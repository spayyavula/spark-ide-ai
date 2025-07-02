-- Fix infinite recursion in RLS policies

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Users can view projects they own or are members of" ON public.projects;
DROP POLICY IF EXISTS "Users can view members of projects they have access to" ON public.project_members;

-- Fix the projects SELECT policy (the issue was project_members.project_id = project_members.id should be project_members.project_id = projects.id)
CREATE POLICY "Users can view projects they own or are members of" 
ON public.projects 
FOR SELECT 
USING (
  (owner_id = auth.uid()) OR 
  (is_public = true) OR 
  (EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_members.project_id = projects.id 
    AND project_members.user_id = auth.uid()
  ))
);

-- Create a simpler policy for project_members that doesn't use the has_project_access function to avoid recursion
CREATE POLICY "Users can view members of projects they have access to" 
ON public.project_members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_members.project_id 
    AND (
      projects.owner_id = auth.uid() OR 
      projects.is_public = true OR
      project_members.user_id = auth.uid()
    )
  )
);