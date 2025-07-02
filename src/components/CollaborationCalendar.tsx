import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarPlus, Clock, Users, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Meeting {
  id: string;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  created_by: string;
  project_id: string;
  invitations?: MeetingInvitation[];
}

interface MeetingInvitation {
  id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'declined';
  invited_at: string;
  responded_at?: string;
}

interface CollaborationCalendarProps {
  selectedProject: string | null;
  currentUserId: string;
  projectMembers: any[];
}

const CollaborationCalendar = ({ selectedProject, currentUserId, projectMembers }: CollaborationCalendarProps) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isCreateMeetingOpen, setIsCreateMeetingOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    time: "",
    duration: "60",
    invitees: [] as string[]
  });

  // Load meetings for selected project
  useEffect(() => {
    if (selectedProject) {
      loadMeetings();
    }
  }, [selectedProject]);

  const loadMeetings = async () => {
    if (!selectedProject) return;

    try {
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          meeting_invitations (
            id,
            user_id,
            status,
            invited_at,
            responded_at
          )
        `)
        .eq('project_id', selectedProject)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setMeetings(data || []);
    } catch (error) {
      console.error('Error loading meetings:', error);
      toast({
        title: "Error loading meetings",
        description: "Failed to load scheduled meetings.",
        variant: "destructive"
      });
    }
  };

  const createMeeting = async () => {
    if (!selectedProject || !selectedDate || !newMeeting.title || !newMeeting.time) return;

    try {
      // Combine date and time
      const [hours, minutes] = newMeeting.time.split(':');
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

      // Create meeting
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          title: newMeeting.title,
          description: newMeeting.description,
          scheduled_at: scheduledDateTime.toISOString(),
          duration_minutes: parseInt(newMeeting.duration),
          project_id: selectedProject,
          created_by: currentUserId
        })
        .select()
        .single();

      if (meetingError) throw meetingError;

      // Create invitations
      if (newMeeting.invitees.length > 0) {
        const invitations = newMeeting.invitees.map(userId => ({
          meeting_id: meeting.id,
          user_id: userId,
          invited_by: currentUserId
        }));

        const { error: inviteError } = await supabase
          .from('meeting_invitations')
          .insert(invitations);

        if (inviteError) throw inviteError;
      }

      toast({
        title: "Meeting scheduled",
        description: `"${newMeeting.title}" has been scheduled successfully.`
      });

      // Reset form and reload meetings
      setNewMeeting({ title: "", description: "", time: "", duration: "60", invitees: [] });
      setIsCreateMeetingOpen(false);
      loadMeetings();
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({
        title: "Error creating meeting",
        description: "Failed to schedule the meeting. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleInviteeToggle = (userId: string) => {
    setNewMeeting(prev => ({
      ...prev,
      invitees: prev.invitees.includes(userId)
        ? prev.invitees.filter(id => id !== userId)
        : [...prev.invitees, userId]
    }));
  };

  const getMeetingsForDate = (date: Date) => {
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.scheduled_at);
      return meetingDate.toDateString() === date.toDateString();
    });
  };

  const selectedDateMeetings = selectedDate ? getMeetingsForDate(selectedDate) : [];

  const getDaysWithMeetings = () => {
    return meetings.map(meeting => new Date(meeting.scheduled_at));
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card className="shadow-elevation">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Collaboration Calendar
              </CardTitle>
              <CardDescription>
                Schedule and manage collaboration meetings
              </CardDescription>
            </div>
            {selectedProject && (
              <Dialog open={isCreateMeetingOpen} onOpenChange={setIsCreateMeetingOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary hover:opacity-90">
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule Collaboration Meeting</DialogTitle>
                    <DialogDescription>
                      Set up a meeting for project collaboration
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="meeting-title">Meeting Title</Label>
                      <Input
                        id="meeting-title"
                        placeholder="Sprint Planning Session"
                        value={newMeeting.title}
                        onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="meeting-description">Description (Optional)</Label>
                      <Textarea
                        id="meeting-description"
                        placeholder="Discuss project milestones and next steps..."
                        value={newMeeting.description}
                        onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="meeting-time">Time</Label>
                        <Input
                          id="meeting-time"
                          type="time"
                          value={newMeeting.time}
                          onChange={(e) => setNewMeeting(prev => ({ ...prev, time: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="meeting-duration">Duration</Label>
                        <Select value={newMeeting.duration} onValueChange={(value) => setNewMeeting(prev => ({ ...prev, duration: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="90">1.5 hours</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {projectMembers.length > 0 && (
                      <div>
                        <Label>Invite Team Members</Label>
                        <div className="mt-2 space-y-2">
                          {projectMembers.map((member) => (
                            <div key={member.user_id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`member-${member.user_id}`}
                                checked={newMeeting.invitees.includes(member.user_id)}
                                onChange={() => handleInviteeToggle(member.user_id)}
                                className="rounded"
                              />
                              <label htmlFor={`member-${member.user_id}`} className="text-sm">
                                {member.user_name || 'Team Member'}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateMeetingOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createMeeting}>
                      Schedule Meeting
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{
              hasMeeting: getDaysWithMeetings()
            }}
            modifiersClassNames={{
              hasMeeting: "bg-primary/20 text-primary font-medium"
            }}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Meeting Details */}
      <Card className="shadow-elevation">
        <CardHeader>
          <CardTitle>
            {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
          </CardTitle>
          <CardDescription>
            {selectedDateMeetings.length > 0 
              ? `${selectedDateMeetings.length} meeting${selectedDateMeetings.length > 1 ? 's' : ''} scheduled`
              : "No meetings scheduled for this date"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedDateMeetings.length > 0 ? (
            <div className="space-y-4">
              {selectedDateMeetings.map((meeting) => (
                <div key={meeting.id} className="p-4 rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{meeting.title}</h3>
                    <Badge variant="secondary">
                      {format(new Date(meeting.scheduled_at), "HH:mm")}
                    </Badge>
                  </div>
                  {meeting.description && (
                    <p className="text-sm text-muted-foreground mb-3">{meeting.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {meeting.duration_minutes} minutes
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {meeting.invitations?.length || 0} invited
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No meetings scheduled for this date</p>
              {selectedProject && (
                <p className="text-sm mt-2">Click "Schedule Meeting" to add one</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CollaborationCalendar;