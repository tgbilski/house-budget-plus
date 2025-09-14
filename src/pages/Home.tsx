import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Scale, Target, Plane, Brain, ArrowRight, Gift, Star, TrendingUp, Users, ChevronDown, Shield, Eye, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { seoData } from "@/utils/seoData";
import { AdSense } from "@/components/AdSense";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import { RSSFeed } from "@/components/RSSFeed";

const toolsData = [
  {
    title: "Monthly Budget Calculator",
    description: "Understand monthly income & expenses.",
    icon: Calculator,
    href: "/budget",
    color: "bg-primary/10 text-primary",
    featured: true,
    benefit: "Save monthly"
  },
  {
    title: "AI Financial Insights",
    description: "Get instant AI-powered insight using your data.",
    icon: Brain,
    href: "/ai-insights",
    color: "bg-orange-500/10 text-orange-600",
    featured: true,
    benefit: "Smart recommendations"
  },
  {
    title: "Vendor Quote Comparison",
    description: "Compare contractor quotes & save your favorites.",
    icon: Scale,
    href: "/compare-prices",
    color: "bg-blue-500/10 text-blue-600",
    benefit: "Save 20% on projects"
  },
  {
    title: "Savings Tracker",
    description: "Track your monthly savings progress with yearly goals.",
    icon: Target,
    href: "/savings",
    color: "bg-green-500/10 text-green-600",
    benefit: "Reach financial goals"
  },
  {
    title: "Vacation Planner",
    description: "Plan trips with budget analysis and compare destinations.",
    icon: Plane,
    href: "/vacation",
    color: "bg-purple-500/10 text-purple-600",
    benefit: "Plan dream trips"
  },
  {
    title: "Gifts & Celebrations",
    description: "Organize gift ideas and track spending for all your celebrations.",
    icon: Gift,
    href: "/gifts",
    color: "bg-pink-500/10 text-pink-600",
    benefit: "Never overspend"
  }
];

const ScrollIndicator = () => (
  <div className="flex justify-center py-4">
    <ChevronDown className="h-8 w-8 text-gray-400 animate-bounce" />
  </div>
);

// Consolidated Hero and Social Proof section
const HeroSectionContent = () => (
  <section className="relative py-8 md:py-12 px-4 rounded-2xl mx-4 shadow-xl overflow-visible bg-white mt-16 md:mt-20">
    {/* Spiral notepad holes at the top */}
    <div className="absolute top-4 left-0 right-0 flex justify-center space-x-8 z-30">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="w-4 h-4 bg-gray-300 rounded-full shadow-inner border-2 border-gray-400"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #f0f0f0, #d0d0d0)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.1)'
          }}
        />
      ))}
    </div>
    
    {/* Red margin line */}
    <div className="absolute top-16 left-8 bottom-8 w-0.5 bg-red-300 opacity-60 z-20"></div>
    
    {/* Subtle horizontal lines for notepad effect */}
    <div className="absolute inset-0 z-10 pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute left-0 right-0 h-px bg-blue-100 opacity-30"
          style={{ top: `${100 + i * 25}px` }}
        />
      ))}
    </div>

    {/* Mascot Image - Absolutely positioned just above the title */}
    <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 z-20">
      <img
        src="/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png"
        alt="Budget Calculator mascot"
        className="w-32 h-32 md:w-40 md:h-40 object-contain hover:scale-110 transition-transform duration-300"
      />
    </div>

    {/* Background house image */}
    <div className="absolute inset-0">
      <img
        src="/lovable-uploads/d46481b3-e5b7-454b-b44e-4e96eb93a00f.png"
        alt="House background"
        className="w-full h-full object-cover rounded-2xl opacity-20"
      />
    </div>
    
    <div className="w-full max-w-6xl mx-auto relative z-10 pt-16 md:pt-20">
      {/* Main Hero Content */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900 leading-tight">
          Own Your <span className="text-primary">House Budget</span>
        </h1>
        <p className="text-base md:text-lg text-gray-600 max-w-4xl mx-auto mb-6 leading-relaxed">
          <strong>Your data stays yours.</strong> No bank connections required. Our AI helps you develop a personalized financial plan using only the data you choose to share.
        </p>
        
        {/* Step-by-step Value Propositions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-w-5xl mx-auto">
          <div className="flex flex-col items-start text-left p-4 bg-[#eaeff0] backdrop-blur-sm rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 shadow-lg">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3 hover:scale-110 transition-transform duration-300">
              <UserCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Step 1: Sign up for free</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Create your account instantly with no credit card required.
            </p>
          </div>
          
          <div className="flex flex-col items-start text-left p-4 bg-[#eaeff0] backdrop-blur-sm rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 shadow-lg">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 hover:scale-110 transition-transform duration-300">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Step 2: Create your household budget</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Track monthly expenses, compare project estimates, and plan gift budgets.
            </p>
          </div>
          
          <div className="flex flex-col items-start text-left p-4 bg-[#eaeff0] backdrop-blur-sm rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 shadow-lg">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3 hover:scale-110 transition-transform duration-300">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Step 3: Upgrade for AI insights</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Access AI-powered recommendations and share data with family members.
            </p>
          </div>
          
          <div className="flex flex-col items-start text-left p-4 bg-[#eaeff0] backdrop-blur-sm rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 shadow-lg">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3 hover:scale-110 transition-transform duration-300">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Step 4: Stay completely private</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              No bank connections required - your financial data remains anonymous and secure.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6 max-w-md mx-auto">
          <Button asChild size="lg" className="w-full sm:w-auto text-base px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <Link to="/budget">
              <div className="flex items-center">
                <span>Start Budgeting</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </div>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-base px-6 py-3 border-2 hover:bg-gray-50 transition-all duration-300">
            <Link to="/ai-insights">
              <span>Try AI Insights</span>
            </Link>
          </Button>
        </div>
        
        <p className="text-sm text-gray-500">
          Free to use • No credit card required • Anonymous signup available
        </p>
      </div>
    </div>
  </section>
);

const AllToolsGrid = () => (
  <section className="py-12 md:py-16 px-4 bg-white rounded-2xl mx-4 my-8 shadow-xl relative overflow-hidden">
    <div className="w-full max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
          Complete Financial Toolkit
        </h2>
        <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
          Everything you need to manage your household finances in one place
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {toolsData.map((tool, index) => (
          <Link to={tool.href} key={index} className="block">
            <Card
              className={`group relative hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 cursor-pointer hover:scale-105 h-full animate-fade-in bg-[#eaeff0]`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl ${tool.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-2`}>
                      <tool.icon className="h-6 w-6 md:h-7 md:w-7" />
                    </div>
                    <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform duration-300">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg md:text-xl group-hover:text-primary transition-colors text-gray-900 mb-2">
                      {tool.title}
                    </CardTitle>
                    <CardDescription className="text-sm md:text-base text-gray-600 leading-relaxed">
                      {tool.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

const CTASection = () => (
  <section className="py-12 md:py-16 px-4 bg-white rounded-2xl mx-4 my-8 shadow-xl relative overflow-hidden">
    <div className="w-full max-w-2xl mx-auto text-center relative z-10">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 animate-fade-in text-gray-900">
        Ready to Save Money Every Month?
      </h2>
      <p className="text-lg md:text-xl mb-8 animate-fade-in text-gray-600" style={{ animationDelay: '0.2s' }}>
        Join our community and take control of your finances with our free tools
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 max-w-md mx-auto">
        <Button asChild size="lg" className="w-full sm:w-auto text-base px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300">
          <Link to="/auth">
            <div className="flex items-center justify-center">
              <span>Sign up for free</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          </Link>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full sm:w-auto text-base px-8 py-4 cursor-pointer border-2 hover:bg-gray-50 transition-all duration-300"
          onClick={() => window.location.href = 'mailto:homebudgetcalculator@gmail.com?subject=Budget Calculator Feedback'}
        >
          Get Support
        </Button>
      </div>
      <p className="text-sm text-gray-500">
        No credit card required • Start saving in under 2 minutes
      </p>
    </div>
  </section>
);

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
        {/* Main content sections */}
        <div className="space-y-4">
          <HeroSectionContent />
          <ScrollIndicator />
          <AllToolsGrid />
          
          {/* AdSense Ad Unit Placeholder */}
          <div className="py-6 md:py-8 overflow-hidden">
            <div className="w-full max-w-2xl mx-auto px-4">
              <div className="max-w-full overflow-hidden">
                <PromoCard />
              </div>
            </div>
          </div>
          <ScrollIndicator />
          
          <CTASection />
          <ScrollIndicator />

          {/* RSS Feed section */}
          <div className="bg-gray-100 rounded-2xl mx-4 my-8 shadow-xl p-6 md:p-8 overflow-hidden">
            <div className="w-full max-w-7xl mx-auto overflow-hidden">
              <RSSFeed 
                feedUrl="https://rss.cnn.com/rss/money_news_international.rss"
                title="Latest Financial News"
              />
            </div>
          </div>
          <ScrollIndicator />

          {/* Badge Display Section */}
          <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
            <BadgeDisplay />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;

// Temporary PromoCard component for the AdSense placeholder
const PromoCard = () => (
  <Card className="flex flex-col items-center justify-center p-8 text-center animate-fade-in transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
    <div className="flex items-center justify-center h-20 w-20 mb-6 bg-orange-500/10 text-orange-600 rounded-full">
      <Brain className="h-10 w-10" />
    </div>
    <CardTitle className="text-xl md:text-2xl font-bold mb-4">Unlock Smart Financial Insights</CardTitle>
    <CardDescription className="text-gray-600 mb-6 text-base md:text-lg">
      Get instant, AI-powered recommendations to help you save more every month.
    </CardDescription>
    <Button asChild size="lg" className="px-8 py-3">
      <Link to="/ai-insights">
        <span>Explore AI Insights</span>
      </Link>
    </Button>
  </Card>
);
