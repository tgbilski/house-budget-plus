import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertCircle, Lightbulb, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Insight {
  id: string;
  insight_type: 'spending_pattern' | 'budget_prediction' | 'savings_opportunity';
  title: string;
  description: string;
  priority: 1 | 2 | 3;
  is_read: boolean;
  data?: any;
  created_at: string;
  valid_until?: string;
}

const insightTypeConfig = {
  spending_pattern: {
    icon: TrendingUp,
    label: 'Spending Pattern',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  budget_prediction: {
    icon: AlertCircle,
    label: 'Budget Alert',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  savings_opportunity: {
    icon: Lightbulb,
    label: 'Savings Tip',
    color: 'bg-green-100 text-green-800 border-green-200'
  }
};

const priorityConfig = {
  1: { label: 'High', color: 'bg-red-100 text-red-800 border-red-200' },
  2: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  3: { label: 'Low', color: 'bg-gray-100 text-gray-800 border-gray-200' }
};

export const InsightsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchInsights();
    }
  }, [user]);

  const fetchInsights = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast({
        title: "Error loading insights",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewInsights = async () => {
    if (!user || isGenerating) return;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-insights', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) throw error;

      toast({
        title: "Insights generated!",
        description: `Generated ${data.count} new personalized insights.`,
      });

      fetchInsights();
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: "Error generating insights",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const markAsRead = async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('user_insights')
        .update({ is_read: true })
        .eq('id', insightId);

      if (error) throw error;

      setInsights(prev => prev.map(insight => 
        insight.id === insightId ? { ...insight, is_read: true } : insight
      ));
    } catch (error) {
      console.error('Error marking insight as read:', error);
    }
  };

  const markAsUnread = async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('user_insights')
        .update({ is_read: false })
        .eq('id', insightId);

      if (error) throw error;

      setInsights(prev => prev.map(insight => 
        insight.id === insightId ? { ...insight, is_read: false } : insight
      ));
    } catch (error) {
      console.error('Error marking insight as unread:', error);
    }
  };

  const unreadCount = insights.filter(insight => !insight.is_read).length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Your Insights
          </h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {unreadCount} new
            </Badge>
          )}
        </div>
        
        <Button 
          onClick={generateNewInsights} 
          disabled={isGenerating}
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating...' : 'Refresh Insights'}
        </Button>
      </div>

      <div className="space-y-4">
        {insights.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No insights yet. Generate your first personalized insights based on your spending patterns!
              </p>
              <Button onClick={generateNewInsights} disabled={isGenerating}>
                <Brain className="h-4 w-4 mr-2" />
                Generate My First Insights
              </Button>
            </CardContent>
          </Card>
        ) : (
          insights.map((insight) => {
            const typeConfig = insightTypeConfig[insight.insight_type];
            const priorityInfo = priorityConfig[insight.priority];
            const TypeIcon = typeConfig.icon;
            const isExpired = insight.valid_until && new Date(insight.valid_until) < new Date();

            return (
              <Card 
                key={insight.id} 
                className={`transition-all ${
                  !insight.is_read ? 'ring-2 ring-primary/20 bg-primary/5' : ''
                } ${isExpired ? 'opacity-60' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <TypeIcon className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {insight.title}
                          {!insight.is_read && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </CardTitle>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={typeConfig.color} variant="outline">
                        {typeConfig.label}
                      </Badge>
                      <Badge className={priorityInfo.color} variant="outline">
                        {priorityInfo.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.description}
                  </p>
                  
                  {insight.data && Object.keys(insight.data).length > 0 && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Additional Details:</p>
                      <div className="text-xs space-y-1">
                        {Object.entries(insight.data).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-muted-foreground">
                      Generated {new Date(insight.created_at).toLocaleDateString()}
                      {isExpired && <span className="ml-2 text-orange-600">(Expired)</span>}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insight.is_read ? markAsUnread(insight.id) : markAsRead(insight.id)}
                    >
                      {insight.is_read ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Mark Unread
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Mark Read
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};