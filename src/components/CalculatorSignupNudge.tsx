import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Save, X, ArrowRight } from 'lucide-react';

/**
 * A contextual signup prompt that appears when a guest user
 * interacts with the budget calculator (detected via budgetUpdate events).
 * Positioned as a sticky bottom bar on mobile.
 */
const CalculatorSignupNudge: React.FC = () => {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleBudgetUpdate = (event: Event) => {
      if (event instanceof CustomEvent) {
        const { income, totalExpenses } = event.detail;
        // Only show once user has entered some real data
        if ((income && income > 0) || (totalExpenses && totalExpenses > 0)) {
          setHasInteracted(true);
        }
      }
    };

    window.addEventListener('budgetUpdate', handleBudgetUpdate);
    return () => window.removeEventListener('budgetUpdate', handleBudgetUpdate);
  }, []);

  if (!hasInteracted || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="bg-card border-t-[3px] border-primary shadow-[0_-4px_20px_rgba(0,0,0,0.15)] px-4 py-3 sm:px-6">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
            <Save className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">
              Yo, don't lose this! 👀
            </p>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Sign up free to save your budget and unlock charts, savings goals & more.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button asChild size="sm" className="font-bold shadow-md">
              <Link to="/signup">
                Save It <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
            <button 
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-full text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorSignupNudge;
