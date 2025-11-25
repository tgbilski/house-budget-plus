export interface SEOData {
  title: string;
  description: string;
  keywords: string;
  structuredData?: any;
  canonical?: string;
  ogImage?: string;
}

export const seoData: Record<string, SEOData> = {
  home: {
    title: "House Budget Calculator - Free Financial Planning Tools Suite",
    description: "Comprehensive suite of free financial tools including budget calculator, vendor comparison, expense tracking, vacation planning, and AI insights. Master your household finances today.",
    keywords: "house budget calculator, financial planning tools, budget tracker, expense calculator, vendor comparison, financial management, household budget",
    canonical: "https://www.housebudgetcalculator.com",
    ogImage: "https://www.housebudgetcalculator.com/assets/calculator-use-preview.png",
    structuredData: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          "name": "House Budget Calculator",
          "url": "https://www.housebudgetcalculator.com",
          "description": "Complete suite of financial planning tools for household budget management",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "All",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "featureList": [
            "Monthly budget calculator",
            "Vendor quote comparison",
            "Takeout expense tracking",
            "Vacation planning tools",
            "AI financial insights",
            "PDF export functionality"
          ]
        },
        {
          "@type": "Organization",
          "name": "House Budget Calculator",
          "url": "https://www.housebudgetcalculator.com",
          "logo": "https://www.housebudgetcalculator.com/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png",
          "description": "Free financial planning tools for household budget management",
          "sameAs": []
        }
      ]
    }
  },

  monthlyBudget: {
    title: "Free Monthly Budget Calculator - Track Income & Expenses Online",
    description: "Plan your household finances with our free monthly budget calculator. Track income, expenses, and calculate net budget for individuals, families, and roommates. Save money and build better financial habits.",
    keywords: "budget calculator, monthly budget, expense tracker, household finances, financial planning, money management, income calculator",
    canonical: "https://www.housebudgetcalculator.com/budget",
    ogImage: "https://www.housebudgetcalculator.com/assets/calculator-use-preview.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Create a Monthly Budget",
      "description": "Track your household income and expenses with our free budget calculator",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Enter Your Income",
          "text": "Input all sources of monthly income including salary, freelance work, and other earnings"
        },
        {
          "@type": "HowToStep",
          "name": "List Your Expenses",
          "text": "Add all monthly expenses across categories like housing, utilities, groceries, and entertainment"
        },
        {
          "@type": "HowToStep",
          "name": "Calculate Net Budget",
          "text": "Review your net balance and adjust spending to meet your financial goals"
        }
      ],
      "totalTime": "PT15M"
    }
  },
  
  compareVendors: {
    title: "Vendor Quote Comparison Tool - Compare Prices & Services",
    description: "Compare vendor quotes easily with our free comparison tool. Evaluate prices, services, financing options, and contractor reliability. Make informed decisions for home improvements and services.",
    keywords: "vendor comparison, quote comparison, contractor quotes, price comparison tool, home improvement quotes, service comparison",
    canonical: "https://www.housebudgetcalculator.com/compare-prices",
    ogImage: "https://www.housebudgetcalculator.com/assets/vendor-compare-preview.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Compare Vendor Quotes",
      "description": "Compare contractor quotes and find the best value for your projects",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Create a Project",
          "text": "Start by naming your project (e.g., Kitchen Remodel, Roof Repair)"
        },
        {
          "@type": "HowToStep",
          "name": "Add Vendor Quotes",
          "text": "Enter quotes from different contractors including price, timeline, and services"
        },
        {
          "@type": "HowToStep",
          "name": "Compare and Choose",
          "text": "Review ratings, financing options, and total costs to select the best vendor"
        }
      ],
      "totalTime": "PT10M"
    }
  },
  
  takeoutCalendar: {
    title: "Takeout & Dining Expense Tracker - Monthly Food Budget Calendar",
    description: "Track your takeout and dining expenses with our interactive calendar. Monitor daily food spending, identify patterns, and optimize your dining budget with visual charts and analytics.",
    keywords: "takeout tracker, dining expenses, food budget, restaurant spending, daily expense tracker, dining budget calculator",
    canonical: "https://www.housebudgetcalculator.com/savings",
    ogImage: "https://www.housebudgetcalculator.com/assets/savings-goal-preview.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Takeout Expense Calendar",
      "description": "Track daily takeout and dining expenses",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  },
  
  vacation: {
    title: "Vacation Planning & Budget Comparison Tool - Travel Cost Calculator",
    description: "Plan your perfect vacation with our comparison tool. Compare destinations, travel costs, accommodations, and experiences. Evaluate options and make informed travel decisions within budget.",
    keywords: "vacation planner, travel budget calculator, vacation comparison, travel cost estimator, trip planning tool, destination comparison",
    canonical: "https://www.housebudgetcalculator.com/vacation",
    ogImage: "https://www.housebudgetcalculator.com/assets/vacation-page-preview.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Plan and Budget Your Vacation",
      "description": "Compare vacation destinations and plan trips within your budget",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Create Vacation Plan",
          "text": "Name your trip and set your travel dates"
        },
        {
          "@type": "HowToStep",
          "name": "Add Destination Options",
          "text": "Compare multiple destinations with costs for transportation, lodging, and activities"
        },
        {
          "@type": "HowToStep",
          "name": "Choose Best Option",
          "text": "Review total costs and select the destination that fits your budget and preferences"
        }
      ],
      "totalTime": "PT20M"
    }
  },
  
  gifts: {
    title: "Gift Lists & Budget Tracker - Organize Gifts for Every Occasion",
    description: "Plan and organize gift lists for holidays, birthdays, and special occasions. Track your gift budget, manage ideas, and never miss an important celebration. Free gift planning tool.",
    keywords: "gift list, gift planner, holiday gifts, birthday gifts, gift budget tracker, gift ideas organizer, occasion planning",
    canonical: "https://www.housebudgetcalculator.com/gifts",
    ogImage: "https://www.housebudgetcalculator.com/assets/gift-page-preview.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Organize Gift Lists and Budget",
      "description": "Organize gifts for every occasion and stay within your budget",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Create Gift Lists",
          "text": "Set up separate lists for different occasions like holidays, birthdays, anniversaries"
        },
        {
          "@type": "HowToStep",
          "name": "Add Gift Ideas",
          "text": "Record gift ideas with estimated prices and recipient details"
        },
        {
          "@type": "HowToStep",
          "name": "Track Your Budget",
          "text": "Monitor total spending and stay within your gift budget for each occasion"
        }
      ],
      "totalTime": "PT15M"
    }
  },

  aiInsights: {
    title: "AI Financial Advisor - Get Personalized Budget Insights",
    description: "Get AI-powered financial advice tailored to your budget. Analyze spending patterns, receive expert insights, and optimize your finances with our intelligent financial advisor.",
    keywords: "AI financial advisor, budget insights, personal finance AI, money management AI, financial optimization, smart budgeting assistant",
    canonical: "https://www.housebudgetcalculator.com/ai-insights",
    ogImage: "https://www.housebudgetcalculator.com/assets/ai-page-preview.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "AI Financial Advisor",
      "applicationCategory": "FinanceApplication",
      "description": "AI-powered financial insights and personalized budget advice",
      "offers": {
        "@type": "Offer",
        "price": "9.99",
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "9.99",
          "priceCurrency": "USD",
          "billingDuration": "P1M"
        }
      },
      "featureList": [
        "Personalized financial advice",
        "Budget analysis and optimization",
        "Spending pattern insights",
        "Savings recommendations",
        "AI-powered chatbot assistant"
      ]
    }
  },

  marketplace: {
    title: "Community Marketplace - Find Local Vendors, Vacation Rentals & Handmade Gifts",
    description: "Discover trusted local vendors, unique vacation rentals, and handmade gifts from our community. Browse listings, compare options, and connect with sellers for your next project or purchase.",
    keywords: "community marketplace, local vendors, vacation rentals, handmade gifts, contractor directory, artisan marketplace, local services",
    canonical: "https://www.housebudgetcalculator.com/marketplace",
    ogImage: "https://www.housebudgetcalculator.com/assets/marketplace-page-preview.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Community Marketplace",
      "description": "Browse community marketplace for vendors, vacation rentals, and handmade gifts",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.housebudgetcalculator.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Marketplace",
            "item": "https://www.housebudgetcalculator.com/marketplace"
          }
        ]
      }
    }
  },

  savingsGoals: {
    title: "Savings Goals Tracker - Track Monthly Savings Progress",
    description: "Set financial goals and track your monthly savings progress. Visual progress tracking, goal milestones, and monthly contribution monitoring to help you reach your financial targets.",
    keywords: "savings tracker, savings goals, financial goals, monthly savings, goal tracker, financial planning, savings progress",
    canonical: "https://www.housebudgetcalculator.com/savings",
    ogImage: "https://www.housebudgetcalculator.com/assets/savings-goal-preview.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Track Savings Goals",
      "description": "Set and track your financial savings goals monthly",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Set Your Goal",
          "text": "Create a savings goal with a target amount and deadline"
        },
        {
          "@type": "HowToStep",
          "name": "Track Monthly Progress",
          "text": "Enter your monthly savings contributions throughout the year"
        },
        {
          "@type": "HowToStep",
          "name": "Monitor Achievement",
          "text": "View your progress percentage and adjust contributions to meet your target"
        }
      ],
      "totalTime": "PT10M"
    }
  },

  blog: {
    title: "Financial Blog - Money Management Tips & Budget Advice",
    description: "Expert articles on budgeting, saving money, and financial planning. Learn practical tips, strategies, and insights to improve your financial health and achieve your money goals.",
    keywords: "financial blog, budgeting tips, money management, savings advice, financial planning, personal finance articles",
    canonical: "https://www.housebudgetcalculator.com/blog",
    ogImage: "https://www.housebudgetcalculator.com/assets/calculator-use-preview.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "House Budget Calculator Financial Blog",
      "description": "Expert financial tips and budgeting advice"
    }
  }
};