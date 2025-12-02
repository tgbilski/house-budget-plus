import React from 'react';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Target, Heart, TrendingUp, ArrowRight, Brain, Calculator, Shield, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdSense } from '@/components/AdSense';
import founderPhoto from '@/assets/founder-photo.jpeg';

const ScrollIndicator = () => (
  <div className="flex justify-center py-4">
    <ChevronDown className="h-8 w-8 text-gray-400 animate-bounce" />
  </div>
);

// Hero Section with founder information
const AboutHeroSection = () => (
  <section className="relative py-12 md:py-16 px-4 rounded-2xl mx-4 shadow-xl overflow-visible bg-white mt-16 md:mt-20">
    {/* Background pattern */}
    <div className="absolute inset-0">
      <div className="w-full h-full bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-2xl"></div>
    </div>
    
    <div className="w-full max-w-6xl mx-auto relative z-10 pt-8">
      {/* Main Hero Content */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight">
          About <span className="text-primary">House Budget Calculator</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto mb-10 leading-relaxed">
          Empowering families to take control of their finances through smart budgeting tools and insights.
        </p>
      </div>

      {/* Founder Section */}
      <div className="flex flex-col lg:flex-row items-center gap-8 mb-12 max-w-5xl mx-auto">
        <div className="flex-shrink-0">
          <img
            src={founderPhoto}
            alt="Toby Bilski, CEO & Founder"
            className="w-48 h-48 md:w-56 md:h-56 object-cover rounded-full shadow-xl border-4 border-white"
          />
        </div>
        <div className="flex-1 text-center lg:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Meet Our Founder</h2>
          <h3 className="text-xl md:text-2xl font-semibold text-primary mb-4">Toby Bilski, CEO & Founder</h3>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-6">
            With extensive experience as a product manager at a Fortune 200 company specializing in data visualization applications, 
            Toby brings deep expertise in creating user-friendly financial tools. His passion for making complex financial data 
            accessible and actionable led to the creation of House Budget Calculator.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all duration-300">
              <Link to="/contact">
                <span>Get in Touch</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Mission and Values Section
const MissionValuesSection = () => (
  <section className="py-12 md:py-16 px-4 bg-white rounded-2xl mx-4 my-8 shadow-xl relative overflow-hidden">
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
          Our Mission & Values
        </h2>
        <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
          Building the future of personal finance management
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 hover:scale-105 h-full">
          <CardHeader className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Target className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Our Mission</CardTitle>
            </div>
            <CardContent className="p-0">
              <p className="text-gray-600 leading-relaxed">
                To make financial planning accessible and simple for every household. We believe that everyone deserves the tools and knowledge to build a secure financial future without compromising their privacy.
              </p>
            </CardContent>
          </CardHeader>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 hover:scale-105 h-full">
          <CardHeader className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-orange-500/10 text-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Heart className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Our Values</CardTitle>
            </div>
            <CardContent className="p-0">
              <ul className="space-y-2 text-gray-600">
                <li>• Transparency in financial planning</li>
                <li>• User-friendly design for all skill levels</li>
                <li>• Privacy and security of your data</li>
                <li>• Continuous improvement and innovation</li>
              </ul>
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    </div>
  </section>
);

// What We Offer Section
const WhatWeOfferSection = () => (
  <section className="py-12 md:py-16 px-4 bg-white rounded-2xl mx-4 my-8 shadow-xl relative overflow-hidden">
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
          Complete Financial Toolkit
        </h2>
        <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
          Everything you need to manage your household finances in one place
        </p>
      </div>

      <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 mb-8">
        <CardHeader className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">What We Offer</CardTitle>
          </div>
          <CardContent className="p-0">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Calculator className="h-3 w-3" />
                  <span>Budget Tracking</span>
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Target className="h-3 w-3" />
                  <span>Savings Goals</span>
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Expense Analysis</span>
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>Vendor Comparison</span>
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Brain className="h-3 w-3" />
                  <span>AI Insights</span>
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Shield className="h-3 w-3" />
                  <span>Vacation Planning</span>
                </Badge>
              </div>
            </div>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  </section>
);

// Our Story Section
const OurStorySection = () => (
  <section className="py-12 md:py-16 px-4 bg-white rounded-2xl mx-4 my-8 shadow-xl relative overflow-hidden">
    <div className="w-full max-w-4xl mx-auto">
      <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
        <CardHeader className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-500/10 text-green-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">Our Story</CardTitle>
          </div>
          <CardContent className="p-0">
            <p className="text-gray-600 mb-4 leading-relaxed">
              House Budget Calculator was born from the simple idea that managing household finances shouldn't be complicated. 
              We noticed that many families struggle with budgeting not because they lack the desire to save, but because they 
              lack the right tools to visualize and manage their money effectively.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Today, we help families make informed financial decisions, reach their savings goals, 
              and build more secure financial futures. Our platform continues to evolve based on user feedback and the 
              changing needs of modern households.
            </p>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  </section>
);

// CTA Section
const CTASection = () => (
  <section className="py-12 md:py-16 px-4 bg-white rounded-2xl mx-4 my-8 shadow-xl relative overflow-hidden">
    <div className="w-full max-w-2xl mx-auto text-center relative z-10">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 animate-fade-in text-gray-900">
        Ready to Start Your Financial Journey?
      </h2>
      <p className="text-lg md:text-xl mb-8 animate-fade-in text-gray-600" style={{ animationDelay: '0.2s' }}>
        Join our community and take control of your finances with our free tools
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 max-w-md mx-auto">
        <Button asChild size="lg" className="w-full sm:w-auto text-base px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300">
          <Link to="/budget">
            <div className="flex items-center justify-center">
              <span>Start Budgeting</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-4 border-2 hover:bg-gray-50 transition-all duration-300">
          <Link to="/contact">
            <span>Contact Us</span>
          </Link>
        </Button>
      </div>
      <p className="text-sm text-gray-500">
        Free to use • No credit card required • Your data stays private
      </p>
    </div>
  </section>
);

const AboutUs: React.FC = () => {
  return (
    <>
      <SEO 
        title="About Us - House Budget Calculator"
        description="Learn about our mission to help families manage their finances better with our comprehensive budgeting tools and calculators."
        keywords="about us, budget calculator team, financial planning mission, household budgeting help"
      />
      
      <div className="min-h-screen overflow-x-hidden relative">
        <div className="space-y-4">
          <AboutHeroSection />
          <ScrollIndicator />
          <MissionValuesSection />
          <ScrollIndicator />
          <WhatWeOfferSection />
          <ScrollIndicator />
          <OurStorySection />
          <ScrollIndicator />
          <CTASection />
          
          {/* AdSense Ad */}
          <div className="py-6 md:py-8 overflow-hidden">
            <div className="w-full max-w-2xl mx-auto px-4">
              <div className="max-w-full overflow-hidden">
                <AdSense adSlot="1234567890" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutUs;