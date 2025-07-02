import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Code, Database, Zap, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
      content: 'Hello! I\'m your AI coding assistant. I can help you with Python, React, Supabase integration, and Stripe payments. What would you like to work on?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
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
        isCode: input.toLowerCase().includes('code') || input.toLowerCase().includes('function') || input.toLowerCase().includes('example')
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('python') || input.includes('backend')) {
      return `I can help you with Python! Here's a quick example for your AI IDE backend:

\`\`\`python
from fastapi import FastAPI
from supabase import create_client
import openai

app = FastAPI()
supabase = create_client(url, key)

@app.post("/ai/analyze")
async def analyze_code(code: str):
    response = await openai.ChatCompletion.acreate(
        model="gpt-4",
        messages=[{"role": "user", "content": f"Analyze: {code}"}]
    )
    return {"analysis": response.choices[0].message.content}
\`\`\`

This creates an AI code analysis endpoint using FastAPI and OpenAI!`;
    }
    
    if (input.includes('react') || input.includes('frontend') || input.includes('component')) {
      return `Perfect! Here's a React component pattern for your AI IDE:

\`\`\`tsx
import React, { useState, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';

export const AICodeEditor = () => {
  const [code, setCode] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const { aiAnalyze } = useSupabase();

  const handleCodeChange = async (newCode: string) => {
    setCode(newCode);
    const analysis = await aiAnalyze(newCode);
    setSuggestions(analysis.suggestions);
  };

  return (
    <div className="editor-container">
      <textarea 
        value={code}
        onChange={(e) => handleCodeChange(e.target.value)}
        className="code-editor"
      />
      <SuggestionPanel suggestions={suggestions} />
    </div>
  );
};
\`\`\`

This gives you real-time AI code analysis!`;
    }
    
    if (input.includes('supabase') || input.includes('database')) {
      return `Supabase is perfect for your AI IDE! Here's how to set up the integration:

\`\`\`typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.REACT_APP_SUPABASE_ANON_KEY!
);

// Store user projects
export const saveProject = async (project: Project) => {
  const { data, error } = await supabase
    .from('projects')
    .insert([project]);
  return { data, error };
};

// Real-time collaboration
export const subscribeToProject = (projectId: string, callback: Function) => {
  return supabase
    .channel('project-changes')
    .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'projects', filter: \`id=eq.\${projectId}\` },
        callback
    )
    .subscribe();
};
\`\`\`

This enables real-time collaborative coding!`;
    }
    
    if (input.includes('stripe') || input.includes('payment') || input.includes('subscription')) {
      return `For monetizing your AI IDE with Stripe, here's a subscription setup:

\`\`\`typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Create subscription plans
export const createSubscription = async (customerId: string, priceId: string) => {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  });
  
  return subscription;
};

// AI Feature tiers
const AI_LIMITS = {
  free: { requests: 100, models: ['gpt-3.5-turbo'] },
  pro: { requests: 1000, models: ['gpt-4', 'gpt-3.5-turbo'] },
  enterprise: { requests: 10000, models: ['gpt-4', 'claude-3'] }
};
\`\`\`

This creates tiered AI access based on subscription!`;
    }
    
    if (input.includes('ai') || input.includes('openai') || input.includes('assistant')) {
      return `I can help you integrate AI capabilities! Here's an AI helper service:

\`\`\`typescript
class AIService {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  
  async generateCode(prompt: string, language: string) {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: \`You are an expert \${language} developer.\` },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
    });
    
    return completion.choices[0].message.content;
  }
  
  async explainCode(code: string) {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Explain this code clearly and concisely." },
        { role: "user", content: code }
      ]
    });
    
    return completion.choices[0].message.content;
  }
}
\`\`\`

This gives you code generation and explanation features!`;
    }

    if (input.includes('help') || input.includes('what can you do')) {
      return `I'm your AI coding assistant for building an AI-powered IDE! I can help you with:

🐍 **Python Backend:**
- FastAPI setup for AI services
- OpenAI integration for code analysis
- Database operations with Supabase

⚛️ **React Frontend:**
- Component architecture for IDE
- Real-time code editing
- AI-powered suggestions

🗄️ **Supabase Integration:**
- User authentication
- Project storage
- Real-time collaboration

💳 **Stripe Payments:**
- Subscription management
- Tiered AI features
- Usage tracking

Just ask me about any specific feature you'd like to implement!`;
    }
    
    return 'I\'m here to help you build your AI-powered IDE! I can assist with Python backends, React frontends, Supabase integration, and Stripe payments. What specific challenge are you facing? Try asking about "Python API setup" or "React code editor component".';
  };

  const copyMessage = async (messageId: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 border-b border-border bg-gradient-accent">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Sparkles className="w-5 h-5 text-primary" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          </div>
          <h3 className="font-semibold text-foreground">AI Assistant</h3>
          <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            GPT-4 Active
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={cn(
            "flex gap-3 group",
            message.type === 'user' ? "justify-end" : "justify-start"
          )}>
            <div className={cn(
              "max-w-[80%] rounded-lg p-3 text-sm relative",
              message.type === 'user' 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-foreground border border-border",
              message.isCode && "font-mono bg-code-bg border border-primary/20"
            )}>
              {message.isCode ? (
                <pre className="whitespace-pre-wrap text-xs leading-relaxed">
                  {message.content}
                </pre>
              ) : (
                <div className="whitespace-pre-wrap">
                  {message.content}
                </div>
              )}
              
              {message.type === 'assistant' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyMessage(message.id, message.content)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
                >
                  {copiedMessageId === message.id ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3">
            <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground border border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary animate-spin" />
                <span>AI is thinking...</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
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
            placeholder="Ask about Python, React, Supabase, Stripe, or AI features..."
            className="flex-1 px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!input.trim()} 
            className="bg-primary hover:bg-primary/90 transition-all hover:shadow-glow"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Code className="w-3 h-3" />
            <span>Code generation</span>
          </div>
          <div className="flex items-center gap-1">
            <Database className="w-3 h-3" />
            <span>Supabase ready</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>Stripe integration</span>
          </div>
        </div>
      </div>
    </div>
  );
};