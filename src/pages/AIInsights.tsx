import { useState, useRef, useEffect } from "react";
import { sanitizeHTML } from '@/utils/sanitize';
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useBadges } from "@/hooks/useBadges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { seoData } from "@/utils/seoData";
import { Link } from "react-router-dom";
import { Crown, Loader2, CheckCircle2, Bot, Sparkles } from "lucide-react";
import { isNativeApp } from '@/utils/capacitor';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";
import { BadgeDisplay } from '@/components/BadgeDisplay';
import calculatorMascot from '@/assets/calculator-mascot.png';

// Agent display info
const AGENTS: Record<string, { name: string; emoji: string; color: string }> = {
  budget: { name: "Budget Agent", emoji: "💰", color: "bg-success/20 text-success" },
  savings: { name: "Savings Agent", emoji: "🎯", color: "bg-primary/20 text-primary" },
  vacation: { name: "Vacation Agent", emoji: "✈️", color: "bg-warning/20 text-warning" },
  expenses: { name: "Expenses Agent", emoji: "📊", color: "bg-destructive/20 text-destructive" },
  gifts: { name: "Gifts Agent", emoji: "🎁", color: "bg-teal/20 text-teal" },
};

interface StatusStep {
  message: string;
  agent?: string;
  completed: boolean;
}

export default function AIInsights() {
  const { user } = useAuth();
  const { earnBadge } = useBadges();
  const isMobileApp = isNativeApp();
  const {
    subscribed,
    subscriptionTier,
    aiQueriesRemaining,
    checkSubscription,
    openCustomerPortal,
    loading: subLoading,
  } = useSubscription();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [statusSteps, setStatusSteps] = useState<StatusStep[]>([]);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to answer as it streams
  useEffect(() => {
    if (answerRef.current && answer) {
      answerRef.current.scrollTop = answerRef.current.scrollHeight;
    }
  }, [answer]);

  const handleAsk = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    setAnswer("");
    setErrorMsg("");
    setStatusSteps([]);
    setActiveAgent(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-orchestrator`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ question }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          toast({
            title: "AI Query Limit Reached",
            description: errorData.message || "You've reached your AI insight limit this month.",
            variant: "destructive",
            duration: 6000,
          });
          setErrorMsg(errorData.message);
          setLoading(false);
          return;
        }
        throw new Error(errorData.error || "Failed to get AI insights");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      if (!reader) {
        throw new Error("No response stream");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === "status") {
                setStatusSteps(prev => {
                  // Mark previous step as completed
                  const updated = prev.map(s => ({ ...s, completed: true }));
                  // Add new step
                  return [...updated, { 
                    message: data.status, 
                    agent: data.agent,
                    completed: false 
                  }];
                });
                if (data.agent) {
                  setActiveAgent(data.agent);
                }
              } else if (data.type === "content") {
                setAnswer(prev => prev + data.content);
              } else if (data.type === "done") {
                setStatusSteps(prev => prev.map(s => ({ ...s, completed: true })));
                setActiveAgent(null);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      earnBadge('ai_insights');
      await checkSubscription();

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

  const formatAIResponse = (content: string) => {
    let processed = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.+)$/gm, '<div>• $1</div>')
      .replace(/^\* (.+)$/gm, '<div>• $1</div>')
      .replace(/\n/g, '<br>');
    
    return sanitizeHTML(`<div>${processed}</div>`);
  };

  return (
    <div className={cn(
      isMobileApp ? "" : "min-h-screen"
    )}>
      <SEO
        title={seoData.aiInsights.title}
        description={seoData.aiInsights.description}
        keywords={seoData.aiInsights.keywords}
        canonical={seoData.aiInsights.canonical}
        ogImage={seoData.aiInsights.ogImage}
        structuredData={seoData.aiInsights.structuredData}
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 pt-2">
        {/* Header - matching Monthly Budget style */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img 
              src={calculatorMascot} 
              alt="Budget Calculator Mascot" 
              className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 flex-shrink-0 object-contain"
            />
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-wide truncate">
                AI INSIGHT
              </h1>
              {subscribed && (
                <p className="text-xs text-muted-foreground mt-1">
                  {aiQueriesRemaining} queries remaining this month
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Agent showcase */}
        {user && subscribed && !subLoading && (
          <div className="mb-6 flex flex-wrap gap-2 justify-center">
            {Object.entries(AGENTS).map(([key, agent]) => (
              <Badge 
                key={key} 
                variant="secondary"
                className={cn(
                  "text-xs py-1 px-2 transition-all duration-300",
                  activeAgent === key ? `${agent.color} ring-2 ring-offset-1 ring-primary scale-110` : "opacity-70"
                )}
              >
                {agent.emoji} {agent.name}
              </Badge>
            ))}
          </div>
        )}

        {/* AI Insights Interface */}
        <div className="max-w-4xl mx-auto space-y-6">
          {subLoading && (
            <div className="flex justify-center items-center h-40 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-lg">Loading your subscription…</span>
            </div>
          )}

          {errorMsg && (
            <div className="text-center text-destructive mb-6 p-4 bg-destructive/10 rounded-lg border border-destructive/20">{errorMsg}</div>
          )}

          {!user && !subLoading && (
            <Card className="w-full shadow-lg">
              <CardContent className="p-8 text-center">
                <p className="text-xl font-semibold mb-6">Please sign in to access AI Insights</p>
                <Button asChild className="mt-4 bg-primary hover:bg-primary/90">
                  <Link to="/auth">Sign In Now</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {user && !subscribed && !subLoading && (
            <Card className="w-full shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold">AI Financial Advisor</CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-center">
                <Badge variant="destructive" className="mb-6 text-base py-1.5 px-4">
                  Subscription Required
                </Badge>
                <p className="text-muted-foreground mb-8">
                  Unlock intelligent financial advice powered by specialized AI agents.
                </p>
                <Button asChild className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-3 rounded-full text-lg font-semibold">
                  <Link to="/settings">Upgrade to Premium</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {user && subscribed && !subLoading && (
            <Card className="bg-card p-6 sm:p-8 shadow-lg border">
              <CardHeader className="text-center pb-6">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl md:text-3xl font-bold">
                  <Bot className="h-7 w-7 text-primary" /> Your AI Financial Advisor
                </CardTitle>
                {subscriptionTier && (
                  <Badge className="mx-auto mt-2 bg-primary/10 text-primary text-sm font-medium px-4 py-2 rounded-full flex items-center gap-1 w-fit">
                    <Crown className="h-4 w-4 text-warning" /> {subscriptionTier} Tier
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={4}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !loading && question.trim()) {
                      e.preventDefault();
                      handleAsk();
                    }
                  }}
                  placeholder="Ask about your budget, savings goals, expenses, vacation plans, or gift lists..."
                  disabled={loading}
                  className="bg-background border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg p-4 resize-none"
                />
                <Button
                  className="mt-6 w-full bg-gradient-to-r from-primary to-teal hover:opacity-90 text-primary-foreground px-8 py-3 rounded-full text-lg font-semibold transition-all"
                  onClick={handleAsk}
                  disabled={loading || !question.trim()}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </span>
                  ) : "Ask AI Advisor"}
                </Button>

                {/* Status steps */}
                {statusSteps.length > 0 && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg border space-y-2">
                    <p className="text-sm font-medium text-muted-foreground mb-3">AI Processing Status:</p>
                    {statusSteps.map((step, index) => (
                      <div 
                        key={index} 
                        className={cn(
                          "flex items-center gap-2 text-sm transition-all duration-300",
                          step.completed ? "text-muted-foreground" : "text-foreground font-medium"
                        )}
                      >
                        {step.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        )}
                        <span>{step.message}</span>
                        {step.agent && AGENTS[step.agent] && (
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", AGENTS[step.agent].color)}
                          >
                            {AGENTS[step.agent].emoji} {AGENTS[step.agent].name}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Streaming answer */}
                {answer && (
                  <div 
                    ref={answerRef}
                    className="mt-8 p-6 bg-muted rounded-xl border shadow-inner max-h-[500px] overflow-y-auto"
                  >
                    <div className="font-bold mb-4 text-primary text-xl flex items-center gap-2">
                      <Bot className="h-6 w-6" /> AI Financial Advisor:
                    </div>
                    <div
                      className="prose prose-sm max-w-none text-foreground leading-relaxed space-y-3"
                      dangerouslySetInnerHTML={{
                        __html: formatAIResponse(answer)
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {user && <BadgeDisplay />}
        </div>
      </div>
    </div>
  );
}
