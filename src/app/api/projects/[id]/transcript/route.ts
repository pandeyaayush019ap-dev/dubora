import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const transcript = await db.getTranscript(projectId);

  if (!transcript) {
    return NextResponse.json({ transcript: null });
  }

  return NextResponse.json({ transcript });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const body = await request.json();

  const existing = await db.getTranscript(projectId);
  if (!existing) {
    return NextResponse.json({ error: 'Transcript not found' }, { status: 404 });
  }

  const updated = await db.saveTranscript({
    ...existing,
    ...body,
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ transcript: updated });
}
