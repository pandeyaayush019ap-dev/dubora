'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, Film, Play, ExternalLink, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { ExportItem } from '@/types';

export default function ExportsPage() {
  const [exportsList, setExportsList] = useState<ExportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/exports')
      .then((res) => res.json())
      .then((data) => setExportsList(data.exports || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto w-full">
      <div className="pb-6 border-b border-heather-800">
        <h1 className="text-2xl font-bold tracking-tight text-feather">Completed Video Exports</h1>
        <p className="text-xs text-quartz/70 mt-1">Verified MP4 video renders ready for multi-platform distribution</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-quartz">Loading exports library...</div>
      ) : exportsList.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-heather-700/80 p-12 text-center bg-heather-900/30">
          <Download className="h-10 w-10 text-quartz/40 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-feather">No video exports rendered yet</h3>
          <p className="text-xs text-quartz/70 mt-1 max-w-sm mx-auto">
            Once a dubbing job completes its FFmpeg remuxing pass, your downloadable MP4 video files will be cataloged here.
          </p>
          <div className="mt-5">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-lg bg-duskyPink px-4 py-2 text-xs font-semibold text-heather-950 hover:bg-duskyPink-light transition-all"
            >
              <span>View Projects</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exportsList.map((exp) => (
            <div
              key={exp.id}
              className="rounded-xl border border-heather-700/60 bg-heather-900 p-5 flex flex-col justify-between hover:border-heather-500 transition-all shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded bg-fern/30 text-fern-light text-[10px] font-mono border border-fern/50 uppercase">
                    {exp.language} • {exp.format.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-mono text-quartz/60">
                    <Clock className="h-3.5 w-3.5 text-eucalyptus" />
                    {exp.durationSeconds.toFixed(1)}s
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-feather truncate mb-2">
                  Dubbed Export ({exp.language.toUpperCase()})
                </h3>
                <p className="text-[11px] text-quartz/70 font-mono">Asset ID: {exp.assetId.slice(0, 12)}...</p>
              </div>

              <div className="mt-6 pt-4 border-t border-heather-800 flex items-center justify-between">
                <Link
                  href={`/app/projects/${exp.projectId}/editor`}
                  className="text-xs text-quartz hover:text-feather transition-colors"
                >
                  Open in Studio
                </Link>

                {exp.downloadUrl && (
                  <a
                    href={exp.downloadUrl}
                    download={`dubora_export_${exp.language}.mp4`}
                    className="flex items-center gap-1.5 rounded-lg bg-duskyPink px-3.5 py-1.5 text-xs font-semibold text-heather-950 hover:bg-duskyPink-light transition-colors shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
