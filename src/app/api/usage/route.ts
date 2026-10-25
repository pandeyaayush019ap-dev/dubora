import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const workspaceId = searchParams.get('workspaceId') || 'ws-default';

  const usage = await db.getWorkspaceUsage(workspaceId);
  const workspace = await db.getWorkspace(workspaceId);

  return NextResponse.json({
    workspace,
    usage,
  });
}
