import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface PageSEOContentProps {
  title: string;
  description: string;
  features?: string[];
  keywords?: string[];
}

export const PageSEOContent: React.FC<PageSEOContentProps> = ({
  title,
  description,
  features = [],
  keywords = [],
}) => {
  return (
    <section className="mt-12 pt-8 border-t border-border">
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
      "Set and monitor savings goals",
      "Export budget reports"
    ],
    keywords: ["household budget calculator", "free budget planner", "monthly expense tracker", "family budget tool", "income vs expenses"]
  },
  savingsGoals: {
    title: "Savings Goal Tracker",
    description: "Reach your financial dreams faster with our visual savings goal tracker. Whether you're saving for a down payment, vacation, emergency fund, or your child's education, our tool helps you stay motivated by showing your progress month by month.",
    features: [
      "Track up to 3 savings goals",
      "Monthly contribution tracking",
      "Visual progress charts",
      "Set target dates",
      "Cumulative savings view",
      "Year-over-year comparisons"
    ],
    keywords: ["savings tracker", "goal setting", "emergency fund calculator", "down payment savings", "financial goals"]
  },
  expenses: {
    title: "Voice-Powered Expense Tracker",
    description: "Log expenses effortlessly with our AI-powered voice expense tracker. Simply speak your purchase details and our intelligent system automatically categorizes and records your spending. Perfect for busy families who want to track daily expenses without the hassle of manual entry.",
    features: [
      "Voice-to-expense conversion",
      "AI-powered categorization",
      "Daily spending summaries",
      "Monthly expense charts",
      "Category breakdowns",
      "Budget alerts"
    ],
    keywords: ["voice expense tracker", "AI expense logging", "daily expense tracker", "spending categorization", "budget tracking app"]
  },
  vacation: {
    title: "Vacation Budget Planner",
    description: "Plan your perfect getaway without breaking the bank. Compare multiple vacation options side-by-side to find the best value for your family. Our vacation planner helps you budget for travel, lodging, and activities so you can enjoy your trip stress-free.",
    features: [
      "Compare vacation destinations",
      "Track travel costs",
      "Lodging budget calculator",
      "Side-by-side comparisons",
      "Total trip cost estimates",
      "Multiple vacation projects"
    ],
    keywords: ["vacation budget calculator", "travel planner", "trip cost estimator", "family vacation budget", "travel expenses"]
  },
  gifts: {
    title: "Gift List Organizer",
    description: "Never forget a gift again with our comprehensive gift list organizer. Track gift ideas for every occasion, manage your gift-giving budget, and keep your shopping list organized. Perfect for holidays, birthdays, and special occasions throughout the year.",
    features: [
      "Organize by occasion",
      "Track recipient preferences",
      "Budget per gift list",
      "Mark items as purchased",
      "Save product links",
      "Household gift sharing"
    ],
    keywords: ["gift list tracker", "holiday gift planner", "birthday gift organizer", "gift budget tracker", "shopping list manager"]
  }
};