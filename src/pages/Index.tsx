import { useState } from "react";
import { Brain, Code, Zap, GitBranch, Star, Users, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo only - no actual authentication
    console.log("Demo login attempt:", { email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-glow">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Brain className="w-8 h-8 text-primary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              CodeCraft AI
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              Documentation
            </Button>
            <Button variant="ghost" size="sm">
              Pricing
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl font-bold leading-tight">
                Code Smarter with{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  AI-Powered
                </span>{" "}
                Development
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Transform your development workflow with intelligent code completion, 
                automated debugging, and seamless collaboration tools.
              </p>
            </div>

            {/* Benefits */}
            <div className="grid gap-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">AI-Powered Code Intelligence</h3>
                  <p className="text-muted-foreground">
                    Get intelligent suggestions, automatic bug fixes, and code optimization 
                    powered by advanced AI that understands your codebase.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Lightning-Fast Development</h3>
                  <p className="text-muted-foreground">
                    Accelerate your workflow with instant compilation, real-time collaboration, 
                    and integrated tools that eliminate context switching.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <GitBranch className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Seamless GitHub Integration</h3>
                  <p className="text-muted-foreground">
                    Connect directly to your repositories, browse code in-browser, 
                    and manage your projects without leaving the IDE.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Login Demo */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md shadow-elevation">
              <CardHeader className="text-center space-y-2">
                <div className="flex justify-center">
                  <div className="p-3 bg-gradient-primary rounded-full">
                    <Code className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Welcome to CodeCraft AI</CardTitle>
                <CardDescription>
                  Sign in to start coding with AI assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="developer@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="transition-all duration-200 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="transition-all duration-200 focus:ring-primary/20"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                  >
                    Sign In to IDE
                  </Button>
                  <div className="text-center">
                    <Button variant="ghost" size="sm" className="text-primary">
                      Try Demo Without Account
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-border bg-card/30">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                <span className="text-3xl font-bold text-primary">99%</span>
              </div>
              <p className="text-muted-foreground">Developer Satisfaction</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-3xl font-bold text-primary">50K+</span>
              </div>
              <p className="text-muted-foreground">Active Developers</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                <span className="text-3xl font-bold text-primary">3x</span>
              </div>
              <p className="text-muted-foreground">Faster Development</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <span className="font-semibold">CodeCraft AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for developers who demand excellence
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
