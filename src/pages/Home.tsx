import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Scale, Target, Plane, Brain, ArrowRight, Gift, Star, TrendingUp, Users, ChevronDown } from "lucide-react";
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
    {/* Mascot Image - Absolutely positioned just above the title */}
    <div className="absolute top-[calc(-50px-10px)] left-1/2 -translate-x-1/2 z-20"> {/* Adjusted for 10px buffer */}
      <img
        src="/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png"
        alt="Budget Calculator mascot"
        className="w-36 h-36 md:w-48 md:h-48 object-contain hover:scale-110 transition-transform duration-300"
      />
    </div>

    {/* Background house image */}
    <div className="absolute inset-0">
      <img
        src="/lovable-uploads/d46481b3-e5b7-454b-b44e-4e96eb93a00f.png"
        alt="House background"
        className="w-full h-full object-cover rounded-2xl opacity-30"
      />
    </div>
    
    {/* Increased padding-top to ensure text starts visually below the mascot */}
    <div className="w-full max-w-4xl mx-auto relative z-10 pt-24 md:pt-28">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900 leading-tight">
          Own Your <span className="text-primary">House Budget</span>
        </h1>
        <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
          Smart financial planning tools with AI insights. Track expenses, compare vendors, and make informed decisions that save you money. Join a community of smart savers today!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-10 max-w-md mx-auto">
          <Button asChild size="lg" className="w-full sm:w-auto text-base px-6 py-4 shadow-lg hover:shadow-xl transition-shadow">
            <Link to="/budget">
              Budget Calculator <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-base px-6 py-4 border-2">
            <Link to="/ai-insights">
              AI Insights
            </Link>
          </Button>
        </div>
      </div>

      {/* Social Proof Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="space-y-3 md:space-y-4 animate-fade-in px-2" style={{ animationDelay: '0.2s' }}>
          <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto hover:scale-110 transition-transform duration-300 hover:bg-primary/20">
            <Calculator className="h-7 w-7 md:h-8 md:w-8" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900">100% Free Forever</h3>
          <p className="text-sm md:text-base text-gray-600">
            Core budgeting tools are completely free. Premium AI insights available for advanced users.
          </p>
        </div>
        <div className="space-y-3 md:space-y-4 animate-fade-in px-2" style={{ animationDelay: '0.4s' }}>
          <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto hover:scale-110 transition-transform duration-300 hover:bg-primary/20">
            <Brain className="h-7 w-7 md:h-8 md:w-8" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900">AI-Powered Insights</h3>
          <p className="text-sm md:text-base text-gray-600">
            Smart recommendations that learn from your spending patterns and help you save more.
          </p>
        </div>
        <div className="space-y-3 md:space-y-4 animate-fade-in px-2" style={{ animationDelay: '0.6s' }>
          <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto hover:scale-110 transition-transform duration-300 hover:bg-primary/20">
            <TrendingUp className="h-7 w-7 md:h-8 md:w-8" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900">Instant Results</h3>
          <p className="text-sm md:text-base text-gray-600">
            Get budget analysis and money-saving insights in seconds, not hours.
          </p>
        </div>
      </div>
    </div>
  </section>
);

const AllToolsGrid = () => (
  <section className="py-8 md:py-12 px-4 bg-white rounded-2xl mx-4 my-6 shadow-xl relative overflow-hidden">
    <div className="w-full max-w-sm md:max-w-4xl lg:max-w-6xl mx-auto">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 px-2">
          Complete Financial Toolkit
        </h2>
        <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto px-2">
          Everything you need to manage your household finances in one place
        </p>
      </div>
      {/* Three-column grid for large screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 relative z-10">
        {toolsData.map((tool, index) => (
          <Link to={tool.href} key={index} className="block">
            <Card
              className={`group relative hover:shadow-lg transition-all duration-500 border-2 hover:border-primary/20 cursor-pointer hover:scale-105 h-full animate-fade-in bg-white`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-3 p-4 md:p-5">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${tool.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-2`}>
                      <tool.icon className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <div className="flex items-center text-xs md:text-sm text-primary group-hover:translate-x-1 transition-transform duration-300">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base md:text-lg group-hover:text-primary transition-colors text-gray-900 mb-1">
                      {tool.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 leading-tight">
                      {tool.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
      <div className="w-full max-w-full overflow-hidden mt-8"> {/* Added margin-top here too if needed */}
        {/* This is where the ad slot or promo card will go */}
      </div>
    </div>
  </section>
);

const CTASection = () => (
  <section className="py-8 md:py-12 px-4 bg-white rounded-2xl mx-4 my-6 shadow-xl relative overflow-hidden">
    <div className="w-full max-w-sm mx-auto text-center relative z-10">
      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6 animate-fade-in px-2 text-gray-900">
        Ready to Save Money Every Month?
      </h2>
      <p className="text-base md:text-lg mb-6 md:mb-8 animate-fade-in px-2 text-gray-600" style={{ animationDelay: '0.2s' }}>
        Join our community and take control of your finances with our free tools
      </p>
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-6 md:mb-8 max-w-md mx-auto">
        <Button asChild size="lg" className="w-full sm:w-auto text-base px-6 py-3">
          <Link to="/auth">
            <span className="block sm:inline">Sign up for free</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="w-full sm:w-auto text-base px-6 py-3 cursor-pointer"
          onClick={() => window.location.href = 'mailto:homebudgetcalculator@gmail.com?subject=Budget Calculator Feedback'}
        >
          <span>Get Support</span>
        </Button>
      </div>
      <p className="text-sm text-gray-500 px-2">
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
        <div>
          <HeroSectionContent />
          <ScrollIndicator />
          <AllToolsGrid />
          
          {/* AdSense Ad Unit Placeholder - Choose an option from previous discussion */}
          <div className="py-6 md:py-8 overflow-hidden">
            <div className="w-full max-w-sm mx-auto px-4">
              <div className="max-w-full overflow-hidden">
                {/* For now, let's use the PromoCard as discussed, or replace with NewsletterCard */}
                <PromoCard /> {/* Example: Using the PromoCard */}
              </div>
            </div>
          </div>
          <ScrollIndicator />
          
          <CTASection />
          <ScrollIndicator />

          {/* === RSS Feed section moved here === */}
          <div className="bg-gray-100 rounded-2xl mx-4 my-6 shadow-xl p-4 md:p-6 overflow-hidden">
            <div className="w-full max-w-sm mx-auto md:max-w-4xl overflow-hidden">
              <RSSFeed 
                feedUrl="https://rss.cnn.com/rss/money_news_international.rss"
                title="Latest Financial News"
              />
            </div>
          </div>
          <ScrollIndicator />

          {/* Badge Display Section - Bottom */}
          <div className="w-full max-w-sm mx-auto md:max-w-4xl px-4 py-6 md:py-8">
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
  <Card className="flex flex-col items-center justify-center p-6 text-center animate-fade-in transition-all duration-300 transform hover:scale-105">
    <div className="flex items-center justify-center h-16 w-16 mb-4 bg-orange-500/10 text-orange-600 rounded-full">
      <Brain className="h-8 w-8" />
    </div>
    <CardTitle className="text-xl font-bold mb-2">Unlock Smart Financial Insights</CardTitle>
    <CardDescription className="text-gray-600 mb-4">
      Get instant, AI-powered recommendations to help you save more every month.
    </CardDescription>
    <Button asChild>
      <Link to="/ai-insights">Explore AI Insights</Link>
    </Button>
  </Card>
);
