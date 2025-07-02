import { useState } from "react";
import { FileExplorer } from "@/components/FileExplorer";
import { CodeEditor } from "@/components/CodeEditor";
import { AIChat } from "@/components/AIChat";
import { Terminal } from "@/components/Terminal";
import { GitHubSearch } from "@/components/GitHubSearch";
import { StatusBar } from "@/components/StatusBar";
import { Brain, Code, Database, Zap, Menu, X, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState("Editor.tsx");
  const [activePanel, setActivePanel] = useState<"ai" | "terminal" | "github">("ai");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editorCode, setEditorCode] = useState("");
  const [gitHubRepoData, setGitHubRepoData] = useState<any[]>([]);
  const [currentRepo, setCurrentRepo] = useState<any>(null);

  // Handle importing code from GitHub
  const handleImportCode = (filename: string, content: string, language: string) => {
    setSelectedFile(filename);
    setEditorCode(content);
    // Switch to the editor to show the imported code
    setActivePanel("ai");
  };

  // Handle loading GitHub repository into file explorer
  const handleLoadRepository = (repoData: any[]) => {
    setGitHubRepoData(repoData);
    setCurrentRepo(repoData[0]);
  };

  // Handle loading GitHub folder contents
  const handleLoadGitHubFolder = async (owner: string, repo: string, path: string) => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
      );
      const data = await response.json();
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error('Error fetching GitHub folder:', error);
      return [];
    }
  };

  // Handle file selection from explorer (both local and GitHub)
  const handleFileSelect = async (filename: string, node?: any) => {
    setSelectedFile(filename);
    
    if (node?.isGitHub && node?.download_url) {
      // Handle GitHub file
      try {
        const response = await fetch(node.download_url);
        const content = await response.text();
        setEditorCode(content);
      } catch (error) {
        console.error('Error fetching GitHub file content:', error);
      }
    } else {
      // Handle local file - use existing code examples
      setEditorCode("");
    }
  };

  // Handle GitHub folder loading for file explorer
  const handleGitHubFolderLoad = async (node: any) => {
    if (!currentRepo || !node.path) return;
    
    try {
      const pathParts = node.path.split('/');
      const owner = currentRepo.name.split('/')[0] || 'owner';
      const repo = currentRepo.name.split('/')[1] || currentRepo.name;
      
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${node.path}`
      );
      const data = await response.json();
      
      // Transform and update the node's children
      const children = Array.isArray(data) ? data.map((file: any) => ({
        name: file.name,
        type: file.type === 'dir' ? 'folder' : 'file',
        path: file.path,
        url: file.url,
        download_url: file.download_url,
        isGitHub: true,
        children: file.type === 'dir' ? [] : undefined
      })) : [];

      // Update the gitHubRepoData with the new children
      // This is a simplified approach - in a real app you'd want more sophisticated state management
      node.children = children;
      setGitHubRepoData([...gitHubRepoData]);
    } catch (error) {
      console.error('Error loading GitHub folder:', error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Header */}
      <header className="h-12 bg-card border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Brain className="w-6 h-6 text-primary" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
              AI IDE
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Code className="w-4 h-4 text-primary" />
              <span>Python + React</span>
            </div>
            <div className="flex items-center gap-1">
              <Database className="w-4 h-4 text-success" />
              <span>Supabase</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-warning" />
              <span>Stripe</span>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            AI-Powered Development Environment
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer Sidebar */}
        <div className={cn(
          "transition-all duration-300 border-r border-border",
          sidebarCollapsed ? "w-0" : "w-64"
        )}>
          {!sidebarCollapsed && (
            <FileExplorer 
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              gitHubRepo={gitHubRepoData}
              onLoadGitHubFolder={handleGitHubFolderLoad}
            />
          )}
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex">
            {/* Code Editor */}
            <div className="flex-1">
              <CodeEditor selectedFile={selectedFile} />
            </div>

            {/* Right Panel - AI Chat / Terminal / GitHub */}
            <div className="w-96 border-l border-border flex flex-col">
              {/* Panel Tabs */}
              <div className="flex bg-card border-b border-border">
                <button
                  onClick={() => setActivePanel("ai")}
                  className={cn(
                    "flex-1 px-3 py-2 text-xs font-medium transition-colors border-r border-border",
                    activePanel === "ai"
                      ? "bg-primary/10 text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-1 justify-center">
                    <Brain className="w-3 h-3" />
                    <span className="hidden sm:inline">AI</span>
                  </div>
                </button>
                <button
                  onClick={() => setActivePanel("terminal")}
                  className={cn(
                    "flex-1 px-3 py-2 text-xs font-medium transition-colors border-r border-border",
                    activePanel === "terminal"
                      ? "bg-primary/10 text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-1 justify-center">
                    <Code className="w-3 h-3" />
                    <span className="hidden sm:inline">Terminal</span>
                  </div>
                </button>
                <button
                  onClick={() => setActivePanel("github")}
                  className={cn(
                    "flex-1 px-3 py-2 text-xs font-medium transition-colors",
                    activePanel === "github"
                      ? "bg-primary/10 text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-1 justify-center">
                    <GitBranch className="w-3 h-3" />
                    <span className="hidden sm:inline">GitHub</span>
                  </div>
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-hidden">
                {activePanel === "ai" && <AIChat />}
                {activePanel === "terminal" && <Terminal />}
                {activePanel === "github" && (
                  <GitHubSearch 
                    onImportCode={handleImportCode}
                    onLoadRepository={handleLoadRepository}
                    onLoadGitHubFolder={handleLoadGitHubFolder}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
};

export default Index;
