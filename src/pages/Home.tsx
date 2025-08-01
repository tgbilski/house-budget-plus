import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Scale, Calendar, Plane, Brain, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { seoData } from "@/utils/seoData";
import { AdSense } from "@/components/AdSense";

const Home = () => {
  const tools = [
    {
      title: "Monthly Budget Calculator",
      description: "Track your household income and expenses with our comprehensive budgeting tool. Perfect for individuals, families, and roommates.",
      icon: Calculator,
      href: "/budget",
      color: "bg-primary/10 text-primary",
      featured: true
    },
    {
      title: "Vendor Quote Comparison",
      description: "Compare contractor quotes and vendor prices easily. Evaluate services, financing options, and make informed decisions.",
      icon: Scale,
      href: "/compare-prices",
      color: "bg-blue-500/10 text-blue-600"
    },
    {
      title: "Takeout Expense Tracker",
      description: "Monitor your dining and takeout expenses with an interactive calendar. Identify spending patterns and optimize your food budget.",
      icon: Calendar,
      href: "/takeout",
      color: "bg-green-500/10 text-green-600"
    },
    {
      title: "Vacation Planner",
      description: "Plan and compare vacation options with budget analysis. Evaluate destinations, costs, and experiences to make the best travel decisions.",
      icon: Plane,
      href: "/vacation",
      color: "bg-purple-500/10 text-purple-600"
    },
    {
      title: "AI Financial Insights",
      description: "Get personalized financial advice and insights powered by artificial intelligence to improve your budgeting strategy.",
      icon: Brain,
      href: "/resources",
      color: "bg-orange-500/10 text-orange-600"
    }
  ];

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
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <img 
                src="/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png" 
                alt="Budget Calculator mascot" 
                className="w-[100px] h-[100px] object-contain"
              />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              House Budget Calculator
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Your complete suite of financial planning tools. Track expenses, compare vendors, plan vacations, and get AI-powered insights to master your household budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/budget">
                  Start Budgeting <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/resources">
                  Get AI Insights
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Financial Tools for Every Need
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose from our comprehensive suite of financial planning tools, all designed to help you make better money decisions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool, index) => (
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

        {/* Features Section */}
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
                  All our basic tools are completely free to use with no hidden fees or subscriptions required.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                  <Brain className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold">AI-Powered</h3>
                <p className="text-muted-foreground">
                  Get intelligent insights and personalized recommendations to optimize your financial decisions.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                  <Scale className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold">Easy to Use</h3>
                <p className="text-muted-foreground">
                  Simple, intuitive interfaces designed to make financial planning accessible to everyone.
                </p>
              </div>
            </div>
          </div>
          
          {/* Integrated AdSense within content */}
          <div className="max-w-4xl mx-auto mt-12 text-center">
            <AdSense adSlot="1234567890" />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Take Control of Your Finances?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start with our most popular tool - the Monthly Budget Calculator - and discover how easy financial planning can be.
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
      </div>
    </>
  );
};

export default Home;