import { useState, useEffect } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useBadges } from "@/hooks/useBadges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Brain, Crown } from "lucide-react"; // FaRobot has been removed

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
    let processed = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.+)$/gm, '• $1')
      .replace(/^\* (.+)$/gm, '• $1')
      .replace(/\n/g, '<br>');
    return `<div>${processed}</div>`;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <SEO
        title="AI Budget Insights - Personal Financial Advisor"
        description="Get personalized financial advice using AI. Analyze your budget data and receive expert insights to optimize your spending and savings."
        keywords="AI financial advisor, budget insights, personal finance, money management, financial optimization"
      />
      
      {/* Hero Section with Light Background and Consistent Styling */}
      <div className="relative bg-white text-gray-900 py-12 rounded-2xl mx-4 mt-4 mb-8 shadow-xl border border-gray-100">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mb-2 text-gray-900">AI Financial Insights</h1>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Unlock personalized financial advice powered by artificial intelligence.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {subLoading && (
            <div className="flex justify-center items-center h-40 text-gray-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3">Loading your subscription…</span>
            </div>
          )}

          {errorMsg && (
            <div className="text-center text-red-700 mb-4">{errorMsg}</div>
          )}

          {typeof subscribed === "undefined" && !subLoading && (
            <div className="text-center text-gray-600 mb-4">
              Unable to determine your subscription status. Please refresh or try again.
            </div>
          )}

          {!user && !subLoading && (
            <div className="min-h-[50vh] flex items-center justify-center">
              <Card className="w-full max-w-md bg-white border-gray-100 text-gray-900 shadow-md">
                <CardContent className="p-6 text-center">
                  <p>Please sign in to access AI Insights</p>
                </CardContent>
              </Card>
            </div>
          )}

          {user && !subscribed && !subLoading && (
            <div className="min-h-[50vh] flex items-center justify-center">
              <Card className="w-full max-w-md bg-white border-gray-100 text-gray-900 shadow-md">
                <CardHeader className="text-center">
                  <CardTitle className="text-gray-900">AI Insights</CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <Badge variant="destructive" className="mb-4 bg-red-500 text-white">
                    Subscription Required
                  </Badge>
                  <p className="text-gray-600">
                    The AI Insights feature is available for premium subscribers.
                  </p>
                  <Button className="mt-6 bg-primary hover:bg-primary/90 text-white" onClick={handleManageSubscription}>
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
                <Card className="bg-white border-gray-100 text-gray-900 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Brain className="h-6 w-6 text-primary" /> AI Financial Advisor
                      {subscriptionTier && (
                        <Badge variant="secondary" className="ml-auto bg-gray-100 text-gray-600 hover:bg-gray-200">
                          <Crown className="h-4 w-4 mr-1 text-yellow-400" /> {subscriptionTier}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      rows={3}
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask an AI-powered budget question, such as 'How can I reduce my expenses?'"
                      disabled={loading}
                      className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-primary"
                    />
                    <Button
                      className="mt-4 bg-primary hover:bg-primary/90 text-white"
                      onClick={handleAsk}
                      disabled={loading || !question.trim()}
                    >
                      {loading ? "Thinking..." : "Ask AI"}
                    </Button>
                    {answer && (
                      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                        <div className="font-bold mb-2 text-gray-900">AI Financial Advisor:</div>
                        <div 
                          className="prose prose-sm max-w-none text-gray-600"
                          dangerouslySetInnerHTML={{ 
                            __html: formatAIResponse(answer) 
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Feature Section */}
              <section className="py-16 px-4 relative mt-8 bg-white rounded-2xl shadow-xl border border-gray-100">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                  <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
                    AI-Powered Financial Intelligence
                  </h2>
                  <p className="text-lg mb-8 text-gray-600">
                    Get personalized insights and recommendations based on your actual financial data.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="font-semibold mb-2 text-gray-900">Smart Analysis</h3>
                      <p className="text-sm text-gray-600">AI analyzes your spending patterns and budget data to provide tailored advice.</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="font-semibold mb-2 text-gray-900">Real-Time Insights</h3>
                      <p className="text-sm text-gray-600">Get instant answers to financial questions based on your current situation.</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="font-semibold mb-2 text-gray-900">Actionable Advice</h3>
                      <p className="text-sm text-gray-600">Receive specific recommendations to improve your financial health.</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
      <Breadcrumbs />
    </div>
  );
}
