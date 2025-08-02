import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "@/components/ui/loader";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Brain, Crown } from "lucide-react";

export default function AIInsights() {
  const { user } = useAuth();
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
      const res = await fetch("/api/ai-budget-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.access_token}`,
        },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) {
        const error = await res.json();
        toast({
          title: "AI Insights Error",
          description: error.message || "Failed to get AI insights.",
          variant: "destructive",
        });
        setErrorMsg(error.message || "Failed to get AI insights.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setAnswer(data.answer || "No answer returned.");
    } catch (error) {
      toast({
        title: "AI Insights Error",
        description: "Failed to get AI insights.",
        variant: "destructive",
      });
      setErrorMsg("Failed to get AI insights.");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <SEO
        title="AI Budget Insights - Personal Financial Advisor"
        description="Get personalized financial advice using AI. Analyze your budget data and receive expert insights to optimize your spending and savings."
        keywords="AI financial advisor, budget insights, personal finance, money management, financial optimization"
      />
      <Breadcrumbs />
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Removed debugState <pre> output */}

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

          {/* Defensive loading/fallback state */}
          {subLoading && (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Loading your subscription…</span>
            </div>
          )}

          {/* Error message */}
          {errorMsg && (
            <div className="text-center text-red-700 mb-4">{errorMsg}</div>
          )}

          {/* Fallback for when subscription status is not yet checked */}
          {typeof subscribed === "undefined" && !subLoading && (
            <div className="text-center text-muted-foreground mb-4">
              Unable to determine your subscription status. Please refresh or try again.
            </div>
          )}

          {/* Not signed in */}
          {!user && !subLoading && (
            <div className="min-h-screen flex items-center justify-center">
              <Card className="w-full max-w-md">
                <CardContent className="p-6 text-center">
                  <p>Please sign in to access AI Insights</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Not subscribed */}
          {user && !subscribed && !subLoading && (
            <div className="min-h-screen flex items-center justify-center">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>AI Insights</CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <Badge variant="warning" className="mb-4">
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

          {/* Main AI Insights UI */}
          {user && subscribed && !subLoading && (
            <div className="max-w-2xl mx-auto space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>AI Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Badge variant="success">
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
                      <div className="font-bold mb-2">AI Answer:</div>
                      <div>{answer}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
