import { useState, useCallback } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Layers, Code2, FileText, Download } from "lucide-react";

interface SemanticNode extends Node {
  ontologyType: "CCO_Entity" | "SEON_Component" | "Service" | "Data_Store" | "Process";
  semanticProperties: Record<string, any>;
}

interface OntologyAnnotation {
  predicate: string;
  object: string;
  namespace: string;
  description: string;
}

const SemanticArchitectureDesigner = () => {
  const [selectedNode, setSelectedNode] = useState<SemanticNode | null>(null);
  const [architectureTemplate, setArchitectureTemplate] = useState<string>("microservices");

  // Initial nodes with ontological classifications
  const initialNodes: SemanticNode[] = [
    {
      id: "1",
      type: "default",
      position: { x: 100, y: 100 },
      data: { label: "User Service" },
      ontologyType: "Service",
      semanticProperties: {
        "cco:has_function": "User Management",
        "seon:implements": "Authentication Process",
        "rdf:type": "Microservice"
      }
    },
    {
      id: "2", 
      type: "default",
      position: { x: 300, y: 100 },
      data: { label: "Database" },
      ontologyType: "Data_Store",
      semanticProperties: {
        "cco:stores": "User Information",
        "seon:persists": "User Entities",
        "rdf:type": "Relational Database"
      }
    },
    {
      id: "3",
      type: "default", 
      position: { x: 200, y: 250 },
      data: { label: "API Gateway" },
      ontologyType: "CCO_Entity",
      semanticProperties: {
        "cco:has_role": "Request Router",
        "seon:mediates": "Service Communication",
        "rdf:type": "Infrastructure Component"
      }
    }
  ];

  const initialEdges: Edge[] = [
    {
      id: "e1-2",
      source: "1",
      target: "2",
      label: "reads/writes",
      type: "smoothstep"
    },
    {
      id: "e3-1",
      source: "3", 
      target: "1",
      label: "routes to",
      type: "smoothstep"
    }
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node as SemanticNode);
  }, []);

  const architectureTemplates = {
    microservices: {
      name: "Microservices Architecture",
      ontologyBasis: "SEON Service-Oriented Architecture",
      description: "Semantic microservices with ontological service discovery",
      nodes: [
        { type: "Service", count: 4, description: "Independent business services" },
        { type: "Data_Store", count: 2, description: "Service-specific databases" },
        { type: "CCO_Entity", count: 1, description: "API Gateway" }
      ]
    },
    layered: {
      name: "Layered Architecture", 
      ontologyBasis: "CCO Hierarchical Structure",
      description: "Traditional layered approach with semantic layer definitions",
      nodes: [
        { type: "Process", count: 1, description: "Presentation Layer" },
        { type: "Service", count: 1, description: "Business Logic Layer" },
        { type: "Data_Store", count: 1, description: "Data Access Layer" }
      ]
    },
    eventdriven: {
      name: "Event-Driven Architecture",
      ontologyBasis: "CCO Event Ontology",
      description: "Event-sourced system with semantic event modeling",
      nodes: [
        { type: "Process", count: 3, description: "Event Processors" },
        { type: "SEON_Component", count: 1, description: "Event Bus" },
        { type: "Data_Store", count: 1, description: "Event Store" }
      ]
    }
  };

  const ontologyAnnotations: OntologyAnnotation[] = [
    {
      predicate: "cco:has_function",
      object: "Business Function",
      namespace: "http://www.ontologyrepository.com/CommonCoreOntologies/",
      description: "Defines the primary business function of this component"
    },
    {
      predicate: "seon:implements",
      object: "Software Process",
      namespace: "http://se-on.org/ontologies/",
      description: "Specifies the software engineering process implemented"
    },
    {
      predicate: "rdf:type",
      object: "Component Type",
      namespace: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      description: "RDF type classification for semantic reasoning"
    }
  ];

  const getNodeColor = (ontologyType: string) => {
    const colors = {
      "CCO_Entity": "#3B82F6",
      "SEON_Component": "#10B981", 
      "Service": "#8B5CF6",
      "Data_Store": "#F59E0B",
      "Process": "#EF4444"
    };
    return colors[ontologyType] || "#6B7280";
  };

  const generateArchitectureCode = () => {
    const template = architectureTemplates[architectureTemplate];
    const codeTemplate = `
// Generated Architecture: ${template.name}
// Ontology Basis: ${template.ontologyBasis}

${nodes.map(node => `
// Component: ${node.data.label}
// Ontology Type: ${node.ontologyType}
export interface ${String(node.data.label).replace(/\s+/g, '')}Component {
  id: string;
  ontologyType: "${node.ontologyType}";
  semanticProperties: {
${Object.entries(node.semanticProperties || {}).map(([key, value]) => 
    `    "${key}": "${value}";`
  ).join('\n')}
  };
  
  // Semantic operations based on ontology
  getSemanticType(): string;
  getOntologyAnnotations(): OntologyAnnotation[];
}
`).join('\n')}

// Architecture Implementation
export class ${String(template.name).replace(/\s+/g, '')} {
  private components: Map<string, SemanticComponent> = new Map();
  
  constructor() {
    this.initializeFromOntology();
  }
  
  private initializeFromOntology(): void {
    // Initialize components based on ${template.ontologyBasis}
    ${nodes.map(node => 
      `this.components.set("${node.id}", new ${String(node.data.label).replace(/\s+/g, '')}Component());`
    ).join('\n    ')}
  }
  
  // Semantic queries using ontological reasoning
  findComponentsByType(ontologyType: string): SemanticComponent[] {
    return Array.from(this.components.values())
      .filter(comp => comp.ontologyType === ontologyType);
  }
  
  getSemanticRelationships(): Array<{source: string, target: string, predicate: string}> {
    return [
      ${edges.map(edge => 
        `{ source: "${edge.source}", target: "${edge.target}", predicate: "${edge.label || 'connected_to'}" }`
      ).join(',\n      ')}
    ];
  }
}`;

    return codeTemplate;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Semantic Architecture Designer</h2>
          <p className="text-muted-foreground">
            Design software architectures using ontological principles
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => console.log(generateArchitectureCode())}>
            <Code2 className="h-4 w-4 mr-2" />
            Generate Code
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Architecture
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Architecture Canvas</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: '500px' }}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onNodeClick={onNodeClick}
                  fitView
                >
                  <Controls />
                  <MiniMap />
                  <Background />
                </ReactFlow>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Architecture Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(architectureTemplates).map(([key, template]) => (
                  <Button
                    key={key}
                    variant={architectureTemplate === key ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setArchitectureTemplate(key)}
                  >
                    <Layers className="h-4 w-4 mr-2" />
                    {template.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedNode && (
            <Card>
              <CardHeader>
                <CardTitle>Semantic Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold">Component:</span> {String(selectedNode.data.label)}
                  </div>
                  <div>
                    <span className="font-semibold">Ontology Type:</span>
                    <Badge 
                      className="ml-2"
                      style={{ backgroundColor: getNodeColor(selectedNode.ontologyType) }}
                    >
                      {selectedNode.ontologyType}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="font-semibold">Semantic Annotations:</span>
                    {Object.entries(selectedNode.semanticProperties || {}).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <code className="bg-muted px-1 rounded">{key}</code>: {value}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Ontology Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="annotations">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="annotations">Annotations</TabsTrigger>
                  <TabsTrigger value="types">Types</TabsTrigger>
                </TabsList>
                
                <TabsContent value="annotations" className="space-y-2">
                  {ontologyAnnotations.map((annotation, index) => (
                    <div key={index} className="text-xs">
                      <code className="bg-muted px-1 rounded">{annotation.predicate}</code>
                      <p className="text-muted-foreground mt-1">{annotation.description}</p>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="types" className="space-y-2">
                  {Object.keys(architectureTemplates.microservices.nodes.reduce((acc, node) => ({...acc, [node.type]: true}), {})).map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: getNodeColor(type) }}
                      />
                      <span className="text-sm">{type.replace('_', ' ')}</span>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SemanticArchitectureDesigner;