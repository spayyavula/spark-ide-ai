import { useState, useEffect, useRef } from "react";
import { Play, Save, Download, Maximize2, Copy, Check, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logger } from '@/utils/logger';
import { cn } from "@/lib/utils";
import Editor from '@monaco-editor/react';

const codeExamples: Record<string, string> = {
  "Editor.tsx": `import React, { useState, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';

interface EditorProps {
  theme: 'dark' | 'light';
  language: string;
}

export const Editor: React.FC<EditorProps> = ({ theme, language }) => {
  const [code, setCode] = useState('');
  const { saveCode, loading } = useSupabase();

  useEffect(() => {
    // Initialize editor with syntax highlighting
    logger.debug('Editor initialized with', { theme, language });
  }, [theme, language]);

  const handleSave = async () => {
    try {
      await saveCode(code);
      logger.debug('Code saved successfully');
    } catch (error) {
      logger.error('Failed to save code:', error);
    }
  };

  return (
    <div className="editor-container">
      <textarea 
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="code-editor"
        placeholder="Start coding..."
      />
    </div>
  );
};`,
  "chat.py": `import openai
import asyncio
from supabase import create_client, Client
from typing import Dict, List, Optional

class AICodeAssistant:
    def __init__(self, api_key: str, supabase_url: str, supabase_key: str):
        self.openai_client = openai.OpenAI(api_key=api_key)
        self.supabase: Client = create_client(supabase_url, supabase_key)
        
    async def analyze_code(self, code: str, language: str) -> Dict:
        """Analyze code and provide AI suggestions"""
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": f"You are an expert {language} developer."},
                    {"role": "user", "content": f"Analyze this code and suggest improvements:\\n{code}"}
                ],
                max_tokens=1000
            )
            
            # Store analysis in Supabase
            result = self.supabase.table('code_analyses').insert({
                'code_snippet': code,
                'language': language,
                'analysis': response.choices[0].message.content,
                'timestamp': datetime.now().isoformat()
            }).execute()
            
            return {
                'suggestions': response.choices[0].message.content,
                'analysis_id': result.data[0]['id']
            }
        except Exception as e:
            return {'error': str(e)}
    
    async def generate_code(self, prompt: str, language: str) -> str:
        """Generate code based on natural language prompt"""
        response = await self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": f"Generate clean, well-documented {language} code."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2000
        )
        return response.choices[0].message.content

# Stripe integration for paid features
async def handle_payment(user_id: str, plan: str):
    """Handle Stripe subscription for premium AI features"""
    import stripe
    # Use secure environment variables in production
    stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
    
    try:
        customer = stripe.Customer.create(
            metadata={'user_id': user_id, 'plan': plan}
        )
        return {'success': True, 'customer_id': customer.id}
    except Exception as e:
        return {'success': False, 'error': str(e)}`,
  "AIChat.tsx": `import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Code, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isCode?: boolean;
}

export const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant', 
      content: 'Hello! I\\'m your AI coding assistant. I can help you with Python, React, Supabase integration, and Stripe payments. What would you like to work on?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(input),
        timestamp: new Date(),
        isCode: input.toLowerCase().includes('code') || input.toLowerCase().includes('function')
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    if (userInput.toLowerCase().includes('python')) {
      return 'I can help you with Python! For your AI IDE, I recommend using FastAPI for the backend, OpenAI\\'s API for AI features, and asyncio for handling concurrent requests. Would you like me to show you a specific implementation?';
    }
    if (userInput.toLowerCase().includes('react')) {
      return 'Great choice! React is perfect for building interactive IDEs. I suggest using TypeScript for better development experience, and libraries like Monaco Editor for code editing. What specific React component are you working on?';
    }
    if (userInput.toLowerCase().includes('supabase')) {
      return 'Supabase is excellent for your backend needs! I can help you set up authentication, real-time collaboration features, and store user projects. Would you like me to show you how to integrate it with your AI IDE?';
    }
    if (userInput.toLowerCase().includes('stripe')) {
      return 'For monetizing your AI IDE, Stripe is perfect! You can offer tiered pricing - free tier with basic AI features, premium with advanced code generation. I can help you implement subscription management.';
    }
    return 'I\\'m here to help you build your AI-powered IDE! I can assist with Python backends, React frontends, Supabase integration, and Stripe payments. What specific challenge are you facing?';
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 border-b border-border bg-gradient-accent">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">AI Assistant</h3>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={cn(
            "flex gap-3",
            message.type === 'user' ? "justify-end" : "justify-start"
          )}>
            <div className={cn(
              "max-w-[80%] rounded-lg p-3 text-sm",
              message.type === 'user' 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-foreground",
              message.isCode && "font-mono"
            )}>
              {message.content}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3">
            <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me about Python, React, Supabase, or Stripe..."
            className="flex-1 px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <Button onClick={sendMessage} disabled={!input.trim()} className="bg-primary hover:bg-primary/90">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};`
};

interface CodeEditorProps {
  selectedFile: string;
}

export const CodeEditor = ({ selectedFile }: CodeEditorProps) => {
  const [code, setCode] = useState(codeExamples[selectedFile] || "// Select a file from the explorer to start coding...");
  const [copied, setCopied] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    setCode(codeExamples[selectedFile] || "// Select a file from the explorer to start coding...");
  }, [selectedFile]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageFromFile = (filename: string) => {
    if (filename.endsWith('.tsx') || filename.endsWith('.ts')) return 'TypeScript';
    if (filename.endsWith('.py')) return 'Python';
    if (filename.endsWith('.json')) return 'JSON';
    return 'Text';
  };

  const getMonacoLanguage = (filename: string) => {
    if (filename.endsWith('.tsx') || filename.endsWith('.ts')) return 'typescript';
    if (filename.endsWith('.py')) return 'python';
    if (filename.endsWith('.json')) return 'json';
    if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'javascript';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.md')) return 'markdown';
    return 'plaintext';
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Configure Monaco theme to match our design system
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Fira Code, Monaco, Consolas, monospace',
      lineHeight: 21,
      tabSize: 2,
      insertSpaces: true,
      automaticLayout: true,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      renderLineHighlight: 'all',
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      parameterHints: { enabled: true },
    });
  };

  return (
    <div className="flex flex-col h-full bg-code-bg">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Code className="w-4 h-4 text-primary" />
          <span className="font-mono text-sm text-foreground">{selectedFile}</span>
          <span className="text-xs text-muted-foreground">({getLanguageFromFile(selectedFile)})</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm">
            <Save className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Play className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Monaco Editor Area */}
      <div className="flex-1">
        <Editor
          value={code}
          language={getMonacoLanguage(selectedFile)}
          onChange={(value) => setCode(value || "")}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Fira Code, Monaco, Consolas, monospace',
            lineHeight: 21,
            tabSize: 2,
            insertSpaces: true,
            automaticLayout: true,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            renderLineHighlight: 'all',
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            suggestOnTriggerCharacters: true,
            quickSuggestions: {
              other: 'on',
              comments: 'off',
              strings: 'off',
            },
            parameterHints: { enabled: true },
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: 'active',
              indentation: true,
            },
            inlineSuggest: { enabled: true },
            acceptSuggestionOnCommitCharacter: true,
            acceptSuggestionOnEnter: 'on',
            accessibilitySupport: 'auto',
            autoIndent: 'full',
            contextmenu: true,
            copyWithSyntaxHighlighting: true,
            cursorSmoothCaretAnimation: 'on',
            find: {
              autoFindInSelection: 'never',
              seedSearchStringFromSelection: 'selection',
            },
            folding: true,
            foldingHighlight: true,
            formatOnPaste: true,
            formatOnType: true,
            glyphMargin: true,
            hover: { enabled: true },
            lightbulb: { enabled: true },
            links: true,
            mouseWheelZoom: true,
            multiCursorModifier: 'alt',
            occurrencesHighlight: 'singleFile',
            renderControlCharacters: false,
            renderFinalNewline: 'on',
            renderWhitespace: 'boundary',
            roundedSelection: false,
            rulers: [],
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              arrowSize: 11,
              useShadows: true,
              verticalHasArrows: false,
              horizontalHasArrows: false,
            },
            selectOnLineNumbers: true,
            selectionHighlight: true,
            showFoldingControls: 'mouseover',
            showUnused: true,
            snippetSuggestions: 'top',
            suggest: {
              insertMode: 'insert',
              filterGraceful: true,
              showWords: true,
            },
            wordBasedSuggestions: 'matchingDocuments',
          }}
          loading={
            <div className="h-full flex items-center justify-center bg-code-bg text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                Loading Monaco Editor...
              </div>
            </div>
          }
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Line {code.split('\n').length}</span>
          <span>UTF-8</span>
          <span>{getLanguageFromFile(selectedFile)}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-success">● Supabase Connected</span>
          <span className="text-warning">● Stripe Ready</span>
          <span className="text-primary">● AI Active</span>
        </div>
      </div>
    </div>
  );
};