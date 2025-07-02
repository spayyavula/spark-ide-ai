import { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, Plus, X, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';

interface TerminalTab {
  id: string;
  title: string;
  terminal: XTerm;
  fitAddon: FitAddon;
  isActive: boolean;
}

export const Terminal = () => {
  const [tabs, setTabs] = useState<TerminalTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>("");
  const [isMaximized, setIsMaximized] = useState(false);
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const tabCounter = useRef(1);

  // Create a new terminal tab
  const createTerminal = () => {
    const terminal = new XTerm({
      theme: {
        background: 'hsl(220 13% 7%)', // terminal-bg from our theme
        foreground: 'hsl(213 31% 91%)', // foreground from our theme
        cursor: 'hsl(191 91% 55%)', // primary color
        cursorAccent: 'hsl(220 13% 7%)',
        black: 'hsl(220 13% 9%)',
        red: 'hsl(0 84% 60%)',
        green: 'hsl(142 76% 36%)',
        yellow: 'hsl(38 92% 50%)',
        blue: 'hsl(191 91% 55%)',
        magenta: 'hsl(270 91% 65%)',
        cyan: 'hsl(191 91% 65%)',
        white: 'hsl(213 31% 91%)',
        brightBlack: 'hsl(217 10% 64%)',
        brightRed: 'hsl(0 84% 70%)',
        brightGreen: 'hsl(142 76% 46%)',
        brightYellow: 'hsl(38 92% 60%)',
        brightBlue: 'hsl(191 91% 65%)',
        brightMagenta: 'hsl(270 91% 75%)',
        brightCyan: 'hsl(191 91% 75%)',
        brightWhite: 'hsl(213 31% 96%)',
      },
      fontFamily: 'JetBrains Mono, Fira Code, Monaco, Consolas, monospace',
      fontSize: 14,
      lineHeight: 1.4,
      cursorStyle: 'bar',
      cursorBlink: true,
      scrollback: 1000,
      tabStopWidth: 4,
      allowProposedApi: true,
    });

    // Add addons
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);

    // Simulate shell behavior
    let currentLine = '';
    const prompt = '$ ';
    
    // Welcome message
    terminal.writeln('Welcome to AI IDE Terminal');
    terminal.writeln('Powered by Theia-style xterm.js integration');
    terminal.writeln('Type "help" for available commands\r\n');
    terminal.write(prompt);

    // Handle input
    terminal.onData((data) => {
      const code = data.charCodeAt(0);
      
      if (code === 13) { // Enter
        terminal.write('\r\n');
        if (currentLine.trim()) {
          executeCommand(terminal, currentLine.trim());
        }
        currentLine = '';
        terminal.write(prompt);
      } else if (code === 127) { // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          terminal.write('\b \b');
        }
      } else if (code >= 32) { // Printable characters
        currentLine += data;
        terminal.write(data);
      }
    });

    const tabId = `tab-${tabCounter.current++}`;
    const newTab: TerminalTab = {
      id: tabId,
      title: `Terminal ${tabCounter.current - 1}`,
      terminal,
      fitAddon,
      isActive: true,
    };

    // Update tabs
    setTabs(prevTabs => {
      const updatedTabs = prevTabs.map(tab => ({ ...tab, isActive: false }));
      return [...updatedTabs, newTab];
    });
    setActiveTabId(tabId);

    // Mount terminal after state update
    setTimeout(() => {
      if (terminalContainerRef.current) {
        terminal.open(terminalContainerRef.current);
        fitAddon.fit();
      }
    }, 0);

    return newTab;
  };

  // Execute terminal commands
  const executeCommand = (terminal: XTerm, command: string) => {
    const [cmd, ...args] = command.split(' ');
    
    switch (cmd.toLowerCase()) {
      case 'help':
        terminal.writeln('Available commands:');
        terminal.writeln('  help           - Show this help');
        terminal.writeln('  clear          - Clear terminal');
        terminal.writeln('  ls             - List files');
        terminal.writeln('  cat [file]     - Show file content');
        terminal.writeln('  python [file]  - Run Python script');
        terminal.writeln('  npm [cmd]      - Run npm command');
        terminal.writeln('  git [cmd]      - Run git command');
        terminal.writeln('  supabase       - Show Supabase status');
        terminal.writeln('  stripe         - Show Stripe status');
        terminal.writeln('  ai [query]     - Ask AI assistant');
        break;
        
      case 'clear':
        terminal.clear();
        break;
        
      case 'ls':
        terminal.writeln('src/');
        terminal.writeln('├── components/');
        terminal.writeln('│   ├── Editor.tsx');
        terminal.writeln('│   ├── AIChat.tsx');
        terminal.writeln('│   └── Terminal.tsx');
        terminal.writeln('├── hooks/');
        terminal.writeln('│   ├── useSupabase.ts');
        terminal.writeln('│   └── useStripe.ts');
        terminal.writeln('backend/');
        terminal.writeln('├── api/');
        terminal.writeln('│   ├── chat.py');
        terminal.writeln('│   └── code-analyzer.py');
        terminal.writeln('package.json');
        terminal.writeln('tsconfig.json');
        break;
        
      case 'python':
        if (args[0]) {
          terminal.writeln(`Running ${args[0]}...`);
          terminal.writeln('🐍 Python script executed successfully!');
          terminal.writeln('AI IDE backend is running on port 8000');
          terminal.writeln('✅ Supabase connection active');
          terminal.writeln('✅ OpenAI API connected');
        } else {
          terminal.writeln('Python 3.11.0');
          terminal.writeln('Type "help()" for more information.');
        }
        break;
        
      case 'npm':
        const npmCmd = args[0];
        if (npmCmd === 'dev' || npmCmd === 'start') {
          terminal.writeln('> ai-ide@1.0.0 dev');
          terminal.writeln('> vite');
          terminal.writeln('');
          terminal.writeln('  VITE v5.0.0  ready in 350ms');
          terminal.writeln('');
          terminal.writeln('  ➜  Local:   http://localhost:5173/');
          terminal.writeln('  ➜  Network: use --host to expose');
        } else if (npmCmd === 'install') {
          terminal.writeln('Installing dependencies...');
          terminal.writeln('✅ @monaco-editor/react');
          terminal.writeln('✅ @xterm/xterm');
          terminal.writeln('✅ @stripe/stripe-js');
          terminal.writeln('✅ @supabase/supabase-js');
          terminal.writeln('All packages installed successfully!');
        } else {
          terminal.writeln(`npm ${args.join(' ')} - command executed`);
        }
        break;
        
      case 'git':
        const gitCmd = args[0];
        if (gitCmd === 'status') {
          terminal.writeln('On branch main');
          terminal.writeln('Your branch is up to date with \'origin/main\'.');
          terminal.writeln('');
          terminal.writeln('Changes not staged for commit:');
          terminal.writeln('  modified:   src/components/Terminal.tsx');
          terminal.writeln('  modified:   src/components/CodeEditor.tsx');
          terminal.writeln('');
          terminal.writeln('no changes added to commit');
        } else {
          terminal.writeln(`git ${args.join(' ')} - command executed`);
        }
        break;
        
      case 'supabase':
        terminal.writeln('Supabase Status:');
        terminal.writeln('  Project URL: https://your-project.supabase.co');
        terminal.writeln('  ✅ Database Connected');
        terminal.writeln('  ✅ Auth Enabled');
        terminal.writeln('  ✅ Storage Ready');
        terminal.writeln('  ✅ Real-time Active');
        break;
        
      case 'stripe':
        terminal.writeln('Stripe Integration Status:');
        terminal.writeln('  Environment: Test Mode');
        terminal.writeln('  ✅ Webhook Active');
        terminal.writeln('  Products: Basic ($9/mo), Pro ($29/mo)');
        terminal.writeln('  Active subscriptions: 0');
        break;
        
      case 'ai':
        const query = args.join(' ');
        if (query) {
          terminal.writeln(`🤖 AI Assistant: "${query}"`);
          terminal.writeln('I can help with that! Consider:');
          terminal.writeln('- Using async/await for better performance');
          terminal.writeln('- Proper error handling');
          terminal.writeln('- Code documentation');
        } else {
          terminal.writeln('Error: Please provide a query');
        }
        break;
        
      default:
        terminal.writeln(`Command '${cmd}' not found. Type 'help' for available commands.`);
    }
  };

  // Create first terminal on mount
  useEffect(() => {
    if (tabs.length === 0) {
      createTerminal();
    }
  }, []);

  // Handle tab switching
  const switchToTab = (tabId: string) => {
    setTabs(prevTabs =>
      prevTabs.map(tab => ({ ...tab, isActive: tab.id === tabId }))
    );
    setActiveTabId(tabId);

    // Mount the selected terminal
    const tab = tabs.find(t => t.id === tabId);
    if (tab && terminalContainerRef.current) {
      setTimeout(() => {
        tab.terminal.open(terminalContainerRef.current!);
        tab.fitAddon.fit();
      }, 0);
    }
  };

  // Close a tab
  const closeTab = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      tab.terminal.dispose();
    }

    setTabs(prevTabs => {
      const filtered = prevTabs.filter(t => t.id !== tabId);
      if (filtered.length === 0) {
        // Create new terminal if closing last one
        setTimeout(createTerminal, 0);
        return [];
      }
      
      // If closing active tab, switch to another
      if (tabId === activeTabId && filtered.length > 0) {
        const newActiveTab = filtered[filtered.length - 1];
        newActiveTab.isActive = true;
        setActiveTabId(newActiveTab.id);
        
        // Mount the new active terminal
        setTimeout(() => {
          if (terminalContainerRef.current) {
            newActiveTab.terminal.open(terminalContainerRef.current);
            newActiveTab.fitAddon.fit();
          }
        }, 0);
      }
      
      return filtered;
    });
  };

  return (
    <div className={cn(
      "flex flex-col bg-terminal-bg transition-all duration-300",
      isMaximized ? "fixed inset-0 z-50" : "h-full"
    )}>
      {/* Terminal Header with Tabs */}
      <div className="flex items-center justify-between bg-card border-b border-border">
        {/* Tab Bar */}
        <div className="flex items-center">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm border-r border-border cursor-pointer transition-colors",
                tab.isActive 
                  ? "bg-terminal-bg text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              onClick={() => switchToTab(tab.id)}
            >
              <TerminalIcon className="w-3 h-3" />
              <span className="font-mono">{tab.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="ml-1 p-0.5 hover:bg-muted rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          {/* Add Tab Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={createTerminal}
            className="ml-2"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Terminal Controls */}
        <div className="flex items-center gap-2 px-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMaximized(!isMaximized)}
          >
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Terminal Container */}
      <div 
        ref={terminalContainerRef}
        className="flex-1 overflow-hidden"
        style={{ minHeight: 0 }}
      />

      {/* Status Bar */}
      <div className="px-4 py-2 bg-muted border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Theia-style Terminal - {tabs.length} tab{tabs.length !== 1 ? 's' : ''}</span>
          <div className="flex items-center gap-4">
            <span>xterm.js powered</span>
            <span className="text-primary">● Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};