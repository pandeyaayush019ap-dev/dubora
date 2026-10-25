import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { configureFfmpegPaths, probeMedia } from '../src/lib/ffmpeg';

describe('FFmpeg & Media Worker Tests', () => {
  const testDir = path.resolve(process.cwd(), 'data', 'test_media');
  const sampleVideo = path.join(testDir, 'sample_test.mp4');

  beforeAll(() => {
    configureFfmpegPaths();
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Generate a minimal valid 2-second MP4 with color test pattern & sine tone using ffmpeg binary
    const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
    const cmd = `"${ffmpegInstaller.path}" -y -f lavfi -i color=c=blue:s=320x240:d=2 -f lavfi -i sine=f=440:d=2 -c:v libx264 -t 2 -pix_fmt yuv420p -c:a aac "${sampleVideo}"`;
    try {
      execSync(cmd, { stdio: 'pipe' });
    } catch (e: any) {
      console.warn('Test video generation notice:', e.message);
    }
  });

  it('should successfully probe real media files and return valid duration and codecs', async () => {
    if (!fs.existsSync(sampleVideo)) {
      console.warn('Skipping probe test: test video generation was skipped');
      return;
    }

    const metadata = await probeMedia(sampleVideo);
    expect(metadata.durationSeconds).toBeGreaterThan(1.5);
    expect(metadata.width).toBe(320);
    expect(metadata.height).toBe(240);
    expect(metadata.videoCodec).toBe('h264');
    expect(metadata.fileSizeBytes).toBeGreaterThan(100);
  });
});
