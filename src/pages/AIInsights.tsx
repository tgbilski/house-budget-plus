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
import { Brain, Crown, Zap, Target, Lightbulb } from "lucide-react";

export default function AIInsights() {
  const { user } = useAuth();
  const { earnBadge } = useBadges();
  const {
    subscribed,
    subscriptionTier,
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
      .replace(/^- (.+)$/gm, '<div>• $1</div>')
      .replace(/^\* (.+)$/gm, '<div>• $1</div>')
      .replace(/\n/g, '<br>');
    return `<div>${processed}</div>`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white relative">
      <SEO
        title="AI Budget Insights - Personal Financial Advisor"
        description="Get personalized financial advice using AI. Analyze your budget data and receive expert insights to optimize your spending and savings."
        keywords="AI financial advisor, budget insights, personal finance, money management, financial optimization"
      />

      {/* Hero Section - Replicating Home Page Layout */}
      <div className="container mx-auto px-4 py-16 md:py-24 relative overflow-hidden">
        {/* Mascot Image - On top of everything */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 md:top-16">
          <img
            src="/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png"
            alt="Budget Calculator mascot"
            className="w-32 h-32 md:w-48 md:h-48 object-contain"
          />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10 pt-20 md:pt-32">
          <h1 className="text-4xl md:text-7xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 leading-tight">
            AI Financial Insights
          </h1>
          <p className="text-lg md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12">
            Unlock intelligent, **personalized financial advice** powered by advanced artificial intelligence to master your money.
          </p>

          {/* Chatbot feature directly in the hero section */}
          <div className="max-w-4xl mx-auto">
            {subLoading && (
              <div className="flex justify-center items-center h-40 text-gray-300">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3">Loading your subscription…</span>
              </div>
            )}

            {errorMsg && (
              <div className="text-center text-red-400 mb-4">{errorMsg}</div>
            )}

            {typeof subscribed === "undefined" && !subLoading && (
              <div className="text-center text-gray-400 mb-4">
                Unable to determine your subscription status. Please refresh or try again.
              </div>
            )}

            {!user && !subLoading && (
              <Card className="w-full bg-gray-800/50 backdrop-blur-md border border-gray-700 text-white shadow-2xl">
                <CardContent className="p-8 text-center">
                  <p className="text-xl font-semibold mb-6 text-gray-100">Please sign in to access AI Insights</p>
                  <Button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 transform hover:scale-105 shadow-lg" onClick={() => window.location.href = '/login'}>Sign In Now</Button>
                </CardContent>
              </Card>
            )}

            {user && !subscribed && !subLoading && (
              <Card className="w-full bg-gray-800/50 backdrop-blur-md border border-gray-700 text-white shadow-2xl">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-bold text-gray-100">AI Insights</CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <Badge variant="destructive" className="mb-6 bg-red-600 text-white text-base py-1.5 px-4 shadow-md">
                    Subscription Required
                  </Badge>
                  <p className="text-gray-300 mb-8 leading-relaxed">
                    Unlock the full power of AI with a premium subscription. Get cutting-edge financial advice tailored just for you.
                  </p>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg" onClick={handleManageSubscription}>
                    Upgrade to Premium
                  </Button>
                </CardContent>
              </Card>
            )}

            {user && subscribed && !subLoading && (
              <Card className="bg-gray-800/50 backdrop-blur-md border border-gray-700 text-white shadow-2xl p-6 sm:p-8">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="flex items-center justify-center gap-3 text-2xl md:text-3xl font-bold text-gray-100">
                    <Brain className="h-7 w-7 text-purple-400" /> Your AI Financial Advisor
                  </CardTitle>
                  {subscriptionTier && (
                    <Badge className="mx-auto mt-2 bg-purple-800/50 text-purple-200 hover:bg-purple-800 text-sm font-medium px-4 py-2 rounded-full flex items-center gap-1 shadow-md w-fit">
                      <Crown className="h-4 w-4 text-yellow-300" /> {subscriptionTier} Tier
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <Textarea
                    rows={4}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask an AI-powered budget question, such as 'How can I reduce my expenses?' or 'What are smart investment strategies?'"
                    disabled={loading}
                    className="bg-gray-900/60 border border-gray-700 text-gray-100 placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-950 transition-all duration-300 rounded-lg p-4 resize-none"
                  />
                  <Button
                    className="mt-6 w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                    onClick={handleAsk}
                    disabled={loading || !question.trim()}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        Thinking<span className="animate-pulse">...</span>
                      </span>
                    ) : "Ask AI"}
                  </Button>
                  {answer && (
                    <div className="mt-8 p-6 bg-gray-900/50 rounded-xl border border-gray-700 shadow-inner">
                      <div className="font-bold mb-4 text-purple-300 text-xl flex items-center gap-2">
                        <Brain className="h-6 w-6 text-purple-400" /> AI Financial Advisor:
                      </div>
                      <div
                        className="prose prose-sm max-w-none text-gray-200 leading-relaxed space-y-3"
                        dangerouslySetInnerHTML={{
                          __html: formatAIResponse(answer)
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Sections - Replicating Home Page Layout */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        {user && subscribed && !subLoading && (
          <div className="max-w-6xl mx-auto">
            {/* Feature Section */}
            <section className="mb-16">
              <div className="text-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                  AI-Powered Financial Intelligence
                </h2>
                <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
                  Leverage cutting-edge AI to gain unparalleled insights into your finances and make smarter decisions.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 shadow-lg hover:shadow-cyan-500/30 transition-shadow duration-300">
                  <Zap className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-xl mb-3 text-gray-50">Smart Analysis</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">Our AI meticulously analyzes your spending patterns and budget data to provide highly tailored, actionable advice.</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 shadow-lg hover:shadow-blue-500/30 transition-shadow duration-300">
                  <Target className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-xl mb-3 text-gray-50">Real-Time Insights</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">Get instant, on-demand answers to your most pressing financial questions, constantly updated based on your current situation.</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 shadow-lg hover:shadow-pink-500/30 transition-shadow duration-300">
                  <Lightbulb className="h-12 w-12 text-pink-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-xl mb-3 text-gray-50">Actionable Advice</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">Receive clear, specific recommendations designed to directly improve your financial health and help you achieve your goals.</p>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
