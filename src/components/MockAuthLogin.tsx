import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMockAuth } from "@/hooks/useMockAuth";
import { useToast } from "@/hooks/use-toast";

const MockAuthLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useMockAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    const result = await login(email, password);
    
    if (result.success) {
      toast({
        title: "Login successful",
        description: "Welcome to ThumbsUp Dev!"
      });
    }
  };

  const handleQuickLogin = () => {
    setEmail("test@example.com");
    setPassword("password123");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login (Mock Auth)</CardTitle>
        <CardDescription>
          This is a mock authentication system for testing. Enter any email to continue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="test@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Any password works"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={handleQuickLogin}
              disabled={isLoading}
            >
              Quick Fill
            </Button>
          </div>
        </form>
        <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
          <strong>For testing:</strong> Any email/password combination will work. 
          The system will create a mock user account automatically.
        </div>
      </CardContent>
    </Card>
  );
};

export default MockAuthLogin;