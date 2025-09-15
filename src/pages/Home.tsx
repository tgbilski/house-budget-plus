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

const otherToolsData = [
  {
    title: "Vendor Quote Comparison",
    description: "Compare contractor quotes & save your favorites.",
    icon: Scale,
    href: "/compare-prices",
    color: "bg-blue-500/10 text-blue-600",
    benefit: "Save 20% on projects"
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
        src="/lovable-uploads/new-house-background.png"
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
          <Button asChild className="h-auto p-0 bg-transparent hover:bg-transparent">
            <Link to="/auth" className="block">
              <Card className="group relative hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 cursor-pointer hover:scale-105 h-full animate-fade-in bg-[#eaeff0]">
                <CardHeader className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3 hover:scale-110 transition-transform duration-300">
                        <UserCheck className="h-6 w-6" />
                      </div>
                      <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform duration-300">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">Step 1: Sign up for free</CardTitle>
                      <CardDescription className="text-sm text-gray-600 leading-relaxed">
                        Create your account instantly with no credit card required.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </Button>
          
          <Button asChild className="h-auto p-0 bg-transparent hover:bg-transparent">
            <Link to="/budget" className="block">
              <Card className="group relative hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 cursor-pointer hover:scale-105 h-full animate-fade-in bg-[#eaeff0]">
                <CardHeader className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 hover:scale-110 transition-transform duration-300">
                        <Calculator className="h-6 w-6" />
                      </div>
                      <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform duration-300">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">Step 2: Create budget</CardTitle>
                      <CardDescription className="text-sm text-gray-600 leading-relaxed">
                        Track monthly expenses and manage your household budget.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </Button>
          
          <Button asChild className="h-auto p-0 bg-transparent hover:bg-transparent">
            <Link to="/savings" className="block">
              <Card className="group relative hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 cursor-pointer hover:scale-105 h-full animate-fade-in bg-[#eaeff0]">
                <CardHeader className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3 hover:scale-110 transition-transform duration-300">
                        <Target className="h-6 w-6" />
                      </div>
                      <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform duration-300">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">Step 3: Set Savings Goals</CardTitle>
                      <CardDescription className="text-sm text-gray-600 leading-relaxed">
                        Define financial goals and track your progress.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </Button>
          
          <Button asChild className="h-auto p-0 bg-transparent hover:bg-transparent">
            <Link to="/subscription-success" className="block">
              <Card className="group relative hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 cursor-pointer hover:scale-105 h-full animate-fade-in bg-[#eaeff0]">
                <CardHeader className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3 hover:scale-110 transition-transform duration-300">
                        <Brain className="h-6 w-6" />
                      </div>
                      <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform duration-300">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">Step 4: Get AI Insights</CardTitle>
                      <CardDescription className="text-sm text-gray-600 leading-relaxed">
                        Access AI-powered recommendations for your finances.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
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

const OtherToolsGrid = () => (
  <section className="py-12 md:py-16 px-4 bg-white rounded-2xl mx-4 my-8 shadow-xl relative overflow-hidden">
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
          Other Great Tools
        </h2>
        <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
          Additional tools to help with specific financial planning needs
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 relative z-10 max-w-2xl mx-auto">
        {otherToolsData.map((tool, index) => (
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
          <OtherToolsGrid />
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
