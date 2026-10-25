import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { db } from '@/lib/db';
import { Project } from '@/types';

const CreateProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120),
  sourceLanguage: z.string().default('auto'),
  targetLanguages: z.array(z.string()).min(1, 'Select at least one target language'),
  workspaceId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const workspaceId = searchParams.get('workspaceId') || undefined;

  const projects = await db.listProjects(workspaceId);
  return NextResponse.json({ projects });
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = CreateProjectSchema.parse(json);

    const project: Project = {
      id: uuidv4(),
      workspaceId: parsed.workspaceId || 'ws-default',
      title: parsed.title,
      sourceLanguage: parsed.sourceLanguage,
      targetLanguages: parsed.targetLanguages,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = await db.createProject(project);
    return NextResponse.json({ project: created }, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
