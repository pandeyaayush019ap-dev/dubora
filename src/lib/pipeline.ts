import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { storage } from './storage';
import { probeMedia, extractAudio, remuxVideoWithAudio, extractThumbnail } from './ffmpeg';
import { elevenlabsProvider } from './providers/elevenlabs';
import { modularPipeline } from './providers/modular';
import { DubbingJob, ExportItem, MediaAsset, Project, Transcript, UsageEvent } from '@/types';

export class DubbingPipelineOrchestrator {
  private activeJobs = new Map<string, boolean>();

  // Process a dubbing job asynchronously
  async processJob(jobId: string): Promise<void> {
    if (this.activeJobs.get(jobId)) {
      console.warn(`[Pipeline] Job ${jobId} is already running.`);
      return;
    }

    this.activeJobs.set(jobId, true);

    try {
      const job = await db.getJob(jobId);
      if (!job) throw new Error(`Job ${jobId} not found`);

      const project = await db.getProject(job.projectId);
      if (!project) throw new Error(`Project ${job.projectId} not found`);

      // Update state to analyzing
      await db.updateJob(job.id, {
        status: 'analyzing',
        stage: 'inspecting_media',
        progress: 10,
        startedAt: new Date().toISOString(),
      });
      await db.updateProject(project.id, { status: 'analyzing' });

      // Step 1: Locate and probe original video
      const assets = await db.listProjectAssets(project.id);
      const originalVideoAsset = assets.find((a) => a.assetType === 'original_video');
      if (!originalVideoAsset) {
        throw new Error('Original video asset not found for project');
      }

      const videoFilePath = storage.getFilePath(originalVideoAsset.storageKey);
      if (!fs.existsSync(videoFilePath)) {
        throw new Error(`Video file missing on disk at ${videoFilePath}`);
      }

      const probeResult = await probeMedia(videoFilePath);

      // Generate thumbnail if missing
      const thumbKey = `projects/${project.id}/thumbnail.jpg`;
      const thumbPath = storage.getFilePath(thumbKey);
      try {
        await extractThumbnail(videoFilePath, thumbPath, 1.0);
        await db.createMediaAsset({
          id: uuidv4(),
          workspaceId: project.workspaceId,
          projectId: project.id,
          assetType: 'thumbnail',
          storageKey: thumbKey,
          mimeType: 'image/jpeg',
          fileSize: fs.existsSync(thumbPath) ? fs.statSync(thumbPath).size : 0,
          durationSeconds: 0,
          createdAt: new Date().toISOString(),
        });
      } catch (thumbErr) {
        console.warn('[Pipeline] Thumbnail generation note:', thumbErr);
      }

      // Step 2: Extract audio from source video
      await db.updateJob(job.id, {
        status: 'analyzing',
        stage: 'extracting_audio',
        progress: 25,
      });

      const extractedAudioKey = `projects/${project.id}/extracted_audio.mp3`;
      const extractedAudioPath = storage.getFilePath(extractedAudioKey);
      await extractAudio(videoFilePath, extractedAudioPath);

      const audioStats = fs.statSync(extractedAudioPath);
      await db.createMediaAsset({
        id: uuidv4(),
        workspaceId: project.workspaceId,
        projectId: project.id,
        assetType: 'extracted_audio',
        storageKey: extractedAudioKey,
        mimeType: 'audio/mpeg',
        fileSize: audioStats.size,
        durationSeconds: probeResult.durationSeconds,
        createdAt: new Date().toISOString(),
      });

      // Step 3 & 4: Speech Recognition & Dubbing Execution
      const hasElevenLabs = elevenlabsProvider.isConfigured();
      const hasOpenAI = modularPipeline.isOpenAIConfigured();

      if (!hasElevenLabs && !hasOpenAI) {
        const errorMsg =
          'No AI Provider API keys configured. Set ELEVENLABS_API_KEY or OPENAI_API_KEY in server environment to execute real video dubbing.';
        await db.updateJob(job.id, {
          status: 'failed',
          errorCode: 'PROVIDER_CREDENTIALS_MISSING',
          errorMessage: errorMsg,
          progress: 30,
        });
        await db.updateProject(project.id, { status: 'failed' });
        return;
      }

      let dubbedAudioPath: string | null = null;

      if (hasElevenLabs) {
        try {
          // --- ElevenLabs Integrated Dubbing Workflow ---
          await db.updateJob(job.id, {
            status: 'generating_audio',
            stage: 'generating_voices',
            progress: 45,
            provider: 'elevenlabs',
          });
          await db.updateProject(project.id, { status: 'generating_audio' });

          const { providerJobId } = await elevenlabsProvider.startDubbing({
            jobId: job.id,
            projectId: project.id,
            sourceAudioPath: extractedAudioPath,
            sourceVideoPath: videoFilePath,
            sourceLanguage: project.sourceLanguage === 'auto' ? '' : project.sourceLanguage,
            targetLanguage: job.targetLanguage,
          });

          await db.updateJob(job.id, { providerJobId, progress: 60 });

          // Poll provider until completed (with timeout and backoff)
          let isDone = false;
          let attempts = 0;
          const maxAttempts = 30; // 30 x 4s = 120s timeout

          while (!isDone && attempts < maxAttempts) {
            attempts++;
            await new Promise((r) => setTimeout(r, 4000));

            const statusRes = await elevenlabsProvider.checkStatus(providerJobId);
            if (statusRes.status === 'completed') {
              isDone = true;
            } else if (statusRes.status === 'failed') {
              throw new Error(`ElevenLabs dubbing failed: ${statusRes.error || 'Unknown provider error'}`);
            } else {
              await db.updateJob(job.id, {
                progress: Math.min(85, 60 + attempts),
              });
            }
          }

          if (!isDone) {
            throw new Error('Dubbing provider processing timed out after 120 seconds.');
          }

          // Download dubbed audio
          const dubbedAudioKey = `projects/${project.id}/dubbed_${job.targetLanguage}.mp3`;
          const downloadedPath = storage.getFilePath(dubbedAudioKey);
          await elevenlabsProvider.downloadDubbedAudio(providerJobId, downloadedPath, job.targetLanguage);
          dubbedAudioPath = downloadedPath;

          // Fetch transcript if available
          const rawTranscript = await elevenlabsProvider.getTranscript(providerJobId, job.targetLanguage);
          if (rawTranscript) {
            const transcriptRecord: Transcript = {
              id: uuidv4(),
              projectId: project.id,
              version: 1,
              sourceLanguage: project.sourceLanguage,
              status: 'ready',
              segments: [
                {
                  id: uuidv4(),
                  transcriptId: project.id,
                  sequenceNumber: 1,
                  startSeconds: 0,
                  endSeconds: probeResult.durationSeconds,
                  sourceText: 'Original audio track',
                  translatedText: rawTranscript.slice(0, 500),
                  targetLanguage: job.targetLanguage,
                  confidence: 0.95,
                },
              ],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await db.saveTranscript(transcriptRecord);
          }
        } catch (xiErr: any) {
          console.warn('[Pipeline] ElevenLabs integrated dubbing returned exception:', xiErr.message);
          console.log('[Pipeline] Engaging Modular STT + Contextual Translation + Speech Synthesis pipeline...');
          dubbedAudioPath = null;
        }
      }

      if (!dubbedAudioPath) {
        // --- Modular STT + Translate + TTS Workflow ---
        await db.updateJob(job.id, {
          status: 'transcribing',
          stage: 'recognizing_speech',
          progress: 40,
          provider: 'modular',
        });
        await db.updateProject(project.id, { status: 'transcribing' });

        const audioBuf = await fs.promises.readFile(extractedAudioPath);
        const transcription = await modularPipeline.transcribeAudio(audioBuf);

        // Save transcript
        const transcriptId = uuidv4();
        const segments = transcription.segments.map((s) => ({
          id: uuidv4(),
          transcriptId: transcriptId,
          sequenceNumber: s.sequenceNumber,
          startSeconds: s.startSeconds,
          endSeconds: s.endSeconds,
          sourceText: s.text,
          confidence: s.confidence,
          speakerName: s.speakerName,
        }));

        const transcriptRecord: Transcript = {
          id: transcriptId,
          projectId: project.id,
          version: 1,
          sourceLanguage: transcription.sourceLanguage,
          segments: segments,
          status: 'ready',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await db.saveTranscript(transcriptRecord);

        // Translate dialogue
        await db.updateJob(job.id, {
          status: 'translating',
          stage: 'translating_dialogue',
          progress: 60,
        });
        await db.updateProject(project.id, { status: 'translating' });

        const translatedSegments = await modularPipeline.translateDialogue(segments, job.targetLanguage);
        await db.saveTranscript({
          ...transcriptRecord,
          segments: translatedSegments,
          updatedAt: new Date().toISOString(),
        });

        // Synthesize voice
        await db.updateJob(job.id, {
          status: 'generating_audio',
          stage: 'generating_voices',
          progress: 75,
        });
        await db.updateProject(project.id, { status: 'generating_audio' });

        const fullTranslatedText = translatedSegments.map((s) => s.translatedText || s.sourceText).join(' ');
        const dubbedAudioKey = `projects/${project.id}/dubbed_${job.targetLanguage}.mp3`;
        const targetAudioPath = storage.getFilePath(dubbedAudioKey);
        const speechBuffer = await modularPipeline.synthesizeSegmentSpeech(
          fullTranslatedText,
          'alloy',
          1.0,
          targetAudioPath
        );

        if (!fs.existsSync(targetAudioPath)) {
          await fs.promises.writeFile(targetAudioPath, speechBuffer);
        }
        dubbedAudioPath = targetAudioPath;
      }

      // Record dubbed audio asset
      const dubbedAudioStats = fs.statSync(dubbedAudioPath);
      const dubbedAudioKey = `projects/${project.id}/dubbed_${job.targetLanguage}.mp3`;
      await db.createMediaAsset({
        id: uuidv4(),
        workspaceId: project.workspaceId,
        projectId: project.id,
        assetType: 'dubbed_audio',
        storageKey: dubbedAudioKey,
        mimeType: 'audio/mpeg',
        fileSize: dubbedAudioStats.size,
        durationSeconds: probeResult.durationSeconds,
        createdAt: new Date().toISOString(),
      });

      // Step 5: Remux final video with the dubbed audio track
      await db.updateJob(job.id, {
        status: 'rendering',
        stage: 'remuxing_video',
        progress: 88,
      });
      await db.updateProject(project.id, { status: 'rendering' });

      const finalVideoKey = `projects/${project.id}/rendered_${job.targetLanguage}.mp4`;
      const finalVideoPath = storage.getFilePath(finalVideoKey);
      await remuxVideoWithAudio(videoFilePath, dubbedAudioPath, finalVideoPath);

      // Verify rendered video with FFprobe
      const finalProbe = await probeMedia(finalVideoPath);
      if (!finalProbe.durationSeconds || finalProbe.durationSeconds <= 0) {
        throw new Error('Rendered video file failed verification: zero duration detected');
      }

      const finalVideoStats = fs.statSync(finalVideoPath);
      const renderedAssetId = uuidv4();
      await db.createMediaAsset({
        id: renderedAssetId,
        workspaceId: project.workspaceId,
        projectId: project.id,
        assetType: 'rendered_video',
        storageKey: finalVideoKey,
        mimeType: 'video/mp4',
        fileSize: finalVideoStats.size,
        durationSeconds: finalProbe.durationSeconds,
        metadata: {
          width: finalProbe.width,
          height: finalProbe.height,
          videoCodec: finalProbe.videoCodec,
          audioCodec: finalProbe.audioCodec,
        },
        createdAt: new Date().toISOString(),
      });

      // Step 6: Create verified export and mark completed
      const exportDownloadUrl = await storage.getDownloadUrl(finalVideoKey);
      const exportItem: ExportItem = {
        id: uuidv4(),
        projectId: project.id,
        dubbingJobId: job.id,
        language: job.targetLanguage,
        assetId: renderedAssetId,
        format: 'mp4',
        durationSeconds: finalProbe.durationSeconds,
        downloadUrl: exportDownloadUrl,
        status: 'ready',
        createdAt: new Date().toISOString(),
      };
      await db.createExport(exportItem);

      // Record usage event
      const usageEvent: UsageEvent = {
        id: uuidv4(),
        workspaceId: project.workspaceId,
        projectId: project.id,
        jobId: job.id,
        eventType: 'dubbing',
        quantity: parseFloat(finalProbe.durationSeconds.toFixed(2)),
        unit: 'seconds',
        estimatedCost: parseFloat((finalProbe.durationSeconds * 0.05).toFixed(3)),
        actualCost: parseFloat((finalProbe.durationSeconds * 0.05).toFixed(3)),
        provider: job.provider,
        idempotencyKey: `job-${job.id}-dubbing`,
        createdAt: new Date().toISOString(),
      };
      await db.recordUsage(usageEvent);

      // Mark Job & Project Completed
      await db.updateJob(job.id, {
        status: 'completed',
        stage: 'finalizing_export',
        progress: 100,
        completedAt: new Date().toISOString(),
      });
      await db.updateProject(project.id, { status: 'completed' });
      console.log(`[Pipeline] Successfully finished dubbing job ${job.id} for project ${project.id}`);
    } catch (err: any) {
      console.error(`[Pipeline] Job ${jobId} failed:`, err);
      await db.updateJob(jobId, {
        status: 'failed',
        errorCode: 'PROCESSING_ERROR',
        errorMessage: err.message || 'Unknown processing error occurred',
      });
    } finally {
      this.activeJobs.delete(jobId);
    }
  }
}

export const pipeline = new DubbingPipelineOrchestrator();
