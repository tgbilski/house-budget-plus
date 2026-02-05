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
    title: "Free Monthly Budget Calculator | Home Budget Made Simple",
    description: "Free monthly budget calculator — see exactly where your paycheck goes in 5 minutes. No bank linking, no spreadsheets. Track household income, split rent with roommates, and finally adult your finances.",
    keywords: "monthly budget calculator free, home budget calculator, household budget calculator, free budgeting calculator, calculate monthly living expenses, house expenses calculator, living budget calculator, living expenses budget calculator, simple budget app",
    canonical: "https://www.housebudgetcalculator.com",
    ogImage: "https://www.housebudgetcalculator.com/assets/calculator-use-preview.png",
    structuredData: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          "name": "House Budget Calculator",
          "url": "https://www.housebudgetcalculator.com",
        "description": "Free monthly budget calculator for households — track your paycheck, manage home expenses, split rent with roommates, and see where your money actually goes",
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
          "ratingValue": "4.9",
          "ratingCount": "247"
          }
        },
        {
          "@type": "Organization",
          "name": "House Budget Calculator",
          "url": "https://www.housebudgetcalculator.com",
          "logo": "https://www.housebudgetcalculator.com/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png",
        "description": "Free monthly home budget calculator trusted by thousands of households"
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is the budget calculator really free?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! Our monthly budget calculator is 100% free with no signup required. Start budgeting in under 5 minutes. Premium AI features are available for just $4.99/month."
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
    title: "Free Monthly Budget Calculator | Track Your Paycheck in Minutes",
    description: "Free monthly budget calculator — input your income, add expenses, and instantly see where your money goes. No bank account linking. Perfect for households, roommates, and first-time budgeters.",
    keywords: "monthly budget calculator free, home budget calculator, household budget calculator, free budgeting calculator, calculate monthly living expenses, living expenses budget calculator, house expenses calculator, living budget calculator, paycheck budget calculator",
    canonical: "https://www.housebudgetcalculator.com/budget",
    ogImage: "https://www.housebudgetcalculator.com/assets/calculator-use-preview.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Create Your Monthly Budget",
      "description": "Free monthly budget calculator — track your household income and expenses in under 5 minutes",
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
    description: "Free expense tracker — log purchases in seconds without bank linking. See monthly spending breakdowns and find out where your money actually goes. Perfect for freelancers and gig workers.",
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
    title: "Vacation Savings Calculator | Plan & Budget Your Trip",
    description: "Free vacation budget calculator — compare trip costs side-by-side and see the true total before you book. Plan flights, hotels, activities, and know exactly what your vacation will cost.",
    keywords: "vacation savings calculator, vacation budget planner, trip cost calculator, vacation cost estimator, travel budget calculator, how much will my vacation cost, trip planning calculator, holiday budget planner, vacation expense tracker",
    canonical: "https://www.housebudgetcalculator.com/vacation",
    ogImage: "https://www.housebudgetcalculator.com/assets/vacation-page-preview.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Budget for Your Vacation",
      "description": "Free vacation budget calculator — plan your trip costs and compare destinations before you book",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Create Your Trip",
          "text": "Name your vacation and start adding destination options to compare"
        },
        {
          "@type": "HowToStep",
          "name": "Add Travel Costs",
          "text": "Enter costs for flights, hotels, car rentals, and activities for each option"
        },
        {
          "@type": "HowToStep",
          "name": "Compare Total Costs",
          "text": "See the true total cost of each trip option side-by-side and choose what fits your budget"
        }
      ],
      "totalTime": "PT15M"
    }
  },
  
  gifts: {
    title: "Gift List Organizer | Track Holiday & Birthday Gift Budgets",
    description: "Free gift list organizer — save gift ideas, track spending, and stay on budget for holidays and birthdays. Never panic-buy or overspend again. Estimate total gift costs before you shop.",
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
    title: "Savings Goal Tracker | Free Visual Savings Calculator",
    description: "Free savings goal tracker — set a target, log monthly contributions, and watch your progress grow. Perfect for apartment deposits, emergency funds, vacations, or any goal you're saving toward.",
    keywords: "savings goal tracker, saving for a vacation calculator, savings calculator free, emergency fund tracker, how much should I save, savings progress tracker, visual savings goal, monthly savings planner, first savings goal",
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