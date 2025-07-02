-- Completely reset RLS policies with simple, non-recursive approach

-- Disable RLS temporarily
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view projects they own or are members of" ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Project owners can update their projects" ON public.projects;
DROP POLICY IF EXISTS "Project owners can delete their projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view project members for their own projects" ON public.project_members;
DROP POLICY IF EXISTS "Project owners can manage members" ON public.project_members;

-- Re-enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for projects
CREATE POLICY "Users can view their own projects and public projects" 
ON public.projects 
FOR SELECT 
USING (owner_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can create projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own projects" 
ON public.projects 
FOR UPDATE 
USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own projects" 
ON public.projects 
FOR DELETE 
USING (owner_id = auth.uid());

-- Create simple policies for project_members (no cross-table references)
CREATE POLICY "Users can view all project members" 
ON public.project_members 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert project members" 
ON public.project_members 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update project members" 
ON public.project_members 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete project members" 
ON public.project_members 
FOR DELETE 
USING (true);