'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Settings2,
  SkipBack,
  SkipForward,
} from 'lucide-react';

interface VideoPlayerProps {
  src?: string;
  poster?: string;
  currentTime?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  className?: string;
}

export function VideoPlayer({
  src,
  poster,
  currentTime = 0,
  onTimeUpdate,
  onDurationChange,
  className = '',
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currTime, setCurrTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasError, setHasError] = useState(false);

  // Sync external currentTime seek
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch((e) => {
        console.warn('Playback error:', e);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrTime(t);
    onTimeUpdate?.(t);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const d = videoRef.current.duration;
    setDuration(d);
    onDurationChange?.(d);
    setHasError(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
      setCurrTime(val);
      onTimeUpdate?.(val);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
  };

  const changePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2, 0.75];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate;
    }
  };

  const skipSeconds = (seconds: number) => {
    if (!videoRef.current) return;
    const target = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = target;
    setCurrTime(target);
    onTimeUpdate?.(target);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`relative flex flex-col rounded-xl overflow-hidden bg-heather-900 border border-heather-700/60 shadow-xl ${className}`}>
      {/* Video surface */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center">
        {src ? (
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            className="h-full w-full object-contain cursor-pointer"
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onError={() => setHasError(true)}
            playsInline
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-quartz/60">
            <p className="text-sm">No video source loaded</p>
            <p className="text-xs text-quartz/40 mt-1">Upload a video to preview in this studio player</p>
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 bg-heather-950/90 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-sm text-red-400 font-semibold">Video decoding error</p>
            <p className="text-xs text-quartz/70 mt-1 max-w-sm">
              The media format could not be played directly by the browser. Video stream copy in MP4 is recommended.
            </p>
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className="bg-heather-850 p-3 flex flex-col gap-2 border-t border-heather-700/60">
        {/* Scrubber slider */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-quartz w-10 text-right">{formatTime(currTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-heather-700 rounded-lg appearance-none cursor-pointer accent-duskyPink hover:accent-duskyPink-light transition-all"
          />
          <span className="text-[11px] font-mono text-quartz/70 w-10">{formatTime(duration)}</span>
        </div>

        {/* Buttons and volume */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => skipSeconds(-5)}
              className="p-1.5 text-quartz hover:text-feather hover:bg-heather-800 rounded transition-colors"
              title="Rewind 5s"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            <button
              onClick={togglePlay}
              className="p-2 bg-duskyPink text-heather-950 rounded-lg hover:bg-duskyPink-light font-bold transition-all shadow-sm"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
            </button>

            <button
              onClick={() => skipSeconds(5)}
              className="p-1.5 text-quartz hover:text-feather hover:bg-heather-800 rounded transition-colors"
              title="Fast Forward 5s"
            >
              <SkipForward className="h-4 w-4" />
            </button>

            <div className="h-4 w-[1px] bg-heather-700 mx-1" />

            {/* Volume control */}
            <div className="flex items-center gap-1.5 group">
              <button
                onClick={toggleMute}
                className="p-1.5 text-quartz hover:text-feather rounded transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-heather-700 rounded appearance-none cursor-pointer accent-quartz"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Speed toggle */}
            <button
              onClick={changePlaybackRate}
              className="px-2 py-1 text-xs font-mono font-medium text-quartz hover:text-feather bg-heather-800 hover:bg-heather-700 rounded transition-colors"
              title="Change Playback Speed"
            >
              {playbackRate}x
            </button>

            <button
              onClick={() => {
                if (videoRef.current) {
                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  } else {
                    videoRef.current.requestFullscreen();
                  }
                }
              }}
              className="p-1.5 text-quartz hover:text-feather hover:bg-heather-800 rounded transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
