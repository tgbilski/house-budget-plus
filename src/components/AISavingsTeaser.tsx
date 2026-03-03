import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Lock, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface AISavingsTeaserProps {
  totalExpenses: number;
  monthlyIncome: number;
  formatCurrency: (amount: number) => string;
}

export const AISavingsTeaser = ({ totalExpenses, monthlyIncome, formatCurrency }: AISavingsTeaserProps) => {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [savingsAmount, setSavingsAmount] = useState(0);

  useEffect(() => {
    // Only show after user has entered meaningful data
    if (totalExpenses > 100) {
      // Generate a believable savings estimate (8-15% of expenses)
      const percentage = 0.08 + Math.random() * 0.07;
      const estimated = Math.round(totalExpenses * percentage);
      setSavingsAmount(estimated);
      // Delay appearance for impact
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [totalExpenses]);

  if (!visible || totalExpenses <= 100) return null;

  return (
    <div className="mt-4 rounded-xl border-[3px] border-stroke bg-gradient-to-r from-primary/5 to-accent/10 shadow-cartoon p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-primary/10 shrink-0">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-foreground">
              AI found {formatCurrency(savingsAmount)} you could save
            </p>
            <TrendingDown className="h-4 w-4 text-success" />
          </div>
          <p className="text-xs text-muted-foreground">
            Our AI analyzed your {Math.round(totalExpenses / monthlyIncome * 100) || 0}% expense-to-income ratio and spotted opportunities to cut costs on subscriptions, utilities, and recurring charges.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <Button asChild size="sm" className="gap-1.5 text-xs h-8">
              <Link to={user ? "/settings" : "/signup"}>
                <Lock className="h-3 w-3" />
                {user ? "Unlock AI Insights — $2.99/mo" : "Sign Up to Unlock"}
              </Link>
            </Button>
            <span className="text-[10px] text-muted-foreground">Less than a coffee ☕</span>
          </div>
        </div>
      </div>
    </div>
  );
};
