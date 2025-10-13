import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Scale, Target, Plane, Brain, ArrowRight, Gift, ChevronDown, UserCheck, Crown, Store, Home as HomeIcon, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { seoData } from "@/utils/seoData";
import { AdSense } from "@/components/AdSense";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import { RSSFeed } from "@/components/RSSFeed";
import { AIChatPreview } from "@/components/AIChatPreview";
import { LucideIcon } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";


// Import page preview images
import calculatorPreview from '@/assets/calculator-page-preview.png';
import savingsPreview from '@/assets/savings-goal-preview.png';
import vacationPreview from '@/assets/vacation-page-preview.png';
import vendorPreview from '@/assets/vendor-compare-preview.png';
import giftPreview from '@/assets/gift-page-preview.png';
import aiPreview from '@/assets/ai-page-preview.png';
import marketplacePreview from '@/assets/marketplace-page-preview.png';
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
    title: "Community Marketplace",
    description: "Discover vendors, vacation rentals, and handmade gifts from our community",
    image: marketplacePreview,
    href: "/marketplace",
    alt: "Community Marketplace page showing vendor, vacation, and gift listings"
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

const PremiumButton = () => {
  const { user } = useAuth();
  const { subscribed } = useSubscription();

  // Don't show any button for premium users
  if (user && subscribed) {
    return null;
  }

  // Show sign up button for non-authenticated users
  if (!user) {
    return (
      <div className="flex justify-center lg:justify-start mb-4">
        <Link 
          to="/auth" 
          className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <UserCheck className="h-4 w-4 mr-2" />
          Sign Up for Free
        </Link>
      </div>
    );
  }

  // Show premium upgrade button for authenticated non-subscribers
  return (
    <div className="flex justify-center lg:justify-start mb-4">
      <Button asChild className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <Link to="/settings">
          <Crown className="h-4 w-4 mr-2" />
          Upgrade to Premium
        </Link>
      </Button>
    </div>
  );
};

const HeroSectionContent = () => (
  <section className="relative py-6 md:py-8 px-4 rounded-2xl mx-4 shadow-xl overflow-visible bg-white mt-16 md:mt-20">
    <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 z-20">
      <img
        src="/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png"
        alt="House Budget Calculator mascot - friendly budget planning assistant"
        className="w-28 h-28 md:w-32 md:h-32 object-contain"
        loading="eager"
        width="128"
        height="128"
      />
    </div>
    <div className="absolute inset-0">
      <img
        src="/lovable-uploads/new-house-background.png"
        alt="House background illustration for budget planning"
        className="w-full h-full object-cover rounded-2xl opacity-20"
        loading="eager"
        width="1200"
        height="400"
      />
    </div>

    <div className="w-full max-w-6xl mx-auto relative z-10 pt-12 md:pt-16">
      {/* Main Content with Calculator Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
        
        {/* Left Side - Calculator Preview */}
        <div className="lg:col-span-2 flex justify-center lg:justify-start order-2 lg:order-1">
          <div className="w-full max-w-xs">
            <img 
              src={calculatorHeroPreview} 
              alt="Monthly budget calculator interface showing income and expense tracking with visual charts"
              className="w-full h-auto rounded-[10px] shadow-lg hover:shadow-xl transition-shadow duration-300"
              loading="eager"
              width="320"
              height="240"
            />
          </div>
        </div>
        
        {/* Right Side - Text Content */}
        <div className="lg:col-span-3 text-center lg:text-left order-1 lg:order-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-gray-900 leading-tight">
            Own Your <span className="text-primary">House Budget</span>
          </h1>
          <p className="text-sm md:text-base text-gray-600 mb-4 leading-relaxed">
            <strong>Your data stays yours.</strong> No bank connections required. Our AI helps you develop a personalized financial plan using only the data you choose to share.
          </p>
          
          {/* AI Chat Preview */}
          <div className="mb-6">
            <AIChatPreview />
          </div>
          
          {/* Conditional Button Display */}
          <PremiumButton />
          
          <p className="text-xs text-gray-500">
            Free to use • No credit card required • Anonymous signup available
          </p>
        </div>
      </div>
    </div>
  </section>
);

const MarketplacePromo = () => (
  <section className="py-6 md:py-8 lg:py-12 px-3 md:px-4 mx-2 md:mx-4 my-6 md:my-8 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl border-2 border-gray-700 relative overflow-hidden">
    {/* Decorative background elements */}
    <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-primary/10 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 left-0 w-32 h-32 md:w-64 md:h-64 bg-secondary/10 rounded-full blur-3xl"></div>
    
    <div className="max-w-6xl mx-auto relative z-10">
      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 md:p-6 mb-6 md:mb-8 text-white text-center">
        <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 md:mb-3">
          🚀 ADVERTISE YOUR LISTING WITH US! 🚀
        </h3>
        <Link to="/marketplace">
          <Button 
            size="default"
            className="bg-white text-purple-600 hover:bg-gray-100 font-bold w-full sm:w-auto mt-2"
          >
            Start Your Listing Now!
          </Button>
        </Link>
      </div>

      <div className="text-center mb-6 md:mb-8">
        <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
          <Store className="h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 text-white flex-shrink-0" />
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white">
            Community Marketplace
          </h2>
          <Store className="h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 text-white flex-shrink-0" />
        </div>
        <p className="text-base md:text-lg lg:text-xl text-white font-semibold mb-2 px-2">
          🎉 Connect with Local Vendors, Discover Unique Gifts & Find Perfect Vacation Rentals!
        </p>
        <p className="text-sm md:text-base lg:text-lg text-gray-300 max-w-3xl mx-auto px-2">
          Browse our growing community marketplace to find trusted contractors, beautiful handmade gifts, and affordable vacation rentals—all in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg border border-primary/10">
          <div className="flex justify-center mb-3 md:mb-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <HomeIcon className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-900 text-center mb-2">Local Vendors</h3>
          <p className="text-sm md:text-base text-gray-600 text-center">Find trusted contractors and service providers for your home projects</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg border border-primary/10">
          <div className="flex justify-center mb-3 md:mb-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Plane className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-900 text-center mb-2">Vacation Rentals</h3>
          <p className="text-sm md:text-base text-gray-600 text-center">Discover affordable and unique stays for your next getaway</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg border border-primary/10">
          <div className="flex justify-center mb-3 md:mb-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Heart className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-900 text-center mb-2">Handmade Gifts</h3>
          <p className="text-sm md:text-base text-gray-600 text-center">Shop unique, handcrafted items perfect for any occasion</p>
        </div>
      </div>

      <div className="flex justify-center px-2">
        <Button asChild size="default" className="bg-white hover:bg-gray-100 text-gray-900 px-6 md:px-8 py-4 md:py-6 text-base md:text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 md:hover:scale-110 w-full sm:w-auto">
          <Link to="/marketplace" className="flex items-center justify-center gap-2">
            <Store className="h-4 w-4 md:h-5 md:w-5" />
            Explore Marketplace
            <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
          </Link>
        </Button>
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
      
      {/* Mobile Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:hidden">
        {featurePreviewsData.map((feature, index) => (
          <Link to={feature.href} key={index} className="block">
            <Card className="group relative hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 cursor-pointer hover:scale-[1.02] animate-fade-in bg-gradient-to-br from-white to-gray-50 overflow-hidden" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex flex-col">
                <div className="w-full h-32 overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.alt}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    width="300"
                    height="128"
                  />
                </div>
                <div className="p-4 bg-sage/20">
                  <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors text-gray-900 mb-2 text-center">{feature.title}</CardTitle>
                  <CardDescription className="text-xs text-gray-600 leading-relaxed text-center">{feature.description}</CardDescription>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      
      {/* Desktop Layout */}
      <div className="hidden md:grid grid-cols-1 gap-8 relative z-10">
        {featurePreviewsData.map((feature, index) => {
          const isEven = index % 2 === 0;
          return (
            <Link to={feature.href} key={index} className="block">
              <Card className="group relative hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 cursor-pointer hover:scale-[1.02] h-64 animate-fade-in bg-gradient-to-br from-white to-gray-50 overflow-hidden" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`flex items-center h-full ${isEven ? '' : 'flex-row-reverse'}`}>
                  <div className="w-1/2 h-full overflow-hidden flex-shrink-0">
                    <img 
                      src={feature.image} 
                      alt={feature.alt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      width="400"
                      height="256"
                    />
                  </div>
                  <div className="w-1/2 p-8 bg-sage/20 h-full">
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
        canonical={seoData.home.canonical}
        ogImage={seoData.home.ogImage}
      />
      <div className="min-h-screen overflow-x-hidden relative">
        <div className="space-y-4">
          <HeroSectionContent />
          <ScrollIndicator />
          <MarketplacePromo />
          <ScrollIndicator />
          <FeaturePreviewsGrid />
          <ScrollIndicator />

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl mx-4 my-8 shadow-xl border-2 border-gray-700 p-6 md:p-8 overflow-hidden">
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
