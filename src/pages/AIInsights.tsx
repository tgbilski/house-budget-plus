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
import { Brain, Crown, Zap, Target, Lightbulb, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-950 text-white relative overflow-hidden">
      {/* Background particles/gradients for a futuristic look */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-pink-500 rounded-full mix-blend-screen filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <SEO
        title="AI Budget Insights - Personal Financial Advisor"
        description="Get personalized financial advice using AI. Analyze your budget data and receive expert insights to optimize your spending and savings."
        keywords="AI financial advisor, budget insights, personal finance, money management, financial optimization"
      />
      
      {/* Hero Section with Glassmorphism */}
      <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 text-white py-20 rounded-3xl mx-4 mt-8 mb-12 shadow-2xl z-10">
        {/* Mascot Image - Absolutely positioned just above the title */}
        <div className="absolute top-[calc(-50px-10px)] left-1/2 -translate-x-1/2 z-20"> {/* Adjusted for 10px buffer */}
          <img
            src="/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png"
            alt="Budget Calculator mascot"
            className="w-36 h-36 md:w-48 md:h-48 object-contain hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 pt-24 md:pt-28"> {/* Adjusted padding-top */}
          <div className="text-center">
            {/* Removed the flex container for the icon, as only the mascot remains */}
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 leading-tight">
              AI Financial Insights
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Unlock **intelligent, personalized financial advice** powered by advanced artificial intelligence to master your money.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 z-10 relative">
        <div className="max-w-6xl mx-auto">
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
            <div className="min-h-[50vh] flex items-center justify-center">
              <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-2xl">
                <CardContent className="p-8 text-center">
                  <p className="text-xl font-semibold mb-6 text-gray-100">Please sign in to access AI Insights</p>
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 transform hover:scale-105 shadow-lg" onClick={() => window.location.href = '/login'}>Sign In Now</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {user && !subscribed && !subLoading && (
            <div className="min-h-[50vh] flex items-center justify-center">
              <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-2xl">
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
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg" onClick={handleManageSubscription}>
                    Upgrade to Premium
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {user && subscribed && !subLoading && (
            <div className="max-w-4xl mx-auto space-y-12">
              {/* AI Chat Interface */}
              <div className="relative">
                <Card className="bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-3xl font-bold text-gray-100">
                      <Brain className="h-8 w-8 text-blue-400" /> Your AI Financial Advisor
                      {subscriptionTier && (
                        <Badge className="ml-auto bg-blue-800/50 text-blue-200 hover:bg-blue-800 text-sm font-medium px-4 py-2 rounded-full flex items-center gap-1 shadow-md">
                          <Crown className="h-4 w-4 text-yellow-300" /> {subscriptionTier} Tier
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 sm:p-8">
                    <Textarea
                      rows={4}
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask an AI-powered budget question, such as 'How can I reduce my expenses?' or 'What are smart investment strategies?'"
                      disabled={loading}
                      className="bg-gray-800/60 border border-gray-700 text-gray-100 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 rounded-lg p-4 resize-none"
                    />
                    <Button
                      className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                      onClick={handleAsk}
                      disabled={loading || !question.trim()}
                    >
                      {loading ? (
                        <span className="flex items-center">
                          Thinking<span className="animate-pulse">...</span>
                        </span>
                      ) : "Ask AI"}
                    </Button>
                    {answer && (
                      <div className="mt-8 p-6 bg-white/10 rounded-xl border border-white/20 shadow-inner">
                        <div className="font-bold mb-4 text-blue-300 text-xl flex items-center gap-2">
                          <Brain className="h-6 w-6 text-blue-400" /> AI Financial Advisor:
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
              </div>

              {/* Feature Section with Darker, Icon-driven Cards */}
              <section className="py-16 px-4 relative mt-12 bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                  <h2 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-teal-300">
                    AI-Powered Financial Intelligence
                  </h2>
                  <p className="text-xl mb-12 text-gray-300 max-w-2xl mx-auto">
                    Leverage cutting-edge AI to gain unparalleled insights into your finances and make smarter decisions.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 shadow-lg hover:shadow-blue-500/30 transition-shadow duration-300">
                      <Zap className="h-12 w-12 text-green-400 mx-auto mb-4" />
                      <h3 className="font-semibold text-xl mb-3 text-gray-50">Smart Analysis</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">Our AI meticulously analyzes your spending patterns and budget data to provide highly tailored, actionable advice.</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 shadow-lg hover:shadow-purple-500/30 transition-shadow duration-300">
                      <Target className="h-12 w-12 text-teal-400 mx-auto mb-4" />
                      <h3 className="font-semibold text-xl mb-3 text-gray-50">Real-Time Insights</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">Get instant, on-demand answers to your most pressing financial questions, constantly updated based on your current situation.</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 shadow-lg hover:shadow-pink-500/30 transition-shadow duration-300">
                      <Lightbulb className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                      <h3 className="font-semibold text-xl mb-3 text-gray-50">Actionable Advice</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">Receive clear, specific recommendations designed to directly improve your financial health and help you achieve your goals.</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
