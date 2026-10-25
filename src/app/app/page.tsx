'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  FolderKanban,
  Search,
  Filter,
  Clock,
  Globe,
  Film,
  Download,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Plus,
  Play,
  Key,
} from 'lucide-react';
import { Project } from '@/types';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerHealth, setProviderHealth] = useState<any>(null);

  const fetchDashboardData = async () => {
    try {
      const [projRes, healthRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/health'),
      ]);

      if (projRes.ok) {
        const data = await projRes.json();
        setProjects(data.projects || []);
      }

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setProviderHealth(healthData.services);
      }
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project and its assets?')) return;

    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalMinutes = projects.reduce((acc, p) => acc + (p.durationSeconds || 0), 0) / 60;
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const processingCount = projects.filter(
    (p) => !['draft', 'completed', 'failed', 'canceled'].includes(p.status)
  ).length;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-heather-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-feather">Studio Workspace</h1>
          <p className="text-xs text-quartz/70 mt-1">Manage video dubbing, timeline reviews, and language exports</p>
        </div>
        <Link
          href="/app/projects/new"
          className="flex items-center gap-2 rounded-lg bg-duskyPink px-4 py-2 text-xs font-semibold text-heather-950 hover:bg-duskyPink-light shadow-lg shadow-duskyPink/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Dub Project</span>
        </Link>
      </div>

      {/* Provider Status Notification Banner */}
      {providerHealth && !providerHealth.elevenlabs?.configured && !providerHealth.openai?.configured && (
        <div className="flex items-start justify-between p-4 rounded-xl border border-heather-600 bg-heather-900 text-xs text-quartz shadow-sm">
          <div className="flex items-start gap-3">
            <Key className="h-4 w-4 text-duskyPink shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-feather">AI Provider Setup Available</p>
              <p className="text-quartz/80 mt-0.5">
                Configure your ElevenLabs or OpenAI API key in <code className="text-duskyPink">.env.local</code> to activate live speech recognition and multilingual voice synthesis. Media inspection, upload storage, and FFmpeg processing are active.
              </p>
            </div>
          </div>
          <Link
            href="/app/settings/api"
            className="px-3 py-1.5 rounded-md bg-heather-800 border border-heather-700 hover:border-heather-600 text-feather font-medium text-xs shrink-0 transition-colors"
          >
            Check Provider Keys
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-heather-700/60 bg-heather-900 shadow-sm">
          <span className="text-[11px] font-mono text-quartz/70 uppercase">Total Projects</span>
          <p className="text-2xl font-bold text-feather mt-1">{projects.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-heather-700/60 bg-heather-900 shadow-sm">
          <span className="text-[11px] font-mono text-quartz/70 uppercase">Processed Media</span>
          <p className="text-2xl font-bold text-fern-light mt-1">{totalMinutes.toFixed(1)} mins</p>
        </div>
        <div className="p-4 rounded-xl border border-heather-700/60 bg-heather-900 shadow-sm">
          <span className="text-[11px] font-mono text-quartz/70 uppercase">Completed Dubs</span>
          <p className="text-2xl font-bold text-feather mt-1">{completedCount}</p>
        </div>
        <div className="p-4 rounded-xl border border-heather-700/60 bg-heather-900 shadow-sm">
          <span className="text-[11px] font-mono text-quartz/70 uppercase">Active Processing</span>
          <p className="text-2xl font-bold text-duskyPink mt-1">{processingCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-quartz/50" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-heather-700 bg-heather-900 pl-9 pr-3 py-1.5 text-xs text-feather focus:border-duskyPink focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-quartz/70" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-heather-700 bg-heather-900 px-3 py-1.5 text-xs text-feather focus:border-duskyPink focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="analyzing">Analyzing</option>
            <option value="generating_audio">Dubbing</option>
            <option value="rendering">Rendering</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Project Cards List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-quartz">Loading workspace projects...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-heather-700/80 p-12 text-center bg-heather-900/30">
          <Film className="h-10 w-10 text-quartz/40 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-feather">No projects found</h3>
          <p className="text-xs text-quartz/70 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Try adjusting your search query or status filter.'
              : 'Create your first multilingual dubbing project to get started.'}
          </p>
          {!searchQuery && (
            <div className="mt-5">
              <Link
                href="/app/projects/new"
                className="inline-flex items-center gap-2 rounded-lg bg-duskyPink px-4 py-2 text-xs font-semibold text-heather-950 hover:bg-duskyPink-light transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Create Dub Project</span>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => {
            const durationFormatted = p.durationSeconds
              ? `${Math.floor(p.durationSeconds / 60)}m ${Math.floor(p.durationSeconds % 60)}s`
              : 'Media pending';

            let statusColor = 'bg-heather-800 text-quartz border-heather-700';
            if (p.status === 'completed') statusColor = 'bg-fern/30 text-fern-light border-fern/50';
            if (p.status === 'failed') statusColor = 'bg-red-950/40 text-red-300 border-red-800';
            if (['analyzing', 'transcribing', 'generating_audio', 'rendering'].includes(p.status)) {
              statusColor = 'bg-duskyPink/20 text-duskyPink border-duskyPink/50 animate-pulse';
            }

            return (
              <div
                key={p.id}
                className="group relative flex flex-col justify-between rounded-xl border border-heather-700/60 bg-heather-900 p-5 hover:border-heather-500 hover:shadow-xl transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border capitalize ${statusColor}`}>
                      {p.status.replace('_', ' ')}
                    </span>
                    <button
                      onClick={(e) => handleDeleteProject(p.id, e)}
                      className="text-quartz/40 hover:text-red-400 p-1 transition-colors text-xs"
                      title="Delete Project"
                    >
                      Delete
                    </button>
                  </div>

                  <Link href={`/app/projects/${p.id}/editor`} className="block group-hover:text-duskyPink transition-colors">
                    <h3 className="text-base font-semibold text-feather line-clamp-1">{p.title}</h3>
                  </Link>

                  <div className="mt-4 flex items-center gap-3 text-xs text-quartz/70 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-eucalyptus" />
                      {durationFormatted}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5 text-fern-light" />
                      {p.sourceLanguage.toUpperCase()} → {(p.targetLanguages || []).join(', ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-heather-800 flex items-center justify-between">
                  <span className="text-[10px] text-quartz/50">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/app/projects/${p.id}/editor`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-duskyPink hover:text-duskyPink-light transition-colors"
                  >
                    <span>Open Studio</span>
                    <Play className="h-3 w-3 fill-current" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
