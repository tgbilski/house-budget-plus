import React from 'react';
import { SEO } from '@/components/SEO';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { InternalLinks } from '@/components/InternalLinks';
import { SocialShare } from '@/components/SocialShare';
import { FAQ } from '@/components/FAQ';
import { AdSense } from '@/components/AdSense';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Users, GraduationCap, Heart, Baby, Home, Plane, DollarSign } from 'lucide-react';

interface BudgetTemplate {
  id: string;
  title: string;
  description: string;
  targetAudience: string;
  estimatedIncome: string;
  icon: React.ComponentType<any>;
  categories: string[];
  keyFeatures: string[];
}

const budgetTemplates: BudgetTemplate[] = [
  {
    id: "college-student",
    title: "College Student Budget",
    description: "Budget template for college students managing tuition, housing, and living expenses",
    targetAudience: "College students and recent graduates",
    estimatedIncome: "$1,000 - $2,500/month",
    icon: GraduationCap,
    categories: ["Tuition", "Housing", "Food", "Transportation", "Books/Supplies", "Entertainment"],
    keyFeatures: ["Student loan tracking", "Part-time income", "Textbook budgeting", "Social expenses"]
  },
  {
    id: "young-professional",
    title: "Young Professional Budget",
    description: "Budget for young professionals starting their career and building financial independence",
    targetAudience: "Recent graduates and early-career professionals",
    estimatedIncome: "$3,000 - $6,000/month",
    icon: DollarSign,
    categories: ["Rent", "Student Loans", "Career Development", "Emergency Fund", "Retirement"],
    keyFeatures: ["Career investment", "Debt payoff strategy", "Emergency fund building", "401k planning"]
  },
  {
    id: "family-budget",
    title: "Family Budget Template",
    description: "Comprehensive budget for families managing household expenses and children's needs",
    targetAudience: "Families with children",
    estimatedIncome: "$5,000 - $12,000/month",
    icon: Users,
    categories: ["Childcare", "Education", "Healthcare", "Family Activities", "Savings"],
    keyFeatures: ["Childcare costs", "Education savings", "Family insurance", "Activity planning"]
  },
  {
    id: "new-parents",
    title: "New Parents Budget",
    description: "Budget template for new parents preparing for baby-related expenses",
    targetAudience: "Expecting and new parents",
    estimatedIncome: "$4,000 - $10,000/month",
    icon: Baby,
    categories: ["Baby Supplies", "Healthcare", "Childcare", "Parental Leave", "College Savings"],
    keyFeatures: ["Baby gear budgeting", "Healthcare planning", "Childcare research", "Education savings"]
  },
  {
    id: "first-time-homebuyer",
    title: "First-Time Homebuyer Budget",
    description: "Budget for those saving for and purchasing their first home",
    targetAudience: "Prospective homeowners",
    estimatedIncome: "$4,000 - $8,000/month",
    icon: Home,
    categories: ["Down Payment Savings", "Mortgage", "Home Insurance", "Maintenance", "Moving"],
    keyFeatures: ["Down payment planning", "Mortgage calculation", "Home maintenance fund", "Moving costs"]
  },
  {
    id: "wedding-planning",
    title: "Wedding Planning Budget",
    description: "Comprehensive budget template for planning your dream wedding",
    targetAudience: "Engaged couples",
    estimatedIncome: "Varies",
    icon: Heart,
    categories: ["Venue", "Catering", "Photography", "Attire", "Flowers", "Honeymoon"],
    keyFeatures: ["Vendor comparison", "Guest list planning", "Timeline tracking", "Honeymoon budgeting"]
  },
  {
    id: "travel-enthusiast",
    title: "Travel Enthusiast Budget",
    description: "Budget for frequent travelers and vacation planning",
    targetAudience: "Travel lovers and digital nomads",
    estimatedIncome: "$3,000 - $8,000/month",
    icon: Plane,
    categories: ["Travel Fund", "Accommodations", "Transportation", "Activities", "Travel Insurance"],
    keyFeatures: ["Multi-trip planning", "Currency tracking", "Travel rewards optimization", "Emergency fund"]
  }
];

const templateFAQs = [
  {
    question: "How do I use these budget templates?",
    answer: "Each template provides a starting framework with pre-configured expense categories relevant to your situation. Simply select the template that best matches your circumstances, then customize the amounts and categories based on your specific needs."
  },
  {
    question: "Can I modify the template categories?",
    answer: "Absolutely! These templates are starting points. You can add, remove, or modify any categories to match your unique situation. The goal is to give you a head start with relevant expense categories."
  },
  {
    question: "Which template should I choose?",
    answer: "Choose the template that most closely matches your current life situation. If none fit perfectly, start with the closest match and customize it, or begin with our standard monthly budget calculator."
  },
  {
    question: "Are these templates based on real data?",
    answer: "Yes, these templates are based on common expense patterns and averages for each demographic group. However, costs vary significantly by location and personal circumstances, so adjust amounts accordingly."
  }
];

const seoData = {
  title: "Free Budget Templates - Customized for Your Life Situation",
  description: "Choose from pre-made budget templates designed for college students, families, new parents, homebuyers, and more. Start budgeting faster with our specialized templates.",
  keywords: "budget templates, college student budget, family budget template, wedding budget, homebuyer budget, new parent budget, travel budget template",
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Budget Templates",
    "description": "Pre-made budget templates for different life situations",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": budgetTemplates.map((template, index) => ({
        "@type": "SoftwareApplication",
        "position": index + 1,
        "name": template.title,
        "description": template.description,
        "applicationCategory": "FinanceApplication"
      }))
    }
  }
};

const BudgetTemplates: React.FC = () => {
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
            <h1 className="text-3xl font-bold text-foreground">Budget Templates</h1>
          </div>
          <p className="text-muted-foreground text-lg mb-4">
            Pre-made budget templates designed for different life situations
          </p>
          <div className="flex justify-center">
            <SocialShare 
              title="Free Budget Templates for Every Life Situation"
              description="Get started with budgeting faster using our specialized templates for students, families, homebuyers, and more."
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {budgetTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <template.icon className="h-8 w-8 text-primary" />
                  <CardTitle className="text-xl">{template.title}</CardTitle>
                </div>
                <p className="text-muted-foreground text-sm">{template.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Target Audience:</h4>
                    <p className="text-sm text-muted-foreground">{template.targetAudience}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">Typical Income Range:</h4>
                    <Badge variant="secondary">{template.estimatedIncome}</Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">Key Categories:</h4>
                    <div className="flex flex-wrap gap-1">
                      {template.categories.slice(0, 3).map((category) => (
                        <Badge key={category} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                      {template.categories.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.categories.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button asChild className="w-full">
                    <Link to="/">
                      Use This Template
                    </Link>
                  </Button>
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

        {/* Why Use Templates Section */}
        <section className="mt-16 max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Why Use Budget Templates?
            </h2>
            <div className="prose prose-sm text-muted-foreground space-y-4">
              <p>
                Budget templates save you time and ensure you don't forget important expense categories 
                specific to your life situation. Each template is designed based on common spending 
                patterns and financial priorities for different demographics.
              </p>
              
              <h3 className="text-lg font-medium text-foreground">Benefits of Using Templates:</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Pre-configured expense categories relevant to your situation</li>
                <li>Faster setup compared to starting from scratch</li>
                <li>Based on real spending data and common patterns</li>
                <li>Helps identify expenses you might otherwise forget</li>
                <li>Provides realistic starting amounts for each category</li>
                <li>Can be fully customized to your specific needs</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground">How to Choose the Right Template:</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Consider your life stage:</strong> Student, professional, family, retiree</li>
                <li><strong>Think about major goals:</strong> Buying a home, planning a wedding, having children</li>
                <li><strong>Assess your income level:</strong> Templates show typical income ranges</li>
                <li><strong>Look at key categories:</strong> Does the template include your major expenses?</li>
              </ul>

              <p>
                Remember, these templates are starting points. Feel free to mix and match categories 
                from different templates or modify amounts based on your specific circumstances and location.
              </p>
            </div>
          </div>
        </section>

        <FAQ faqs={templateFAQs} />
        <InternalLinks currentPage="/templates" />
      </div>
    </div>
  );
};

export default BudgetTemplates;