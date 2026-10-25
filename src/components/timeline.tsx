'use client';

import React from 'react';
import { TranscriptSegment } from '@/types';
import { Layers, MessageSquare } from 'lucide-react';

interface TimelineProps {
  duration: number;
  currentTime: number;
  segments?: TranscriptSegment[];
  onSeek: (time: number) => void;
  onSelectSegment?: (segment: TranscriptSegment) => void;
  activeSegmentId?: string;
}

export function Timeline({
  duration = 60,
  currentTime = 0,
  segments = [],
  onSeek,
  onSelectSegment,
  activeSegmentId,
}: TimelineProps) {
  const safeDuration = duration > 0 ? duration : 60;
  const progressPercent = Math.min(100, (currentTime / safeDuration) * 100);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(clickPercent * safeDuration);
  };

  // Generate ruler markers every 5 or 10 seconds
  const step = safeDuration > 120 ? 15 : 5;
  const markerCount = Math.floor(safeDuration / step);
  const markers = Array.from({ length: markerCount + 1 }, (_, i) => i * step);

  return (
    <div className="flex flex-col rounded-xl bg-heather-900 border border-heather-700/60 p-4 shadow-lg select-none">
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-fern-light" />
          <span className="font-semibold text-feather">Multilingual Dialogue Timeline</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-quartz/70 font-mono">
          <span>{segments.length} dialogue segments</span>
          <span className="text-eucalyptus">Current: {currentTime.toFixed(1)}s</span>
        </div>
      </div>

      {/* Timeline ruler & tracks */}
      <div
        className="relative w-full h-28 bg-heather-950 rounded-lg border border-heather-800 cursor-pointer overflow-hidden group timeline-grid"
        onClick={handleTimelineClick}
      >
        {/* Time ruler bar */}
        <div className="h-5 w-full bg-heather-900/90 border-b border-heather-800 flex items-center relative text-[10px] text-quartz/50 font-mono">
          {markers.map((sec) => {
            const leftPct = (sec / safeDuration) * 100;
            if (leftPct > 98) return null;
            return (
              <div
                key={sec}
                className="absolute top-0 bottom-0 border-l border-heather-700/60 pl-1 flex items-center"
                style={{ left: `${leftPct}%` }}
              >
                <span>{sec}s</span>
              </div>
            );
          })}
        </div>

        {/* Simulated audio waveform background in Fern and Eucalyptus tones */}
        <div className="absolute top-6 left-0 right-0 h-10 flex items-center gap-[2px] px-2 opacity-30 pointer-events-none">
          {Array.from({ length: 60 }).map((_, i) => {
            const height = 15 + Math.sin(i * 0.4) * 12 + ((i * 13) % 20);
            return (
              <div
                key={i}
                className="flex-1 rounded-sm bg-fern"
                style={{ height: `${height}px` }}
              />
            );
          })}
        </div>

        {/* Dialogue segment blocks */}
        <div className="absolute top-8 left-0 right-0 h-14 px-1 pointer-events-auto">
          {segments.map((seg) => {
            const left = (seg.startSeconds / safeDuration) * 100;
            const width = Math.max(2, ((seg.endSeconds - seg.startSeconds) / safeDuration) * 100);
            const isActive = activeSegmentId === seg.id || (currentTime >= seg.startSeconds && currentTime <= seg.endSeconds);

            return (
              <div
                key={seg.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSegment?.(seg);
                  onSeek(seg.startSeconds);
                }}
                className={`absolute top-1 h-10 rounded-md px-2 py-1 flex items-center gap-1.5 text-xs cursor-pointer border transition-all ${
                  isActive
                    ? 'bg-duskyPink/90 border-duskyPink-light text-heather-950 font-semibold shadow-md shadow-duskyPink/30 scale-[1.02] z-20'
                    : 'bg-heather-800/90 border-heather-600/80 text-feather hover:bg-heather-700 hover:border-quartz/40 z-10'
                }`}
                style={{ left: `${left}%`, width: `${width}%` }}
                title={`${seg.speakerName || 'Speaker'}: ${seg.sourceText} (${seg.startSeconds}s - ${seg.endSeconds}s)`}
              >
                <MessageSquare className={`h-3 w-3 shrink-0 ${isActive ? 'text-heather-950' : 'text-duskyPink'}`} />
                <span className="truncate text-[11px] leading-tight">
                  {seg.translatedText || seg.sourceText}
                </span>
              </div>
            );
          })}
        </div>

        {/* Red / Accent Playhead Line */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-red-400 shadow-md shadow-red-500/50 pointer-events-none z-30 transition-all duration-75"
          style={{ left: `${progressPercent}%` }}
        >
          <div className="w-2.5 h-2.5 bg-red-400 rotate-45 -ml-[4px] -mt-[2px] rounded-xs" />
        </div>
      </div>
    </div>
  );
}
