import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bot, Send, Brain, Crown, Star, Check } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Badge } from '@/components/ui/badge';

const AIInsights = () => {
  const { user } = useAuth();
  const { subscribed, subscriptionTier, subscriptionEnd, loading: subLoading, createCheckout, openCustomerPortal } = useSubscription();
  const { toast } = useToast();
  const [question, setQuestion] = useState('');
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    "How can I optimize my budget using BudgetGenius?",
    "Where am I spending too much money?",
    "What's a realistic savings goal for me?",
    "How can I reduce my monthly expenses?",
    "Am I on track financially?",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to get AI insights",
        variant: "destructive",
      });
      return;
    }

    if (!subscribed) {
      toast({
        title: "Subscription Required",
        description: "Please subscribe to access AI insights",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-budget-insights', {
        body: { question },
      });

      if (error) {
        if (error.message?.includes('Subscription required')) {
          toast({
            title: "Subscription Required",
            description: "Please subscribe to access AI insights",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      setInsight(data.insight);
    } catch (error) {
      console.error('Error getting AI insights:', error);
      toast({
        title: "Error",
        description: "Failed to get AI insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = (suggestedQ: string) => {
    setQuestion(suggestedQ);
  };

  const handleSubscribe = async (plan: 'monthly' | 'annual') => {
    try {
      await createCheckout(plan);
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process",
        variant: "destructive",
      });
    }
  };

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open subscription management",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <SEO
        title="AI Budget Insights - Personal Financial Advisor"
        description="Get personalized financial advice using AI. Analyze your budget data and receive expert insights to optimize your spending and savings."
        keywords="AI financial advisor, budget insights, personal finance, money management, financial optimization"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Brain className="h-12 w-12 text-primary mr-3" />
              <h1 className="text-4xl font-bold">AI Budget Insights</h1>
              <Crown className="h-8 w-8 text-yellow-500 ml-2" />
            </div>
            <p className="text-xl text-muted-foreground">
              Get personalized financial advice powered by AI
            </p>
          </div>

          {!user && (
            <Card className="mb-8 border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Sign In & Subscribe to Leverage AI Insights!</h3>
                  <p className="text-muted-foreground mb-4">
                    Unlock powerful AI-driven financial insights using your personal budget data
                  </p>
                  <Button asChild>
                    <a href="/auth">Sign In to Get Started</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {user && !subscribed && !subLoading && (
            <div className="mb-8 space-y-6">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Subscribe to Access AI Insights</h3>
                    <p className="text-muted-foreground mb-6">
                      Get personalized financial advice using your actual budget data
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="relative border-2 border-primary/20">
                  <CardHeader className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="h-6 w-6 text-primary mr-2" />
                      <CardTitle>Monthly Plan</CardTitle>
                    </div>
                    <div className="text-3xl font-bold">$4.99<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                    <CardDescription>Perfect for regular budget optimization</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Unlimited AI insights</li>
                      <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Personal budget analysis</li>
                      <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Smart recommendations</li>
                      <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Monthly financial review</li>
                    </ul>
                    <Button 
                      onClick={() => handleSubscribe('monthly')} 
                      className="w-full"
                      size="lg"
                    >
                      Subscribe Monthly
                    </Button>
                  </CardContent>
                </Card>

                <Card className="relative border-2 border-green-500">
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500">
                    Best Value
                  </Badge>
                  <CardHeader className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Crown className="h-6 w-6 text-yellow-500 mr-2" />
                      <CardTitle>Annual Plan</CardTitle>
                    </div>
                    <div className="text-3xl font-bold">$49.99<span className="text-lg font-normal text-muted-foreground">/year</span></div>
                    <CardDescription className="text-green-600 font-medium">Save $9.89 per year!</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Unlimited AI insights</li>
                      <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Personal budget analysis</li>
                      <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Smart recommendations</li>
                      <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Priority support</li>
                      <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Annual financial planning</li>
                    </ul>
                    <Button 
                      onClick={() => handleSubscribe('annual')} 
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      Subscribe Annually
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {user && subscribed && (
            <div className="mb-6">
              <Card className="border-green-500 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Crown className="h-6 w-6 text-green-600 mr-2" />
                      <div>
                        <h3 className="font-semibold text-green-800">Premium Subscriber</h3>
                        <p className="text-sm text-green-600">
                          Tier: {subscriptionTier} 
                          {subscriptionEnd && 
                            ` • Expires: ${new Date(subscriptionEnd).toLocaleDateString()}`
                          }
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={handleManageSubscription}>
                      Manage Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {user && subscribed && (
            <div className="grid gap-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Send className="h-5 w-5 mr-2" />
                    Ask Your Question
                  </CardTitle>
                  <CardDescription>
                    Ask anything about your budget, spending habits, or financial goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Textarea
                      placeholder="e.g., How can I save more money each month using BudgetGenius?"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button 
                      type="submit" 
                      disabled={loading || !question.trim()}
                      className="w-full"
                    >
                      {loading ? 'Getting Insights...' : 'Get AI Insights'}
                    </Button>
                  </form>

                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Suggested Questions:</h3>
                    <div className="space-y-2">
                      {suggestedQuestions.map((q, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestedQuestion(q)}
                          className="w-full text-left justify-start"
                        >
                          {q}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bot className="h-5 w-5 mr-2" />
                    AI Response
                  </CardTitle>
                  <CardDescription>
                    Personalized insights based on your financial data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : insight ? (
                    <div className="prose prose-sm max-w-none">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        {insight.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-3 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Ask a question to get started with AI insights
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>How AI Insights Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <h3 className="font-semibold mb-1">Analyze Your Data</h3>
                  <p className="text-sm text-muted-foreground">
                    AI reviews your BudgetGenius data including budgets, expenses, and transactions
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <h3 className="font-semibold mb-1">Ask Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    Get answers about spending patterns, savings, and optimization strategies
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <h3 className="font-semibold mb-1">Get Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive actionable advice tailored to your specific financial situation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;