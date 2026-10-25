import fs from 'fs';
import path from 'path';
import {
  Project,
  MediaAsset,
  Transcript,
  TranscriptSegment,
  Speaker,
  DubbingJob,
  ExportItem,
  UsageEvent,
  UserProfile,
  Workspace,
} from '@/types';

interface DatabaseSchema {
  profiles: UserProfile[];
  workspaces: Workspace[];
  projects: Project[];
  mediaAssets: MediaAsset[];
  transcripts: Transcript[];
  segments: TranscriptSegment[];
  speakers: Speaker[];
  jobs: DubbingJob[];
  exports: ExportItem[];
  usageEvents: UsageEvent[];
}

class LocalDatabase {
  private filePath: string;
  private data: DatabaseSchema;

  constructor() {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.filePath = path.resolve(dataDir, 'db.json');
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error loading db.json, initializing fresh store:', e);
      }
    }

    const defaultWorkspace: Workspace = {
      id: 'ws-default',
      name: 'Default Workspace',
      ownerId: 'user-default',
      planId: 'creator',
      monthlySourceMinutesLimit: 120,
      createdAt: new Date().toISOString(),
    };

    const defaultProfile: UserProfile = {
      id: 'user-default',
      email: 'creator@dubora.ai',
      displayName: 'Dubora Creator',
      preferredLanguage: 'en',
      createdAt: new Date().toISOString(),
    };

    const initial: DatabaseSchema = {
      profiles: [defaultProfile],
      workspaces: [defaultWorkspace],
      projects: [],
      mediaAssets: [],
      transcripts: [],
      segments: [],
      speakers: [],
      jobs: [],
      exports: [],
      usageEvents: [],
    };

    fs.writeFileSync(this.filePath, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }

  private save(): void {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  // Workspaces
  async getWorkspace(id: string): Promise<Workspace | undefined> {
    return this.data.workspaces.find((w) => w.id === id) || this.data.workspaces[0];
  }

  // Projects
  async listProjects(workspaceId?: string): Promise<Project[]> {
    if (!workspaceId) return this.data.projects;
    return this.data.projects.filter((p) => p.workspaceId === workspaceId);
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.data.projects.find((p) => p.id === id);
  }

  async createProject(project: Project): Promise<Project> {
    this.data.projects.unshift(project);
    this.save();
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const idx = this.data.projects.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    this.data.projects[idx] = {
      ...this.data.projects[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.projects[idx];
  }

  async deleteProject(id: string): Promise<boolean> {
    const initialLen = this.data.projects.length;
    this.data.projects = this.data.projects.filter((p) => p.id !== id);
    this.data.transcripts = this.data.transcripts.filter((t) => t.projectId !== id);
    this.data.speakers = this.data.speakers.filter((s) => s.projectId !== id);
    this.data.jobs = this.data.jobs.filter((j) => j.projectId !== id);
    this.data.exports = this.data.exports.filter((e) => e.projectId !== id);
    this.save();
    return this.data.projects.length < initialLen;
  }

  // Media Assets
  async createMediaAsset(asset: MediaAsset): Promise<MediaAsset> {
    this.data.mediaAssets.push(asset);
    this.save();
    return asset;
  }

  async getMediaAsset(id: string): Promise<MediaAsset | undefined> {
    return this.data.mediaAssets.find((a) => a.id === id);
  }

  async listProjectAssets(projectId: string): Promise<MediaAsset[]> {
    return this.data.mediaAssets.filter((a) => a.projectId === projectId);
  }

  // Transcripts & Segments
  async getTranscript(projectId: string): Promise<Transcript | undefined> {
    const transcript = this.data.transcripts.find((t) => t.projectId === projectId);
    if (!transcript) return undefined;
    const segments = this.data.segments.filter((s) => s.transcriptId === transcript.id);
    return { ...transcript, segments };
  }

  async saveTranscript(transcript: Transcript): Promise<Transcript> {
    const existingIdx = this.data.transcripts.findIndex((t) => t.id === transcript.id);
    if (existingIdx !== -1) {
      this.data.transcripts[existingIdx] = transcript;
    } else {
      this.data.transcripts.push(transcript);
    }

    // Save segments
    this.data.segments = this.data.segments.filter((s) => s.transcriptId !== transcript.id);
    if (transcript.segments && transcript.segments.length > 0) {
      this.data.segments.push(...transcript.segments);
    }

    this.save();
    return transcript;
  }

  async updateSegment(id: string, updates: Partial<TranscriptSegment>): Promise<TranscriptSegment | undefined> {
    const idx = this.data.segments.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    this.data.segments[idx] = { ...this.data.segments[idx], ...updates };
    this.save();
    return this.data.segments[idx];
  }

  // Speakers
  async listSpeakers(projectId: string): Promise<Speaker[]> {
    return this.data.speakers.filter((s) => s.projectId === projectId);
  }

  async saveSpeaker(speaker: Speaker): Promise<Speaker> {
    const idx = this.data.speakers.findIndex((s) => s.id === speaker.id);
    if (idx !== -1) {
      this.data.speakers[idx] = speaker;
    } else {
      this.data.speakers.push(speaker);
    }
    this.save();
    return speaker;
  }

  // Jobs
  async createJob(job: DubbingJob): Promise<DubbingJob> {
    this.data.jobs.unshift(job);
    this.save();
    return job;
  }

  async getJob(id: string): Promise<DubbingJob | undefined> {
    return this.data.jobs.find((j) => j.id === id);
  }

  async listProjectJobs(projectId: string): Promise<DubbingJob[]> {
    return this.data.jobs.filter((j) => j.projectId === projectId);
  }

  async updateJob(id: string, updates: Partial<DubbingJob>): Promise<DubbingJob | undefined> {
    const idx = this.data.jobs.findIndex((j) => j.id === id);
    if (idx === -1) return undefined;
    this.data.jobs[idx] = {
      ...this.data.jobs[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.jobs[idx];
  }

  // Exports
  async createExport(exportItem: ExportItem): Promise<ExportItem> {
    this.data.exports.unshift(exportItem);
    this.save();
    return exportItem;
  }

  async listProjectExports(projectId: string): Promise<ExportItem[]> {
    return this.data.exports.filter((e) => e.projectId === projectId);
  }

  async listAllExports(): Promise<ExportItem[]> {
    return this.data.exports;
  }

  // Usage Events
  async recordUsage(event: UsageEvent): Promise<UsageEvent> {
    this.data.usageEvents.push(event);
    this.save();
    return event;
  }

  async getWorkspaceUsage(workspaceId: string): Promise<{ totalMinutes: number; totalCost: number; events: UsageEvent[] }> {
    const events = this.data.usageEvents.filter((u) => u.workspaceId === workspaceId);
    let totalSeconds = 0;
    let totalCost = 0;
    for (const ev of events) {
      if (ev.unit === 'seconds') totalSeconds += ev.quantity;
      if (ev.unit === 'minutes') totalSeconds += ev.quantity * 60;
      totalCost += ev.actualCost || ev.estimatedCost || 0;
    }
    return {
      totalMinutes: parseFloat((totalSeconds / 60).toFixed(2)),
      totalCost: parseFloat(totalCost.toFixed(3)),
      events,
    };
  }
}

export const db = new LocalDatabase();
