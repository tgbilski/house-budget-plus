import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlannerModeSwitch } from "@/components/PlannerModeSwitch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ShoppingCart, Check, Download, ChevronDown, Link2 } from "lucide-react";
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

const shareUrl = "https://www.housebudgetcalculator.com/";
const shareText = "Grocery budgeting just got easier! 🛒 Find a monthly and weekly target for your household with this free USDA-based calculator. No sign-up needed.";
const shareLinks = [
  { name: "Facebook", icon: "facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
  { name: "X", icon: "x", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}` },
  { name: "Pinterest", icon: "pinterest", href: `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent("https://www.housebudgetcalculator.com/social/grocery-calculator-homepage.png")}&description=${encodeURIComponent(shareText)}` },
  { name: "WhatsApp", icon: "whatsapp", href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}` },
];

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

type Variant = "grocery" | "fodmap";
const VARIANTS = {
  grocery: {
    path: "/", planner: "/planner", canonical: "https://www.housebudgetcalculator.com/",
    helmetTitle: "", helmetDescription: "",
    kicker: "Grocery adulting, made easy", h1: "Grocery Budget Calculator",
    sub: "Other calculators give you a number. Ours gives you the number, the meal plan, and the grocery list to match — free, no sign-up.",
    offerTitle: "Turn {total} into a week of meals",
    offer: "The Meal Planner & Grocery List tool picks your meals, builds your shopping list, and keeps it inside your budget — one-time payment, 90 days of access.",
    features: ["45+ budget meals with estimated ingredient costs", "Add your own meals too", "Auto grocery list, grouped by store section", "Live total vs. your weekly budget", "Bonus: 12-month budget spreadsheet"],
    cta: "Get the meal planner",
  },
  fodmap: {
    path: "/low-fodmap-grocery-budget-calculator", planner: "/low-fodmap-planner", canonical: "https://www.housebudgetcalculator.com/low-fodmap-grocery-budget-calculator",
    helmetTitle: "Low-FODMAP Grocery Budget Calculator (2026) | House Budget Calculator",
    helmetDescription: "Find your monthly grocery budget, then plan low-FODMAP meals and get a gut-friendly grocery list that fits it. No onion, no garlic, no guesswork. Free, no sign-up.",
    kicker: "Gut-friendly grocery adulting", h1: "Low-FODMAP Grocery Budget Calculator",
    sub: "Find your grocery number, then get a low-FODMAP meal plan and grocery list to match — no onion, no garlic, no guesswork. Free, no sign-up.",
    offerTitle: "Turn {total} into a week of low-FODMAP meals",
    offer: "The Low-FODMAP Meal Planner picks gut-friendly meals, builds your shopping list, and keeps it inside your budget — one-time payment, 90 days of access.",
    features: ["30+ FODMAP-safe meals with estimated ingredient costs", "Add your own safe meals too", "Auto grocery list, grouped by store section", "Live total vs. your weekly budget", "No onion, no garlic, lactose-smart"],
    cta: "Get the low-FODMAP planner",
  },
} as const;

export default function GroceryBudgetCalculator({ variant = "grocery" }: { variant?: Variant }) {
  const v = VARIANTS[variant];
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
  const [copied, setCopied] = useState(false);

  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      const field = document.createElement("textarea");
      field.value = `${shareText} ${shareUrl}`;
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      const success = document.execCommand("copy");
      field.remove();
      setCopied(success);
      if (success) window.setTimeout(() => setCopied(false), 2500);
    }
  };

  const buy = async () => {
    trackEvent("template_checkout_click", { price: 5, product: variant });
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-template-checkout", { body: { product: variant } });
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
        <link rel="canonical" href={v.canonical} />
        {v.helmetTitle && <title>{v.helmetTitle}</title>}
        {v.helmetDescription && <meta name="description" content={v.helmetDescription} />}
        {v.helmetTitle && <meta property="og:title" content={v.helmetTitle} />}
        {v.helmetDescription && <meta property="og:description" content={v.helmetDescription} />}
        {variant === "fodmap" && <meta property="og:url" content={v.canonical} />}
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <PlannerModeSwitch mode={variant} page="calculator" />

      <header className="text-center space-y-3 md:space-y-4 pt-2 md:pt-0">
        <img
          src={mascot}
          alt="Grocery budget calculator mascot"
          className="w-20 h-20 md:w-28 md:h-28 mx-auto rounded-full"
          width={112}
          height={112}
        />
        <p className="text-xs md:text-sm font-semibold tracking-widest uppercase text-primary">{v.kicker}</p>
        <h1 className="text-2xl md:text-5xl font-bold text-foreground leading-tight">{v.h1}</h1>
        <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
          {v.sub}
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

      <section aria-label="Share the grocery budget calculator" className="flex flex-wrap items-center justify-center gap-2 border-y border-border py-4">
        <span className="w-full text-center text-sm font-semibold text-foreground sm:w-auto sm:mr-2">Share this calculator</span>
        {shareLinks.map(({ name, icon, href }) => (
          <Button key={name} asChild variant="outline" size="icon" className="h-10 w-10" title={`Share on ${name}`}>
            <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${name}`} onClick={() => trackEvent("calculator_share_click", { platform: name })}>
              <img src={`/social/icons/${icon}.svg`} alt="" className="h-5 w-5 dark:invert" width={20} height={20} />
            </a>
          </Button>
        ))}
        <Button variant="outline" size="icon" className="h-10 w-10" onClick={copyShare} aria-label={copied ? "Post text and link copied" : "Copy post text and link"} title={copied ? "Copied!" : "Copy post text and link"}>
          {copied ? <Check className="h-5 w-5" /> : <Link2 className="h-5 w-5" />}
        </Button>
        <span role="status" className="sr-only">{copied ? "Post text and link copied" : ""}</span>
      </section>

      <Card className="p-6 md:p-8 border-2 border-primary space-y-4">
        <div className="flex items-center gap-3">
          <ShoppingCart className="h-8 w-8 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">{v.offerTitle.replace("{total}", fmt(total))}</h2>
        </div>
        <p className="text-muted-foreground">{v.offer}</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-lg text-muted-foreground line-through">$10</span>
          <span className="text-3xl font-bold text-foreground">$5</span>
          <span className="rounded-full bg-success/15 text-success text-xs font-bold px-3 py-1 uppercase tracking-wide">50% off</span>
        </div>
        <ul className="space-y-2">
          {v.features.map(f => (
            <li key={f} className="flex gap-2 text-foreground"><Check className="h-5 w-5 text-success shrink-0" />{f}</li>
          ))}
        </ul>
        <Button size="lg" className="w-full text-lg whitespace-nowrap" onClick={buy} disabled={checkoutLoading}>
          <Download className="h-5 w-5 mr-2 shrink-0" />
          {checkoutLoading ? "Opening checkout…" : v.cta}
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link to={v.planner}>Try the planner free</Link>
        </Button>
        <p className="text-xs text-center text-muted-foreground">Plan meals free. Unlock costs and budget tracking for $5 / 90 days.</p>
        <p className="text-xs text-center text-muted-foreground">
          Already bought it? <Link to={v.planner} className="underline">Open your planner</Link>
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
