import { useState, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import { FileText, Save, Play, Settings, GitBranch, Terminal as TerminalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GitHubManager } from "./GitHubManager";
import { Terminal } from "./Terminal";
import { useToast } from "@/hooks/use-toast";

interface CodeFile {
  name: string;
  content: string;
  language: string;
  id: string;
}

export const EnhancedCodeEditor = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<CodeFile[]>([
    {
      id: "1",
      name: "App.tsx",
      language: "typescript",
      content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to ThumbsUp Dev</h1>
        <p>Start building your amazing project!</p>
      </header>
    </div>
  );
}

export default App;`
    }
  ]);
  const [activeFile, setActiveFile] = useState<string>("1");
  const [theme, setTheme] = useState<"vs-dark" | "light">("vs-dark");

  const currentFile = files.find(f => f.id === activeFile);

  const handleCodeChange = (value: string | undefined) => {
    if (!value || !currentFile) return;
    
    setFiles(prev => prev.map(file => 
      file.id === activeFile 
        ? { ...file, content: value }
        : file
    ));
  };

  const handleImportCode = (filename: string, content: string, language: string) => {
    const newFile: CodeFile = {
      id: Date.now().toString(),
      name: filename,
      content,
      language
    };
    
    setFiles(prev => [...prev, newFile]);
    setActiveFile(newFile.id);
    
    toast({
      title: "Code Imported",
      description: `${filename} has been imported successfully`
    });
  };

  const saveFile = () => {
    if (!currentFile) return;
    
    // Simulate saving
    toast({
      title: "File Saved",
      description: `${currentFile.name} has been saved`
    });
  };

  const runCode = () => {
    if (!currentFile) return;
    
    // Simulate running code
    toast({
      title: "Code Executed",
      description: `Running ${currentFile.name}...`
    });
  };

  const createNewFile = () => {
    const newFile: CodeFile = {
      id: Date.now().toString(),
      name: `new-file-${files.length + 1}.tsx`,
      content: "// New file\n",
      language: "typescript"
    };
    
    setFiles(prev => [...prev, newFile]);
    setActiveFile(newFile.id);
  };

  const closeFile = (fileId: string) => {
    if (files.length === 1) return; // Don't close the last file
    
    setFiles(prev => prev.filter(f => f.id !== fileId));
    
    if (activeFile === fileId) {
      const remainingFiles = files.filter(f => f.id !== fileId);
      setActiveFile(remainingFiles[0]?.id || "");
    }
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* File Tabs */}
      <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30">
        {files.map((file) => (
          <div
            key={file.id}
            className={`flex items-center gap-2 px-3 py-1 rounded-md cursor-pointer transition-colors ${
              activeFile === file.id 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted/50"
            }`}
            onClick={() => setActiveFile(file.id)}
          >
            <FileText className="w-3 h-3" />
            <span className="text-sm font-mono">{file.name}</span>
            {files.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeFile(file.id);
                }}
                className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded p-0.5"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <Button
          size="sm"
          variant="ghost"
          onClick={createNewFile}
          className="ml-2"
        >
          +
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {currentFile?.language || 'plaintext'}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {currentFile?.name}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={saveFile}>
            <Save className="w-3 h-3 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={runCode}>
            <Play className="w-3 h-3 mr-1" />
            Run
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setTheme(theme === "vs-dark" ? "light" : "vs-dark")}
          >
            <Settings className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Code Editor */}
        <div className="lg:col-span-2 border-r border-border">
          <Editor
            height="100%"
            language={currentFile?.language || "typescript"}
            theme={theme}
            value={currentFile?.content || ""}
            onChange={handleCodeChange}
            options={{
              minimap: { enabled: false },
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
              fontLigatures: true
            }}
          />
        </div>

        {/* Right Panel */}
        <div className="flex flex-col h-full">
          <Tabs defaultValue="github" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mx-2 mt-2">
              <TabsTrigger value="github" className="text-xs">
                <GitBranch className="w-3 h-3 mr-1" />
                GitHub
              </TabsTrigger>
              <TabsTrigger value="terminal" className="text-xs">
                <TerminalIcon className="w-3 h-3 mr-1" />
                Terminal
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="github" className="h-full mt-2">
                <GitHubManager onImportCode={handleImportCode} />
              </TabsContent>
              
              <TabsContent value="terminal" className="h-full mt-2 p-2">
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TerminalIcon className="w-4 h-4" />
                      Terminal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 h-full">
                    <Terminal />
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};