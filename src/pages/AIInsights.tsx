import { useState, useEffect } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useBadges } from "@/hooks/useBadges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
// Removed loader import - using inline spinner instead
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Brain, Crown } from "lucide-react";
import { FinancialGauges } from "@/components/FinancialGauges";

export default function AIInsights() {
  const { user } = useAuth();
  const { earnBadge } = useBadges();
  const {
    subscribed,
    subscriptionTier,
    subscriptionEnd,
    openCustomerPortal,
    loading: subLoading,
  } = useSubscription();

  // Removed auto badge earning - now earned when user asks a question

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");
    setErrorMsg("");
    try {
      const { data, error } = await supabase.functions.invoke('ai-budget-insights', {
        body: { question }
      });

      if (error) throw error;

      setAnswer(data.insight || "No answer returned.");
      
      // Award badge when user successfully gets AI insights
      earnBadge('ai_insights');
    } catch (error) {
      console.error('AI Insights error:', error);
      toast({
        title: "AI Insights Error",
        description: (error as Error).message || "Failed to get AI insights.",
        variant: "destructive",
      });
      setErrorMsg((error as Error).message || "Failed to get AI insights.");
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to open subscription management",
        variant: "destructive",
      });
    }
  };

  const formatAIResponse = (content: string) => {
    return content
      // Bold text for **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Bullet points
      .replace(/^- (.+)$/gm, '• $1')
      .replace(/^\* (.+)$/gm, '• $1')
      // Line breaks for paragraphs
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      // Wrap in paragraph
      .replace(/^(.+)$/, '<p>$1</p>');
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="AI Budget Insights - Personal Financial Advisor"
        description="Get personalized financial advice using AI. Analyze your budget data and receive expert insights to optimize your spending and savings."
        keywords="AI financial advisor, budget insights, personal finance, money management, financial optimization"
      />
      
      {/* Hero Section with Light Background */}
      <div className="relative bg-white text-gray-900 py-8 rounded-2xl mx-4 mt-4 mb-6 shadow-xl">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <svg className="h-10 w-10 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <svg className="h-10 w-10 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
              </svg>
            </div>
            <h1 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">AI Financial Insights</h1>
            <p className="text-sm md:text-base text-gray-600 mb-4 max-w-2xl mx-auto">
              Get personalized financial advice powered by artificial intelligence
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* The debugState <pre> block has been removed */}

          {subLoading && (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Loading your subscription…</span>
            </div>
          )}

          {errorMsg && (
            <div className="text-center text-red-700 mb-4">{errorMsg}</div>
          )}

          {typeof subscribed === "undefined" && !subLoading && (
            <div className="text-center text-muted-foreground mb-4">
              Unable to determine your subscription status. Please refresh or try again.
            </div>
          )}

          {!user && !subLoading && (
            <div className="min-h-screen flex items-center justify-center">
              <Card className="w-full max-w-md">
                <CardContent className="p-6 text-center">
                  <p>Please sign in to access AI Insights</p>
                </CardContent>
              </Card>
            </div>
          )}

          {user && !subscribed && !subLoading && (
            <div className="min-h-screen flex items-center justify-center">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>AI Insights</CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <Badge variant="destructive" className="mb-4">
                    Subscription Required
                  </Badge>
                  <p>
                    The AI Insights feature is available for premium subscribers.
                  </p>
                  <Button className="mt-6" onClick={handleManageSubscription}>
                    Manage Subscription
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {user && subscribed && !subLoading && (
            <div className="max-w-6xl mx-auto space-y-8">

              {/* AI Chat Interface */}
              <div className="max-w-2xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <Badge variant="secondary">
                        Active: {subscriptionTier}
                      </Badge>
                      {subscriptionEnd && (
                        <span className="ml-2 text-muted-foreground text-sm">
                          until {new Date(subscriptionEnd).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <Textarea
                      rows={3}
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask an AI-powered budget question..."
                      disabled={loading}
                    />
                    <Button
                      className="mt-4"
                      onClick={handleAsk}
                      disabled={loading || !question.trim()}
                    >
                      {loading ? "Thinking..." : "Ask AI"}
                    </Button>
                    {answer && (
                      <div className="mt-6 p-4 bg-muted rounded">
                        <div className="font-bold mb-2">AI Financial Advisor:</div>
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ 
                            __html: formatAIResponse(answer) 
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Transparent Section - Background removed */}
          {user && subscribed && !subLoading && (
            <section className="py-16 px-4 relative mt-8">
              <div className="max-w-4xl mx-auto text-center relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">
                  AI-Powered Financial Intelligence
                </h2>
                <p className="text-lg mb-8 text-white">
                  Get personalized insights and recommendations based on your actual financial data
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="font-semibold mb-2 text-gray-900">Smart Analysis</h3>
                    <p className="text-sm text-gray-600">AI analyzes your spending patterns and budget data to provide tailored advice</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="font-semibold mb-2 text-gray-900">Real-Time Insights</h3>
                    <p className="text-sm text-gray-600">Get instant answers to financial questions based on your current situation</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="font-semibold mb-2 text-gray-900">Actionable Advice</h3>
                    <p className="text-sm text-gray-600">Receive specific recommendations to improve your financial health</p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
