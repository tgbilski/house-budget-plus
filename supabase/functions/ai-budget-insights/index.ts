import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "@/components/ui/loader";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

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

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");
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
    } finally {
      setLoading(false);
    }
  };

  // Remove any debug rendering of user/subscription objects
  // Previously: <pre>{JSON.stringify({user, subscribed, subLoading, subscriptionTier, subscriptionEnd}, null, 2)}</pre>

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p>Please sign in to access AI Insights</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!subscribed) {
    return (
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
            <Button className="mt-6" onClick={openCustomerPortal}>
              Manage Subscription
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
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
    </div>
  );
}
