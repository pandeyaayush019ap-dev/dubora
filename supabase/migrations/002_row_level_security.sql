-- ==============================================================================
-- DUBORA SCHEMA MIGRATION 002: ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcript_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dubbing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;

-- Security helper function to check workspace membership
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.workspace_members wm
        JOIN public.profiles p ON wm.user_id = p.id
        WHERE wm.workspace_id = ws_id
        AND p.auth_user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = auth_user_id);

-- 2. WORKSPACES POLICIES
CREATE POLICY "Users can view workspaces they belong to"
    ON public.workspaces FOR SELECT
    USING (public.is_workspace_member(id));

CREATE POLICY "Workspace owners can update their workspace"
    ON public.workspaces FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = owner_id AND p.auth_user_id = auth.uid()
        )
    );

-- 3. WORKSPACE MEMBERS POLICIES
CREATE POLICY "Members can view other members in the workspace"
    ON public.workspace_members FOR SELECT
    USING (public.is_workspace_member(workspace_id));

-- 4. PROJECTS POLICIES
CREATE POLICY "Workspace members can view projects"
    ON public.projects FOR SELECT
    USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can insert projects"
    ON public.projects FOR INSERT
    WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can update projects"
    ON public.projects FOR UPDATE
    USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can delete projects"
    ON public.projects FOR DELETE
    USING (public.is_workspace_member(workspace_id));

-- 5. MEDIA ASSETS POLICIES
CREATE POLICY "Workspace members can access media assets"
    ON public.media_assets FOR ALL
    USING (public.is_workspace_member(workspace_id));

-- 6. TRANSCRIPTS & SEGMENTS POLICIES
CREATE POLICY "Workspace members can access transcripts"
    ON public.transcripts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND public.is_workspace_member(p.workspace_id)
        )
    );

CREATE POLICY "Workspace members can access transcript segments"
    ON public.transcript_segments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.transcripts t
            JOIN public.projects p ON t.project_id = p.id
            WHERE t.id = transcript_id AND public.is_workspace_member(p.workspace_id)
        )
    );

-- 7. DUBBING JOBS & EXPORTS POLICIES
CREATE POLICY "Workspace members can access dubbing jobs"
    ON public.dubbing_jobs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND public.is_workspace_member(p.workspace_id)
        )
    );

CREATE POLICY "Workspace members can access exports"
    ON public.exports FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id AND public.is_workspace_member(p.workspace_id)
        )
    );

-- 8. USAGE EVENTS & GLOSSARY
CREATE POLICY "Workspace members can view usage"
    ON public.usage_events FOR SELECT
    USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can view and manage glossary"
    ON public.glossary_terms FOR ALL
    USING (public.is_workspace_member(workspace_id));
