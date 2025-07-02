import { Database, Zap, Brain, Wifi, GitBranch, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntegrationStatus {
  name: string;
  status: "connected" | "disconnected" | "warning";
  icon: React.ReactNode;
  details?: string;
}

export const StatusBar = () => {
  const integrations: IntegrationStatus[] = [
    {
      name: "Supabase",
      status: "connected",
      icon: <Database className="w-3 h-3" />,
      details: "Database & Auth Ready"
    },
    {
      name: "Stripe",
      status: "connected", 
      icon: <Zap className="w-3 h-3" />,
      details: "Payments Enabled"
    },
    {
      name: "AI Assistant",
      status: "connected",
      icon: <Brain className="w-3 h-3" />,
      details: "OpenAI GPT-4 Active"
    },
    {
      name: "Network",
      status: "connected",
      icon: <Wifi className="w-3 h-3" />,
      details: "Online"
    }
  ];

  const getStatusColor = (status: IntegrationStatus["status"]) => {
    switch (status) {
      case "connected":
        return "text-success";
      case "warning":
        return "text-warning";
      case "disconnected":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-card border-t border-border text-xs">
      {/* Left side - Project info */}
      <div className="flex items-center gap-4 text-muted-foreground">
        <div className="flex items-center gap-1">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </div>
        <span>AI-Powered IDE</span>
        <span>TypeScript React</span>
      </div>

      {/* Center - File info */}
      <div className="flex items-center gap-4 text-muted-foreground">
        <span>Ln 42, Col 18</span>
        <span>UTF-8</span>
        <span>CRLF</span>
      </div>

      {/* Right side - Integration statuses */}
      <div className="flex items-center gap-4">
        {integrations.map((integration) => (
          <div
            key={integration.name}
            className="flex items-center gap-1 cursor-pointer hover:bg-muted/50 px-2 py-1 rounded transition-colors"
            title={integration.details}
          >
            <div className={cn("flex items-center", getStatusColor(integration.status))}>
              {integration.icon}
            </div>
            <span className={cn("text-xs", getStatusColor(integration.status))}>
              {integration.name}
            </span>
          </div>
        ))}
        
        {/* Overall status indicator */}
        <div className="flex items-center gap-1 text-primary">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow"></div>
          <span className="text-xs font-medium">Ready</span>
        </div>
      </div>
    </div>
  );
};