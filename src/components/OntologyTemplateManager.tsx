import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GitBranch, Download, FileText, Layers, Code2, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OntologyTemplate {
  id: string;
  name: string;
  description: string;
  category: "architecture" | "patterns" | "documentation" | "ontology";
  githubUrl: string;
  stars: number;
  language: string;
  ontologyType: "CCO" | "SEON" | "Software Description" | "Domain Specific" | "Custom";
  tags: string[];
  lastUpdated: string;
}

interface ArchitecturalPattern {
  name: string;
  description: string;
  ontologyMapping: string;
  codeTemplate: string;
  documentation: string;
}

const OntologyTemplateManager = () => {
  const [templates, setTemplates] = useState<OntologyTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Mock ontology-based templates - in production, these would come from GitHub API
  const mockTemplates: OntologyTemplate[] = [
    {
      id: "1",
      name: "Common Core Ontology Framework",
      description: "Complete implementation of CCO-based software architecture with domain modeling",
      category: "ontology",
      githubUrl: "https://github.com/CommonCoreOntology/CommonCoreOntologies",
      stars: 241,
      language: "OWL",
      ontologyType: "CCO",
      tags: ["BFO", "mid-level", "domain-agnostic", "formal-ontology"],
      lastUpdated: "2024-01-15"
    },
    {
      id: "2", 
      name: "Software Engineering Ontology Network",
      description: "SEON-based software evolution and maintenance architecture templates",
      category: "architecture",
      githubUrl: "http://se-on.org/",
      stars: 89,
      language: "TypeScript",
      ontologyType: "SEON",
      tags: ["software-evolution", "maintenance", "5-layer-pyramid", "OWL"],
      lastUpdated: "2024-01-20"
    },
    {
      id: "3",
      name: "Microservices Ontology Pattern",
      description: "Ontology-driven microservices architecture with semantic service discovery",
      category: "patterns",
      githubUrl: "https://github.com/example/microservices-ontology",
      stars: 156,
      language: "Java",
      ontologyType: "Domain Specific",
      tags: ["microservices", "semantic-web", "service-discovery", "REST"],
      lastUpdated: "2024-01-18"
    },
    {
      id: "4",
      name: "Software Description Documentation",
      description: "Automated documentation generation using Software Description Ontology",
      category: "documentation",
      githubUrl: "https://github.com/example/sd-ontology-docs",
      stars: 73,
      language: "Python",
      ontologyType: "Software Description",
      tags: ["documentation", "automation", "RDF", "semantic-annotation"],
      lastUpdated: "2024-01-22"
    }
  ];

  const architecturalPatterns: ArchitecturalPattern[] = [
    {
      name: "Ontology-Driven Domain Model",
      description: "Domain model structure based on ontological principles",
      ontologyMapping: "CCO Entity-Relationship mapping",
      codeTemplate: `
// Domain Entity with Ontological Structure
export interface DomainEntity {
  id: string;
  type: OntologyType;
  properties: Record<string, any>;
  relationships: EntityRelationship[];
}

export interface EntityRelationship {
  predicate: string;
  target: string;
  ontologyClass: string;
}`,
      documentation: "Based on Common Core Ontology principles for entity modeling"
    },
    {
      name: "Semantic Service Architecture",
      description: "Service layer with semantic annotations and discovery",
      ontologyMapping: "SEON Software Service Ontology",
      codeTemplate: `
// Semantic Service Interface
export interface SemanticService {
  serviceId: string;
  ontologyAnnotations: ServiceAnnotation[];
  execute(context: SemanticContext): Promise<SemanticResult>;
}

export interface ServiceAnnotation {
  predicate: string;
  object: string;
  namespace: string;
}`,
      documentation: "Implements SEON-based service modeling for semantic interoperability"
    }
  ];

  useEffect(() => {
    setTemplates(mockTemplates);
  }, []);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleImportTemplate = async (template: OntologyTemplate) => {
    setLoading(true);
    try {
      // Simulate GitHub repository import
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Template Imported",
        description: `${template.name} has been imported to your workspace`,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "architecture": return <Layers className="h-4 w-4" />;
      case "patterns": return <Code2 className="h-4 w-4" />;
      case "documentation": return <FileText className="h-4 w-4" />;
      case "ontology": return <Database className="h-4 w-4" />;
      default: return <GitBranch className="h-4 w-4" />;
    }
  };

  const getOntologyTypeColor = (type: string) => {
    switch (type) {
      case "CCO": return "bg-blue-100 text-blue-800";
      case "SEON": return "bg-green-100 text-green-800";
      case "Software Description": return "bg-purple-100 text-purple-800";
      case "Domain Specific": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Ontology-Based Templates</h2>
            <p className="text-muted-foreground">
              Architectural solutions and documentation based on software engineering ontologies
            </p>
          </div>
        </div>

        <div className="flex space-x-4">
          <Input
            placeholder="Search templates by name, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">All Categories</option>
            <option value="architecture">Architecture</option>
            <option value="patterns">Patterns</option>
            <option value="documentation">Documentation</option>
            <option value="ontology">Ontology</option>
          </select>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">GitHub Templates</TabsTrigger>
          <TabsTrigger value="patterns">Architectural Patterns</TabsTrigger>
          <TabsTrigger value="ontologies">Ontology Reference</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="grid gap-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(template.category)}
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <Badge variant="outline">{template.language}</Badge>
                        </div>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">⭐ {template.stars}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getOntologyTypeColor(template.ontologyType)}>
                          {template.ontologyType}
                        </Badge>
                        {template.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Updated: {template.lastUpdated}
                        </span>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(template.githubUrl, '_blank')}
                          >
                            <GitBranch className="h-4 w-4 mr-1" />
                            View Source
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleImportTemplate(template)}
                            disabled={loading}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Import Template
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="grid gap-4">
              {architecturalPatterns.map((pattern, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Code2 className="h-5 w-5" />
                      <span>{pattern.name}</span>
                    </CardTitle>
                    <CardDescription>{pattern.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Ontology Mapping:</h4>
                      <p className="text-sm text-muted-foreground">{pattern.ontologyMapping}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Code Template:</h4>
                      <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                        <code>{pattern.codeTemplate}</code>
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Documentation:</h4>
                      <p className="text-sm">{pattern.documentation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="ontologies" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Common Core Ontologies (CCO)</CardTitle>
                <CardDescription>Mid-level ontologies for domain-agnostic modeling</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Agent Ontology - Agents, persons, organizations</li>
                  <li>Artifact Ontology - Human-made objects and their functions</li>
                  <li>Event Ontology - Processes, events, and temporal relations</li>
                  <li>Information Entity Ontology - Information content and bearers</li>
                  <li>Quality Ontology - Qualities, measurements, and units</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Software Engineering Ontology Network (SEON)</CardTitle>
                <CardDescription>5-layer pyramid for software engineering concepts</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>General Concepts - Foundational software engineering terms</li>
                  <li>Software Engineering - Core SE processes and artifacts</li>
                  <li>Software Evolution - Change management and maintenance</li>
                  <li>Tool-specific - Integration with SE tools</li>
                  <li>Project-specific - Domain-specific extensions</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Software Description Ontology</CardTitle>
                <CardDescription>Standardized software component descriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Software components and their interfaces</li>
                  <li>Execution environments and dependencies</li>
                  <li>Configuration parameters and constraints</li>
                  <li>Semantic annotations for discovery</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OntologyTemplateManager;