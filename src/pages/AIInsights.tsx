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
import { AdSense } from '@/components/AdSense';

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
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <Brain className="h-8 w-8 sm:h-12 sm:w-12 text-primary mr-2 sm:mr-3" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">AI Budget Insights</h1>
              <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 ml-1 sm:ml-2" />
            </div>
            <p className="text-lg sm:text-xl text-muted-foreground px-4">
              Get personalized financial advice powered by AI
            </p>
          </div>

          {!user && (
            <Card className="mb-6 sm:mb-8 border-primary/20 bg-primary/5 mx-3 sm:mx-0">
              <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                <div className="text-center">
                  <Crown className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Sign In & Subscribe to Leverage AI Insights!</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 px-2">
                    Unlock powerful AI-driven financial insights using your personal budget data
                  </p>
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <a href="/auth">Sign In to Get Started</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AdSense for non-subscribers */}
          {!subscribed && (
            <div className="mb-8">
              <AdSense adSlot="1234567890" />
            </div>
          )}

          {user && !subscribed && !subLoading && (
            <div className="mb-6 sm:mb-8 space-y-4 sm:space-y-6 px-3 sm:px-0">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                  <div className="text-center">
                    <Crown className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">Subscribe to Access AI Insights</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-2">
                      Get personalized financial advice using your actual budget data
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                <Card className="relative border-2 border-primary/20">
                  <CardHeader className="text-center pb-4">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="h-5 w-5 sm:h-6 sm:w-6 text-primary mr-2" />
                      <CardTitle className="text-lg sm:text-xl">Monthly Plan</CardTitle>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold">$1.99<span className="text-base sm:text-lg font-normal text-muted-foreground">/month</span></div>
                    <CardDescription className="text-sm sm:text-base">Affordable AI-powered budget optimization</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                    <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base">
                      <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />Unlimited AI insights</li>
                      <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />Personal budget analysis</li>
                      <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />Smart recommendations</li>
                      <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />Monthly financial review</li>
                    </ul>
                    <Button 
                      onClick={() => handleSubscribe('monthly')} 
                      className="w-full h-12"
                      size="lg"
                    >
                      Subscribe Monthly
                    </Button>
                  </CardContent>
                </Card>

                <Card className="relative border-2 border-green-500">
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-xs sm:text-sm">
                    Best Value
                  </Badge>
                  <CardHeader className="text-center pb-4 pt-6">
                    <div className="flex items-center justify-center mb-2">
                      <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 mr-2" />
                      <CardTitle className="text-lg sm:text-xl">Annual Plan</CardTitle>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold">$19.99<span className="text-base sm:text-lg font-normal text-muted-foreground">/year</span></div>
                    <CardDescription className="text-green-600 font-medium text-sm sm:text-base">Save $3.89 per year!</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                    <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base">
                      <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />Unlimited AI insights</li>
                      <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />Personal budget analysis</li>
                      <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />Smart recommendations</li>
                      <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />Priority support</li>
                      <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />Annual financial planning</li>
                    </ul>
                    <Button 
                      onClick={() => handleSubscribe('annual')} 
                      className="w-full bg-green-600 hover:bg-green-700 h-12"
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
            <div className="mb-4 sm:mb-6 mx-3 sm:mx-0">
              <Card className="border-green-500 bg-green-50">
                <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <div className="flex items-center">
                      <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-2 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-green-800 text-sm sm:text-base">Premium Subscriber</h3>
                        <p className="text-xs sm:text-sm text-green-600">
                          Tier: {subscriptionTier} 
                          {subscriptionEnd && 
                            ` • Expires: ${new Date(subscriptionEnd).toLocaleDateString()}`
                          }
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={handleManageSubscription} size="sm" className="w-full sm:w-auto">
                      Manage Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {user && subscribed && (
            <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 xl:grid-cols-2 px-3 sm:px-0">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg sm:text-xl">
                    <Send className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Ask Your Question
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Ask anything about your budget, spending habits, or financial goals
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    <Textarea
                      placeholder="e.g., How can I save more money each month using BudgetGenius?"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                    />
                    <Button 
                      type="submit" 
                      disabled={loading || !question.trim()}
                      className="w-full h-12"
                      size="lg"
                    >
                      {loading ? 'Getting Insights...' : 'Get AI Insights'}
                    </Button>
                  </form>

                  <div className="mt-4 sm:mt-6">
                    <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Suggested Questions:</h3>
                    <div className="space-y-1.5 sm:space-y-2">
                      {suggestedQuestions.map((q, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestedQuestion(q)}
                          className="w-full text-left justify-start text-xs sm:text-sm h-auto py-2 sm:py-3 px-3"
                        >
                          {q}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg sm:text-xl">
                    <Bot className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    AI Response
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Personalized insights based on your financial data
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-6 sm:py-8">
                      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : insight ? (
                    <div className="prose prose-sm max-w-none">
                      <div className="bg-muted/50 p-3 sm:p-4 rounded-lg text-sm sm:text-base">
                        {insight.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-3 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm sm:text-base">
                      Ask a question to get started with AI insights
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* AdSense after AI interaction */}
          <div className="mt-8 mb-8">
            <AdSense adSlot="0987654321" />
          </div>

          <Card className="mt-6 sm:mt-8 mx-3 sm:mx-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">How AI Insights Works</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <div className="text-center p-3 sm:p-4">
                  <div className="bg-primary/10 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <span className="text-primary font-bold text-sm sm:text-base">1</span>
                  </div>
                  <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Analyze Your Data</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    AI reviews your BudgetGenius data including budgets, expenses, and transactions
                  </p>
                </div>
                <div className="text-center p-3 sm:p-4">
                  <div className="bg-primary/10 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <span className="text-primary font-bold text-sm sm:text-base">2</span>
                  </div>
                  <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Ask Questions</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Get answers about spending patterns, savings, and optimization strategies
                  </p>
                </div>
                <div className="text-center p-3 sm:p-4">
                  <div className="bg-primary/10 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <span className="text-primary font-bold text-sm sm:text-base">3</span>
                  </div>
                  <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Get Insights</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
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