-- Fix security issues by properly enabling RLS and fixing function search paths

-- Enable RLS on tables that currently have it disabled but have policies
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_invitations ENABLE ROW LEVEL SECURITY;

-- Fix function search path issues for security
CREATE OR REPLACE FUNCTION public.has_project_access(_project_id uuid, _user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = _project_id 
    AND (p.owner_id = _user_id OR p.is_public = true)
  ) OR EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = _project_id 
    AND pm.user_id = _user_id
  );
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;