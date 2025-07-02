import { useState } from "react";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Database, Code, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  language?: string;
  path?: string;
  url?: string;
  download_url?: string;
  isGitHub?: boolean;
}

const projectStructure: FileNode[] = [
  {
    name: "ai-ide-project",
    type: "folder",
    children: [
      {
        name: "src",
        type: "folder", 
        children: [
          { name: "components", type: "folder", children: [
            { name: "Editor.tsx", type: "file", language: "typescript" },
            { name: "AIChat.tsx", type: "file", language: "typescript" },
            { name: "Terminal.tsx", type: "file", language: "typescript" }
          ]},
          { name: "pages", type: "folder", children: [
            { name: "Dashboard.tsx", type: "file", language: "typescript" }
          ]},
          { name: "hooks", type: "folder", children: [
            { name: "useSupabase.ts", type: "file", language: "typescript" },
            { name: "useStripe.ts", type: "file", language: "typescript" }
          ]},
          { name: "utils", type: "folder", children: [
            { name: "ai-helpers.ts", type: "file", language: "typescript" }
          ]}
        ]
      },
      {
        name: "backend",
        type: "folder",
        children: [
          { name: "api", type: "folder", children: [
            { name: "chat.py", type: "file", language: "python" },
            { name: "code-analyzer.py", type: "file", language: "python" },
            { name: "supabase-client.py", type: "file", language: "python" }
          ]},
          { name: "requirements.txt", type: "file", language: "text" }
        ]
      },
      { name: "package.json", type: "file", language: "json" },
      { name: "tsconfig.json", type: "file", language: "json" },
      { name: ".env.example", type: "file", language: "text" }
    ]
  }
];

interface FileItemProps {
  node: FileNode;
  level: number;
  onSelect: (filename: string, node?: FileNode) => void;
  selectedFile: string;
  onLoadGitHubFolder?: (node: FileNode) => void;
}

const getFileIcon = (name: string, language?: string) => {
  if (language === "python") return <span className="text-warning">🐍</span>;
  if (language === "typescript" || language === "javascript") return <span className="text-primary">⚛️</span>;
  if (language === "json") return <span className="text-accent">📄</span>;
  if (name.includes("supabase")) return <Database className="w-3 h-3 text-success" />;
  if (name.includes("stripe")) return <Zap className="w-3 h-3 text-warning" />;
  return <File className="w-3 h-3 text-muted-foreground" />;
};

const FileItem = ({ node, level, onSelect, selectedFile, onLoadGitHubFolder }: FileItemProps) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  
  const handleClick = async () => {
    if (node.type === "folder") {
      setIsExpanded(!isExpanded);
      // If it's a GitHub folder that hasn't been loaded yet, load its contents
      if (node.isGitHub && (!node.children || node.children.length === 0) && onLoadGitHubFolder) {
        onLoadGitHubFolder(node);
      }
    } else {
      onSelect(node.name, node);
    }
  };

  const isSelected = selectedFile === node.name;

  return (
    <div>
      <div
        onClick={handleClick}
        className={cn(
          "flex items-center gap-2 py-1 px-2 cursor-pointer hover:bg-muted/50 transition-colors",
          "text-sm font-mono",
          isSelected && "bg-primary/20 text-primary border-l-2 border-primary",
          !isSelected && "text-foreground"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {node.type === "folder" && (
          isExpanded ? (
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          )
        )}
        
        {node.type === "folder" ? (
          isExpanded ? (
            <FolderOpen className="w-3 h-3 text-primary" />
          ) : (
            <Folder className="w-3 h-3 text-muted-foreground" />
          )
        ) : (
          getFileIcon(node.name, node.language)
        )}
        
        <span className="truncate">{node.name}</span>
      </div>
      
      {node.type === "folder" && isExpanded && node.children && (
        <div className="animate-slide-in">
          {node.children.map((child, index) => (
            <FileItem
              key={`${child.name}-${index}`}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedFile={selectedFile}
              onLoadGitHubFolder={onLoadGitHubFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface FileExplorerProps {
  onFileSelect: (filename: string, node?: FileNode) => void;
  selectedFile: string;
  gitHubRepo?: FileNode[];
  onLoadGitHubFolder?: (node: FileNode) => void;
}

export const FileExplorer = ({ onFileSelect, selectedFile, gitHubRepo, onLoadGitHubFolder }: FileExplorerProps) => {
  const displayStructure = gitHubRepo && gitHubRepo.length > 0 ? gitHubRepo : projectStructure;

  return (
    <div className="h-full bg-sidebar-bg border-r border-border">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-sm text-foreground uppercase tracking-wide">
          {gitHubRepo && gitHubRepo.length > 0 ? "GitHub Repository" : "Explorer"}
        </h2>
      </div>
      
      <div className="overflow-auto h-full">
        {displayStructure.map((node, index) => (
          <FileItem
            key={`${node.name}-${index}`}
            node={node}
            level={0}
            onSelect={onFileSelect}
            selectedFile={selectedFile}
            onLoadGitHubFolder={onLoadGitHubFolder}
          />
        ))}
      </div>
    </div>
  );
};