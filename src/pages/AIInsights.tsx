import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bot, Send, Brain } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { seoData } from '@/utils/seoData';

const AIInsights = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [question, setQuestion] = useState('');
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    "How can I optimize my budget?",
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

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-budget-insights', {
        body: { question },
      });

      if (error) throw error;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <SEO
        title="AI Budget Insights - Personal Financial Advisor"
        description="Get personalized financial advice using AI. Analyze your budget data and receive expert insights to optimize your spending and savings."
        keywords="AI financial advisor, budget insights, personal finance, money management, financial optimization"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Brain className="h-12 w-12 text-primary mr-3" />
              <h1 className="text-4xl font-bold">AI Budget Insights</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Get personalized financial advice based on your budget data
            </p>
          </div>

          {!user && (
            <Card className="mb-8 border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <p className="text-center text-amber-800">
                  Sign in to get personalized AI insights based on your budget data
                </p>
              </CardContent>
            </Card>
          )}

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
                    placeholder="e.g., How can I save more money each month?"
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

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <h3 className="font-semibold mb-1">Analyze Your Data</h3>
                  <p className="text-sm text-muted-foreground">
                    AI reviews your budget, expenses, and transaction history
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <h3 className="font-semibold mb-1">Ask Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    Get answers about spending patterns, savings, and optimization
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <h3 className="font-semibold mb-1">Get Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive personalized recommendations and actionable advice
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