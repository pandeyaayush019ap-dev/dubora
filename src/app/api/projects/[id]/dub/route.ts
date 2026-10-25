import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { db } from '@/lib/db';
import { pipeline } from '@/lib/pipeline';
import { elevenlabsProvider } from '@/lib/providers/elevenlabs';
import { modularPipeline } from '@/lib/providers/modular';
import { DubbingJob } from '@/types';

const DubRequestSchema = z.object({
  targetLanguage: z.string().min(2),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const project = await db.getProject(projectId);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const assets = await db.listProjectAssets(projectId);
    const hasOriginal = assets.some((a) => a.assetType === 'original_video');
    if (!hasOriginal) {
      return NextResponse.json(
        { error: 'Cannot start dubbing: Project has no uploaded video file yet.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { targetLanguage } = DubRequestSchema.parse(body);

    // Validate provider readiness
    const hasElevenLabs = elevenlabsProvider.isConfigured();
    const hasOpenAI = modularPipeline.isOpenAIConfigured();

    if (!hasElevenLabs && !hasOpenAI) {
      return NextResponse.json(
        {
          error: 'No AI dubbing providers configured on server.',
          details:
            'Please configure ELEVENLABS_API_KEY (for integrated dubbing) or OPENAI_API_KEY in .env.local to execute video localization.',
          providerHealth: {
            elevenlabs: hasElevenLabs,
            openai: hasOpenAI,
          },
        },
        { status: 422 }
      );
    }

    const jobId = uuidv4();
    const chosenProvider = hasElevenLabs ? 'elevenlabs' : 'modular';

    const job: DubbingJob = {
      id: jobId,
      projectId: projectId,
      targetLanguage,
      provider: chosenProvider,
      status: 'queued',
      stage: 'initializing',
      progress: 5,
      attemptCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.createJob(job);
    await db.updateProject(projectId, { status: 'queued' });

    // Kick off asynchronous background processing
    // Intentionally do not await so HTTP response returns promptly
    pipeline.processJob(jobId).catch((err) => {
      console.error(`[Background Worker Exception in Job ${jobId}]:`, err);
    });

    return NextResponse.json({ job }, { status: 202 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
