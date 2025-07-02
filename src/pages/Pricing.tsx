import { Brain, Check, Star, Zap, Users, Shield, Crown, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gradient-glow">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative">
              <Brain className="w-8 h-8 text-primary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ThumbsUp Dev
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/documentation">Documentation</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground">
              Choose the perfect plan for your development needs
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-primary" />
              <span>14-day free trial</span>
              <Check className="w-4 h-4 text-primary" />
              <span>Cancel anytime</span>
              <Check className="w-4 h-4 text-primary" />
              <span>No setup fees</span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Starter Plan */}
            <Card className="shadow-elevation relative">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-primary" />
                  <CardTitle>Starter</CardTitle>
                </div>
                <CardDescription>Perfect for individual developers</CardDescription>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">$9</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">5 private projects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">AI code completion</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">GitHub integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">Basic collaboration (2 users)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">Community support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">5GB storage</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="shadow-elevation relative border-primary">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-primary text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <CardTitle>Pro</CardTitle>
                </div>
                <CardDescription>Best for growing development teams</CardDescription>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">$29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">25 private projects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">Advanced AI features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">Real-time collaboration (10 users)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">Priority support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">Advanced debugging tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">50GB storage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">Custom deployment</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-primary hover:opacity-90">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="shadow-elevation relative">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  <CardTitle>Enterprise</CardTitle>
                </div>
                <CardDescription>For large organizations</CardDescription>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">$99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">Unlimited projects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">Unlimited collaboration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">Advanced security & compliance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">24/7 dedicated support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">Custom integrations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">500GB storage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">On-premise deployment</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features Comparison */}
          <Card className="mb-8 shadow-elevation">
            <CardHeader>
              <CardTitle className="text-center">Feature Comparison</CardTitle>
              <CardDescription className="text-center">
                See what each plan includes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Features</th>
                      <th className="text-center py-3 px-4">Starter</th>
                      <th className="text-center py-3 px-4">Pro</th>
                      <th className="text-center py-3 px-4">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4">Private Projects</td>
                      <td className="text-center py-3 px-4">5</td>
                      <td className="text-center py-3 px-4">25</td>
                      <td className="text-center py-3 px-4">Unlimited</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4">Collaborators</td>
                      <td className="text-center py-3 px-4">2</td>
                      <td className="text-center py-3 px-4">10</td>
                      <td className="text-center py-3 px-4">Unlimited</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4">Storage</td>
                      <td className="text-center py-3 px-4">5GB</td>
                      <td className="text-center py-3 px-4">50GB</td>
                      <td className="text-center py-3 px-4">500GB</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4">AI Code Completion</td>
                      <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                      <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                      <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4">Advanced AI Features</td>
                      <td className="text-center py-3 px-4">-</td>
                      <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                      <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4">Priority Support</td>
                      <td className="text-center py-3 px-4">-</td>
                      <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                      <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="shadow-elevation">
            <CardHeader>
              <CardTitle className="text-center">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h4 className="font-semibold">Can I change plans anytime?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes! You can upgrade, downgrade, or cancel your subscription at any time. 
                  Changes take effect at your next billing cycle.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">What happens to my projects if I cancel?</h4>
                <p className="text-sm text-muted-foreground">
                  Your projects remain accessible for 30 days after cancellation. 
                  You can export all your code and data during this period.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Do you offer educational discounts?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes! Students and educational institutions receive 50% off all plans. 
                  Contact our support team to verify your eligibility.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Is there a free plan?</h4>
                <p className="text-sm text-muted-foreground">
                  We offer a 14-day free trial for all plans. During the trial, 
                  you have full access to all Pro features.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Pricing;