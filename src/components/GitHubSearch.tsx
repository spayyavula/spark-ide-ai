import { useState, useEffect } from "react";
import { Search, Download, Eye, GitBranch, Star, FileText, FolderOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  language: string;
  updated_at: string;
  default_branch: string;
}

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: 'file' | 'dir';
}

interface GitHubFileContent {
  name: string;
  path: string;
  content: string;
  encoding: string;
  size: number;
  sha: string;
}

interface GitHubSearchProps {
  onImportCode: (filename: string, content: string, language: string) => void;
}

export const GitHubSearch = ({ onImportCode }: GitHubSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [repoFiles, setRepoFiles] = useState<GitHubFile[]>([]);
  const [currentPath, setCurrentPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileContent, setFileContent] = useState<GitHubFileContent | null>(null);
  const [activeTab, setActiveTab] = useState("search");

  // Search GitHub repositories
  const searchRepositories = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=20`
      );
      const data = await response.json();
      setRepos(data.items || []);
    } catch (error) {
      console.error('Error searching repositories:', error);
    }
    setLoading(false);
  };

  // Get repository contents
  const getRepoContents = async (repo: GitHubRepo, path: string = "") => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repo.full_name}/contents/${path}`
      );
      const data = await response.json();
      setRepoFiles(Array.isArray(data) ? data : [data]);
      setCurrentPath(path);
    } catch (error) {
      console.error('Error fetching repository contents:', error);
    }
    setLoading(false);
  };

  // Get file content
  const getFileContent = async (file: GitHubFile) => {
    if (file.type !== 'file') return;
    
    setLoading(true);
    try {
      const response = await fetch(file.url);
      const data = await response.json();
      setFileContent(data);
      setActiveTab("preview");
    } catch (error) {
      console.error('Error fetching file content:', error);
    }
    setLoading(false);
  };

  // Import file content into IDE
  const importToIDE = () => {
    if (fileContent) {
      const content = atob(fileContent.content); // Decode base64
      const language = getLanguageFromExtension(fileContent.name);
      onImportCode(fileContent.name, content, language);
    }
  };

  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts': case 'tsx': return 'typescript';
      case 'js': case 'jsx': return 'javascript';
      case 'py': return 'python';
      case 'json': return 'json';
      case 'css': return 'css';
      case 'html': return 'html';
      case 'md': return 'markdown';
      default: return 'plaintext';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">GitHub Integration</h3>
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Search repositories (e.g., 'react typescript')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchRepositories(searchQuery)}
            className="flex-1"
          />
          <Button 
            onClick={() => searchRepositories(searchQuery)}
            disabled={loading || !searchQuery.trim()}
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="browse" disabled={!selectedRepo}>Browse</TabsTrigger>
          <TabsTrigger value="preview" disabled={!fileContent}>Preview</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="search" className="h-full mt-4 px-4">
            <div className="h-full overflow-auto space-y-3">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              
              {repos.map((repo) => (
                <Card key={repo.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-sm font-mono text-primary">
                          {repo.full_name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          {repo.description}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRepo(repo);
                          getRepoContents(repo);
                          setActiveTab("browse");
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Browse
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {repo.stargazers_count.toLocaleString()}
                      </div>
                      {repo.language && (
                        <Badge variant="secondary" className="text-xs">
                          {repo.language}
                        </Badge>
                      )}
                      <span>Updated {formatDate(repo.updated_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {repos.length === 0 && !loading && searchQuery && (
                <div className="text-center py-8 text-muted-foreground">
                  No repositories found for "{searchQuery}"
                </div>
              )}

              {repos.length === 0 && !searchQuery && (
                <div className="text-center py-8 text-muted-foreground">
                  Search for GitHub repositories to get started
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="browse" className="h-full mt-4 px-4">
            {selectedRepo && (
              <div className="h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
                  <GitBranch className="w-4 h-4 text-primary" />
                  <span className="font-mono text-sm">{selectedRepo.full_name}</span>
                  {currentPath && (
                    <>
                      <span className="text-muted-foreground">/</span>
                      <span className="font-mono text-sm text-muted-foreground">{currentPath}</span>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(selectedRepo.html_url, '_blank')}
                    className="ml-auto"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>

                <div className="flex-1 overflow-auto space-y-1">
                  {currentPath && (
                    <div
                      className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded cursor-pointer"
                      onClick={() => {
                        const parentPath = currentPath.split('/').slice(0, -1).join('/');
                        getRepoContents(selectedRepo, parentPath);
                      }}
                    >
                      <FolderOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">..</span>
                    </div>
                  )}

                  {repoFiles.map((file) => (
                    <div
                      key={file.sha}
                      className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded cursor-pointer"
                      onClick={() => {
                        if (file.type === 'dir') {
                          getRepoContents(selectedRepo, file.path);
                        } else {
                          getFileContent(file);
                        }
                      }}
                    >
                      {file.type === 'dir' ? (
                        <FolderOpen className="w-4 h-4 text-warning" />
                      ) : (
                        <FileText className="w-4 h-4 text-primary" />
                      )}
                      <span className="text-sm flex-1">{file.name}</span>
                      {file.type === 'file' && (
                        <span className="text-xs text-muted-foreground">
                          {formatSize(file.size)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="h-full mt-4 px-4">
            {fileContent && (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                  <div>
                    <h4 className="font-mono text-sm">{fileContent.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(fileContent.size)} • {fileContent.path}
                    </p>
                  </div>
                  <Button
                    onClick={importToIDE}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Import to IDE
                  </Button>
                </div>

                <div className="flex-1 overflow-auto">
                  <pre className="text-sm bg-code-bg p-4 rounded border border-border overflow-auto">
                    <code className="font-mono text-foreground">
                      {atob(fileContent.content)}
                    </code>
                  </pre>
                </div>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};