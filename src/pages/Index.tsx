import { useState } from "react";
import { FileExplorer } from "@/components/FileExplorer";
import { CodeEditor } from "@/components/CodeEditor";
import { AIChat } from "@/components/AIChat";
import { Terminal } from "@/components/Terminal";
import { StatusBar } from "@/components/StatusBar";
import { Brain, Code, Database, Zap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState("Editor.tsx");
  const [activePanel, setActivePanel] = useState<"ai" | "terminal">("ai");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
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

            {/* Right Panel - AI Chat / Terminal */}
            <div className="w-96 border-l border-border flex flex-col">
              {/* Panel Tabs */}
              <div className="flex bg-card border-b border-border">
                <button
                  onClick={() => setActivePanel("ai")}
                  className={cn(
                    "flex-1 px-4 py-2 text-sm font-medium transition-colors",
                    activePanel === "ai"
                      ? "bg-primary/10 text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-2 justify-center">
                    <Brain className="w-4 h-4" />
                    AI Assistant
                  </div>
                </button>
                <button
                  onClick={() => setActivePanel("terminal")}
                  className={cn(
                    "flex-1 px-4 py-2 text-sm font-medium transition-colors",
                    activePanel === "terminal"
                      ? "bg-primary/10 text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-2 justify-center">
                    <Code className="w-4 h-4" />
                    Terminal
                  </div>
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1">
                {activePanel === "ai" ? <AIChat /> : <Terminal />}
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
