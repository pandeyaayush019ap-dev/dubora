-- ==============================================================================
-- DUBORA SCHEMA MIGRATION 001: CORE TABLES & INDEXES
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    preferred_language VARCHAR(10) DEFAULT 'en',
    onboarding_completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. WORKSPACES
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) DEFAULT 'creator',
    monthly_source_minutes_limit INT DEFAULT 60,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. WORKSPACE MEMBERS
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(30) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (workspace_id, user_id)
);

-- 4. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    source_language VARCHAR(10) NOT NULL DEFAULT 'auto',
    original_asset_id UUID,
    status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (
        status IN (
            'draft', 'uploading', 'queued', 'analyzing', 
            'transcribing', 'translating', 'generating_audio', 
            'synchronizing', 'rendering', 'completed', 'failed', 'canceled'
        )
    ),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. MEDIA ASSETS
CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL CHECK (
        asset_type IN ('original_video', 'extracted_audio', 'dubbed_audio', 'rendered_video', 'thumbnail', 'subtitles')
    ),
    storage_key TEXT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    duration_seconds NUMERIC(10, 3) DEFAULT 0,
    checksum TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. SPEAKERS
CREATE TABLE IF NOT EXISTS public.speakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    provider_voice_id TEXT,
    voice_configuration JSONB DEFAULT '{}'::jsonb,
    consent_reference TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. TRANSCRIPTS
CREATE TABLE IF NOT EXISTS public.transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    version INT NOT NULL DEFAULT 1,
    source_language VARCHAR(10) NOT NULL,
    content TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'edited', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. TRANSCRIPT SEGMENTS
CREATE TABLE IF NOT EXISTS public.transcript_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transcript_id UUID NOT NULL REFERENCES public.transcripts(id) ON DELETE CASCADE,
    speaker_id UUID REFERENCES public.speakers(id) ON DELETE SET NULL,
    sequence_number INT NOT NULL,
    start_seconds NUMERIC(10, 3) NOT NULL,
    end_seconds NUMERIC(10, 3) NOT NULL,
    source_text TEXT NOT NULL,
    translated_text TEXT,
    target_language VARCHAR(10),
    confidence NUMERIC(4, 3) DEFAULT 1.0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. DUBBING JOBS
CREATE TABLE IF NOT EXISTS public.dubbing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    target_language VARCHAR(10) NOT NULL,
    provider VARCHAR(50) NOT NULL DEFAULT 'elevenlabs',
    provider_job_id TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'queued' CHECK (
        status IN ('queued', 'analyzing', 'transcribing', 'translating', 'generating_audio', 'synchronizing', 'rendering', 'completed', 'failed', 'canceled')
    ),
    stage VARCHAR(50) NOT NULL DEFAULT 'initializing',
    progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    error_code VARCHAR(100),
    error_message TEXT,
    attempt_count INT NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. EXPORTS
CREATE TABLE IF NOT EXISTS public.exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    dubbing_job_id UUID REFERENCES public.dubbing_jobs(id) ON DELETE SET NULL,
    language VARCHAR(10) NOT NULL,
    asset_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
    format VARCHAR(20) NOT NULL DEFAULT 'mp4',
    duration_seconds NUMERIC(10, 3) DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'ready' CHECK (status IN ('processing', 'ready', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. USAGE EVENTS
CREATE TABLE IF NOT EXISTS public.usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    job_id UUID REFERENCES public.dubbing_jobs(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    quantity NUMERIC(10, 3) NOT NULL DEFAULT 0,
    unit VARCHAR(30) NOT NULL DEFAULT 'seconds',
    estimated_cost NUMERIC(10, 4) DEFAULT 0,
    actual_cost NUMERIC(10, 4) DEFAULT 0,
    provider VARCHAR(50),
    idempotency_key TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. GLOSSARY TERMS
CREATE TABLE IF NOT EXISTS public.glossary_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    source_term TEXT NOT NULL,
    target_term TEXT NOT NULL,
    source_language VARCHAR(10) NOT NULL,
    target_language VARCHAR(10) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_projects_workspace ON public.projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_project ON public.media_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_project ON public.transcripts(project_id);
CREATE INDEX IF NOT EXISTS idx_segments_transcript ON public.transcript_segments(transcript_id);
CREATE INDEX IF NOT EXISTS idx_segments_sequence ON public.transcript_segments(transcript_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_jobs_project ON public.dubbing_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.dubbing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_exports_project ON public.exports(project_id);
CREATE INDEX IF NOT EXISTS idx_usage_workspace ON public.usage_events(workspace_id);
