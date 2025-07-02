import { useState, useEffect } from "react";
import { Brain, Code, Users, GitBranch, Settings, LogOut, UserPlus, Share2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMockAuth } from "@/hooks/useMockAuth";
import { useProjectPresence } from "@/hooks/useProjectPresence";
import PresenceIndicator from "@/components/PresenceIndicator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user, logout } = useMockAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("developer");
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Real-time presence for selected project
  const { presenceUsers, isConnected, updateCursorPosition } = useProjectPresence(
    selectedProject,
    user ? { id: user.id, name: user.name } : null
  );

  // Track mouse movement for cursor position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (selectedProject && user) {
        updateCursorPosition(e.clientX, e.clientY);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [selectedProject, user, updateCursorPosition]);

  // Load user's projects
  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_members (
            id,
            role,
            user_id
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // For demo purposes, create some mock projects if none exist
      if (!data || data.length === 0) {
        const mockProjects = [
          {
            id: '1',
            name: 'React E-commerce App',
            description: 'A full-stack e-commerce application built with React and Node.js',
            owner_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_public: false,
            project_members: []
          },
          {
            id: '2', 
            name: 'Mobile Dashboard',
            description: 'Real-time analytics dashboard for mobile applications',
            owner_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_public: true,
            project_members: []
          }
        ];
        setProjects(mockProjects);
      } else {
        setProjects(data);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: "Error loading projects",
        description: "There was an issue loading your projects. Please try again.",
        variant: "destructive"
      });
    }
  };

  const createProject = async () => {
    if (!user || !newProjectName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: newProjectName,
          description: newProjectDescription,
          owner_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setProjects(prev => [data, ...prev]);
      setNewProjectName("");
      setNewProjectDescription("");
      setIsCreateProjectOpen(false);
      
      toast({
        title: "Project created",
        description: `"${newProjectName}" has been created successfully.`
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error creating project",
        description: "There was an issue creating your project. Please try again.",
        variant: "destructive"
      });
    }
  };

  const inviteCollaborator = async () => {
    if (!selectedProject || !inviteEmail.trim()) return;

    // For demo purposes, just show a success message
    toast({
      title: "Invitation sent",
      description: `An invitation has been sent to ${inviteEmail} to collaborate as ${inviteRole}.`
    });
    
    setInviteEmail("");
    setInviteRole("developer");
    setIsInviteOpen(false);
  };

  const joinProject = (projectId: string) => {
    setSelectedProject(projectId);
    toast({
      title: "Joined project",
      description: "You're now collaborating live on this project!"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-glow">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Brain className="w-8 h-8 text-primary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ThumbsUp Dev
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.name}
            </span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Show presence indicator if project is selected */}
      {selectedProject && (
        <PresenceIndicator 
          presenceUsers={presenceUsers}
          isConnected={isConnected}
          currentUserId={user?.id || ''}
        />
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Header with actions */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Your Projects</h2>
              <p className="text-muted-foreground">
                Collaborate with developers worldwide in real-time
              </p>
            </div>
            <div className="flex gap-2">
              {selectedProject && (
                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-primary hover:opacity-90">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite Collaborator
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Collaborator</DialogTitle>
                      <DialogDescription>
                        Invite a developer to collaborate on this project in real-time.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="invite-email">Email</Label>
                        <Input
                          id="invite-email"
                          type="email"
                          placeholder="developer@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="invite-role">Role</Label>
                        <Select value={inviteRole} onValueChange={setInviteRole}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="senior_dev">Senior Developer</SelectItem>
                            <SelectItem value="developer">Developer</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={inviteCollaborator}>
                        Send Invitation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              
              <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Code className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                      Start a new collaborative development project.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="project-name">Project Name</Label>
                      <Input
                        id="project-name"
                        placeholder="My Awesome Project"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="project-description">Description</Label>
                      <Input
                        id="project-description"
                        placeholder="Brief description of your project"
                        value={newProjectDescription}
                        onChange={(e) => setNewProjectDescription(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateProjectOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createProject}>
                      Create Project
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className={`shadow-elevation cursor-pointer transition-all hover:shadow-lg ${
                  selectedProject === project.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => joinProject(project.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {project.description || 'No description provided'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {project.is_public && (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                      <Share2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {project.project_members?.length || 0} collaborators
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      variant={selectedProject === project.id ? "default" : "outline"}
                    >
                      {selectedProject === project.id ? "Live" : "Join"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty state */}
          {projects.length === 0 && (
            <Card className="shadow-elevation">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Code className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first project to start collaborating with developers worldwide
                </p>
                <Button onClick={() => setIsCreateProjectOpen(true)}>
                  Create Your First Project
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;