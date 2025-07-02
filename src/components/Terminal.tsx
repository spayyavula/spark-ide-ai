import { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TerminalLine {
  id: string;
  type: "command" | "output" | "error";
  content: string;
  timestamp: Date;
}

export const Terminal = () => {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: "1",
      type: "output",
      content: "Welcome to AI IDE Terminal v1.0.0",
      timestamp: new Date()
    },
    {
      id: "2", 
      type: "output",
      content: "Type 'help' for available commands",
      timestamp: new Date()
    }
  ]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [lines]);

  const executeCommand = (command: string) => {
    const trimmedCommand = command.trim();
    if (!trimmedCommand) return;

    // Add command to history
    setCommandHistory(prev => [...prev, trimmedCommand]);
    setHistoryIndex(-1);

    // Add command line
    const commandLine: TerminalLine = {
      id: Date.now().toString(),
      type: "command",
      content: `$ ${trimmedCommand}`,
      timestamp: new Date()
    };

    setLines(prev => [...prev, commandLine]);

    // Execute command
    setTimeout(() => {
      const output = processCommand(trimmedCommand);
      const outputLine: TerminalLine = {
        id: (Date.now() + 1).toString(),
        type: output.startsWith("Error:") ? "error" : "output",
        content: output,
        timestamp: new Date()
      };
      setLines(prev => [...prev, outputLine]);
    }, 100);

    setCurrentCommand("");
  };

  const processCommand = (command: string): string => {
    const [cmd, ...args] = command.split(" ");

    switch (cmd.toLowerCase()) {
      case "help":
        return `Available commands:
  help         - Show this help message
  clear        - Clear terminal
  ls           - List files
  cat [file]   - Show file content
  python [file] - Run Python script
  npm [cmd]    - Run npm command
  git [cmd]    - Run git command
  supabase     - Show Supabase status
  stripe       - Show Stripe integration
  ai [query]   - Ask AI assistant`;

      case "clear":
        setLines([]);
        return "";

      case "ls":
        return `src/
  components/
    Editor.tsx
    AIChat.tsx
    Terminal.tsx
  hooks/
    useSupabase.ts
    useStripe.ts
backend/
  api/
    chat.py
    code-analyzer.py
package.json
tsconfig.json`;

      case "cat":
        if (args[0]) {
          return `Reading ${args[0]}...
This is a simulated file viewer.
In a real IDE, this would show actual file contents.`;
        }
        return "Error: Please specify a file name";

      case "python":
        if (args[0]) {
          return `Running ${args[0]}...
🐍 Python script executed successfully!
Output: AI IDE backend is running on port 8000
Supabase connection: ✅ Active
OpenAI API: ✅ Connected`;
        }
        return `Python 3.11.0
Type "help", "copyright", "credits" or "license" for more information.
>>>`;

      case "npm":
        const npmCmd = args[0];
        if (npmCmd === "start" || npmCmd === "dev") {
          return `> ai-ide@1.0.0 ${npmCmd}
> vite

  VITE v5.0.0  ready in 350ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help`;
        }
        if (npmCmd === "install") {
          return `Installing dependencies...
✅ @stripe/stripe-js
✅ @supabase/supabase-js
✅ openai
✅ All packages installed successfully!`;
        }
        return `npm ${args.join(" ")} - command executed`;

      case "git":
        const gitCmd = args[0];
        if (gitCmd === "status") {
          return `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  modified:   src/components/Editor.tsx
  modified:   backend/api/chat.py

no changes added to commit`;
        }
        if (gitCmd === "add") {
          return "Files staged for commit";
        }
        return `git ${args.join(" ")} - command executed`;

      case "supabase":
        return `Supabase Status:
  Project URL: https://your-project.supabase.co
  Database: ✅ Connected
  Auth: ✅ Enabled
  Storage: ✅ Ready
  Real-time: ✅ Active

Tables:
  - users
  - projects  
  - code_analyses
  - ai_sessions`;

      case "stripe":
        return `Stripe Integration Status:
  Environment: Test Mode
  Webhook: ✅ Active
  Products:
    - Basic Plan ($9/month)
    - Pro Plan ($29/month)
    - Enterprise ($99/month)
  
  Recent transactions: 0
  Active subscriptions: 0`;

      case "ai":
        const query = args.join(" ");
        if (query) {
          return `🤖 AI Assistant Response:
"${query}"

I can help you with that! Here are some suggestions:
- Check the documentation for more details
- Consider using async/await for better performance
- Make sure to handle errors properly
- Would you like me to generate code examples?`;
        }
        return "Error: Please provide a query for the AI assistant";

      default:
        return `Error: Command '${cmd}' not found. Type 'help' for available commands.`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(currentCommand);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentCommand("");
        } else {
          setHistoryIndex(newIndex);
          setCurrentCommand(commandHistory[newIndex]);
        }
      }
    }
  };

  const clearTerminal = () => {
    setLines([]);
  };

  return (
    <div className="flex flex-col h-full bg-terminal-bg">
      {/* Terminal Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">Terminal</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={clearTerminal}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="flex-1 overflow-auto p-4 font-mono text-sm"
      >
        {lines.map((line) => (
          <div key={line.id} className="mb-1">
            <span className={
              line.type === "command" 
                ? "text-primary" 
                : line.type === "error"
                ? "text-destructive"
                : "text-foreground"
            }>
              {line.content}
            </span>
          </div>
        ))}
        
        {/* Command Input */}
        <div className="flex items-center">
          <span className="text-primary mr-2">$</span>
          <input
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-foreground outline-none"
            placeholder="Type a command..."
            autoFocus
          />
        </div>
      </div>

      {/* Terminal Footer */}
      <div className="px-4 py-2 bg-muted border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Ready - Type 'help' for commands</span>
          <div className="flex items-center gap-4">
            <span>History: {commandHistory.length}</span>
            <span className="text-primary">● Terminal Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};