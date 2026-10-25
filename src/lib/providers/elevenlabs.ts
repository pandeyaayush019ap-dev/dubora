import fs from 'fs';
import { CreateDubbingRequest, DubbingStatusResult, IDubbingProvider } from '@/types';

export class ElevenLabsDubbingProvider implements IDubbingProvider {
  name = 'elevenlabs';
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY || '';
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  getMissingConfigurationMessage(): string {
    return 'ELEVENLABS_API_KEY is not configured in server environment variables. Please provide a valid ElevenLabs API key in .env.local to run real voice dubbing.';
  }

  async startDubbing(request: CreateDubbingRequest): Promise<{ providerJobId: string }> {
    if (!this.isConfigured()) {
      throw new Error(this.getMissingConfigurationMessage());
    }

    if (!fs.existsSync(request.sourceAudioPath) && !fs.existsSync(request.sourceVideoPath)) {
      throw new Error(`Media file not found at ${request.sourceAudioPath || request.sourceVideoPath}`);
    }

    const mediaPath = fs.existsSync(request.sourceAudioPath)
      ? request.sourceAudioPath
      : request.sourceVideoPath;

    const fileBuffer = await fs.promises.readFile(mediaPath);
    const fileName = mediaPath.endsWith('.mp3') ? 'audio.mp3' : 'video.mp4';
    const mimeType = mediaPath.endsWith('.mp3') ? 'audio/mpeg' : 'video/mp4';

    const formData = new FormData();
    const blob = new Blob([new Uint8Array(fileBuffer)], { type: mimeType });
    formData.append('file', blob, fileName);
    formData.append('name', `Dubora Dub: ${request.projectId.slice(0, 8)}`);
    formData.append('source_lang', request.sourceLanguage || 'auto');
    formData.append('target_lang', request.targetLanguage);
    if (request.speakerCount) {
      formData.append('num_speakers', request.speakerCount.toString());
    }

    const response = await fetch(`${this.baseUrl}/dubbing`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`ElevenLabs dubbing creation failed [${response.status}]: ${errBody}`);
    }

    const result = (await response.json()) as { dubbing_id: string; expected_duration_sec?: number };
    return { providerJobId: result.dubbing_id };
  }

  async checkStatus(providerJobId: string): Promise<DubbingStatusResult> {
    if (!this.isConfigured()) {
      throw new Error(this.getMissingConfigurationMessage());
    }

    const response = await fetch(`${this.baseUrl}/dubbing/${providerJobId}`, {
      method: 'GET',
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`ElevenLabs status check failed [${response.status}]: ${errBody}`);
    }

    const data = (await response.json()) as {
      dubbing_id: string;
      name: string;
      status: 'dubbed' | 'dubbing' | 'failed';
      error?: string;
    };

    if (data.status === 'dubbed') {
      return {
        providerJobId: data.dubbing_id,
        status: 'completed',
        progress: 100,
        stage: 'completed',
      };
    } else if (data.status === 'failed') {
      return {
        providerJobId: data.dubbing_id,
        status: 'failed',
        error: data.error || 'ElevenLabs reported job failure',
      };
    } else {
      return {
        providerJobId: data.dubbing_id,
        status: 'processing',
        stage: 'generating_audio',
        progress: 50,
      };
    }
  }

  async downloadDubbedAudio(providerJobId: string, destinationPath: string, languageCode: string = 'es'): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error(this.getMissingConfigurationMessage());
    }

    const response = await fetch(`${this.baseUrl}/dubbing/${providerJobId}/audio/${languageCode}`, {
      method: 'GET',
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`ElevenLabs audio download failed [${response.status}]: ${err}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.promises.writeFile(destinationPath, buffer);
    return destinationPath;
  }

  async getTranscript(providerJobId: string, languageCode: string): Promise<string | null> {
    if (!this.isConfigured()) return null;

    try {
      const response = await fetch(`${this.baseUrl}/dubbing/${providerJobId}/transcript/${languageCode}`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) return null;
      return await response.text();
    } catch {
      return null;
    }
  }
}

export const elevenlabsProvider = new ElevenLabsDubbingProvider();
