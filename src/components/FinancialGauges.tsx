import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, DollarSign, ShoppingCart, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface GaugeMetrics {
  incomeExpenseDiff: number;
  monthlyTakeout: number;
  takeoutChange: number;
  insights: {
    incomeExpense: string;
    takeout: string;
    trend: string;
  };
}

export const FinancialGauges: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<GaugeMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMetrics();
    }
  }, [user]);

  const fetchMetrics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get current month dates
      const now = new Date();
      const currentMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      const currentMonthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59));
      
      // Get previous month dates for comparison
      const prevMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
      const prevMonthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59));

      // Fetch all budget data (income vs expenses) from monthly calculators
      const { data: budgetData } = await supabase
        .from('budget_data')
        .select('income, expenses')
        .eq('user_id', user.id)
        .eq('page_type', 'monthly-budget');

      // Fetch current month takeout transactions
      const { data: currentTakeout } = await supabase
        .from('takeout_transactions')
        .select('amount')
        .eq('user_id', user.id)
        .gte('date', currentMonthStart.toISOString().split('T')[0])
        .lte('date', currentMonthEnd.toISOString().split('T')[0]);

      // Fetch previous month takeout transactions
      const { data: prevTakeout } = await supabase
        .from('takeout_transactions')
        .select('amount')
        .eq('user_id', user.id)
        .gte('date', prevMonthStart.toISOString().split('T')[0])
        .lte('date', prevMonthEnd.toISOString().split('T')[0]);

      // Calculate metrics - sum all monthly budget calculators
      const totalIncome = budgetData?.reduce((sum, budget) => sum + (budget.income || 0), 0) || 0;
      const totalExpenses = budgetData?.reduce((sum, budget) => {
        const expenseObj = budget.expenses as Record<string, number> || {};
        const expenseSum = Object.values(expenseObj).reduce((expSum, val) => expSum + val, 0);
        return sum + expenseSum;
      }, 0) || 0;
      
      const currentTakeoutTotal = currentTakeout?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const prevTakeoutTotal = prevTakeout?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      
      const takeoutChange = prevTakeoutTotal > 0 
        ? ((currentTakeoutTotal - prevTakeoutTotal) / prevTakeoutTotal) * 100 
        : currentTakeoutTotal > 0 ? 100 : 0;

      // Check for cached insights first
      const cacheKey = `${totalIncome}-${totalExpenses}-${currentTakeoutTotal}-${prevTakeoutTotal}`;
      const { data: cachedInsights } = await supabase
        .from('user_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('insight_type', 'financial_gauges')
        .eq('title', cacheKey)
        .gte('valid_until', new Date().toISOString().split('T')[0])
        .single();

      let parsedInsights;
      if (cachedInsights) {
        parsedInsights = cachedInsights.data;
      } else {
        // Generate new AI insights
        const { data: insights } = await supabase.functions.invoke('ai-budget-insights', {
          body: {
            question: `Analyze these financial metrics and provide insights: Income: $${totalIncome}, Total Expenses: $${totalExpenses}, Income-Expense Difference: $${totalIncome - totalExpenses}, Current Month Takeout: $${currentTakeoutTotal}, Previous Month Takeout: $${prevTakeoutTotal}, Month-over-Month Change: ${takeoutChange.toFixed(1)}%. Provide separate insights for each metric in this format: {"incomeExpense": "insight about income vs expenses", "takeout": "insight about takeout spending", "trend": "insight about the month-over-month trend"}`
          }
        });

        try {
          parsedInsights = JSON.parse(insights?.insight || '{}');
        } catch {
          parsedInsights = {
            incomeExpense: "Your income and expenses show your financial position for this month.",
            takeout: "Monitor your takeout spending to understand your dining habits.",
            trend: "Track changes in spending patterns month over month."
          };
        }

        // Cache the insights for 24 hours
        const validUntil = new Date();
        validUntil.setHours(validUntil.getHours() + 24);
        
        await supabase
          .from('user_insights')
          .insert({
            user_id: user.id,
            insight_type: 'financial_gauges',
            title: cacheKey,
            description: 'Cached financial gauge insights',
            data: parsedInsights,
            priority: 1,
            valid_until: validUntil.toISOString().split('T')[0]
          });
      }

      setMetrics({
        incomeExpenseDiff: totalIncome - totalExpenses,
        monthlyTakeout: currentTakeoutTotal,
        takeoutChange,
        insights: parsedInsights
      });

    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getGaugeColor = (value: number, type: 'income' | 'takeout' | 'trend') => {
    if (type === 'income') {
      return value > 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))';
    }
    if (type === 'takeout') {
      return value < 200 ? 'hsl(var(--success))' : value < 500 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))';
    }
    if (type === 'trend') {
      return value < 0 ? 'hsl(var(--success))' : value > 20 ? 'hsl(var(--destructive))' : 'hsl(var(--warning))';
    }
    return 'hsl(var(--primary))';
  };

  const getGaugeProgress = (value: number, type: 'income' | 'takeout' | 'trend') => {
    if (type === 'income') {
      const maxRange = 5000; // Assuming max income difference of $5000
      return Math.min(Math.abs(value) / maxRange * 100, 100);
    }
    if (type === 'takeout') {
      const maxRange = 1000; // Assuming max takeout spending of $1000
      return Math.min(value / maxRange * 100, 100);
    }
    if (type === 'trend') {
      const maxRange = 100; // Assuming max change of 100%
      return Math.min(Math.abs(value) / maxRange * 100, 100);
    }
    return 0;
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-destructive" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-success" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-2 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Unable to load financial metrics. Please try refreshing the page.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Income vs Expenses Gauge */}
      <Card className="card-modern">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Income vs Expenses
          </CardTitle>
          <div className="text-2xl font-bold flex items-center gap-2">
            {formatCurrency(metrics.incomeExpenseDiff)}
            {metrics.incomeExpenseDiff > 0 ? (
              <Badge className="bg-success/10 text-success border-success/20">
                Surplus
              </Badge>
            ) : (
              <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                Deficit
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Progress 
              value={getGaugeProgress(metrics.incomeExpenseDiff, 'income')} 
              className="h-2"
              style={{
                '--progress-color': getGaugeColor(metrics.incomeExpenseDiff, 'income')
              } as React.CSSProperties}
            />
          </div>
          <div className="text-sm text-muted-foreground leading-relaxed">
            {metrics.insights.incomeExpense}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Takeout Spending Gauge */}
      <Card className="card-modern">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" />
            Monthly Takeout
          </CardTitle>
          <div className="text-2xl font-bold">
            {formatCurrency(metrics.monthlyTakeout)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Progress 
              value={getGaugeProgress(metrics.monthlyTakeout, 'takeout')} 
              className="h-2"
              style={{
                '--progress-color': getGaugeColor(metrics.monthlyTakeout, 'takeout')
              } as React.CSSProperties}
            />
          </div>
          <div className="text-sm text-muted-foreground leading-relaxed">
            {metrics.insights.takeout}
          </div>
        </CardContent>
      </Card>

      {/* Month-over-Month Change Gauge */}
      <Card className="card-modern">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Takeout Trend
          </CardTitle>
          <div className="text-2xl font-bold flex items-center gap-2">
            {metrics.takeoutChange >= 0 ? '+' : ''}{metrics.takeoutChange.toFixed(1)}%
            {getTrendIcon(metrics.takeoutChange)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Progress 
              value={getGaugeProgress(metrics.takeoutChange, 'trend')} 
              className="h-2"
              style={{
                '--progress-color': getGaugeColor(metrics.takeoutChange, 'trend')
              } as React.CSSProperties}
            />
          </div>
          <div className="text-sm text-muted-foreground leading-relaxed">
            {metrics.insights.trend}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};