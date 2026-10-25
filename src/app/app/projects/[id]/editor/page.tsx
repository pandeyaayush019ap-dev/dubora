'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Play,
  Sparkles,
  Download,
  Save,
  RefreshCw,
  Sliders,
  Volume2,
  Globe,
  Film,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  MessageSquare,
  FileVideo,
  Key,
} from 'lucide-react';
import { VideoPlayer } from '@/components/video-player';
import { Timeline } from '@/components/timeline';
import { Project, Transcript, TranscriptSegment, DubbingJob, ExportItem, MediaAsset, Speaker } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/lib/providers/registry';

export default function DubbingStudioEditor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);

  const [project, setProject] = useState<Project | null>(null);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [jobs, setJobs] = useState<DubbingJob[]>([]);
  const [exportsList, setExportsList] = useState<ExportItem[]>([]);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);

  // Studio Player & Editing State
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('es');
  const [selectedSegment, setSelectedSegment] = useState<TranscriptSegment | null>(null);
  const [editedText, setEditedText] = useState('');
  const [isSavingSegment, setIsSavingSegment] = useState(false);
  const [isTriggeringDub, setIsTriggeringDub] = useState(false);
  const [dubError, setDubError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Poll project details and active jobs
  const fetchProjectData = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error('Failed to load project');
      const data = await res.json();

      setProject(data.project);
      setAssets(data.assets || []);
      setJobs(data.jobs || []);
      setExportsList(data.exports || []);
      setTranscript(data.transcript);
      setSpeakers(data.speakers || []);

      if (data.project?.durationSeconds) {
        setDuration(data.project.durationSeconds);
      }

      if (data.project?.targetLanguages && data.project.targetLanguages.length > 0) {
        if (!data.project.targetLanguages.includes(selectedLanguage)) {
          setSelectedLanguage(data.project.targetLanguages[0]);
        }
      }

      // Auto-select first segment if not selected
      if (!selectedSegment && data.transcript?.segments && data.transcript.segments.length > 0) {
        setSelectedSegment(data.transcript.segments[0]);
        setEditedText(data.transcript.segments[0].translatedText || data.transcript.segments[0].sourceText);
      }
    } catch (e: any) {
      console.error('Editor fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
    // Poll every 3 seconds if there is an active job running
    const interval = setInterval(() => {
      fetchProjectData();
    }, 3000);
    return () => clearInterval(interval);
  }, [projectId]);

  // Update editor text when selecting segment
  const handleSelectSegment = (seg: TranscriptSegment) => {
    setSelectedSegment(seg);
    setEditedText(seg.translatedText || seg.sourceText);
  };

  // Persist translation edit
  const handleSaveSegmentEdit = async () => {
    if (!selectedSegment) return;
    setIsSavingSegment(true);
    setSaveSuccessMsg(false);

    try {
      const res = await fetch(`/api/segments/${selectedSegment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          translatedText: editedText,
          status: 'edited',
        }),
      });

      if (!res.ok) throw new Error('Save failed');
      const { segment: updated } = await res.json();

      // Update local state
      setSelectedSegment(updated);
      if (transcript) {
        const nextSegs = transcript.segments.map((s) => (s.id === updated.id ? updated : s));
        setTranscript({ ...transcript, segments: nextSegs });
      }
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 2000);
    } catch (err: any) {
      alert(`Could not save edit: ${err.message}`);
    } finally {
      setIsSavingSegment(false);
    }
  };

  // Trigger Dubbing for the active language
  const handleStartDubbing = async () => {
    setIsTriggeringDub(true);
    setDubError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/dub`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLanguage: selectedLanguage }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.details || data.error || 'Dubbing initiation failed');
      }

      // Refresh to capture newly queued job
      fetchProjectData();
    } catch (err: any) {
      setDubError(err.message || 'Error starting dubbing');
    } finally {
      setIsTriggeringDub(false);
    }
  };

  // Find active job for current language
  const activeJob = jobs.find((j) => j.targetLanguage === selectedLanguage);
  // Find completed export for current language
  const activeExport = exportsList.find((e) => e.language === selectedLanguage && e.status === 'ready');

  // Video source: prioritize rendered video export if available, else original video
  const activeVideoUrl = activeExport?.downloadUrl || project?.originalVideoUrl;

  const originalVideoAsset = assets.find((a) => a.assetType === 'original_video');
  const segments = transcript?.segments || [];

  if (loading && !project) {
    return (
      <div className="flex h-screen items-center justify-center text-xs text-quartz">
        Loading Dubora Studio workspace...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-heather-950 text-feather">
      {/* Top Studio Bar */}
      <header className="h-14 border-b border-heather-700/60 bg-heather-900 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/app"
            className="flex items-center gap-1.5 text-xs text-quartz hover:text-feather transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Projects</span>
          </Link>
          <div className="h-4 w-[1px] bg-heather-700" />
          <h1 className="text-sm font-semibold text-feather truncate max-w-sm">{project?.title}</h1>
          <span className="px-2 py-0.5 rounded bg-heather-800 text-quartz text-[10px] font-mono border border-heather-700">
            Source: {project?.sourceLanguage?.toUpperCase() || 'AUTO'}
          </span>
        </div>

        {/* Language Tabs & Launch Action */}
        <div className="flex items-center gap-3">
          {/* Target language selector */}
          <div className="flex items-center gap-1 bg-heather-950 p-1 rounded-lg border border-heather-700">
            {(project?.targetLanguages || ['es']).map((langCode) => {
              const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
              const isActive = selectedLanguage === langCode;
              const hasExport = exportsList.some((e) => e.language === langCode && e.status === 'ready');

              return (
                <button
                  key={langCode}
                  onClick={() => setSelectedLanguage(langCode)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-all ${
                    isActive
                      ? 'bg-duskyPink text-heather-950 font-bold shadow-sm'
                      : 'text-quartz hover:text-feather'
                  }`}
                >
                  <span>{langMeta?.flag || '🌐'}</span>
                  <span>{langCode.toUpperCase()}</span>
                  {hasExport && <span className="h-1.5 w-1.5 rounded-full bg-fern-light ml-0.5" />}
                </button>
              );
            })}
          </div>

          {/* Export / Download if ready */}
          {activeExport?.downloadUrl && (
            <a
              href={activeExport.downloadUrl}
              download={`${project?.title || 'dubbed_video'}_${selectedLanguage}.mp4`}
              className="flex items-center gap-1.5 rounded-lg bg-fern px-3.5 py-1.5 text-xs font-semibold text-feather hover:bg-fern-light transition-colors shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Video</span>
            </a>
          )}

          {/* Trigger Dub button */}
          <button
            onClick={handleStartDubbing}
            disabled={isTriggeringDub || (activeJob && !['completed', 'failed', 'canceled'].includes(activeJob.status))}
            className="flex items-center gap-1.5 rounded-lg bg-duskyPink px-4 py-1.5 text-xs font-semibold text-heather-950 hover:bg-duskyPink-light transition-all shadow-md shadow-duskyPink/20 disabled:opacity-50"
          >
            {isTriggeringDub ? (
              <span>Queueing...</span>
            ) : activeJob && !['completed', 'failed', 'canceled'].includes(activeJob.status) ? (
              <span className="flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Processing ({activeJob.progress}%)</span>
              </span>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Dub in {selectedLanguage.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main 3-Column Studio Workspace */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Left Panel: Media Specs & Speakers */}
        <aside className="col-span-3 border-r border-heather-700/60 bg-heather-900/60 p-4 overflow-y-auto space-y-4">
          {/* Source video card */}
          <div className="rounded-xl border border-heather-700 bg-heather-900 p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-feather flex items-center gap-1.5">
                <FileVideo className="h-4 w-4 text-duskyPink" />
                <span>Source Media</span>
              </span>
              <span className="text-[10px] font-mono text-eucalyptus">
                {duration ? `${duration.toFixed(1)}s` : 'Unknown'}
              </span>
            </div>

            {originalVideoAsset ? (
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-quartz">
                <div className="bg-heather-950 p-2 rounded border border-heather-800">
                  <span className="text-quartz/50 block text-[9px]">CODEC</span>
                  <span>{originalVideoAsset.metadata?.videoCodec || 'h264'}</span>
                </div>
                <div className="bg-heather-950 p-2 rounded border border-heather-800">
                  <span className="text-quartz/50 block text-[9px]">RESOLUTION</span>
                  <span>{originalVideoAsset.metadata?.width || 1920}x{originalVideoAsset.metadata?.height || 1080}</span>
                </div>
                <div className="bg-heather-950 p-2 rounded border border-heather-800">
                  <span className="text-quartz/50 block text-[9px]">AUDIO</span>
                  <span>{originalVideoAsset.metadata?.audioCodec || 'aac'}</span>
                </div>
                <div className="bg-heather-950 p-2 rounded border border-heather-800">
                  <span className="text-quartz/50 block text-[9px]">FILE SIZE</span>
                  <span>{(originalVideoAsset.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-quartz/60">No original video asset registered.</p>
            )}
          </div>

          {/* Speakers List */}
          <div className="rounded-xl border border-heather-700 bg-heather-900 p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-feather flex items-center gap-1.5">
                <User className="h-4 w-4 text-fern-light" />
                <span>Identified Speakers</span>
              </span>
              <span className="text-[10px] font-mono text-quartz/70">
                {speakers.length || 1} Voice
              </span>
            </div>

            <div className="space-y-2">
              {(speakers.length > 0 ? speakers : [{ id: 's1', displayName: 'Speaker 1 (Lead)' }]).map((sp) => (
                <div
                  key={sp.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-heather-950 border border-heather-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-heather-800 flex items-center justify-center text-feather text-[10px] font-bold">
                      {sp.displayName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-feather leading-tight">{sp.displayName}</p>
                      <p className="text-[10px] text-eucalyptus">Neural Timbre Match</p>
                    </div>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-fern-light" title="Voice profile active" />
                </div>
              ))}
            </div>
          </div>

          {/* Job Pipeline Diagnostics Card */}
          <div className="rounded-xl border border-heather-700 bg-heather-900 p-3.5 space-y-2 text-xs">
            <span className="font-semibold text-feather block">Dubbing State Machine</span>
            {activeJob ? (
              <div className="space-y-2 pt-1 font-mono text-[11px]">
                <div className="flex justify-between text-quartz">
                  <span>Status:</span>
                  <span className="text-feather uppercase font-semibold">{activeJob.status}</span>
                </div>
                <div className="flex justify-between text-quartz">
                  <span>Stage:</span>
                  <span className="text-duskyPink">{activeJob.stage}</span>
                </div>
                <div className="flex justify-between text-quartz">
                  <span>Provider:</span>
                  <span>{activeJob.provider}</span>
                </div>
                {activeJob.errorMessage && (
                  <div className="mt-2 p-2 rounded bg-red-950/40 border border-red-800 text-[10px] text-red-300 font-sans">
                    {activeJob.errorMessage}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-quartz/60">No job queued yet for {selectedLanguage.toUpperCase()}. Click "Dub" to initiate localization.</p>
            )}
          </div>
        </aside>

        {/* Center Panel: Video Player & Timeline */}
        <main className="col-span-6 flex flex-col justify-between p-4 bg-heather-950 overflow-y-auto space-y-4">
          {dubError && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950/40 border border-red-800/80 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <div>
                <p className="font-semibold">Dubbing Provider Configuration Required</p>
                <p className="mt-0.5 text-red-300/80">{dubError}</p>
                <Link href="/app/settings/api" className="text-duskyPink underline font-semibold mt-1 inline-block">
                  Go to API Settings to configure key →
                </Link>
              </div>
            </div>
          )}

          {/* Video Player */}
          <div className="w-full flex-1 flex flex-col justify-center">
            <VideoPlayer
              src={activeVideoUrl}
              currentTime={currentTime}
              onTimeUpdate={(t) => setCurrentTime(t)}
              onDurationChange={(d) => setDuration(d)}
            />
          </div>

          {/* Synchronized Timeline */}
          <div className="w-full shrink-0">
            <Timeline
              duration={duration}
              currentTime={currentTime}
              segments={segments}
              onSeek={(t) => setCurrentTime(t)}
              onSelectSegment={handleSelectSegment}
              activeSegmentId={selectedSegment?.id}
            />
          </div>
        </main>

        {/* Right Panel: Dialogue Segment Inspector & Editor */}
        <aside className="col-span-3 border-l border-heather-700/60 bg-heather-900/60 p-4 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-heather-800">
            <h2 className="text-xs font-semibold text-feather flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-duskyPink" />
              <span>Dialogue Inspector</span>
            </h2>
            {selectedSegment && (
              <span className="text-[10px] font-mono text-eucalyptus">
                Seg #{selectedSegment.sequenceNumber}
              </span>
            )}
          </div>

          {selectedSegment ? (
            <div className="space-y-4 text-xs">
              {/* Segment timing chips */}
              <div className="flex items-center justify-between text-[11px] font-mono bg-heather-950 p-2 rounded-lg border border-heather-800 text-quartz">
                <span>Start: {selectedSegment.startSeconds.toFixed(1)}s</span>
                <span>•</span>
                <span>End: {selectedSegment.endSeconds.toFixed(1)}s</span>
                <span>•</span>
                <span className="text-feather">
                  {(selectedSegment.endSeconds - selectedSegment.startSeconds).toFixed(1)}s
                </span>
              </div>

              {/* Source dialogue (Original) */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-quartz/60 mb-1">
                  Original Source Dialogue ({project?.sourceLanguage?.toUpperCase() || 'EN'})
                </label>
                <div className="p-3 rounded-lg bg-heather-950 border border-heather-800 text-quartz leading-relaxed">
                  {selectedSegment.sourceText}
                </div>
              </div>

              {/* Editable Translation Dialogue */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono uppercase text-duskyPink font-medium">
                    Localized Dialogue ({selectedLanguage.toUpperCase()})
                  </label>
                  <span className="text-[10px] text-quartz/50">{editedText.length} chars</span>
                </div>
                <textarea
                  rows={4}
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full rounded-lg border border-heather-700 bg-heather-950 p-3 text-xs text-feather focus:border-duskyPink focus:outline-none resize-none leading-relaxed"
                  placeholder="Enter localized speech..."
                />
              </div>

              {/* Save & Re-synthesize actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleSaveSegmentEdit}
                  disabled={isSavingSegment}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-duskyPink text-heather-950 font-semibold text-xs hover:bg-duskyPink-light transition-all shadow-sm disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{isSavingSegment ? 'Saving...' : 'Save Dialogue'}</span>
                </button>
              </div>

              {saveSuccessMsg && (
                <div className="flex items-center gap-1.5 text-xs text-fern-light justify-center pt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Dialogue persisted to database</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-quartz/60">
              <MessageSquare className="h-8 w-8 text-quartz/30 mx-auto mb-2" />
              <p>No segment selected.</p>
              <p className="text-[11px] text-quartz/40 mt-1">
                Click a segment block in the timeline to inspect and edit localized dialogue.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
