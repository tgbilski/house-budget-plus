import { useState } from "react";
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
import { Link } from "react-router-dom";
import { Brain, Crown } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50 text-gray-900 relative">
      <SEO
        title="AI Budget Insights - Personal Financial Advisor"
        description="Get personalized financial advice using AI. Analyze your budget data and receive expert insights to optimize your spending and savings."
        keywords="AI financial advisor, budget insights, personal finance, money management, financial optimization"
      />

      {/* Main Container for the Hero section */}
      <div className="container mx-auto px-4 relative overflow-hidden">
        {/* Mascot Image - Absolutely positioned outside the card */}
        <div className="absolute top-[calc(0px-10px)] left-1/2 -translate-x-1/2 z-20">
          <img
            src="/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png"
            alt="Budget Calculator mascot"
            className="w-36 h-36 md:w-48 md:h-48 object-contain"
          />
        </div>

        {/* Hero Section Card - Replicating Home Page Layout */}
        <div className="relative py-8 md:py-12 px-4 rounded-2xl mx-4 shadow-xl overflow-visible bg-white mt-16 md:mt-20">
          <div className="w-full max-w-4xl mx-auto relative z-10 pt-24 md:pt-28">
            <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900 leading-tight">
                AI Financial Insights
              </h1>
              <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                Unlock intelligent, **personalized financial advice** powered by advanced artificial intelligence to master your money.
              </p>
            </div>

            {/* Chatbot feature directly in the hero section */}
            <div className="max-w-4xl mx-auto">
              {subLoading && (
                <div className="flex justify-center items-center h-40 text-gray-600">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-3">Loading your subscription…</span>
                </div>
              )}

              {errorMsg && (
                <div className="text-center text-red-500 mb-4">{errorMsg}</div>
              )}

              {typeof subscribed === "undefined" && !subLoading && (
                <div className="text-center text-gray-500 mb-4">
                  Unable to determine your subscription status. Please refresh or try again.
                </div>
              )}

              {!user && !subLoading && (
                <Card className="w-full bg-white shadow-2xl">
                  <CardContent className="p-8 text-center">
                    <p className="text-xl font-semibold mb-6 text-gray-900">Please sign in to access AI Insights</p>
                    <Button asChild className="mt-4 bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 transform hover:scale-105 shadow-lg">
                      <Link to="/auth">
                        <span>Sign In Now</span>
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {user && !subscribed && !subLoading && (
                <Card className="w-full bg-white shadow-2xl">
                  <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-gray-900">AI Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 text-center">
                    <Badge variant="destructive" className="mb-6 bg-red-600 text-white text-base py-1.5 px-4 shadow-md">
                      Subscription Required
                    </Badge>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                      Unlock the full power of AI with a premium subscription. Get cutting-edge financial advice tailored just for you.
                    </p>
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg" onClick={handleManageSubscription}>
                      Upgrade to Premium
                    </Button>
                  </CardContent>
                </Card>
              )}

              {user && subscribed && !subLoading && (
                <Card className="bg-gray-100 p-6 sm:p-8 shadow-2xl">
                  <CardHeader className="text-center pb-6">
                    <CardTitle className="flex items-center justify-center gap-3 text-2xl md:text-3xl font-bold text-gray-900">
                      <Brain className="h-7 w-7 text-purple-600" /> Your AI Financial Advisor
                    </CardTitle>
                    {subscriptionTier && (
                      <Badge className="mx-auto mt-2 bg-purple-100 text-purple-800 text-sm font-medium px-4 py-2 rounded-full flex items-center gap-1 shadow-md w-fit">
                        <Crown className="h-4 w-4 text-yellow-500" /> {subscriptionTier} Tier
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
                      className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-50 transition-all duration-300 rounded-lg p-4 resize-none"
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
                      <div className="mt-8 p-6 bg-gray-200 rounded-xl border border-gray-300 shadow-inner">
                        <div className="font-bold mb-4 text-purple-600 text-xl flex items-center gap-2">
                          <Brain className="h-6 w-6 text-purple-600" /> AI Financial Advisor:
                        </div>
                        <div
                          className="prose prose-sm max-w-none text-gray-800 leading-relaxed space-y-3"
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
      </div>
    </div>
  );
}
