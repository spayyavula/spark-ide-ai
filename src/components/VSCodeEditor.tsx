import { useState, useEffect, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { 
  Search, 
  Files, 
  GitBranch, 
  Terminal as TerminalIcon, 
  Settings, 
  Play, 
  Bug, 
  Package,
  Folder,
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronDown,
  X,
  Plus,
  SplitSquareHorizontal,
  Command,
  Filter,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { GitHubSearch } from "./GitHubSearch";
import { Terminal } from "./Terminal";

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  content?: string;
  language?: string;
  isOpen?: boolean;
  isGitHub?: boolean;
  url?: string;
  download_url?: string;
}

interface OpenTab {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isDirty: boolean;
  isActive: boolean;
}

interface PanelConfig {
  id: string;
  activeTab: string;
  tabs: OpenTab[];
}

export const VSCodeEditor = () => {
  const { toast } = useToast();
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [leftPanelWidth, setLeftPanelWidth] = useState(300);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(200);
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState("explorer");
  const [activeBottomTab, setActiveBottomTab] = useState("terminal");
  const [theme, setTheme] = useState<"vs-dark" | "light">("vs-dark");
  
  // Multi-panel editor state
  const [panels, setPanels] = useState<PanelConfig[]>([
    {
      id: "main",
      activeTab: "",
      tabs: []
    }
  ]);

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [currentRepo, setCurrentRepo] = useState<string>("");

  // Sample large project structure
  useEffect(() => {
    const sampleProject: FileNode[] = [
      {
        id: "root",
        name: "large-react-project",
        type: "folder",
        path: "/",
        isOpen: true,
        children: [
          {
            id: "src",
            name: "src",
            type: "folder", 
            path: "/src",
            isOpen: true,
            children: [
              {
                id: "components",
                name: "components",
                type: "folder",
                path: "/src/components",
                isOpen: false,
                children: [
                  { id: "header", name: "Header.tsx", type: "file", path: "/src/components/Header.tsx", language: "typescript" },
                  { id: "sidebar", name: "Sidebar.tsx", type: "file", path: "/src/components/Sidebar.tsx", language: "typescript" },
                  { id: "modal", name: "Modal.tsx", type: "file", path: "/src/components/Modal.tsx", language: "typescript" },
                ]
              },
              {
                id: "pages",
                name: "pages",
                type: "folder",
                path: "/src/pages",
                isOpen: false,
                children: [
                  { id: "home", name: "Home.tsx", type: "file", path: "/src/pages/Home.tsx", language: "typescript" },
                  { id: "about", name: "About.tsx", type: "file", path: "/src/pages/About.tsx", language: "typescript" },
                  { id: "contact", name: "Contact.tsx", type: "file", path: "/src/pages/Contact.tsx", language: "typescript" },
                ]
              },
              {
                id: "hooks",
                name: "hooks",
                type: "folder",
                path: "/src/hooks",
                isOpen: false,
                children: [
                  { id: "useAuth", name: "useAuth.ts", type: "file", path: "/src/hooks/useAuth.ts", language: "typescript" },
                  { id: "useApi", name: "useApi.ts", type: "file", path: "/src/hooks/useApi.ts", language: "typescript" },
                ]
              },
              {
                id: "utils",
                name: "utils",
                type: "folder",
                path: "/src/utils",
                isOpen: false,
                children: [
                  { id: "helpers", name: "helpers.ts", type: "file", path: "/src/utils/helpers.ts", language: "typescript" },
                  { id: "constants", name: "constants.ts", type: "file", path: "/src/utils/constants.ts", language: "typescript" },
                ]
              },
              { id: "app", name: "App.tsx", type: "file", path: "/src/App.tsx", language: "typescript" },
              { id: "main", name: "main.tsx", type: "file", path: "/src/main.tsx", language: "typescript" },
            ]
          },
          {
            id: "public",
            name: "public",
            type: "folder",
            path: "/public",
            isOpen: false,
            children: [
              { id: "index_html", name: "index.html", type: "file", path: "/public/index.html", language: "html" },
              { id: "favicon", name: "favicon.ico", type: "file", path: "/public/favicon.ico", language: "plaintext" },
            ]
          },
          { id: "package", name: "package.json", type: "file", path: "/package.json", language: "json" },
          { id: "readme", name: "README.md", type: "file", path: "/README.md", language: "markdown" },
          { id: "tsconfig", name: "tsconfig.json", type: "file", path: "/tsconfig.json", language: "json" },
        ]
      }
    ];
    setFileTree(sampleProject);
  }, []);

  const getFileIcon = (name: string, type: string, isOpen?: boolean) => {
    if (type === "folder") {
      return isOpen ? <FolderOpen className="w-4 h-4 text-primary" /> : <Folder className="w-4 h-4 text-muted-foreground" />;
    }
    
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'jsx':
        return <span className="text-blue-500">⚛️</span>;
      case 'ts':
      case 'js':
        return <span className="text-yellow-500">📜</span>;
      case 'json':
        return <span className="text-orange-500">📋</span>;
      case 'md':
        return <span className="text-blue-400">📖</span>;
      case 'html':
        return <span className="text-orange-600">🌐</span>;
      case 'css':
        return <span className="text-purple-500">🎨</span>;
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const toggleFolder = (nodeId: string) => {
    const updateNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId && node.type === "folder") {
          return { ...node, isOpen: !node.isOpen };
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children) };
        }
        return node;
      });
    };
    setFileTree(updateNode(fileTree));
  };

  const openFile = async (node: FileNode) => {
    if (node.type === "folder") {
      toggleFolder(node.id);
      return;
    }

    let content = node.content || "";
    
    // If it's a GitHub file, fetch content
    if (node.isGitHub && node.download_url) {
      try {
        const response = await fetch(node.download_url);
        content = await response.text();
      } catch (error) {
        toast({
          title: "Error loading file",
          description: "Could not load file content from GitHub",
          variant: "destructive"
        });
        return;
      }
    } else {
      // Sample content for demo files
      content = getSampleContent(node.path, node.language || "plaintext");
    }

    const newTab: OpenTab = {
      id: node.id,
      name: node.name,
      path: node.path,
      content,
      language: node.language || "plaintext",
      isDirty: false,
      isActive: true
    };

    setPanels(prev => prev.map(panel => {
      if (panel.id === "main") {
        const existingTabIndex = panel.tabs.findIndex(tab => tab.id === node.id);
        if (existingTabIndex >= 0) {
          return {
            ...panel,
            activeTab: node.id,
            tabs: panel.tabs.map(tab => ({ ...tab, isActive: tab.id === node.id }))
          };
        } else {
          return {
            ...panel,
            activeTab: node.id,
            tabs: [
              ...panel.tabs.map(tab => ({ ...tab, isActive: false })),
              newTab
            ]
          };
        }
      }
      return panel;
    }));
  };

  const closeTab = (panelId: string, tabId: string) => {
    setPanels(prev => prev.map(panel => {
      if (panel.id === panelId) {
        const newTabs = panel.tabs.filter(tab => tab.id !== tabId);
        const newActiveTab = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : "";
        return {
          ...panel,
          tabs: newTabs.map(tab => ({ 
            ...tab, 
            isActive: tab.id === newActiveTab 
          })),
          activeTab: newActiveTab
        };
      }
      return panel;
    }));
  };

  const handleCodeChange = (value: string | undefined, panelId: string, tabId: string) => {
    if (!value) return;
    
    setPanels(prev => prev.map(panel => {
      if (panel.id === panelId) {
        return {
          ...panel,
          tabs: panel.tabs.map(tab => 
            tab.id === tabId 
              ? { ...tab, content: value, isDirty: true }
              : tab
          )
        };
      }
      return panel;
    }));
  };

  const getSampleContent = (path: string, language: string): string => {
    if (path.includes("App.tsx")) {
      return `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;`;
    }
    
    if (path.includes("package.json")) {
      return `{
  "name": "large-react-project",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "axios": "^1.3.0",
    "styled-components": "^5.3.6"
  },
  "devDependencies": {
    "@types/react": "^18.0.27",
    "@types/react-dom": "^18.0.10",
    "@vitejs/plugin-react": "^3.1.0",
    "typescript": "^4.9.3",
    "vite": "^4.1.0"
  }
}`;
    }

    return `// ${path}
// This is a sample file for demonstration
// Replace with actual content

export default function Component() {
  return (
    <div>
      <h1>Sample Component</h1>
      <p>This is placeholder content for ${path}</p>
    </div>
  );
}`;
  };

  const renderFileTree = (nodes: FileNode[], level: number = 0) => {
    const filteredNodes = searchQuery 
      ? nodes.filter(node => 
          node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (node.children && node.children.some(child => 
            child.name.toLowerCase().includes(searchQuery.toLowerCase())
          ))
        )
      : nodes;

    return filteredNodes.map(node => (
      <div key={node.id}>
        <div
          className={cn(
            "flex items-center gap-1 py-1 px-2 hover:bg-muted/50 cursor-pointer text-sm",
            "transition-colors duration-200"
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => openFile(node)}
        >
          {node.type === "folder" && (
            node.isOpen ? 
              <ChevronDown className="w-3 h-3 text-muted-foreground" /> :
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
          )}
          {getFileIcon(node.name, node.type, node.isOpen)}
          <span className="truncate font-mono">{node.name}</span>
        </div>
        {node.type === "folder" && node.isOpen && node.children && (
          <div>
            {renderFileTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const handleImportFromGitHub = (filename: string, content: string, language: string) => {
    const newTab: OpenTab = {
      id: Date.now().toString(),
      name: filename,
      path: `/${filename}`,
      content,
      language,
      isDirty: false,
      isActive: true
    };

    setPanels(prev => prev.map(panel => {
      if (panel.id === "main") {
        return {
          ...panel,
          activeTab: newTab.id,
          tabs: [
            ...panel.tabs.map(tab => ({ ...tab, isActive: false })),
            newTab
          ]
        };
      }
      return panel;
    }));

    toast({
      title: "File Imported",
      description: `${filename} imported successfully`
    });
  };

  const loadGitHubRepository = (repoData: any[]) => {
    setFileTree(repoData);
    toast({
      title: "Repository Loaded",
      description: "GitHub repository loaded into file explorer"
    });
  };

  const loadGitHubFolder = async (owner: string, repo: string, path: string) => {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
      const data = await response.json();
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error('Error loading GitHub folder:', error);
      return [];
    }
  };

  const mainPanel = panels.find(p => p.id === "main");
  const activeTab = mainPanel?.tabs.find(t => t.id === mainPanel.activeTab);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            <span className="font-semibold">ThumbsUp IDE</span>
          </div>
          {currentRepo && (
            <Badge variant="outline">
              <GitBranch className="w-3 h-3 mr-1" />
              {currentRepo}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCommandPaletteOpen(true)}
          >
            <Command className="w-4 h-4 mr-1" />
            Command Palette
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setTheme(theme === "vs-dark" ? "light" : "vs-dark")}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div 
          className="border-r border-border bg-sidebar-bg flex flex-col"
          style={{ width: leftPanelWidth }}
        >
          {/* Left Panel Tabs */}
          <div className="flex border-b border-border">
            <Button
              size="sm"
              variant={activeLeftTab === "explorer" ? "secondary" : "ghost"}
              onClick={() => setActiveLeftTab("explorer")}
              className="rounded-none flex-1"
            >
              <Files className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={activeLeftTab === "search" ? "secondary" : "ghost"}
              onClick={() => setActiveLeftTab("search")}
              className="rounded-none flex-1"
            >
              <Search className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={activeLeftTab === "git" ? "secondary" : "ghost"}
              onClick={() => setActiveLeftTab("git")}
              className="rounded-none flex-1"
            >
              <GitBranch className="w-4 h-4" />
            </Button>
          </div>

          {/* Left Panel Content */}
          <div className="flex-1 overflow-hidden">
            {activeLeftTab === "explorer" && (
              <div className="h-full flex flex-col">
                <div className="p-3 border-b border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">EXPLORER</span>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2">
                    {renderFileTree(fileTree)}
                  </div>
                </ScrollArea>
              </div>
            )}

            {activeLeftTab === "search" && (
              <div className="p-3">
                <h3 className="text-sm font-medium mb-3">SEARCH</h3>
                <div className="space-y-2">
                  <Input placeholder="Search..." className="h-8 text-xs" />
                  <Input placeholder="Files to include..." className="h-8 text-xs" />
                  <Input placeholder="Files to exclude..." className="h-8 text-xs" />
                </div>
              </div>
            )}

            {activeLeftTab === "git" && (
              <div className="h-full">
                <GitHubSearch 
                  onImportCode={handleImportFromGitHub}
                  onLoadRepository={loadGitHubRepository}
                  onLoadGitHubFolder={loadGitHubFolder}
                />
              </div>
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor Tabs */}
          {mainPanel && mainPanel.tabs.length > 0 && (
            <div className="flex items-center border-b border-border bg-muted/30 overflow-x-auto">
              {mainPanel.tabs.map(tab => (
                <div
                  key={tab.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 border-r border-border cursor-pointer transition-colors min-w-0",
                    tab.isActive ? "bg-card text-foreground" : "hover:bg-muted/50"
                  )}
                  onClick={() => {
                    setPanels(prev => prev.map(panel => 
                      panel.id === "main" 
                        ? {
                            ...panel,
                            activeTab: tab.id,
                            tabs: panel.tabs.map(t => ({ ...t, isActive: t.id === tab.id }))
                          }
                        : panel
                    ));
                  }}
                >
                  {getFileIcon(tab.name, "file")}
                  <span className="text-sm font-mono truncate">{tab.name}</span>
                  {tab.isDirty && <div className="w-2 h-2 bg-primary rounded-full" />}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab("main", tab.id);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Editor */}
          <div className="flex-1 relative">
            {activeTab ? (
              <Editor
                height="100%"
                language={activeTab.language}
                theme={theme}
                value={activeTab.content}
                onChange={(value) => handleCodeChange(value, "main", activeTab.id)}
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  wordWrap: "on",
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  renderWhitespace: "selection",
                  selectOnLineNumbers: true,
                  roundedSelection: false,
                  readOnly: false,
                  cursorStyle: "line",
                  fontFamily: "Fira Code, Monaco, Consolas, monospace",
                  fontLigatures: true,
                  multiCursorModifier: "ctrlCmd",
                  formatOnPaste: true,
                  formatOnType: true,
                  suggestOnTriggerCharacters: true,
                  acceptSuggestionOnEnter: "on",
                  tabCompletion: "on",
                  wordBasedSuggestions: "allDocuments",
                  parameterHints: { enabled: true },
                  quickSuggestions: true,
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Files className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No File Open</h3>
                  <p className="text-sm">Open a file from the explorer to start editing</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Panel */}
      {isBottomPanelOpen && (
        <div 
          className="border-t border-border bg-card"
          style={{ height: bottomPanelHeight }}
        >
          <Tabs value={activeBottomTab} onValueChange={setActiveBottomTab} className="h-full flex flex-col">
            <TabsList className="h-10 rounded-none justify-start border-b border-border bg-transparent">
              <TabsTrigger value="terminal" className="rounded-none">
                <TerminalIcon className="w-4 h-4 mr-2" />
                Terminal
              </TabsTrigger>
              <TabsTrigger value="problems" className="rounded-none">
                <Bug className="w-4 h-4 mr-2" />
                Problems
              </TabsTrigger>
              <TabsTrigger value="output" className="rounded-none">
                <FileText className="w-4 h-4 mr-2" />
                Output
              </TabsTrigger>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto mr-2"
                onClick={() => setIsBottomPanelOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </TabsList>
            
            <div className="flex-1 overflow-hidden">
              <TabsContent value="terminal" className="h-full m-0">
                <Terminal />
              </TabsContent>
              <TabsContent value="problems" className="h-full m-0 p-4">
                <div className="text-sm text-muted-foreground">No problems found</div>
              </TabsContent>
              <TabsContent value="output" className="h-full m-0 p-4">
                <div className="text-sm text-muted-foreground">Output will appear here</div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      )}

      {/* Status Bar */}
      <div className="h-6 bg-primary text-primary-foreground px-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span>UTF-8</span>
          {activeTab && (
            <>
              <span>{activeTab.language}</span>
              <span>Line 1, Column 1</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            variant="ghost"
            className="h-5 text-xs text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setIsBottomPanelOpen(!isBottomPanelOpen)}
          >
            <TerminalIcon className="w-3 h-3 mr-1" />
            Terminal
          </Button>
          <span>ThumbsUp IDE</span>
        </div>
      </div>
    </div>
  );
};