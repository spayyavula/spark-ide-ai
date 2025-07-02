-- Create meetings table for scheduled collaboration sessions
CREATE TABLE public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meeting invitations table
CREATE TABLE public.meeting_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  invited_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for meetings
CREATE POLICY "Users can view meetings for projects they have access to" 
ON public.meetings 
FOR SELECT 
USING (has_project_access(project_id, auth.uid()));

CREATE POLICY "Users can create meetings for projects they have access to" 
ON public.meetings 
FOR INSERT 
WITH CHECK (has_project_access(project_id, auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Meeting creators can update their meetings" 
ON public.meetings 
FOR UPDATE 
USING (created_by = auth.uid());

CREATE POLICY "Meeting creators can delete their meetings" 
ON public.meetings 
FOR DELETE 
USING (created_by = auth.uid());

-- RLS policies for meeting invitations
CREATE POLICY "Users can view invitations for meetings they have access to" 
ON public.meeting_invitations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.meetings m 
    WHERE m.id = meeting_invitations.meeting_id 
    AND has_project_access(m.project_id, auth.uid())
  )
);

CREATE POLICY "Users can create invitations for meetings they created" 
ON public.meeting_invitations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.meetings m 
    WHERE m.id = meeting_invitations.meeting_id 
    AND m.created_by = auth.uid()
  ) AND invited_by = auth.uid()
);

CREATE POLICY "Users can update their own invitation responses" 
ON public.meeting_invitations 
FOR UPDATE 
USING (user_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_meetings_updated_at
BEFORE UPDATE ON public.meetings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();