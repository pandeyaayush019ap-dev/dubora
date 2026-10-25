import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: segmentId } = await params;
  const updates = await request.json();

  const updated = await db.updateSegment(segmentId, updates);
  if (!updated) {
    return NextResponse.json({ error: 'Segment not found' }, { status: 404 });
  }

  return NextResponse.json({ segment: updated });
}
