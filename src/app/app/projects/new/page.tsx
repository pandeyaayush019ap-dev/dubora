'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Check, Globe, Film, ChevronRight, Video } from 'lucide-react';
import Link from 'next/link';
import { UploadZone } from '@/components/upload-zone';
import { SUPPORTED_LANGUAGES } from '@/lib/providers/registry';
import { Project } from '@/types';

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [selectedTargets, setSelectedTargets] = useState<string[]>(['es']);
  const [createdProject, setCreatedProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTarget = (code: string) => {
    if (selectedTargets.includes(code)) {
      if (selectedTargets.length > 1) {
        setSelectedTargets(selectedTargets.filter((c) => c !== code));
      }
    } else {
      setSelectedTargets([...selectedTargets, code]);
    }
  };

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a project title');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          sourceLanguage: sourceLang,
          targetLanguages: selectedTargets,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create project');
      }

      const { project } = await res.json();
      setCreatedProject(project);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Error creating project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadComplete = (updatedProject: Project) => {
    // Proceed directly to the Dubbing Studio Editor
    router.push(`/app/projects/${updatedProject.id}/editor`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 text-xs text-quartz hover:text-feather transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Projects</span>
        </Link>
      </div>

      {/* Header */}
      <div className="pb-6 border-b border-heather-800">
        <h1 className="text-2xl font-bold tracking-tight text-feather">New Localization Project</h1>
        <p className="text-xs text-quartz/70 mt-1">Configure your languages and upload a source video file</p>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center gap-3 text-xs">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
            step === 1
              ? 'bg-duskyPink/15 border-duskyPink text-feather font-semibold'
              : 'bg-heather-900 border-heather-700/60 text-quartz/70'
          }`}
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-heather-800 text-[10px] font-mono">1</span>
          <span>Target Languages</span>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-quartz/40" />
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
            step === 2
              ? 'bg-duskyPink/15 border-duskyPink text-feather font-semibold'
              : 'bg-heather-900 border-heather-700/60 text-quartz/70'
          }`}
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-heather-800 text-[10px] font-mono">2</span>
          <span>Upload & Inspect Video</span>
        </div>
      </div>

      {/* Step 1: Project Details & Languages */}
      {step === 1 && (
        <form onSubmit={handleCreateDraft} className="space-y-6 bg-heather-900 p-6 rounded-2xl border border-heather-700/70 shadow-xl">
          <div>
            <label className="block text-xs font-semibold text-feather mb-1.5">Project Title</label>
            <input
              type="text"
              placeholder="e.g. Product Launch Keynote 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-heather-700 bg-heather-950 px-3.5 py-2 text-xs text-feather focus:border-duskyPink focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-feather mb-1.5">Source Audio Language</label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full rounded-lg border border-heather-700 bg-heather-950 px-3 py-2 text-xs text-feather focus:border-duskyPink focus:outline-none"
              >
                <option value="auto">Auto-detect speech</option>
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-feather">Target Localization Languages</label>
              <span className="text-[11px] text-eucalyptus font-mono">{selectedTargets.length} selected</span>
            </div>
            <p className="text-[11px] text-quartz/70 mb-3">
              Select one or more languages. Dubora generates independent dubbing tracks with individual synchronization.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = selectedTargets.includes(lang.code);
                return (
                  <div
                    key={lang.code}
                    onClick={() => toggleTarget(lang.code)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-duskyPink/20 border-duskyPink text-feather font-medium shadow-sm'
                        : 'bg-heather-950 border-heather-800 text-quartz hover:border-heather-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{lang.flag}</span>
                      <span className="truncate">{lang.name}</span>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-duskyPink shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="pt-4 border-t border-heather-800 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-duskyPink px-5 py-2.5 text-xs font-semibold text-heather-950 hover:bg-duskyPink-light transition-all shadow-md shadow-duskyPink/20 disabled:opacity-50"
            >
              <span>Continue to Upload</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Video Upload & Inspection */}
      {step === 2 && createdProject && (
        <div className="space-y-6 bg-heather-900 p-6 rounded-2xl border border-heather-700/70 shadow-xl">
          <div>
            <h2 className="text-sm font-semibold text-feather">Upload Source Media</h2>
            <p className="text-xs text-quartz/70 mt-0.5">
              Targeting: <span className="text-feather font-medium">{createdProject.title}</span> • {selectedTargets.join(', ').toUpperCase()}
            </p>
          </div>

          <UploadZone projectId={createdProject.id} onUploadSuccess={handleUploadComplete} />

          <div className="pt-4 border-t border-heather-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-quartz hover:text-feather transition-colors"
            >
              Change project settings
            </button>
            <Link
              href={`/app/projects/${createdProject.id}/editor`}
              className="text-xs text-duskyPink hover:underline"
            >
              Skip upload for now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
