import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { storage } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = await db.getProject(id);

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const assets = await db.listProjectAssets(id);
  const jobs = await db.listProjectJobs(id);
  const exportsList = await db.listProjectExports(id);
  const transcript = await db.getTranscript(id);
  const speakers = await db.listSpeakers(id);

  // Generate signed/authenticated stream URLs for original video
  const originalAsset = assets.find((a) => a.assetType === 'original_video');
  const videoUrl = originalAsset ? await storage.getDownloadUrl(originalAsset.storageKey) : undefined;

  // Generate thumbnail URL if present
  const thumbAsset = assets.find((a) => a.assetType === 'thumbnail');
  const thumbnailUrl = thumbAsset ? await storage.getDownloadUrl(thumbAsset.storageKey) : undefined;

  // Also include stream URLs for any exported rendered videos
  const enrichedExports = await Promise.all(
    exportsList.map(async (exp) => {
      const asset = assets.find((a) => a.id === exp.assetId);
      const url = asset ? await storage.getDownloadUrl(asset.storageKey) : exp.downloadUrl;
      return { ...exp, downloadUrl: url };
    })
  );

  return NextResponse.json({
    project: {
      ...project,
      originalVideoUrl: videoUrl,
      thumbnailUrl,
    },
    assets,
    jobs,
    exports: enrichedExports,
    transcript,
    speakers,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const updates = await request.json();

  const updated = await db.updateProject(id, updates);
  if (!updated) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({ project: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = await db.deleteProject(id);

  if (!deleted) {
    return NextResponse.json({ error: 'Project not found or already deleted' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
