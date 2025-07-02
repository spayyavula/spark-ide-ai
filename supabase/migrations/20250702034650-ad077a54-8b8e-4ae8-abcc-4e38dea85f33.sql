-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('owner', 'senior_dev', 'developer', 'viewer');

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_public BOOLEAN NOT NULL DEFAULT false
);

-- Create project_members table for collaboration
CREATE TABLE public.project_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'developer',
  invited_by UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Create project_presence table for real-time presence
CREATE TABLE public.project_presence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  cursor_position JSONB,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(project_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_presence ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check project access
CREATE OR REPLACE FUNCTION public.has_project_access(_project_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = _project_id 
    AND (p.owner_id = _user_id OR p.is_public = true)
  ) OR EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = _project_id 
    AND pm.user_id = _user_id
  );
$$;

-- RLS Policies for projects
CREATE POLICY "Users can view projects they own or are members of"
ON public.projects FOR SELECT
USING (
  owner_id = auth.uid() OR 
  is_public = true OR
  EXISTS (
    SELECT 1 FROM public.project_members 
    WHERE project_id = id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own projects"
ON public.projects FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Project owners can update their projects"
ON public.projects FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY "Project owners can delete their projects"
ON public.projects FOR DELETE
USING (owner_id = auth.uid());

-- RLS Policies for project_members
CREATE POLICY "Users can view members of projects they have access to"
ON public.project_members FOR SELECT
USING (public.has_project_access(project_id, auth.uid()));

CREATE POLICY "Project owners can manage members"
ON public.project_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = project_id AND owner_id = auth.uid()
  )
);

-- RLS Policies for project_presence
CREATE POLICY "Users can view presence in projects they have access to"
ON public.project_presence FOR SELECT
USING (public.has_project_access(project_id, auth.uid()));

CREATE POLICY "Users can insert their own presence"
ON public.project_presence FOR INSERT
WITH CHECK (user_id = auth.uid() AND public.has_project_access(project_id, auth.uid()));

CREATE POLICY "Users can update their own presence records"
ON public.project_presence FOR UPDATE
USING (user_id = auth.uid() AND public.has_project_access(project_id, auth.uid()));

CREATE POLICY "Users can delete their own presence records"
ON public.project_presence FOR DELETE
USING (user_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for collaboration
ALTER TABLE public.project_presence REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_presence;

ALTER TABLE public.project_members REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_members;