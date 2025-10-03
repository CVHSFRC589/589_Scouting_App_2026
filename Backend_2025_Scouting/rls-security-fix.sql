-- RLS Security Fix for FRC Scouting Database
-- Run this in your Supabase SQL Editor to fix the RLS security issue

-- Enable RLS on all tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.robot_info ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (FRC data is typically public)
-- Teams - allow public read, authenticated users can insert/update
CREATE POLICY "teams_public_read" ON public.teams
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "teams_authenticated_write" ON public.teams
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Matches - allow public read, authenticated users can insert/update
CREATE POLICY "matches_public_read" ON public.matches
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "matches_authenticated_write" ON public.matches
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Robot info - allow public read, authenticated users can insert/update
CREATE POLICY "robot_info_public_read" ON public.robot_info
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "robot_info_authenticated_write" ON public.robot_info
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('teams', 'matches', 'robot_info');