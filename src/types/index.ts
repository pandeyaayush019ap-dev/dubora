export type ProjectStatus =
  | 'draft'
  | 'uploading'
  | 'queued'
  | 'analyzing'
  | 'transcribing'
  | 'translating'
  | 'generating_audio'
  | 'synchronizing'
  | 'rendering'
  | 'completed'
  | 'failed'
  | 'canceled';

export type JobStatus =
  | 'queued'
  | 'analyzing'
  | 'transcribing'
  | 'translating'
  | 'generating_audio'
  | 'synchronizing'
  | 'rendering'
  | 'completed'
  | 'failed'
  | 'canceled';

export type JobStage =
  | 'initializing'
  | 'inspecting_media'
  | 'extracting_audio'
  | 'recognizing_speech'
  | 'translating_dialogue'
  | 'generating_voices'
  | 'aligning_timing'
  | 'remuxing_video'
  | 'finalizing_export';

export type AssetType =
  | 'original_video'
  | 'extracted_audio'
  | 'dubbed_audio'
  | 'rendered_video'
  | 'thumbnail'
  | 'subtitles';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  preferredLanguage: string;
  onboardingCompletedAt?: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  planId: 'trial' | 'creator' | 'pro' | 'business';
  monthlySourceMinutesLimit: number;
  createdAt: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  title: string;
  sourceLanguage: string;
  targetLanguages: string[];
  status: ProjectStatus;
  originalAssetId?: string;
  originalVideoUrl?: string;
  durationSeconds?: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface MediaAsset {
  id: string;
  workspaceId: string;
  projectId: string;
  assetType: AssetType;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  durationSeconds: number;
  checksum?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Speaker {
  id: string;
  projectId: string;
  displayName: string;
  providerVoiceId?: string;
  originalVoiceSampleKey?: string;
  voiceConfiguration?: {
    stability?: number;
    similarityBoost?: number;
    pitch?: number;
    speed?: number;
  };
  consentReference?: string;
  createdAt: string;
}

export interface TranscriptSegment {
  id: string;
  transcriptId: string;
  speakerId?: string;
  speakerName?: string;
  sequenceNumber: number;
  startSeconds: number;
  endSeconds: number;
  sourceText: string;
  translatedText?: string;
  targetLanguage?: string;
  confidence: number;
  status?: 'pending' | 'translated' | 'synthesized' | 'locked';
  metadata?: Record<string, any>;
}

export interface Transcript {
  id: string;
  projectId: string;
  version: number;
  sourceLanguage: string;
  segments: TranscriptSegment[];
  status: 'processing' | 'ready' | 'edited' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface DubbingJob {
  id: string;
  projectId: string;
  targetLanguage: string;
  provider: 'elevenlabs' | 'modular' | 'custom';
  providerJobId?: string;
  status: JobStatus;
  stage: JobStage;
  progress: number;
  errorCode?: string;
  errorMessage?: string;
  attemptCount: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExportItem {
  id: string;
  projectId: string;
  dubbingJobId?: string;
  language: string;
  assetId: string;
  format: string;
  durationSeconds: number;
  downloadUrl?: string;
  status: 'processing' | 'ready' | 'failed';
  createdAt: string;
}

export interface UsageEvent {
  id: string;
  workspaceId: string;
  projectId?: string;
  jobId?: string;
  eventType: 'media_inspection' | 'stt' | 'translation' | 'tts' | 'dubbing' | 'rendering';
  quantity: number;
  unit: 'seconds' | 'characters' | 'minutes';
  estimatedCost: number;
  actualCost: number;
  provider: string;
  idempotencyKey?: string;
  createdAt: string;
}

// Provider Interfaces
export interface MediaProbeResult {
  durationSeconds: number;
  width?: number;
  height?: number;
  frameRate?: number;
  videoCodec?: string;
  audioCodec?: string;
  audioChannels?: number;
  audioSampleRate?: number;
  fileSizeBytes: number;
}

export interface CreateDubbingRequest {
  jobId: string;
  projectId: string;
  sourceAudioPath: string;
  sourceVideoPath: string;
  sourceLanguage: string;
  targetLanguage: string;
  speakerCount?: number;
}

export interface DubbingStatusResult {
  providerJobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  stage?: string;
  progress?: number;
  dubbedMediaUrl?: string;
  dubbedMediaPath?: string;
  error?: string;
}

export interface IDubbingProvider {
  name: string;
  isConfigured(): boolean;
  getMissingConfigurationMessage(): string;
  startDubbing(request: CreateDubbingRequest): Promise<{ providerJobId: string }>;
  checkStatus(providerJobId: string): Promise<DubbingStatusResult>;
  downloadDubbedAudio(providerJobId: string, destinationPath: string): Promise<string>;
}
