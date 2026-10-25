'use client';

import React, { useState, useEffect } from 'react';
import { Key, CheckCircle2, XCircle, Cpu, Server, Shield, RefreshCw } from 'lucide-react';
import { ProviderHealthReport } from '@/lib/providers/registry';

export default function ApiSettingsPage() {
  const [health, setHealth] = useState<ProviderHealthReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth(data.services);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between pb-6 border-b border-heather-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-feather">AI Provider & Service Registry</h1>
          <p className="text-xs text-quartz/70 mt-1">
            Status of background processors, media engines, and external voice synthesis services
          </p>
        </div>
        <button
          onClick={fetchHealth}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-heather-700 bg-heather-900 text-xs text-quartz hover:text-feather transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {health ? (
        <div className="space-y-6">
          {/* ElevenLabs Provider Card */}
          <div className="p-6 rounded-xl border border-heather-700/60 bg-heather-900 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-heather-800 border border-heather-700 flex items-center justify-center text-duskyPink font-bold text-sm">
                  XI
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-feather">ElevenLabs Dubbing API</h3>
                  <p className="text-xs text-quartz/70">Integrated end-to-end voice dubbing and ambient soundtrack preservation</p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  health.elevenlabs.configured
                    ? 'bg-fern/30 text-fern-light border-fern/50'
                    : 'bg-heather-800 text-quartz border-heather-700'
                }`}
              >
                {health.elevenlabs.configured ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-fern-light" />
                    <span>Configured (Ready)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5 text-quartz/50" />
                    <span>Awaiting API Key</span>
                  </>
                )}
              </span>
            </div>

            <div className="text-xs text-quartz pt-2 border-t border-heather-800 space-y-2">
              <p className="text-quartz/80">
                To activate ElevenLabs Dubbing, add the following to your server <code className="text-duskyPink bg-heather-950 px-1 py-0.5 rounded">.env.local</code>:
              </p>
              <pre className="p-3 rounded-lg bg-heather-950 border border-heather-800 text-[11px] font-mono text-quartz overflow-x-auto">
                ELEVENLABS_API_KEY="xi_your_api_key_here"
              </pre>
            </div>
          </div>

          {/* OpenAI Whisper / Modular Pipeline Card */}
          <div className="p-6 rounded-xl border border-heather-700/60 bg-heather-900 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-heather-800 border border-heather-700 flex items-center justify-center text-eucalyptus font-bold text-sm">
                  OA
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-feather">OpenAI Modular Engine (Whisper + GPT-4o + TTS)</h3>
                  <p className="text-xs text-quartz/70">Segment-level dialogue transcription, contextual translation, and neural speech</p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  health.openai.configured
                    ? 'bg-fern/30 text-fern-light border-fern/50'
                    : 'bg-heather-800 text-quartz border-heather-700'
                }`}
              >
                {health.openai.configured ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-fern-light" />
                    <span>Configured (Ready)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5 text-quartz/50" />
                    <span>Awaiting API Key</span>
                  </>
                )}
              </span>
            </div>

            <div className="text-xs text-quartz pt-2 border-t border-heather-800 space-y-2">
              <p className="text-quartz/80">
                Add to your server <code className="text-duskyPink bg-heather-950 px-1 py-0.5 rounded">.env.local</code>:
              </p>
              <pre className="p-3 rounded-lg bg-heather-950 border border-heather-800 text-[11px] font-mono text-quartz overflow-x-auto">
                OPENAI_API_KEY="sk-proj-your_api_key_here"
              </pre>
            </div>
          </div>

          {/* Native Media & Storage Infrastructure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border border-heather-700/60 bg-heather-900 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-feather flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-fern-light" />
                  <span>FFmpeg / FFprobe Media Worker</span>
                </span>
                <span className="text-[10px] font-mono text-fern-light bg-fern/20 px-2 py-0.5 rounded">ACTIVE</span>
              </div>
              <p className="text-xs text-quartz/80">
                Binary: {health.ffmpeg.version}. Configured for stream-copy remuxing, audio extraction, and frame-rate probing.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-heather-700/60 bg-heather-900 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-feather flex items-center gap-2">
                  <Server className="h-4 w-4 text-duskyPink" />
                  <span>Private Object Storage</span>
                </span>
                <span className="text-[10px] font-mono text-fern-light bg-fern/20 px-2 py-0.5 rounded">READY</span>
              </div>
              <p className="text-xs text-quartz/80">
                Engine: <span className="font-mono text-feather">{health.storage.provider}</span>. Serving authenticated streaming chunks with HTTP 206 Partial Content support.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center text-xs text-quartz">Loading provider registry status...</div>
      )}
    </div>
  );
}
