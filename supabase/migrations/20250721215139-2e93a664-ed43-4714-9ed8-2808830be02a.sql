-- Fix critical RLS security issues on project_members table
-- Replace overpermissive policies with proper access controls

-- Drop the overpermissive policies
DROP POLICY IF EXISTS "Anyone can insert project members" ON public.project_members;
DROP POLICY IF EXISTS "Anyone can update project members" ON public.project_members;
DROP POLICY IF EXISTS "Anyone can delete project members" ON public.project_members;
DROP POLICY IF EXISTS "Users can view all project members" ON public.project_members;

-- Create secure RLS policies for project_members
CREATE POLICY "Users can view project members for projects they have access to" 
ON public.project_members 
FOR SELECT 
USING (
  -- Users can see members of projects they own
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_members.project_id 
    AND projects.owner_id = auth.uid()
  ) OR
  -- Users can see members of public projects
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_members.project_id 
    AND projects.is_public = true
  ) OR
  -- Users can see themselves in any project they're a member of
  (project_members.user_id = auth.uid())
);

CREATE POLICY "Project owners can add members to their projects" 
ON public.project_members 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_members.project_id 
    AND projects.owner_id = auth.uid()
  ) AND invited_by = auth.uid()
);

CREATE POLICY "Project owners can update members in their projects" 
ON public.project_members 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_members.project_id 
    AND projects.owner_id = auth.uid()
  )
);

CREATE POLICY "Project owners can remove members from their projects" 
ON public.project_members 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_members.project_id 
    AND projects.owner_id = auth.uid()
  )
);