import { describe, it, expect } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../src/lib/db';
import { Project, DubbingJob } from '../src/types';

describe('Dubbing Pipeline & DB Persistence Tests', () => {
  it('should create and update project records with state transitions', async () => {
    const projId = uuidv4();
    const project: Project = {
      id: projId,
      workspaceId: 'ws-default',
      title: 'Automated Pipeline Test',
      sourceLanguage: 'en',
      targetLanguages: ['es', 'ja'],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await db.createProject(project);
    expect(saved.id).toBe(projId);

    // Transition to analyzing
    const analyzing = await db.updateProject(projId, { status: 'analyzing' });
    expect(analyzing?.status).toBe('analyzing');

    // Transition to completed
    const completed = await db.updateProject(projId, { status: 'completed' });
    expect(completed?.status).toBe('completed');

    // Cleanup
    await db.deleteProject(projId);
  });

  it('should persist transcript edits persistently without loss', async () => {
    const projId = uuidv4();
    const transcriptId = uuidv4();

    await db.saveTranscript({
      id: transcriptId,
      projectId: projId,
      version: 1,
      sourceLanguage: 'en',
      status: 'ready',
      segments: [
        {
          id: 'seg-1',
          transcriptId,
          sequenceNumber: 1,
          startSeconds: 0,
          endSeconds: 3.5,
          sourceText: 'Hello world',
          translatedText: 'Hola mundo',
          targetLanguage: 'es',
          confidence: 0.98,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const retrieved = await db.getTranscript(projId);
    expect(retrieved).toBeDefined();
    expect(retrieved?.segments.length).toBe(1);
    expect(retrieved?.segments[0].translatedText).toBe('Hola mundo');

    // Update segment translation
    await db.updateSegment('seg-1', { translatedText: 'Hola a todos' });
    const updated = await db.getTranscript(projId);
    expect(updated?.segments[0].translatedText).toBe('Hola a todos');
  });
});
