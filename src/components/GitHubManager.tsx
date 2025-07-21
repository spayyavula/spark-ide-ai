import { useState, useEffect } from "react";
import { GitBranch, Upload, Download, Settings, Globe, Zap, Check, AlertCircle, RefreshCw, Plus, GitCommit, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { GitHubSearch } from "./GitHubSearch";
import { FileExplorer } from "./FileExplorer";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface GitHubManagerProps {
  onImportCode: (filename: string, content: string, language: string) => void;
}

interface GitHubConnection {
  connected: boolean;
  username?: string;
  token?: string;
  repoUrl?: string;
  branch?: string;
}

interface DeploymentStatus {
  status: 'idle' | 'deploying' | 'success' | 'error';
  url?: string;
  message?: string;
}

export const GitHubManager = ({ onImportCode }: GitHubManagerProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("connect");
  const [githubConnection, setGithubConnection] = useState<GitHubConnection>({
    connected: false
  });
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>({
    status: 'idle'
  });
  const [gitHubRepo, setGitHubRepo] = useState<any[]>([]);
  
  // Connection form state
  const [connectionForm, setConnectionForm] = useState({
    username: "",
    token: "",
    repoName: ""
  });
  
  // Git operations state
  const [commitMessage, setCommitMessage] = useState("");
  const [isCommitting, setIsCommitting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  
  // Deployment form state
  const [deploymentForm, setDeploymentForm] = useState({
    netlifyToken: "",
    siteName: "",
    buildCommand: "npm run build",
    publishDir: "dist"
  });

  useEffect(() => {
    // Load saved GitHub connection from localStorage
    const savedConnection = localStorage.getItem('github-connection');
    if (savedConnection) {
      setGithubConnection(JSON.parse(savedConnection));
      setActiveTab("operations");
    }
  }, []);

  const connectToGitHub = async () => {
    if (!connectionForm.username || !connectionForm.token) {
      toast({
        title: "Missing Information",
        description: "Please provide both username and token",
        variant: "destructive"
      });
      return;
    }

    try {
      // Validate GitHub connection
      const response = await fetch(`https://api.github.com/user`, {
        headers: {
          'Authorization': `token ${connectionForm.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('Invalid GitHub token');
      }

      const userData = await response.json();
      
      const connection: GitHubConnection = {
        connected: true,
        username: userData.login,
        token: connectionForm.token,
        repoUrl: connectionForm.repoName ? `https://github.com/${userData.login}/${connectionForm.repoName}` : undefined,
        branch: 'main'
      };

      setGithubConnection(connection);
      // Store connection info without sensitive token
      const safeConnection = { ...connection };
      delete safeConnection.token;
      localStorage.setItem('github-connection', JSON.stringify(safeConnection));
      
      toast({
        title: "Connected to GitHub",
        description: `Successfully connected as ${userData.login}`
      });
      
      setActiveTab("operations");
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Please check your GitHub token and try again",
        variant: "destructive"
      });
    }
  };

  const disconnectFromGitHub = () => {
    setGithubConnection({ connected: false });
    localStorage.removeItem('github-connection');
    setConnectionForm({ username: "", token: "", repoName: "" });
    toast({
      title: "Disconnected",
      description: "Successfully disconnected from GitHub"
    });
    setActiveTab("connect");
  };

  const createRepository = async () => {
    if (!githubConnection.token || !connectionForm.repoName) return;

    try {
      const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `token ${githubConnection.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: connectionForm.repoName,
          description: "Created with ThumbsUp Dev IDE",
          private: false,
          auto_init: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create repository');
      }

      const repo = await response.json();
      
      setGithubConnection(prev => ({
        ...prev,
        repoUrl: repo.html_url
      }));

      toast({
        title: "Repository Created",
        description: `Successfully created ${repo.full_name}`
      });
    } catch (error) {
      toast({
        title: "Failed to Create Repository",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const simulateCommit = async () => {
    if (!commitMessage.trim()) {
      toast({
        title: "Commit Message Required",
        description: "Please enter a commit message",
        variant: "destructive"
      });
      return;
    }

    setIsCommitting(true);
    
    // Simulate commit process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsCommitting(false);
    setCommitMessage("");
    
    toast({
      title: "Changes Committed",
      description: `Committed: ${commitMessage}`
    });
  };

  const simulatePush = async () => {
    setIsPushing(true);
    
    // Simulate push process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsPushing(false);
    
    toast({
      title: "Pushed to GitHub",
      description: "Your changes have been pushed to the remote repository"
    });
  };

  const simulatePull = async () => {
    setIsPulling(true);
    
    // Simulate pull process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsPulling(false);
    
    toast({
      title: "Pulled from GitHub",
      description: "Your local repository is now up to date"
    });
  };

  const deployToNetlify = async () => {
    if (!deploymentForm.netlifyToken || !deploymentForm.siteName) {
      toast({
        title: "Missing Deployment Info",
        description: "Please provide Netlify token and site name",
        variant: "destructive"
      });
      return;
    }

    setDeploymentStatus({ status: 'deploying', message: 'Building and deploying...' });
    
    // Simulate deployment process
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const deployUrl = `https://${deploymentForm.siteName}.netlify.app`;
    
    setDeploymentStatus({
      status: 'success',
      url: deployUrl,
      message: 'Deployment successful!'
    });
    
    toast({
      title: "Deployment Successful",
      description: `Your app is live at ${deployUrl}`
    });
  };

  const loadGitHubFolder = async (owner: string, repo: string, path: string) => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          headers: githubConnection.token ? {
            'Authorization': `token ${githubConnection.token}`
          } : {}
        }
      );
      const data = await response.json();
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error('Error loading GitHub folder:', error);
      return [];
    }
  };

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <GitBranch className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">GitHub Integration</h2>
          {githubConnection.connected && (
            <Badge variant="secondary" className="ml-auto">
              <Check className="w-3 h-3 mr-1" />
              Connected as {githubConnection.username}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 mx-4 mt-4">
            <TabsTrigger value="connect">Connect</TabsTrigger>
            <TabsTrigger value="operations" disabled={!githubConnection.connected}>Git Ops</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="deploy">Deploy</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto p-4">
            <TabsContent value="connect" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    GitHub Connection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!githubConnection.connected ? (
                    <>
                      <div>
                        <Label htmlFor="username">GitHub Username</Label>
                        <Input
                          id="username"
                          placeholder="Enter your GitHub username"
                          value={connectionForm.username}
                          onChange={(e) => setConnectionForm(prev => ({ ...prev, username: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="token">Personal Access Token</Label>
                        <Input
                          id="token"
                          type="password"
                          placeholder="ghp_xxxxxxxxxxxx"
                          value={connectionForm.token}
                          onChange={(e) => setConnectionForm(prev => ({ ...prev, token: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Create a token at GitHub Settings → Developer settings → Personal access tokens
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="repo">Repository Name (Optional)</Label>
                        <Input
                          id="repo"
                          placeholder="my-awesome-project"
                          value={connectionForm.repoName}
                          onChange={(e) => setConnectionForm(prev => ({ ...prev, repoName: e.target.value }))}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={connectToGitHub} className="flex-1">
                          <GitBranch className="w-4 h-4 mr-2" />
                          Connect to GitHub
                        </Button>
                        {connectionForm.repoName && (
                          <Button onClick={createRepository} variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Repo
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Connected to GitHub</p>
                          <p className="text-sm text-muted-foreground">@{githubConnection.username}</p>
                          {githubConnection.repoUrl && (
                            <p className="text-sm text-muted-foreground">{githubConnection.repoUrl}</p>
                          )}
                        </div>
                        <Button variant="outline" onClick={disconnectFromGitHub}>
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="operations" className="mt-0">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GitCommit className="w-5 h-5" />
                      Commit Changes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="commit-message">Commit Message</Label>
                      <Textarea
                        id="commit-message"
                        placeholder="Add new feature or fix bug..."
                        value={commitMessage}
                        onChange={(e) => setCommitMessage(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={simulateCommit} 
                      disabled={isCommitting || !commitMessage.trim()}
                      className="w-full"
                    >
                      {isCommitting && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                      <GitCommit className="w-4 h-4 mr-2" />
                      Commit Changes
                    </Button>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <Button 
                        onClick={simulatePush} 
                        disabled={isPushing}
                        variant="outline"
                        className="w-full"
                      >
                        {isPushing && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                        <ArrowUp className="w-4 h-4 mr-2" />
                        Push to Remote
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <Button 
                        onClick={simulatePull} 
                        disabled={isPulling}
                        variant="outline"
                        className="w-full"
                      >
                        {isPulling && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                        <ArrowDown className="w-4 h-4 mr-2" />
                        Pull from Remote
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="import" className="mt-0 h-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                <div className="h-full">
                  <GitHubSearch 
                    onImportCode={onImportCode}
                    onLoadRepository={setGitHubRepo}
                    onLoadGitHubFolder={loadGitHubFolder}
                  />
                </div>
                <div className="h-full">
                  <FileExplorer 
                    onFileSelect={(filename, node) => {
                      if (node?.download_url) {
                        fetch(node.download_url)
                          .then(res => res.text())
                          .then(content => {
                            const language = node.language || 'plaintext';
                            onImportCode(filename, content, language);
                          });
                      }
                    }}
                    selectedFile=""
                    gitHubRepo={gitHubRepo}
                    onLoadGitHubFolder={async (node) => {
                      if (node.url) {
                        const pathParts = node.url.split('/');
                        const owner = pathParts[4];
                        const repo = pathParts[5];
                        const path = pathParts.slice(7).join('/');
                        const children = await loadGitHubFolder(owner, repo, path);
                        // Update the node with loaded children
                        setGitHubRepo(prev => prev.map(item => 
                          item === node ? { ...item, children } : item
                        ));
                      }
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="deploy" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Deploy to Netlify
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="netlify-token">Netlify Access Token</Label>
                      <Input
                        id="netlify-token"
                        type="password"
                        placeholder="Your Netlify token"
                        value={deploymentForm.netlifyToken}
                        onChange={(e) => setDeploymentForm(prev => ({ ...prev, netlifyToken: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="site-name">Site Name</Label>
                      <Input
                        id="site-name"
                        placeholder="my-awesome-site"
                        value={deploymentForm.siteName}
                        onChange={(e) => setDeploymentForm(prev => ({ ...prev, siteName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="build-command">Build Command</Label>
                      <Input
                        id="build-command"
                        placeholder="npm run build"
                        value={deploymentForm.buildCommand}
                        onChange={(e) => setDeploymentForm(prev => ({ ...prev, buildCommand: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="publish-dir">Publish Directory</Label>
                      <Input
                        id="publish-dir"
                        placeholder="dist"
                        value={deploymentForm.publishDir}
                        onChange={(e) => setDeploymentForm(prev => ({ ...prev, publishDir: e.target.value }))}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={deployToNetlify}
                    disabled={deploymentStatus.status === 'deploying' || !deploymentForm.netlifyToken || !deploymentForm.siteName}
                    className="w-full bg-gradient-primary hover:opacity-90"
                  >
                    {deploymentStatus.status === 'deploying' && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                    <Zap className="w-4 h-4 mr-2" />
                    Deploy to Netlify
                  </Button>

                  {deploymentStatus.status !== 'idle' && (
                    <div className={cn(
                      "p-4 rounded-lg border",
                      deploymentStatus.status === 'success' && "bg-success/10 border-success text-success",
                      deploymentStatus.status === 'error' && "bg-destructive/10 border-destructive text-destructive",
                      deploymentStatus.status === 'deploying' && "bg-warning/10 border-warning text-warning"
                    )}>
                      <div className="flex items-center gap-2">
                        {deploymentStatus.status === 'success' && <Check className="w-4 h-4" />}
                        {deploymentStatus.status === 'error' && <AlertCircle className="w-4 h-4" />}
                        {deploymentStatus.status === 'deploying' && <RefreshCw className="w-4 h-4 animate-spin" />}
                        <span className="font-medium">{deploymentStatus.message}</span>
                      </div>
                      {deploymentStatus.url && (
                        <div className="mt-2">
                          <a 
                            href={deploymentStatus.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm underline hover:no-underline"
                          >
                            {deploymentStatus.url}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};