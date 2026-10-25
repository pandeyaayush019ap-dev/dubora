import ffmpeg from 'fluent-ffmpeg';
import { MediaProbeResult } from '@/types';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
let isFfmpegConfigured = false;

export function configureFfmpegPaths() {
  if (isFfmpegConfigured) return;

  try {
    const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
    const ffprobeInstaller = require('@ffprobe-installer/ffprobe');

    if (ffmpegInstaller && ffmpegInstaller.path) {
      ffmpeg.setFfmpegPath(ffmpegInstaller.path);
    }
    if (ffprobeInstaller && ffprobeInstaller.path) {
      ffmpeg.setFfprobePath(ffprobeInstaller.path);
    }
    isFfmpegConfigured = true;
  } catch (err) {
    console.warn('[Dubora Media] Warning: Could not auto-detect @ffmpeg-installer paths:', err);
  }
}

// 1. Inspect media properties using FFprobe
export async function probeMedia(filePath: string): Promise<MediaProbeResult> {
  configureFfmpegPaths();

  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return reject(new Error(`FFprobe failed to inspect file: ${err.message}`));
      }

      const format = metadata.format;
      const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
      const audioStream = metadata.streams.find((s) => s.codec_type === 'audio');

      const durationSeconds = format.duration ? parseFloat(format.duration.toString()) : 0;
      const fileSizeBytes = format.size ? parseInt(format.size.toString(), 10) : 0;

      let frameRate: number | undefined;
      if (videoStream?.r_frame_rate) {
        const parts = videoStream.r_frame_rate.split('/');
        if (parts.length === 2 && parseInt(parts[1], 10) > 0) {
          frameRate = parseFloat((parseInt(parts[0], 10) / parseInt(parts[1], 10)).toFixed(2));
        }
      }

      resolve({
        durationSeconds,
        width: videoStream?.width,
        height: videoStream?.height,
        frameRate,
        videoCodec: videoStream?.codec_name,
        audioCodec: audioStream?.codec_name,
        audioChannels: audioStream?.channels,
        audioSampleRate: audioStream?.sample_rate ? parseInt(audioStream.sample_rate.toString(), 10) : undefined,
        fileSizeBytes,
      });
    });
  });
}

// 2. Extract clean audio (MP3 or WAV) from video without re-encoding video
export async function extractAudio(videoPath: string, outputAudioPath: string): Promise<string> {
  configureFfmpegPaths();

  const outDir = path.dirname(outputAudioPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .noVideo()
      .audioCodec('libmp3lame')
      .audioBitrate(192)
      .audioChannels(2)
      .audioFrequency(44100)
      .output(outputAudioPath)
      .on('end', () => resolve(outputAudioPath))
      .on('error', (err) => reject(new Error(`Audio extraction failed: ${err.message}`)))
      .run();
  });
}

// 3. Remux final video with the generated dubbed audio
// Stream copies the video track (-c:v copy) to preserve original quality and encode fast,
// while multiplexing the dubbed audio track.
export async function remuxVideoWithAudio(
  videoPath: string,
  audioPath: string,
  outputPath: string
): Promise<string> {
  configureFfmpegPaths();

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoPath)
      .input(audioPath)
      .outputOptions([
        '-c:v copy', // Stream copy video track without generational quality loss
        '-c:a aac',  // Standard high-compatibility audio codec
        '-b:a 192k',
        '-map 0:v:0', // Take video stream from video file
        '-map 1:a:0', // Take audio stream from dubbed audio file
        '-shortest',  // Ensure container duration matches the streams
      ])
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(new Error(`Video remuxing failed: ${err.message}`)))
      .run();
  });
}

// 4. Extract video preview thumbnail at 1 second mark
export async function extractThumbnail(
  videoPath: string,
  outputThumbnailPath: string,
  timeSeconds: number = 1.0
): Promise<string> {
  configureFfmpegPaths();

  const outDir = path.dirname(outputThumbnailPath);
  const filename = path.basename(outputThumbnailPath);

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: [timeSeconds],
        filename: filename,
        folder: outDir,
        size: '640x?',
      })
      .on('end', () => resolve(outputThumbnailPath))
      .on('error', (err) => reject(new Error(`Thumbnail extraction failed: ${err.message}`)));
  });
}
