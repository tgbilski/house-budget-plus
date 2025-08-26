
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Scale, Target, Plane, Brain, ArrowRight, Gift, Star, TrendingUp, Users } from "lucide-react";
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

const HeroSection = () => (
  <section
    className="relative py-16 md:py-24 px-4 bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5 overflow-hidden"
    style={{
      backgroundImage: `url('https://res.cloudinary.com/dqh8kcdas/image/upload/v1754758366/Gemini_Generated_Image_40ga540ga540ga54_smkr18.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'right center',
      backgroundRepeat: 'no-repeat'
    }}
  >
    
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="text-left animate-fade-in">
          <div className="flex items-center mb-6">
            <img
              src="/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png"
              alt="Budget Calculator mascot"
              className="w-16 h-16 md:w-20 md:h-20 object-contain mr-4 hover:scale-110 transition-transform duration-300"
            />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 animate-pulse" style={{ animationDelay: '0.1s' }} />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">
            Own Your 
            <span className="text-primary block">House Budget</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            Smart financial planning tools with AI insights. Track expenses, compare vendors, and make informed decisions that save you money.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button asChild size="lg" className="text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-shadow">
              <Link to="/budget">
                Free Budget Calculator <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3 border-2">
              <Link to="/ai-insights">
                Try AI Insights
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>100% Free Tools</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span>No Sign-up Required</span>
            </div>
          </div>
        </div>
        
        {/* Visual space for background image */}
        <div className="hidden lg:block"></div>
      </div>
    </div>
  </section>
);

const FeaturedToolsSection = () => {
  const featuredTools = toolsData.filter(tool => tool.featured);
  
  return (
    <section className="py-16 px-4 bg-slate-900 text-white relative" style={{
      backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.04) 40px, rgba(255,255,255,0.04) 42px)`
    }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 text-white">
            Start Saving Money Today
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 relative z-10">
          {featuredTools.map((tool, index) => (
            <Link to={tool.href} key={index}>
              <Card className="group relative hover:shadow-xl transition-all duration-500 border-2 hover:border-primary/30 cursor-pointer h-full animate-fade-in hover:scale-105 transform" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                  POPULAR
                </div>
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 rounded-xl ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <tool.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors mb-2">
                    {tool.title}
                  </CardTitle>
                  <div className="text-sm font-semibold text-green-600 mb-2">
                    ✓ {tool.benefit}
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">Get Started</span>
                    <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        
        <div className="text-center">
        </div>
      </div>
    </section>
  );
};

const AllToolsGrid = () => (
  <section className="py-16 px-4 bg-slate-900 text-white relative overflow-hidden" style={{
    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.04) 40px, rgba(255,255,255,0.04) 42px)`
  }}>
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
          Complete Financial Toolkit
        </h2>
        <p className="text-base text-gray-300 max-w-2xl mx-auto">
          Everything you need to manage your household finances in one place
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {toolsData.map((tool, index) => (
          <Link to={tool.href} key={index}>
            <Card
              className={`group relative hover:shadow-lg transition-all duration-500 border-2 hover:border-primary/20 cursor-pointer hover:scale-105 h-full animate-fade-in bg-white/80 backdrop-blur-sm`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-lg ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <tool.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {tool.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <div className="absolute top-4 right-4 flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform duration-300">
                try now <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

const SocialProofSection = () => (
  <section className="py-16 px-4 bg-gradient-to-r from-white via-primary/5 to-white relative">
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-2xl md:text-3xl font-bold mb-8">
        Join a Community of Smart Savers
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 relative z-10">
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto hover:scale-110 transition-transform duration-300 hover:bg-primary/20">
            <Calculator className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold">100% Free Forever</h3>
          <p className="text-muted-foreground">
            Core budgeting tools are completely free. Premium AI insights available for advanced users.
          </p>
        </div>
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto hover:scale-110 transition-transform duration-300 hover:bg-primary/20">
            <Brain className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold">AI-Powered Insights</h3>
          <p className="text-muted-foreground">
            Smart recommendations that learn from your spending patterns and help you save more.
          </p>
        </div>
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto hover:scale-110 transition-transform duration-300 hover:bg-primary/20">
            <TrendingUp className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold">Instant Results</h3>
          <p className="text-muted-foreground">
            Get budget analysis and money-saving insights in seconds, not hours.
          </p>
        </div>
      </div>
    </div>
  </section>
);

const CTASection = () => (
  <section className="py-20 px-4 bg-slate-900 text-white relative overflow-hidden" style={{
    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.04) 40px, rgba(255,255,255,0.04) 42px)`
  }}>
    <div className="max-w-4xl mx-auto text-center relative z-10">
      <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-in">
        Ready to Save Money Every Month?
      </h2>
      <p className="text-xl mb-8 opacity-90 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        Join our community and take control of your finances with our free tools
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-3">
          <Link to="/budget">
            Free Budget Calculator <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
        <Button
          asChild
          variant="secondary"
          size="lg"
          className="text-lg px-8 py-3 cursor-pointer border-bg-primary-foreground/20 hover:bg-primary-foreground/10"
          onClick={() => window.location.href = 'mailto:homebudgetcalculator@gmail.com?subject=Budget Calculator Feedback'}
        >
          <span>Get Support</span>
        </Button>
      </div>
      <p className="text-sm opacity-75">
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
      <div className="min-h-screen relative">
        <HeroSection />
        <FeaturedToolsSection />
        <RSSFeed 
          feedUrl="https://rss.cnn.com/rss/money_news_international.rss"
          title="Latest Financial News"
        />
        <AllToolsGrid />
        
        {/* AdSense Ad Unit */}
        <div className="py-8 bg-background">
          <div className="max-w-6xl mx-auto px-4">
            <AdSense 
              adSlot="5669663372" 
              adFormat="fluid"
              style={{ display: 'block' }}
              responsive={false}
            />
          </div>
        </div>
        
        <SocialProofSection />
        <CTASection />
        
        {/* Badge Display Section - Bottom */}
        <div className="container mx-auto px-4 py-8">
          <BadgeDisplay />
        </div>
      </div>
    </>
  );
};

export default Home;
