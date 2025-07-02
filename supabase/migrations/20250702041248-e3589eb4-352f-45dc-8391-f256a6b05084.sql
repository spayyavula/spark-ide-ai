-- Temporarily disable RLS for testing with mock auth
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_presence DISABLE ROW LEVEL SECURITY;