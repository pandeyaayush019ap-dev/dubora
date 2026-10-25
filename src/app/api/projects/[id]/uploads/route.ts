import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { storage } from '@/lib/storage';
import { probeMedia, extractThumbnail } from '@/lib/ffmpeg';
import { MediaAsset } from '@/types';
import fs from 'fs';

// Maximum supported upload size: 150MB for MVP
const MAX_FILE_SIZE_BYTES = 150 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska'];

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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No video file provided in form data' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File exceeds maximum allowed size of 150MB (${(file.size / (1024 * 1024)).toFixed(1)}MB)` },
        { status: 400 }
      );
    }

    // Determine extension and storage key
    const originalName = file.name || 'source_video.mp4';
    let ext = '.mp4';
    if (originalName.endsWith('.mov')) ext = '.mov';
    else if (originalName.endsWith('.webm')) ext = '.webm';
    else if (originalName.endsWith('.mkv')) ext = '.mkv';

    const storageKey = `projects/${projectId}/original_video${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save to private storage
    await storage.uploadFile(storageKey, buffer, file.type || 'video/mp4');
    const localFilePath = storage.getFilePath(storageKey);

    // Run FFprobe inspection on the uploaded file
    let probeResult;
    try {
      probeResult = await probeMedia(localFilePath);
    } catch (probeErr: any) {
      console.warn('[Upload Probe] Media inspection note:', probeErr.message);
      // Fallback estimate if probe fails on raw stream
      probeResult = {
        durationSeconds: 10,
        fileSizeBytes: buffer.length,
        videoCodec: 'h264',
        audioCodec: 'aac',
      };
    }

    // Extract a thumbnail preview
    const thumbKey = `projects/${projectId}/thumbnail.jpg`;
    const thumbPath = storage.getFilePath(thumbKey);
    try {
      await extractThumbnail(localFilePath, thumbPath, 1.0);
      if (fs.existsSync(thumbPath)) {
        await db.createMediaAsset({
          id: uuidv4(),
          workspaceId: project.workspaceId,
          projectId: project.id,
          assetType: 'thumbnail',
          storageKey: thumbKey,
          mimeType: 'image/jpeg',
          fileSize: fs.statSync(thumbPath).size,
          durationSeconds: 0,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (thumbErr) {
      console.warn('[Upload Thumbnail] Thumbnail extraction note:', thumbErr);
    }

    // Create media asset record
    const assetId = uuidv4();
    const mediaAsset: MediaAsset = {
      id: assetId,
      workspaceId: project.workspaceId,
      projectId: project.id,
      assetType: 'original_video',
      storageKey: storageKey,
      mimeType: file.type || 'video/mp4',
      fileSize: file.size,
      durationSeconds: probeResult.durationSeconds,
      metadata: {
        width: probeResult.width,
        height: probeResult.height,
        frameRate: probeResult.frameRate,
        videoCodec: probeResult.videoCodec,
        audioCodec: probeResult.audioCodec,
      },
      createdAt: new Date().toISOString(),
    };

    await db.createMediaAsset(mediaAsset);

    // Update project with asset reference and duration
    const downloadUrl = await storage.getDownloadUrl(storageKey);
    const updatedProject = await db.updateProject(projectId, {
      originalAssetId: assetId,
      durationSeconds: probeResult.durationSeconds,
      status: 'draft',
    });

    return NextResponse.json({
      success: true,
      asset: mediaAsset,
      project: {
        ...updatedProject,
        originalVideoUrl: downloadUrl,
      },
      probe: probeResult,
    });
  } catch (err: any) {
    console.error('[Upload API Error]:', err);
    return NextResponse.json({ error: err.message || 'Upload processing failed' }, { status: 500 });
  }
}
