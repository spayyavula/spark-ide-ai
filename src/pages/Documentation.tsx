import { Brain, Code, Zap, GitBranch, Users, Rocket, ChevronRight, BookOpen, Terminal, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const Documentation = () => {
  return (
    <div className="min-h-screen bg-gradient-glow">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative">
              <Brain className="w-8 h-8 text-primary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ThumbsUp Dev
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/pricing">Pricing</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl font-bold">Documentation</h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to build amazing projects with ThumbsUp Dev
            </p>
          </div>

          {/* Quick Start */}
          <Card className="mb-8 shadow-elevation">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Rocket className="w-6 h-6 text-primary" />
                <CardTitle>Quick Start Guide</CardTitle>
              </div>
              <CardDescription>Get up and running in minutes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold">Create Your Account</h4>
                    <p className="text-sm text-muted-foreground">Sign up with your email to access the full IDE experience</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold">Start Your First Project</h4>
                    <p className="text-sm text-muted-foreground">Choose from our templates or start from scratch with AI assistance</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold">Collaborate & Deploy</h4>
                    <p className="text-sm text-muted-foreground">Invite team members and deploy your project with one click</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Features */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="shadow-elevation">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Brain className="w-6 h-6 text-primary" />
                  <CardTitle>AI-Powered Development</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-semibold">Intelligent Code Completion</h4>
                  <p className="text-sm text-muted-foreground">
                    Get context-aware suggestions as you type. Our AI understands your codebase and provides relevant completions.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Automatic Bug Detection</h4>
                  <p className="text-sm text-muted-foreground">
                    Catch errors before they happen with real-time code analysis and smart error suggestions.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Code Optimization</h4>
                  <p className="text-sm text-muted-foreground">
                    Improve performance with AI-suggested optimizations and best practice recommendations.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elevation">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" />
                  <CardTitle>Global Collaboration</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-semibold">Real-time Collaboration</h4>
                  <p className="text-sm text-muted-foreground">
                    Work together with developers worldwide in real-time. See changes as they happen.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Developer Discovery</h4>
                  <p className="text-sm text-muted-foreground">
                    Find and connect with developers who share your interests and expertise.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Project Sharing</h4>
                  <p className="text-sm text-muted-foreground">
                    Share your projects publicly or privately with granular permission controls.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elevation">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <GitBranch className="w-6 h-6 text-primary" />
                  <CardTitle>Version Control</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-semibold">Built-in Git</h4>
                  <p className="text-sm text-muted-foreground">
                    Full Git integration with visual diff, merge conflict resolution, and branch management.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">GitHub Integration</h4>
                  <p className="text-sm text-muted-foreground">
                    Seamlessly sync with your GitHub repositories and manage pull requests.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Backup & Sync</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatic backups ensure your code is never lost. Access from any device.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elevation">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-primary" />
                  <CardTitle>Lightning Performance</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-semibold">Instant Compilation</h4>
                  <p className="text-sm text-muted-foreground">
                    See your changes immediately with hot reload and instant compilation.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Cloud Infrastructure</h4>
                  <p className="text-sm text-muted-foreground">
                    Powered by global cloud infrastructure for consistent performance worldwide.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Smart Caching</h4>
                  <p className="text-sm text-muted-foreground">
                    Intelligent caching reduces build times and improves development speed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* API Documentation */}
          <Card className="mb-8 shadow-elevation">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Terminal className="w-6 h-6 text-primary" />
                <CardTitle>API Reference</CardTitle>
              </div>
              <CardDescription>Integrate ThumbsUp Dev into your workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Authentication</h4>
                <code className="text-sm bg-background px-2 py-1 rounded">
                  POST /api/auth/login
                </code>
                <p className="text-sm text-muted-foreground mt-2">
                  Authenticate users and receive access tokens for API requests.
                </p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Projects</h4>
                <code className="text-sm bg-background px-2 py-1 rounded">
                  GET /api/projects
                </code>
                <p className="text-sm text-muted-foreground mt-2">
                  Retrieve user projects with metadata and collaboration settings.
                </p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Collaboration</h4>
                <code className="text-sm bg-background px-2 py-1 rounded">
                  POST /api/projects/:id/invite
                </code>
                <p className="text-sm text-muted-foreground mt-2">
                  Invite collaborators to projects with specified permissions.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="shadow-elevation">
            <CardHeader>
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-primary" />
                <CardTitle>Support & Community</CardTitle>
              </div>
              <CardDescription>Get help and connect with other developers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center space-y-2">
                  <div className="p-3 bg-primary/10 rounded-lg inline-block">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold">Community Forum</h4>
                  <p className="text-sm text-muted-foreground">
                    Join discussions with developers worldwide
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="p-3 bg-primary/10 rounded-lg inline-block">
                    <Wrench className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold">Help Center</h4>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive guides and tutorials
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="p-3 bg-primary/10 rounded-lg inline-block">
                    <Code className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold">Code Examples</h4>
                  <p className="text-sm text-muted-foreground">
                    Sample projects and code snippets
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Documentation;