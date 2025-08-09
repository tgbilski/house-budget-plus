import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Scale, Calendar, Plane, Brain, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { seoData } from "@/utils/seoData";
import { AdSense } from "@/components/AdSense";

const toolsData = [
  {
    title: "Monthly Budget Calculator",
    description: "Track income and expenses with intelligent categorization and spending insights.",
    icon: Calculator,
    href: "/budget",
    color: "bg-primary/10 text-primary",
    featured: true
  },
  {
    title: "AI Financial Insights",
    description: "Get instant AI-powered financial advice and personalized insights to optimize your budget.",
    icon: Brain,
    href: "/ai-insights",
    color: "bg-orange-500/10 text-orange-600"
  },
  {
    title: "Vendor Quote Comparison",
    description: "Compare contractor quotes instantly. Make smarter purchasing decisions.",
    icon: Scale,
    href: "/compare-prices",
    color: "bg-blue-500/10 text-blue-600"
  },
  {
    title: "Takeout Tracker",
    description: "Monitor dining expenses with calendar view. Spot spending patterns instantly.",
    icon: Calendar,
    href: "/takeout",
    color: "bg-green-500/10 text-green-600"
  },
  {
    title: "Vacation Planner",
    description: "Plan trips with budget analysis. Compare destinations and costs effortlessly.",
    icon: Plane,
    href: "/vacation",
    color: "bg-purple-500/10 text-purple-600"
  }
];

const HeroSection = () => (
  <section
    className="relative py-20 px-4 bg-cover bg-no-repeat bg-right"
    style={{
      backgroundImage: `url('https://app.box.com/s/6j1jzmngo9vtbd096xpwztty1rmd6k0s')`
    }}
  >
    <div className="max-w-6xl mx-auto text-left">
      <div className="flex mb-6 justify-start">
        <img
          src="/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png"
          alt="Budget Calculator mascot"
          className="w-[100px] h-[100px] object-contain"
        />
      </div>
      <h1 className="text-3xl md:text-5xl font-bold mb-10 text-gray-900">
        House Budget Calculator!
      </h1>
      <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl">
        Smart financial planning tools with AI insights. Track expenses, compare vendors, and make informed decisions.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-start">
        <Button asChild size="lg" className="text-lg px-8">
          <Link to="/budget">
            Start Budgeting <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="text-lg px-8">
          <Link to="/ai-insights">
            Get AI Insights
          </Link>
        </Button>
      </div>
    </div>
  </section>
);

const ToolsGrid = () => (
  <section className="py-20 px-4">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Financial Tools for Every Need
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Smart tools powered by AI to make budgeting effortless and insights instant.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {toolsData.map((tool, index) => (
          <Card
            key={index}
            className={`group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 ${
              tool.featured ? 'md:col-span-2 lg:col-span-1 ring-2 ring-primary/20' : ''
            }`}
          >
            <CardHeader>
              <div className={`w-12 h-12 rounded-lg ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <tool.icon className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                {tool.title}
              </CardTitle>
              <CardDescription className="text-base">
                {tool.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Link to={tool.href}>
                  Try It Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

const FeaturesSection = () => (
  <section className="py-20 px-4 bg-secondary/30">
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl font-bold mb-8">
        Why Choose Our Financial Tools?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
            <Calculator className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold">100% Free</h3>
          <p className="text-muted-foreground">
            Basic tools free forever. Premium AI insights available.
          </p>
        </div>
        <div className="space-y-4">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
            <Brain className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold">AI-Powered</h3>
          <p className="text-muted-foreground">
            Smart insights that learn from your spending patterns.
          </p>
        </div>
        <div className="space-y-4">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
            <Scale className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold">Instant Results</h3>
          <p className="text-muted-foreground">
            Get answers and insights in seconds, not hours.
          </p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto mt-12 text-center">
        <AdSense adSlot="1234567890" />
      </div>
    </div>
  </section>
);

const CTASection = () => (
  <section className="py-20 px-4">
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl font-bold mb-6">
        Ready to Take Control of Your Finances?
      </h2>
      <p className="text-lg text-muted-foreground mb-8">
        Start with our budget calculator and discover AI-powered financial insights.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg" className="text-lg px-8">
          <Link to="/budget">
            Start Your Budget <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          onClick={() => window.location.href = 'mailto:homebudgetcalculator@gmail.com?subject=Budget Calculator Feedback'}
        >
          <span>Contact Us</span>
        </Button>
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
      <div className="min-h-screen">
        <HeroSection />
        <ToolsGrid />
        <FeaturesSection />
        <CTASection />
      </div>
    </>
  );
};

export default Home;
