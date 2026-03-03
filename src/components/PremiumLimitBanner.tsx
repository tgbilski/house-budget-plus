import { Link } from "react-router-dom";
import { Lock, Sparkles, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PremiumLimitBannerProps {
  featureName: string;
  freeLimit: number;
  className?: string;
  savingsAmount?: string;
}

export const PremiumLimitBanner = ({ featureName, freeLimit, className = "", savingsAmount }: PremiumLimitBannerProps) => {
  return (
    <div className={`w-full rounded-xl border-[3px] border-stroke bg-card shadow-cartoon p-6 text-center space-y-3 ${className}`}>
      <div className="flex justify-center">
        <div className="p-3 rounded-full bg-primary/10">
          <Lock className="h-6 w-6 text-primary" />
        </div>
      </div>
      <div>
        <p className="font-semibold text-foreground">
          Upgrade to add more {featureName}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Free users can add up to {freeLimit}. Unlock unlimited {featureName} for just $2.99/month.
        </p>
      </div>
      {savingsAmount && (
        <div className="flex items-center justify-center gap-2 text-sm text-success font-medium">
          <Sparkles className="h-4 w-4" />
          <span>AI found {savingsAmount} you could save</span>
          <TrendingDown className="h-4 w-4" />
        </div>
      )}
      <Button asChild className="gap-2">
        <Link to="/settings">
          <Lock className="h-4 w-4" />
          Upgrade Now
        </Link>
      </Button>
    </div>
  );
};
