import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface PageSEOContentProps {
  title: string;
  description: string;
  features?: string[];
  keywords?: string[];
  premiumTitle?: string;
  premiumDescription?: string;
  premiumFeatures?: string[];
}

export const PageSEOContent: React.FC<PageSEOContentProps> = ({
  title,
  description,
  features = [],
  keywords = [],
  premiumTitle,
  premiumDescription,
  premiumFeatures = [],
}) => {
  return (
    <section className="mt-12 pt-8 border-t border-border space-y-6">
      {/* Free Features Section */}
      <Card className="bg-muted border-border/50">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            {title}
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {description}
          </p>
          
          {features.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-foreground mb-2">Key Features:</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-0.5">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {keywords.map((keyword, index) => (
                <span 
                  key={index}
                  className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Premium Features Section */}
      {premiumTitle && premiumFeatures.length > 0 && (
        <Card className="bg-card border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                {premiumTitle}
              </h2>
            </div>
            {premiumDescription && (
              <p className="text-muted-foreground leading-relaxed mb-4">
                {premiumDescription}
              </p>
            )}
            
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {premiumFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-0.5">★</span>
                  {feature}
                </li>
              ))}
            </ul>
            
            <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border/50">
              Premium features available for just $2.99/month — less than a coffee.
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  );
};

// Pre-defined SEO content for each page
export const pageSEOData = {
  monthlyBudget: {
    title: "Free Monthly Budget Calculator for Households",
    description: "See exactly where your money goes with our free monthly budget calculator. Perfect for households, first apartments, and roommate expense splitting. No spreadsheets, no bank linking — just simple budgeting that works.",
    features: [
      "Calculate your monthly household budget in minutes",
      "See exactly where your money goes each month",
      "Visual breakdowns that actually make sense",
      "Multiple calculators for different income sources",
      "No bank account linking required"
    ],
    keywords: ["monthly budget calculator free", "home budget calculator", "household budget calculator", "free budgeting calculator", "calculate monthly living expenses", "house expenses calculator", "living budget calculator", "living expenses budget calculator"],
    premiumTitle: "Level Up Your Budget Game",
    premiumDescription: "Get AI-powered money advice that actually understands your lifestyle — not your parents' finances.",
    premiumFeatures: [
      "AI insights tailored to your spending habits",
      "Share budgets with roommates or partners",
      "First home & car affordability calculators",
      "Personalized tips to grow your savings"
    ]
  },
  savingsGoals: {
    title: "Save for What Actually Matters",
    description: "Track your progress toward any savings goal — apartment deposits, vacations, emergency funds, or anything else you're working toward. Visual charts keep you motivated and on track.",
    features: [
      "Track up to 3 savings goals at once",
      "See your progress month by month",
      "Set realistic target dates",
      "Visual charts that feel rewarding",
      "Perfect for first-time savers"
    ],
    keywords: ["savings goal tracker", "saving for a vacation calculator", "savings calculator free", "emergency fund tracker", "savings progress tracker", "visual savings goal", "monthly savings planner"],
    premiumTitle: "Supercharge Your Savings",
    premiumDescription: "AI-powered nudges to help you hit your goals faster — like a supportive friend who's actually good with money.",
    premiumFeatures: [
      "AI savings recommendations",
      "Share goals with your partner",
      "Smart contribution suggestions",
      "Motivational progress insights"
    ]
  },
  expenses: {
    title: "Track Spending Without the Guilt Trip",
    description: "Know exactly where your money went without connecting your bank or feeling judged. Perfect for gig workers, freelancers, and anyone with variable income who needs a flexible expense tracker that adapts to real life — not a cookie-cutter budget template.",
    features: [
      "Log purchases in seconds",
      "Automatic smart categorization",
      "Monthly spending breakdowns",
      "Works for irregular income",
      "No bank account sync needed"
    ],
    keywords: ["expense tracker no bank", "freelancer expense tracker", "gig worker budget", "variable income tracker", "simple spending tracker", "expense log app", "side hustle income tracker", "millennial expense app"],
    premiumTitle: "Voice-Powered Expense Tracking",
    premiumDescription: "Just say what you spent and let AI handle the rest. Perfect for busy people who hate data entry.",
    premiumFeatures: [
      "Voice-to-expense logging",
      "AI-powered categorization",
      "Spending pattern insights",
      "Smart budget alerts"
    ]
  },
  vacation: {
    title: "Vacation Budget Calculator — Know Your Trip Costs",
    description: "Compare vacation options side-by-side and know exactly what your trip will cost before you book. Add flights, hotels, car rentals, and activities to see the true total for each destination.",
    features: [
      "Compare multiple trip options",
      "Track flights, hotels & activities",
      "Side-by-side cost comparison",
      "Calculate true vacation costs",
      "Perfect for group trip planning"
    ],
    keywords: ["vacation savings calculator", "vacation budget planner", "trip cost calculator", "vacation cost estimator", "travel budget calculator", "holiday budget planner", "vacation expense tracker"],
    premiumTitle: "Smart Vacation Planning",
    premiumDescription: "Get AI recommendations to maximize your vacation while minimizing costs.",
    premiumFeatures: [
      "AI vacation insights",
      "Share plans with travel buddies",
      "Budget optimization tips",
      "Cost-saving recommendations"
    ]
  },
  gifts: {
    title: "Gift Giving Without Going Broke",
    description: "Keep track of gift ideas year-round so you're not panic-buying at the last minute. Perfect for managing holiday gift lists, birthday presents, and special occasions without blowing your budget or forgetting anyone important.",
    features: [
      "Organize by occasion or person",
      "Save gift ideas and links",
      "Track your gift budget",
      "Mark items as purchased",
      "Never forget a gift again"
    ],
    keywords: ["gift list organizer", "holiday budget tracker", "birthday gift planner", "cheap gift ideas tracker", "gift giving on a budget", "present tracker app", "millennial gift planner", "affordable gift list"],
    premiumTitle: "Collaborative Gift Planning",
    premiumDescription: "Coordinate with family or roommates so nobody double-buys and everyone stays on budget.",
    premiumFeatures: [
      "Share lists with household",
      "AI gift suggestions",
      "Budget recommendations",
      "Occasion reminders"
    ]
  }
};