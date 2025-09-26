import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Scale, Target, Plane, Brain, ArrowRight, Gift, ChevronDown, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { seoData } from "@/utils/seoData";
import { AdSense } from "@/components/AdSense";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import { RSSFeed } from "@/components/RSSFeed";
import { LucideIcon } from 'lucide-react';

// Import page preview images
import calculatorPreview from '@/assets/calculator-page-preview.png';
import savingsPreview from '@/assets/savings-goal-preview.png';
import vacationPreview from '@/assets/vacation-page-preview.png';
import vendorPreview from '@/assets/vendor-compare-preview.png';
import giftPreview from '@/assets/gift-page-preview.png';
import aiPreview from '@/assets/ai-page-preview.png';
import calculatorHeroPreview from '@/assets/calculator-preview-hero.png';

// --- Data for Child Components ---

const featurePreviewsData = [
  {
    title: "Monthly Budget Calculator",
    description: "Track your household income and expenses with our intuitive calculator",
    image: calculatorPreview,
    href: "/budget",
    alt: "Monthly Budget Calculator page showing dual calculators with income and expense tracking"
  },
  {
    title: "Savings Goals Tracker",
    description: "Set and monitor your financial goals with visual progress tracking",
    image: savingsPreview,
    href: "/savings",
    alt: "Savings Goals page showing progress tracker for a new car with monthly entries"
  },
  {
    title: "Vacation Planner",
    description: "Compare vacation destinations and plan your trips within budget",
    image: vacationPreview,
    href: "/vacation",
    alt: "Vacation Planner page showing comparison of vacation destinations with cost breakdowns"
  },
  {
    title: "Vendor Comparison Tool",
    description: "Compare contractor quotes and find the best value for your projects",
    image: vendorPreview,
    href: "/compare-prices",
    alt: "Vendor Comparison page showing project summary and contractor quote comparisons"
  },
  {
    title: "Gift Lists",
    description: "Organize your gift ideas for every occasion with budget tracking",
    image: giftPreview,
    href: "/gifts",
    alt: "Gift Lists page showing holiday gifts with budget tracking and gift ideas"
  },
  {
    title: "AI Financial Advisor",
    description: "Get personalized financial insights and advice powered by AI",
    image: aiPreview,
    href: "/ai-insights",
    alt: "AI Financial Advisor page showing personalized financial guidance and analysis"
  }
];

// --- Reusable and Page-Specific Components ---

const StepCard: React.FC<{
  to: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconTextColor: string;
  title: string;
  description: React.ReactNode;
}> = ({ to, icon: Icon, iconBgColor, iconTextColor, title, description }) => (
  <Link to={to} className="block w-full h-full">
    <Card className="group relative hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 cursor-pointer hover:scale-105 h-full animate-fade-in bg-[#eaeff0]">
      <CardHeader className="p-6 flex flex-col justify-center h-full text-center">
        <div className="flex flex-col items-center">
          <div className={`w-12 h-12 ${iconBgColor} ${iconTextColor} rounded-full flex items-center justify-center mb-3 hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors uppercase">{title}</CardTitle>
          <CardDescription className="text-sm text-gray-600 leading-relaxed">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  </Link>
);

const ScrollIndicator = () => (
  <div className="flex justify-center py-4">
    <ChevronDown className="h-8 w-8 text-gray-400 animate-bounce" />
  </div>
);

const HeroSectionContent = () => (
  <section className="relative py-8 md:py-12 px-4 rounded-2xl mx-4 shadow-xl overflow-visible bg-white mt-16 md:mt-20">
    <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 z-20">
      <img
        src="/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png"
        alt="Budget Calculator mascot"
        className="w-32 h-32 md:w-40 md:h-40 object-contain hover:scale-110 transition-transform duration-300"
      />
    </div>
    <div className="absolute inset-0">
      <img
        src="/lovable-uploads/new-house-background.png"
        alt="House background"
        className="w-full h-full object-cover rounded-2xl opacity-20"
      />
    </div>
    
    {/* Upgrade Banner */}
    <div className="absolute top-0 right-0 z-30 overflow-hidden">
      <Link to="/ai-insights" className="group block">
        <div className="bg-secondary text-secondary-foreground px-8 py-2 transform rotate-45 translate-x-6 translate-y-2 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 relative">
          <Brain className="h-4 w-4 inline mr-2" />
          <span className="text-sm font-semibold">Upgrade for AI!</span>
          {/* Triangular shadow for 3D effect */}
          <div className="absolute -bottom-1 -left-1 w-0 h-0 border-l-4 border-l-transparent border-b-4 border-b-secondary/60 border-r-4 border-r-secondary/60"></div>
        </div>
      </Link>
    </div>

    <div className="w-full max-w-6xl mx-auto relative z-10 pt-16 md:pt-20">
      {/* Main Content with Calculator Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Calculator Preview */}
        <div className="flex justify-center lg:justify-start order-2 lg:order-1">
          <div className="w-full max-w-md">
            <img 
              src={calculatorHeroPreview} 
              alt="Budget Calculator Preview"
              className="w-full h-auto rounded-[10px] shadow-lg hover:shadow-xl transition-shadow duration-300"
            />
          </div>
        </div>
        
        {/* Right Side - Text Content */}
        <div className="text-center lg:text-left order-1 lg:order-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900 leading-tight">
            Own Your <span className="text-primary">House Budget</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed">
            <strong>Your data stays yours.</strong> No bank connections required. Our AI helps you develop a personalized financial plan using only the data you choose to share.
          </p>
          
          {/* Centered Sign Up Button */}
          <div className="flex justify-center lg:justify-start mb-6">
            <Link 
              to="/auth" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <UserCheck className="h-5 w-5 mr-2" />
              Sign Up for Free
            </Link>
          </div>
          
          <p className="text-sm text-gray-500">
            Free to use • No credit card required • Anonymous signup available
          </p>
        </div>
      </div>
    </div>
  </section>
);

const FeaturePreviewsGrid = () => (
  <section className="py-12 md:py-16 px-4 bg-white rounded-2xl mx-4 my-8 shadow-xl relative overflow-hidden">
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">Explore Our Features</h2>
        <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
          Take a preview of our powerful financial planning tools
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 relative z-10">
        {featurePreviewsData.map((feature, index) => {
          const isEven = index % 2 === 0;
          return (
            <Link to={feature.href} key={index} className="block">
              <Card className="group relative hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 cursor-pointer hover:scale-[1.02] h-64 animate-fade-in bg-gradient-to-br from-white to-gray-50" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`flex items-center h-full ${isEven ? '' : 'flex-row-reverse'}`}>
                  <div className="w-1/2 h-full overflow-hidden rounded-l-lg flex-shrink-0">
                    <img 
                      src={feature.image} 
                      alt={feature.alt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="w-1/2 p-8">
                    <div className="flex items-center justify-between h-full">
                      <div className="flex-1">
                        <CardTitle className="text-xl md:text-2xl group-hover:text-primary transition-colors text-gray-900 mb-4">{feature.title}</CardTitle>
                        <CardDescription className="text-base md:text-lg text-gray-600 leading-relaxed">{feature.description}</CardDescription>
                      </div>
                      <div className={`flex items-center text-primary group-hover:translate-x-1 transition-transform duration-300 ${isEven ? 'ml-6' : 'mr-6'}`}>
                        <ArrowRight className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  </section>
);



// --- Main Page Component ---

const Home = () => {
  return (
    <>
      <SEO
        title={seoData.home.title}
        description={seoData.home.description}
        keywords={seoData.home.keywords}
        structuredData={seoData.home.structuredData}
        canonical="https://www.housebudgetcalculator.com/"
      />
      <div className="min-h-screen overflow-x-hidden relative">
        <div className="space-y-4">
          <HeroSectionContent />
          <ScrollIndicator />
          <FeaturePreviewsGrid />
          <ScrollIndicator />

          <div className="bg-gray-100 rounded-2xl mx-4 my-8 shadow-xl p-6 md:p-8 overflow-hidden">
            <div className="w-full max-w-7xl mx-auto overflow-hidden">
              <RSSFeed
                feedUrl="https://rss.cnn.com/rss/money_news_international.rss"
                title="Latest Financial News"
              />
            </div>
          </div>
          <ScrollIndicator />

          <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
            <BadgeDisplay />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
