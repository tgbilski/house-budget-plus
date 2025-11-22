import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Scale, Target, Plane, Brain, ArrowRight, Gift, ChevronDown, UserCheck, Crown, Store, Home as HomeIcon, Heart, Mic } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { seoData } from "@/utils/seoData";
import { AdSense } from "@/components/AdSense";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import { RSSFeed } from "@/components/RSSFeed";
import { AIChatPreview } from "@/components/AIChatPreview";
import { HowItWorks } from "@/components/HowItWorks";
import { FeatureComparison } from "@/components/FeatureComparison";
import { LucideIcon } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";

// Import page preview images
import voiceExpenseConcept from '@/assets/voice-expense-concept.png';
import budgetConcept from '@/assets/budget-concept.png';
import savingsConcept from '@/assets/savings-concept.png';
import vacationConcept from '@/assets/vacation-concept.png';
import vendorConcept from '@/assets/vendor-concept.png';
import giftsConcept from '@/assets/gifts-concept.png';
import marketplaceConcept from '@/assets/marketplace-concept.png';
import aiConcept from '@/assets/ai-concept.png';
import calculatorHeroPreview from '@/assets/calculator-preview-hero.png';
import localVendorsConcept from '@/assets/local-vendors-concept.png';
import vacationRentalConcept from '@/assets/vacation-rental-concept.png';
import handmadeGiftsConcept from '@/assets/handmade-gifts-concept.png';
import howItWorksConcept from '@/assets/how-it-works-concept.png';

const featurePreviewsData = [
  {
    title: "Voice Expense Tracker",
    description: "Log expenses instantly by speaking - AI-powered transcription and smart categorization (Premium Feature)",
    image: voiceExpenseConcept,
    href: "/expenses",
    alt: "Voice-activated expense tracking with microphone and financial data",
    icon: Mic
  },
  {
    title: "Monthly Budget Calculator",
    description: "Track your household income and expenses with our intuitive calculator",
    image: budgetConcept,
    href: "/budget",
    alt: "Budget planning workspace with calculator, charts, and financial documents",
    icon: Calculator
  },
  {
    title: "Savings Goals Tracker",
    description: "Set and monitor your financial goals with visual progress tracking",
    image: savingsConcept,
    href: "/savings",
    alt: "Savings jar with plant growing and progress chart showing financial growth",
    icon: Target
  },
  {
    title: "Vacation Planner",
    description: "Compare vacation destinations and plan your trips within budget",
    image: vacationConcept,
    href: "/vacation",
    alt: "Tropical beach vacation planning with tablet showing budget options",
    icon: Plane
  },
  {
    title: "Vendor Comparison Tool",
    description: "Compare contractor quotes and find the best value for your projects",
    image: vendorConcept,
    href: "/compare-prices",
    alt: "Home renovation with contractor reviewing quotes and ratings on tablet",
    icon: Scale
  },
  {
    title: "Gift Lists",
    description: "Organize your gift ideas for every occasion with budget tracking",
    image: giftsConcept,
    href: "/gifts",
    alt: "Holiday gift planning with wrapped presents and gift list notebook",
    icon: Gift
  },
  {
    title: "Community Marketplace",
    description: "Discover vendors, vacation rentals, and handmade gifts from our community",
    image: marketplaceConcept,
    href: "/marketplace",
    alt: "Vibrant farmer's market with smartphone showing marketplace listings",
    icon: Store
  },
  {
    title: "AI Financial Advisor",
    description: "Get personalized financial insights and advice powered by AI",
    image: aiConcept,
    href: "/ai-insights",
    alt: "Futuristic AI brain hologram with financial charts and insights",
    icon: Brain
  }
];

interface StepCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

const StepCard: React.FC<StepCardProps> = ({ icon: Icon, title, description, href }) => (
  <Link to={href} className="block group">
    <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105 border-primary/20 hover:border-primary/40 bg-card/50 backdrop-blur cursor-pointer">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Icon className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-xl mb-2">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
    </Card>
  </Link>
);

const StickySignupBanner = () => {
  const { user } = useAuth();
  const { subscribed } = useSubscription();

  if (user && subscribed) return null;

  return (
    <div className="sticky top-0 z-40 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-3 px-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <p className="text-sm md:text-base font-medium">
          {user ? "Upgrade to Premium for unlimited features!" : "Sign up now and start saving smarter!"}
        </p>
        <Link to="/auth">
          <Button variant="secondary" size="sm" className="ml-4">
            {user ? "Upgrade Now" : "Get Started Free"}
          </Button>
        </Link>
      </div>
    </div>
  );
};

const ScrollIndicator = () => (
  <div className="flex justify-center py-8">
    <ChevronDown className="h-8 w-8 text-muted-foreground animate-bounce" />
  </div>
);

const PremiumButton = () => {
  const { user } = useAuth();
  const { subscribed } = useSubscription();

  if (user && subscribed) return null;

  return (
    <Link to="/auth">
      <Button 
        size="lg" 
        className="text-lg px-8 h-14 shadow-lg hover:shadow-xl transition-all"
      >
        {user ? (
          <>
            <Crown className="mr-2 h-5 w-5" />
            Upgrade to Premium
          </>
        ) : (
          <>
            <UserCheck className="mr-2 h-5 w-5" />
            Sign Up Free
          </>
        )}
      </Button>
    </Link>
  );
};

const HeroSectionContent = () => (
  <section className="container mx-auto px-4 py-12 md:py-20">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12 space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Take Control of Your
          <span className="block text-primary">Financial Future</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
          All-in-one platform for budgeting, expense tracking, savings goals, and smart financial planning
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
          <AIChatPreview />
          <PremiumButton />
        </div>
      </div>
      
      <div className="mt-12">
        <img 
          src={calculatorHeroPreview} 
          alt="House Budget Calculator Preview - Budget tracking interface" 
          className="rounded-xl shadow-2xl border border-border w-full"
        />
      </div>
    </div>
  </section>
);

const MarketplacePromo = () => (
  <section className="py-16 md:py-24 bg-gradient-to-b from-secondary/20 to-transparent">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12 space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold">
          Discover Our Community Marketplace
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Connect with local vendors, find vacation rentals, and browse handmade gifts
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
        <Card className="overflow-hidden hover:shadow-xl transition-all group border-primary/20">
          <div className="relative h-64 overflow-hidden">
            <img 
              src={localVendorsConcept}
              alt="Local vendors at community market with fresh products"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Local Vendors
            </CardTitle>
            <CardDescription className="text-base">
              Find trusted contractors, service providers, and local businesses in your area
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="overflow-hidden hover:shadow-xl transition-all group border-primary/20">
          <div className="relative h-64 overflow-hidden">
            <img 
              src={vacationRentalConcept}
              alt="Beautiful vacation rental property with tropical scenery"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HomeIcon className="h-5 w-5 text-primary" />
              Vacation Rentals
            </CardTitle>
            <CardDescription className="text-base">
              Browse unique vacation homes and rentals shared by our community members
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="overflow-hidden hover:shadow-xl transition-all group border-primary/20">
          <div className="relative h-64 overflow-hidden">
            <img 
              src={handmadeGiftsConcept}
              alt="Handcrafted gifts and artisan products display"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Handmade Gifts
            </CardTitle>
            <CardDescription className="text-base">
              Discover unique handcrafted items and support local artisans
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="text-center">
        <Link to="/marketplace">
          <Button size="lg" className="text-lg px-8 h-14">
            Explore Marketplace
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

const AdvertiseSection = () => (
  <section className="py-16 bg-gradient-to-r from-primary/10 to-accent/10">
    <div className="container mx-auto px-4 text-center space-y-6">
      <h2 className="text-3xl md:text-4xl font-bold">
        Want to advertise your listing?
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Reach thousands of potential customers in our growing community marketplace
      </p>
      <Link to="/marketplace">
        <Button size="lg" className="text-lg px-8 h-14">
          List Your Service or Product
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Link>
    </div>
  </section>
);

const FeaturePreviewsGrid = () => {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleCards(prev => new Set(prev).add(index));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.feature-card').forEach((card) => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold">
            Powerful Financial Tools
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to manage your household finances in one place
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {featurePreviewsData.map((feature, index) => (
            <div
              key={feature.title}
              data-index={index}
              className={`feature-card transition-all duration-700 ${
                visibleCards.has(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Link to={feature.href} className="block group h-full">
                <Card className="h-full overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 border-primary/20 hover:border-primary/40 bg-card/50 backdrop-blur">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.alt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <div className="p-3 rounded-full bg-primary/90 backdrop-blur">
                        <feature.icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function Features() {
  return (
    <>
      <SEO {...seoData.home} />
      <StickySignupBanner />
      
      <div className="min-h-screen">
        <HeroSectionContent />
        <ScrollIndicator />
        
        <HowItWorks />
        <ScrollIndicator />
        
        <FeatureComparison />
        <ScrollIndicator />
        
        <MarketplacePromo />
        
        <FeaturePreviewsGrid />
        
        <AdvertiseSection />
        
        <RSSFeed />
        
        <BadgeDisplay />
        
        <div className="py-8">
          <AdSense adSlot="1234567890" />
        </div>
      </div>
    </>
  );
}
