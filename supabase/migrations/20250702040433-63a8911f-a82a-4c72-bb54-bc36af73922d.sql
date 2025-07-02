-- Check and fix any remaining RLS policy issues

-- First, let's drop ALL policies and recreate them properly to avoid any remaining recursion
DROP POLICY IF EXISTS "Project owners can manage members" ON public.project_members;
DROP POLICY IF EXISTS "Users can view members of projects they have access to" ON public.project_members;

-- Now recreate clean, non-recursive policies for project_members
CREATE POLICY "Users can view project members for their own projects" 
ON public.project_members 
FOR SELECT 
USING (
  -- Users can see members of projects they own
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_members.project_id 
    AND projects.owner_id = auth.uid()
  ) OR
  -- Users can see members of public projects
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_members.project_id 
    AND projects.is_public = true
  ) OR
  -- Users can see themselves in any project they're a member of
  (project_members.user_id = auth.uid())
);

CREATE POLICY "Project owners can manage members" 
ON public.project_members 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_members.project_id 
    AND projects.owner_id = auth.uid()
  )
);