import React from 'react';
import { SEO } from '@/components/SEO';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { InternalLinks } from '@/components/InternalLinks';
import { SocialShare } from '@/components/SocialShare';
import { FAQ } from '@/components/FAQ';
import { AdSense } from '@/components/AdSense';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calculator, TrendingUp, PiggyBank, Shield, Target, Award, AlertTriangle } from 'lucide-react';

interface ResourceArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  icon: React.ComponentType<any>;
  readTime: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
}

const articles: ResourceArticle[] = [
  {
    id: "budgeting-101",
    title: "Budgeting 101: A Complete Beginner's Guide",
    excerpt: "Learn the fundamentals of creating and maintaining a budget that actually works for your lifestyle.",
    category: "Budgeting Basics",
    icon: Calculator,
    readTime: 8,
    difficulty: "Beginner",
    tags: ["basics", "getting-started", "monthly-budget"]
  },
  {
    id: "emergency-fund",
    title: "How to Build an Emergency Fund: The Complete Guide",
    excerpt: "Step-by-step instructions for building a 3-6 month emergency fund to protect your financial future.",
    category: "Emergency Planning",
    icon: Shield,
    readTime: 12,
    difficulty: "Beginner",
    tags: ["emergency-fund", "savings", "financial-security"]
  },
  {
    id: "debt-payoff-strategies",
    title: "Debt Payoff Strategies: Snowball vs Avalanche Method",
    excerpt: "Compare different debt repayment strategies and find the best approach for your situation.",
    category: "Debt Management",
    icon: TrendingUp,
    readTime: 10,
    difficulty: "Intermediate",
    tags: ["debt-payoff", "strategy", "financial-freedom"]
  },
  {
    id: "investment-basics",
    title: "Investment Basics for Budget-Conscious Beginners",
    excerpt: "Start investing with small amounts and grow your wealth while maintaining a solid budget.",
    category: "Investing",
    icon: PiggyBank,
    readTime: 15,
    difficulty: "Intermediate",
    tags: ["investing", "wealth-building", "retirement"]
  },
  {
    id: "saving-strategies",
    title: "50 Proven Ways to Save Money on Monthly Expenses",
    excerpt: "Practical tips to reduce your monthly expenses without sacrificing quality of life.",
    category: "Money Saving",
    icon: Target,
    readTime: 6,
    difficulty: "Beginner",
    tags: ["money-saving", "expenses", "frugal-living"]
  },
  {
    id: "financial-goals",
    title: "Setting and Achieving Financial Goals: A Strategic Approach",
    excerpt: "Learn how to set realistic financial goals and create actionable plans to achieve them.",
    category: "Financial Planning",
    icon: Award,
    readTime: 11,
    difficulty: "Intermediate",
    tags: ["goal-setting", "financial-planning", "success"]
  },
  {
    id: "common-budget-mistakes",
    title: "10 Common Budgeting Mistakes and How to Avoid Them",
    excerpt: "Learn from others' mistakes and avoid the pitfalls that derail most budgeting efforts.",
    category: "Common Mistakes",
    icon: AlertTriangle,
    readTime: 7,
    difficulty: "Beginner",
    tags: ["mistakes", "budget-tips", "learning"]
  },
  {
    id: "financial-literacy",
    title: "Essential Financial Literacy: Terms Every Adult Should Know",
    excerpt: "Master the financial vocabulary you need to make informed money decisions.",
    category: "Financial Education",
    icon: BookOpen,
    readTime: 9,
    difficulty: "Beginner",
    tags: ["financial-literacy", "education", "terminology"]
  }
];

const resourcesFAQs = [
  {
    question: "How do I start learning about personal finance?",
    answer: "Start with our Budgeting 101 guide to understand the basics. Focus on creating a simple budget first, then gradually learn about emergency funds, debt management, and investing. Take it one topic at a time."
  },
  {
    question: "What's the most important financial habit to develop?",
    answer: "Tracking your spending and maintaining a monthly budget is the most crucial habit. It provides the foundation for all other financial decisions and helps you understand where your money goes."
  },
  {
    question: "How much should I save each month?",
    answer: "A good starting point is the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment. Adjust these percentages based on your income and financial goals."
  },
  {
    question: "Should I pay off debt or start investing first?",
    answer: "Generally, pay off high-interest debt (like credit cards) first, then build an emergency fund, and then start investing. However, if your employer offers a 401(k) match, contribute enough to get the full match first."
  },
  {
    question: "How do I stay motivated with budgeting?",
    answer: "Set clear, achievable financial goals and celebrate small wins. Use visual tools to track progress, automate savings when possible, and review your budget regularly to see how far you've come."
  }
];

const seoData = {
  title: "Financial Resources & Budgeting Guides - Free Money Management Education",
  description: "Free financial education resources including budgeting guides, debt payoff strategies, investment basics, and money-saving tips. Improve your financial literacy today.",
  keywords: "financial education, budgeting guide, personal finance tips, money management, debt payoff, investment basics, emergency fund, financial literacy",
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Financial Resources",
    "description": "Educational resources for better money management and financial planning",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": articles.map((article, index) => ({
        "@type": "Article",
        "position": index + 1,
        "headline": article.title,
        "description": article.excerpt,
        "articleSection": article.category
      }))
    }
  }
};

const FinancialResources: React.FC = () => {
  const categories = [...new Set(articles.map(article => article.category))];

  return (
    <div className="min-h-screen">
      <SEO {...seoData} />
      <Breadcrumbs />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img 
              src="/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png" 
              alt="Calculator mascot" 
              className="w-16 h-16 object-contain"
            />
            <h1 className="text-3xl font-bold text-foreground">Financial Resources</h1>
          </div>
          <p className="text-muted-foreground text-lg mb-4">
            Free guides and resources to improve your financial literacy and money management skills
          </p>
          <div className="flex justify-center">
            <SocialShare 
              title="Free Financial Education Resources & Budgeting Guides"
              description="Comprehensive guides on budgeting, saving, investing, and debt management. Improve your financial literacy for free."
            />
          </div>
        </div>

        {/* Quick Start Guide */}
        <section className="mb-12 max-w-4xl mx-auto">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Start Here: Your Financial Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <span className="font-bold text-primary">1</span>
                  </div>
                  <h3 className="font-medium mb-2">Create Your Budget</h3>
                  <p className="text-sm text-muted-foreground">Start with our monthly budget calculator to understand your income and expenses.</p>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <span className="font-bold text-primary">2</span>
                  </div>
                  <h3 className="font-medium mb-2">Build Emergency Fund</h3>
                  <p className="text-sm text-muted-foreground">Save 3-6 months of expenses for unexpected situations.</p>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <span className="font-bold text-primary">3</span>
                  </div>
                  <h3 className="font-medium mb-2">Plan Your Future</h3>
                  <p className="text-sm text-muted-foreground">Set financial goals and start investing for long-term wealth.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {articles.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <article.icon className="h-8 w-8 text-primary" />
                  <Badge variant="outline">{article.difficulty}</Badge>
                </div>
                <CardTitle className="text-lg">{article.title}</CardTitle>
                <p className="text-muted-foreground text-sm">{article.excerpt}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{article.readTime} min read</span>
                    <Badge variant="secondary" className="text-xs">{article.category}</Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {article.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AdSense Banner */}
        <div className="max-w-6xl mx-auto mt-8 flex justify-center">
          <div className="w-full max-w-2xl">
            <div className="text-center text-xs text-muted-foreground mb-2">Advertisement</div>
            <AdSense 
              adSlot="9361321362"
              style={{ display: 'block', minHeight: '120px' }}
            />
          </div>
        </div>

        {/* Financial Tips Section */}
        <section className="mt-16 max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Essential Financial Tips for Everyone
            </h2>
            <div className="prose prose-sm text-muted-foreground space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-foreground">Budgeting Fundamentals</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Track every expense for at least one month</li>
                    <li>Use the 50/30/20 rule as a starting point</li>
                    <li>Automate savings to make it effortless</li>
                    <li>Review and adjust your budget monthly</li>
                    <li>Plan for irregular expenses</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-foreground">Smart Saving Strategies</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Pay yourself first before any expenses</li>
                    <li>Start with small, achievable savings goals</li>
                    <li>Use separate accounts for different goals</li>
                    <li>Take advantage of employer matching</li>
                    <li>Reduce subscription services you don't use</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-foreground">Debt Management</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>List all debts with balances and interest rates</li>
                    <li>Choose debt snowball or avalanche method</li>
                    <li>Pay more than minimum payments when possible</li>
                    <li>Avoid taking on new debt while paying off existing</li>
                    <li>Consider debt consolidation for multiple debts</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-foreground">Building Wealth</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Start investing early, even with small amounts</li>
                    <li>Diversify your investment portfolio</li>
                    <li>Keep investment fees low</li>
                    <li>Don't try to time the market</li>
                    <li>Increase contributions with salary raises</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="text-lg font-medium text-foreground mb-2">💡 Pro Tip</h3>
                <p className="text-sm">
                  The best financial plan is one you can stick to consistently. Start with small, manageable 
                  changes and gradually build better money habits. Focus on progress, not perfection.
                </p>
              </div>
            </div>
          </div>
        </section>

        <FAQ faqs={resourcesFAQs} title="Financial Education FAQ" />
        <InternalLinks currentPage="/resources" />
      </div>
    </div>
  );
};

export default FinancialResources;