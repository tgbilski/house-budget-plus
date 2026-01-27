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
    title: "Free Budget Calculator | Adulting Your Money Made Simple",
    description: "Finally figure out where your paycheck disappears to. Free budget calculator for first apartments, roommate splitting, side hustles & more. No bank account needed — just start adulting your finances.",
    keywords: "adulting budget, first apartment budget calculator, millennial budget planner, gen z money tracker, roommate expense splitter, side hustle income tracker, paycheck budget, budget without spreadsheet, simple budget app, budget for beginners",
    canonical: "https://www.housebudgetcalculator.com",
    ogImage: "https://www.housebudgetcalculator.com/assets/calculator-use-preview.png",
    structuredData: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          "name": "House Budget Calculator",
          "url": "https://www.housebudgetcalculator.com",
          "description": "Free budget calculator for millennials and Gen Z — track your paycheck, split expenses with roommates, and manage side hustle income",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "All",
          "browserRequirements": "Requires JavaScript",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "featureList": [
            "First apartment budget calculator",
            "Roommate expense splitting",
            "Side hustle income tracking",
            "Visual budget breakdown charts",
            "No bank account linking required",
            "Savings goals tracker",
            "Gift list organizer for holidays",
            "Vacation budget planner"
          ],
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "150"
          }
        },
        {
          "@type": "Organization",
          "name": "House Budget Calculator",
          "url": "https://www.housebudgetcalculator.com",
          "logo": "https://www.housebudgetcalculator.com/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png",
          "description": "Free budget tools for millennials and Gen Z to adult their finances"
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is the budget calculator really free?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our budget calculator is completely free with no signup required. Perfect for first-time budgeters, roommates, and anyone with a side hustle. Premium AI features are available for $4.99/month."
              }
            },
            {
              "@type": "Question",
              "name": "Do I need to connect my bank account?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No bank account linking required! Just enter your income and expenses manually. We keep it simple — no complicated setup or scary permissions."
              }
            },
            {
              "@type": "Question",
              "name": "Can I split expenses with roommates?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! Premium users can share budgets with roommates or partners for easy expense splitting. Perfect for first apartments and couples merging finances."
              }
            },
            {
              "@type": "Question",
              "name": "How do I budget with variable income from gig work?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Our expense tracker works great for freelancers and gig workers. Track income from multiple sources and see your actual spending patterns without rigid budget templates."
              }
            }
          ]
        }
      ]
    }
  },

  monthlyBudget: {
    title: "Free Budget Calculator | Adulting Your Money Made Simple",
    description: "Finally figure out where your paycheck disappears to. Free budget calculator for first apartments, roommate splitting, side hustles & student loan payoff. No bank account needed — start adulting your finances.",
    keywords: "adulting budget, first apartment budget calculator, millennial budget planner, gen z money tracker, roommate expense splitter, paycheck budget, budget without spreadsheet, budget for beginners, simple budget no bank",
    canonical: "https://www.housebudgetcalculator.com/budget",
    ogImage: "https://www.housebudgetcalculator.com/assets/calculator-use-preview.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Adult Your Monthly Budget",
      "description": "Track your paycheck and expenses with our free budget calculator — no spreadsheets required",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Enter Your Income",
          "text": "Input your paycheck, side hustle earnings, freelance gigs, and any other income sources"
        },
        {
          "@type": "HowToStep",
          "name": "List Your Expenses",
          "text": "Add rent, utilities, subscriptions, groceries, and all those little purchases that add up"
        },
        {
          "@type": "HowToStep",
          "name": "See Where Your Money Goes",
          "text": "Get a visual breakdown of your spending and figure out how to save more"
        }
      ],
      "totalTime": "PT10M"
    }
  },
  
  expenses: {
    title: "Expense Tracker | Track Spending Without Linking Your Bank",
    description: "Know exactly where your money went without connecting your bank or using spreadsheets. Perfect for freelancers, gig workers, and anyone with variable income who needs flexible expense tracking.",
    keywords: "expense tracker no bank, freelancer expense tracker, gig worker budget, variable income tracker, simple spending tracker, side hustle income tracker, millennial expense app, expense log app",
    canonical: "https://www.housebudgetcalculator.com/expenses",
    ogImage: "https://www.housebudgetcalculator.com/assets/expenses-page-preview-new.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Expense Tracker",
      "description": "Track daily expenses without bank linking — perfect for freelancers and gig workers",
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
    title: "Vacation Budget Planner | Compare Trip Costs Before You Book",
    description: "Compare vacation options side-by-side so you can actually afford that trip. Budget backpacking adventures, group trips, or your first real vacation as an adult. See the true cost before you book.",
    keywords: "budget backpacking trip planner, cheap vacation calculator, trip cost comparison, group trip budget, girls trip planner, first vacation budget, travel on a budget, millennial travel planner, vacation cost estimator",
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
          "text": "Name your trip — backpacking Europe, girls trip, or wherever you're dreaming about"
        },
        {
          "@type": "HowToStep",
          "name": "Add Destination Options",
          "text": "Compare multiple destinations with costs for flights, hotels, and activities"
        },
        {
          "@type": "HowToStep",
          "name": "Choose Best Option",
          "text": "See total costs side-by-side and pick what fits your budget"
        }
      ],
      "totalTime": "PT15M"
    }
  },
  
  gifts: {
    title: "Gift List Organizer | Gift Giving Without Going Broke",
    description: "Keep track of gift ideas year-round so you're not panic-buying at the last minute. Manage holiday lists, birthday presents, and special occasions without blowing your budget.",
    keywords: "gift list organizer, holiday budget tracker, birthday gift planner, cheap gift ideas, gift giving on a budget, present tracker app, millennial gift planner, affordable gift list, gift tracker",
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
          "text": "Set up separate lists for holidays, birthdays, and special occasions"
        },
        {
          "@type": "HowToStep",
          "name": "Add Gift Ideas",
          "text": "Save ideas with prices and links throughout the year"
        },
        {
          "@type": "HowToStep",
          "name": "Track Your Budget",
          "text": "Monitor total spending and never overspend on gifts again"
        }
      ],
      "totalTime": "PT10M"
    }
  },

  aiInsights: {
    title: "AI Budget Advisor | Get Money Tips That Actually Make Sense",
    description: "Get AI-powered financial advice that understands your lifestyle — not your parents' finances. Personalized insights to help you save more and stress less about money.",
    keywords: "AI financial advisor, budget insights, personal finance AI, money management AI, millennial money advice, smart budgeting assistant, AI savings tips",
    canonical: "https://www.housebudgetcalculator.com/ai-insights",
    ogImage: "https://www.housebudgetcalculator.com/assets/ai-page-preview.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "AI Budget Advisor",
      "applicationCategory": "FinanceApplication",
      "description": "AI-powered money advice tailored to your spending habits and lifestyle",
      "offers": {
        "@type": "Offer",
        "price": "4.99",
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "4.99",
          "priceCurrency": "USD",
          "billingDuration": "P1M"
        }
      },
      "featureList": [
        "Personalized savings recommendations",
        "Spending pattern analysis",
        "Voice expense tracking",
        "Budget optimization tips",
        "AI-powered chatbot assistant"
      ]
    }
  },

  marketplace: {
    title: "Community Marketplace | Find Local Vendors & Handmade Gifts",
    description: "Discover trusted local vendors, unique vacation rentals, and handmade gifts from our community. Support small businesses and find unique options for your next project or purchase.",
    keywords: "community marketplace, local vendors, handmade gifts, artisan marketplace, local services, small business directory, unique gifts, local contractors",
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
    title: "Savings Goal Tracker | Save for What Actually Matters",
    description: "Stop feeling guilty about every purchase and start saving for things you actually want — apartment deposits, engagement rings, travel, or a quit-your-job fund. Visual progress tracking keeps you motivated.",
    keywords: "save for apartment deposit, first emergency fund, save for engagement ring, travel savings tracker, millennial savings goals, gen z savings app, quit job fund, adulting savings, savings goal tracker",
    canonical: "https://www.housebudgetcalculator.com/savings",
    ogImage: "https://www.housebudgetcalculator.com/assets/savings-goal-preview.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Track Your Savings Goals",
      "description": "Set and track your savings goals for apartment deposits, travel, emergencies, and more",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Set Your Goal",
          "text": "Create a savings goal — apartment deposit, vacation, emergency fund, or anything you're working toward"
        },
        {
          "@type": "HowToStep",
          "name": "Track Monthly Progress",
          "text": "Log your monthly contributions and watch your progress grow"
        },
        {
          "@type": "HowToStep",
          "name": "Stay Motivated",
          "text": "Visual charts show how close you are to achieving your goal"
        }
      ],
      "totalTime": "PT5M"
    }
  },

  blog: {
    title: "Money Blog | Budgeting Tips for Real Life",
    description: "Practical money tips that actually make sense for millennials and Gen Z. Learn to budget your first apartment, manage side hustle income, save for what matters, and adult your finances.",
    keywords: "millennial money tips, gen z budget advice, first apartment budget, side hustle finances, adulting money blog, budget tips for beginners, saving money advice",
    canonical: "https://www.housebudgetcalculator.com/blog",
    ogImage: "https://www.housebudgetcalculator.com/assets/calculator-use-preview.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "House Budget Calculator Money Blog",
      "description": "Practical budgeting tips for millennials and Gen Z"
    }
  }
};