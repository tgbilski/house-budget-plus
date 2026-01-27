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
      <Card className="bg-muted/30 border-border/50">
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
        <Card className="bg-gradient-to-br from-primary/5 to-primary-glow/5 border-primary/20">
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
              Premium features available for just $4.99/month — the cost of a cup of coffee.
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
    title: "Free Monthly Budget Calculator",
    description: "Take control of your household finances with our free monthly budget calculator. Perfect for families and individuals looking to track income, manage expenses, and build a solid financial foundation. Our easy-to-use tool helps you visualize spending patterns and identify areas where you can save money.",
    features: [
      "Track multiple income sources",
      "Categorize monthly expenses",
      "Visual budget breakdown charts",
      "Calculate housing affordability",
      "Set and monitor savings goals"
    ],
    keywords: ["household budget calculator", "free budget planner", "monthly expense tracker", "family budget tool", "income vs expenses"],
    premiumTitle: "Premium Budget Features",
    premiumDescription: "Unlock powerful AI-driven insights and collaboration tools to supercharge your budgeting.",
    premiumFeatures: [
      "AI-powered financial insights",
      "Share budgets with household members",
      "Major purchase affordability toolkit",
      "Personalized savings recommendations"
    ]
  },
  savingsGoals: {
    title: "Savings Goal Tracker",
    description: "Reach your financial dreams faster with our visual savings goal tracker. Whether you're saving for a down payment, vacation, emergency fund, or your child's education, our tool helps you stay motivated by showing your progress month by month.",
    features: [
      "Track up to 3 savings goals",
      "Monthly contribution tracking",
      "Visual progress charts",
      "Set target dates",
      "Cumulative savings view"
    ],
    keywords: ["savings tracker", "goal setting", "emergency fund calculator", "down payment savings", "financial goals"],
    premiumTitle: "Premium Savings Features",
    premiumDescription: "Get AI-powered guidance to reach your savings goals faster.",
    premiumFeatures: [
      "AI savings recommendations",
      "Household goal sharing",
      "Smart contribution suggestions",
      "Progress insights and tips"
    ]
  },
  expenses: {
    title: "Daily Expense Tracker",
    description: "Stay on top of your daily spending with our comprehensive expense tracker. Categorize purchases, view spending trends, and identify where your money goes each month. Perfect for busy families who want visibility into their daily expenses.",
    features: [
      "Track daily purchases",
      "Automatic categorization",
      "Monthly spending summaries",
      "Category breakdowns",
      "Year-over-year trends"
    ],
    keywords: ["daily expense tracker", "spending tracker", "budget tracking app", "expense categorization", "money management"],
    premiumTitle: "Premium Expense Tracking",
    premiumDescription: "Log expenses hands-free with AI-powered voice tracking.",
    premiumFeatures: [
      "Voice-to-expense conversion",
      "AI-powered categorization",
      "Smart spending insights",
      "Budget alerts and warnings"
    ]
  },
  vacation: {
    title: "Vacation Budget Planner",
    description: "Plan your perfect getaway without breaking the bank. Compare multiple vacation options side-by-side to find the best value for your family. Our vacation planner helps you budget for travel, lodging, and activities so you can enjoy your trip stress-free.",
    features: [
      "Compare vacation destinations",
      "Track travel costs",
      "Lodging budget calculator",
      "Side-by-side comparisons",
      "Total trip cost estimates"
    ],
    keywords: ["vacation budget calculator", "travel planner", "trip cost estimator", "family vacation budget", "travel expenses"],
    premiumTitle: "Premium Vacation Planning",
    premiumDescription: "Get AI recommendations for your vacation planning.",
    premiumFeatures: [
      "AI vacation insights",
      "Share plans with household",
      "Budget optimization tips",
      "Cost-saving recommendations"
    ]
  },
  gifts: {
    title: "Gift List Organizer",
    description: "Never forget a gift again with our comprehensive gift list organizer. Track gift ideas for every occasion, manage your gift-giving budget, and keep your shopping list organized. Perfect for holidays, birthdays, and special occasions throughout the year.",
    features: [
      "Organize by occasion",
      "Track recipient preferences",
      "Budget per gift list",
      "Mark items as purchased",
      "Save product links"
    ],
    keywords: ["gift list tracker", "holiday gift planner", "birthday gift organizer", "gift budget tracker", "shopping list manager"],
    premiumTitle: "Premium Gift Planning",
    premiumDescription: "Collaborate with your household on gift lists and get AI suggestions.",
    premiumFeatures: [
      "Household gift sharing",
      "AI gift suggestions",
      "Budget recommendations",
      "Occasion reminders"
    ]
  }
};