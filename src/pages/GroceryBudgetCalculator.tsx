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
        <p className="text-muted-foreground">The Grocery Budget Tracker spreadsheet does the tracking for you — one-time payment, yours forever.</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-lg text-muted-foreground line-through">$10</span>
          <span className="text-3xl font-bold text-foreground">$5</span>
          <span className="rounded-full bg-success/15 text-success text-xs font-bold px-3 py-1 uppercase tracking-wide">50% off</span>
        </div>
        <ul className="space-y-2">
          {["12-month tracker with auto totals", "Weekly meal planner + shopping list", "Price-per-unit comparison sheet", "Works in Google Sheets & Excel"].map(f => (
            <li key={f} className="flex gap-2 text-foreground"><Check className="h-5 w-5 text-success shrink-0" />{f}</li>
          ))}
        </ul>
        <Button size="lg" className="w-full text-lg whitespace-nowrap" onClick={buy} disabled={checkoutLoading}>
          <Download className="h-5 w-5 mr-2 shrink-0" />
          {checkoutLoading ? "Opening checkout…" : "Get the template"}
        </Button>
        <p className="text-xs text-center text-muted-foreground">One-time payment. No subscription. Instant download.</p>
        <p className="text-xs text-center text-muted-foreground">
          Already bought it? <Link to="/purchase-success" className="underline">Recover your download</Link>
        </p>
      </Card>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Average grocery cost per month by household size</h2>
        <p className="text-muted-foreground leading-relaxed">
          The USDA publishes four official food plans — Thrifty, Low-cost, Moderate, and Liberal — based on what
          American households actually spend on groceries. Here's what each plan costs per month in 2026:
        </p>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-xs md:text-sm">
            <thead>
              <tr className="bg-accent text-accent-foreground">
                <th className="text-left p-1.5 md:p-3 font-semibold">Household</th>
                <th className="text-right p-1.5 md:p-3 font-semibold">Thrifty</th>
                <th className="text-right p-1.5 md:p-3 font-semibold">Low-cost</th>
                <th className="text-right p-1.5 md:p-3 font-semibold">Moderate</th>
                <th className="text-right p-1.5 md:p-3 font-semibold">Liberal</th>
              </tr>
            </thead>
            <tbody>
              {householdTable.map((row, i) => (
                <tr key={row.size} className={i % 2 === 0 ? "bg-card" : "bg-muted/50"}>
                  <td className="p-1.5 md:p-3 font-medium text-foreground whitespace-nowrap">{row.size}</td>
                  <td className="p-1.5 md:p-3 text-right text-muted-foreground">{fmt(row.thrifty)}</td>
                  <td className="p-1.5 md:p-3 text-right text-muted-foreground">{fmt(row.low)}</td>
                  <td className="p-1.5 md:p-3 text-right text-muted-foreground">{fmt(row.moderate)}</td>
                  <td className="p-1.5 md:p-3 text-right text-muted-foreground">{fmt(row.liberal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Estimates assume two adults plus children for households of 3+. The Thrifty plan is the basis for SNAP
          benefit calculations; most families land between Low-cost and Moderate. Your actual spending will vary
          by region, dietary needs, and where you shop.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">How to calculate your grocery budget</h2>
        <ol className="space-y-4">
          {[
            { title: "Start with your household size", body: "More people means more food, but the cost per person drops as your household grows — buying in bulk and cooking larger batches is more efficient. Use the table above or the calculator to get your baseline." },
            { title: "Pick a spending style that matches your life", body: "Be honest here. If you cook most meals from scratch and shop sales, Thrifty or Low-cost is realistic. If you buy convenience foods, organic products, or name brands, plan for Moderate or Liberal." },
            { title: "Check it against your income", body: "Your grocery budget should be roughly 10–15% of your take-home pay. If the number you calculated is higher, that's a signal to adjust your spending style — not to feel guilty." },
            { title: "Track it for one month", body: "A budget only works if you compare it to reality. Save your receipts or use a tracker (like our $5 spreadsheet) to see where you actually land. Most people find $50–$150 in savings the first month just by paying attention." },
            { title: "Adjust monthly, not daily", body: "Groceries fluctuate week to week. Judge yourself on the monthly total, not one expensive Costco run." },
          ].map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">{i + 1}</span>
              <div>
                <h3 className="font-semibold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Grocery budget FAQ</h2>
        {faqs.map(f => (
          <div key={f.q}><h3 className="font-semibold text-foreground">{f.q}</h3><p className="text-muted-foreground leading-relaxed">{f.a}</p></div>
        ))}
      </section>
    </div>
  );
}
