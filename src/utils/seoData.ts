export interface SEOData {
  title: string;
  description: string;
  keywords: string;
  structuredData?: any;
}

export const seoData: Record<string, SEOData> = {
  home: {
    title: "House Budget Calculator - Free Financial Planning Tools Suite",
    description: "Comprehensive suite of free financial tools including budget calculator, vendor comparison, expense tracking, vacation planning, and AI insights. Master your household finances today.",
    keywords: "house budget calculator, financial planning tools, budget tracker, expense calculator, vendor comparison, financial management, household budget",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "House Budget Calculator",
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
    }
  },

  monthlyBudget: {
    title: "Free Monthly Budget Calculator - Track Income & Expenses Online",
    description: "Plan your household finances with our free monthly budget calculator. Track income, expenses, and calculate net budget for individuals, families, and roommates. Save money and build better financial habits.",
    keywords: "budget calculator, monthly budget, expense tracker, household finances, financial planning, money management, income calculator",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Monthly Budget Calculator",
      "description": "Free online tool to calculate monthly budget, track income and expenses",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Track monthly income and expenses",
        "Multiple household members support",
        "Real-time budget calculations",
        "Custom expense categories",
        "PDF export functionality"
      ]
    }
  },
  
  compareVendors: {
    title: "Vendor Quote Comparison Tool - Compare Prices & Services",
    description: "Compare vendor quotes easily with our free comparison tool. Evaluate prices, services, financing options, and contractor reliability. Make informed decisions for home improvements and services.",
    keywords: "vendor comparison, quote comparison, contractor quotes, price comparison tool, home improvement quotes, service comparison",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Vendor Quote Comparison Tool",
      "description": "Compare vendor quotes and evaluate contractors",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  },
  
  takeoutCalendar: {
    title: "Takeout & Dining Expense Tracker - Monthly Food Budget Calendar",
    description: "Track your takeout and dining expenses with our interactive calendar. Monitor daily food spending, identify patterns, and optimize your dining budget with visual charts and analytics.",
    keywords: "takeout tracker, dining expenses, food budget, restaurant spending, daily expense tracker, dining budget calculator",
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
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Vacation Planning Tool",
      "description": "Compare vacation options and plan travel budgets",
      "applicationCategory": "TravelApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  }
};