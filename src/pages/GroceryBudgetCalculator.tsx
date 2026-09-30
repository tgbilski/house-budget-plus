import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ShoppingCart, Check, Download, ChevronDown } from "lucide-react";
import { trackEvent } from "@/utils/analytics";
import mascot from "@/assets/calculator-mascot.png";

// USDA Food Plans monthly cost per person (approx. 2026 averages, USD)
const PLANS = {
  thrifty: { label: "Thrifty", adult: 310, child: 230 },
  low: { label: "Low-cost", adult: 360, child: 270 },
  moderate: { label: "Moderate", adult: 450, child: 330 },
  liberal: { label: "Liberal", adult: 560, child: 400 },
} as const;
type PlanKey = keyof typeof PLANS;

import { supabase } from "@/integrations/supabase/client";

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const faqs = [
  { q: "How much should I spend on groceries per month?", a: "Based on USDA food plans, one adult spends roughly $310–$560/month depending on how thrifty or generous the plan is. A family of four on a moderate plan spends about $1,500/month." },
  { q: "What percentage of income should go to groceries?", a: "Most budgeting guides suggest 10–15% of take-home pay. If you're above 15%, meal planning and store brands are the fastest wins." },
  { q: "Is $400 a month enough for groceries?", a: "For one adult, yes — $400 covers a low-cost to moderate USDA plan with room to spare. For a couple it's tight but doable on a thrifty plan with meal planning. For a family of four, $400 is well below even the thrifty USDA estimate, so it would require heavy reliance on bulk staples, sales, and cooking from scratch." },
  { q: "How much should a family of 4 spend on groceries?", a: "Using 2026 USDA Food Plan estimates, a family of four (two adults, two kids) spends roughly $1,080/month on a thrifty plan, $1,260 on low-cost, $1,560 on moderate, and $1,920 on a liberal plan. Most families land in the low-cost to moderate range." },
  { q: "How can I lower my grocery bill?", a: "The biggest wins: plan meals around weekly sales, buy store brands (typically 20–30% cheaper), cook from scratch instead of buying pre-made, shop with a list to avoid impulse buys, and compare price-per-unit rather than package price. Tracking your spending for one month usually reveals $50–$150 in easy savings." },
  { q: "How is this grocery budget calculated?", a: "We use USDA Food Plan cost estimates per adult and child, then compare the total to your monthly take-home income." },
];

// Average monthly grocery cost by household size (USDA 2026 estimates, low-cost plan)
const householdTable = [
  { size: "1 person", thrifty: 310, low: 360, moderate: 450, liberal: 560 },
  { size: "2 people", thrifty: 620, low: 720, moderate: 900, liberal: 1120 },
  { size: "3 people", thrifty: 850, low: 990, moderate: 1230, liberal: 1520 },
  { size: "4 people", thrifty: 1080, low: 1260, moderate: 1560, liberal: 1920 },
  { size: "5 people", thrifty: 1310, low: 1530, moderate: 1890, liberal: 2320 },
  { size: "6 people", thrifty: 1540, low: 1800, moderate: 2220, liberal: 2720 },
];

export default function GroceryBudgetCalculator() {
  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(0);
  const [income, setIncome] = useState(5000);
  const [plan, setPlan] = useState<PlanKey>("low");

  const { total, pct, weekly } = useMemo(() => {
    const p = PLANS[plan];
    const total = adults * p.adult + kids * p.child;
    return { total, weekly: total / 4.33, pct: income > 0 ? (total / income) * 100 : 0 };
  }, [adults, kids, income, plan]);

  const verdict = pct <= 10 ? "Right on track" : pct <= 15 ? "Typical range" : "Room to save";

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const buy = async () => {
    trackEvent("template_checkout_click", { price: 5 });
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-template-checkout");
      if (error || !data?.url) throw new Error(data?.error || error?.message || "Checkout failed");
      window.location.href = data.url;
    } catch (e) {
      console.error("Checkout error:", e);
      setCheckoutLoading(false);
    }
  };

  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-6 md:py-10 space-y-6 md:space-y-10 relative z-10">
      <Helmet>
        <title>Grocery Budget Calculator (2026) — How Much Should You Spend on Groceries?</title>
        <meta name="description" content="Free grocery budget calculator based on USDA Food Plans. Enter your household size and income to see how much you should spend on groceries per month and per week — no sign-up required." />
        <link rel="canonical" href="https://www.housebudgetcalculator.com/" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <header className="text-center space-y-3 md:space-y-4 pt-2 md:pt-0">
        <img
          src={mascot}
          alt="Grocery budget calculator mascot"
          className="w-20 h-20 md:w-28 md:h-28 mx-auto rounded-full"
          width={112}
          height={112}
        />
        <h1 className="text-2xl md:text-5xl font-bold text-foreground leading-tight">Grocery Budget Calculator</h1>
        <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
          Find out how much your family should spend on groceries each month — free, no sign-up.
        </p>
        <a
          href="#calculator"
          className="inline-flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors pt-1"
          aria-label="Scroll down to the calculator"
        >
          <span className="text-xs font-medium tracking-wide uppercase">Start calculating</span>
          <ChevronDown className="h-6 w-6 animate-scroll-bounce" />
        </a>
      </header>

      <Card id="calculator" className="p-4 md:p-6 space-y-5 md:space-y-6 scroll-mt-4">
        <h2 className="text-lg md:text-xl font-bold text-foreground text-center">How much should you spend on groceries?</h2>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div><Label htmlFor="adults">Adults</Label><Input id="adults" type="number" min={1} value={adults} onChange={e => setAdults(Math.max(0, +e.target.value))} /></div>
          <div><Label htmlFor="kids">Kids</Label><Input id="kids" type="number" min={0} value={kids} onChange={e => setKids(Math.max(0, +e.target.value))} /></div>
        </div>
        <div>
          <Label htmlFor="income">Monthly take-home income</Label>
          <Input id="income" type="number" min={0} value={income} onChange={e => setIncome(Math.max(0, +e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label>Spending style</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(Object.keys(PLANS) as PlanKey[]).map(k => (
              <Button key={k} type="button" variant={plan === k ? "default" : "outline"} onClick={() => setPlan(k)}>{PLANS[k].label}</Button>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-accent p-4 md:p-6 text-center space-y-1">
          <p className="text-sm text-accent-foreground">Your monthly grocery budget</p>
          <p className="text-4xl md:text-5xl font-bold text-foreground">{fmt(total)}</p>
          <p className="text-sm md:text-base text-muted-foreground">{fmt(weekly)}/week · {pct.toFixed(1)}% of income · <strong>{verdict}</strong></p>
        </div>
      </Card>

      <Card className="p-6 md:p-8 border-2 border-primary space-y-4">
        <div className="flex items-center gap-3">
          <ShoppingCart className="h-8 w-8 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Stick to {fmt(total)} every month</h2>
        </div>
        <p className="text-muted-foreground">The Grocery Budget Tracker spreadsheet does the tracking for you — one-time $5, yours forever.</p>
        <ul className="space-y-2">
          {["12-month tracker with auto totals", "Weekly meal planner + shopping list", "Price-per-unit comparison sheet", "Works in Google Sheets & Excel"].map(f => (
            <li key={f} className="flex gap-2 text-foreground"><Check className="h-5 w-5 text-success shrink-0" />{f}</li>
          ))}
        </ul>
        <Button size="lg" className="w-full text-lg" onClick={buy} disabled={checkoutLoading}>
          <Download className="h-5 w-5 mr-2" />
          {checkoutLoading ? "Redirecting to checkout…" : "Get the template — $5"}
        </Button>
        <p className="text-xs text-center text-muted-foreground">One-time payment. No subscription. Instant download.</p>
        <p className="text-xs text-center text-muted-foreground">
          Already bought it? <Link to="/purchase-success" className="underline">Recover your download</Link>
        </p>
      </Card>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Grocery budget FAQ</h2>
        {faqs.map(f => (
          <div key={f.q}><h3 className="font-semibold text-foreground">{f.q}</h3><p className="text-muted-foreground leading-relaxed">{f.a}</p></div>
        ))}
      </section>
    </div>
  );
}
