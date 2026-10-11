import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Lock, Loader2, Plus, X, Copy, Check, Printer, Download, ShoppingCart, UtensilsCrossed, ListChecks,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/utils/analytics";
import {
  MEALS, MEAL_CATEGORIES, mealCost, type Meal, type CustomMeal, type StoreSection,
} from "@/data/meals";

const PAID_KEY = "grocery_planner_paid"; // stores unlock timestamp (ms), not "1"
const STATE_KEY = "grocery_planner_state";
const ACCESS_DAYS = 90;
const ACCESS_MS = ACCESS_DAYS * 24 * 60 * 60 * 1000;

const getPaidUntil = (): number | null => {
  const raw = localStorage.getItem(PAID_KEY);
  if (!raw) return null;
  const ts = raw === "1" ? null : Number(raw); // legacy "1" values have no timestamp — treat as expired
  if (!ts || Number.isNaN(ts)) return null;
  return ts + ACCESS_MS;
};

const isPaid = (): boolean => {
  const until = getPaidUntil();
  return until !== null && until > Date.now();
};

const markPaid = () => localStorage.setItem(PAID_KEY, String(Date.now()));

const fmt2 = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

function PlannerPrice({ paid, amount }: { paid: boolean; amount: number }) {
  return paid ? <>{fmt2(amount)}</> : (
    <span className="inline-flex items-center gap-1 text-muted-foreground" aria-label="Price locked">
      <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span className="blur-sm select-none" aria-hidden="true">$••.••</span>
    </span>
  );
}

interface PlannerState {
  selected: string[]; // library meal ids
  customMeals: CustomMeal[];
  customItems: { id: string; name: string; section: StoreSection; price: number }[];
  weeklyBudget: number;
  checked: string[]; // grocery list item keys
}

const loadState = (): PlannerState => {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) return { selected: [], customMeals: [], customItems: [], weeklyBudget: 166, checked: [], ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { selected: [], customMeals: [], customItems: [], weeklyBudget: 166, checked: [] };
};

const SECTION_ORDER: StoreSection[] = ["Produce", "Meat & Seafood", "Dairy & Eggs", "Bakery", "Pantry", "Frozen", "Household"];

export default function MealPlanner() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [paid, setPaid] = useState<boolean>(isPaid);
  const [verifying, setVerifying] = useState(!!sessionId && !paid);
  const [unlockEmail, setUnlockEmail] = useState("");
  const [unlockState, setUnlockState] = useState<"idle" | "checking" | "notfound">("idle");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [state, setState] = useState<PlannerState>(loadState);
  const [category, setCategory] = useState<string>(MEAL_CATEGORIES[0]);
  const [customName, setCustomName] = useState("");
  const [customCost, setCustomCost] = useState("");
  const [customIngredients, setCustomIngredients] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemSection, setItemSection] = useState<StoreSection>(SECTION_ORDER[0]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }, [state]);

  // Verify Stripe session after checkout redirect
  useEffect(() => {
    if (!sessionId || paid) return;
    supabase.functions
      .invoke("verify-template-purchase", { body: { session_id: sessionId } })
      .then(({ data, error }) => {
        if (!error && data?.paid) {
          markPaid();
          setPaid(true);
          trackEvent("purchase", { value: 5, currency: "USD", item: "meal_planner" });
        }
      })
      .finally(() => setVerifying(false));
  }, [sessionId, paid]);

  const unlock = async () => {
    if (!unlockEmail.trim()) return;
    setUnlockState("checking");
    // Owner test account: always unlocked, never expires
    if (unlockEmail.trim().toLowerCase() === "tgbilski@gmail.com") {
      localStorage.setItem(PAID_KEY, String(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000));
      setPaid(true);
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("verify-template-purchase", {
        body: { email: unlockEmail.trim() },
      });
      if (!error && data?.paid) {
        markPaid();
        setPaid(true);
        trackEvent("planner_unlocked", { method: "email" });
      } else {
        setUnlockState("notfound");
      }
    } catch {
      setUnlockState("notfound");
    }
  };

  const buy = async () => {
    trackEvent("template_checkout_click", { price: 5, source: "planner" });
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

  const toggleMeal = (id: string) => {
    setState((s) => ({
      ...s,
      selected: s.selected.includes(id) ? s.selected.filter((m) => m !== id) : [...s.selected, id],
      checked: [],
    }));
  };

  const addCustomMeal = () => {
    if (!customName.trim()) return;
    const meal: CustomMeal = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      cost: Math.max(0, parseFloat(customCost) || 0),
      ingredients: customIngredients.trim(),
      custom: true,
    };
    setState((s) => ({ ...s, customMeals: [...s.customMeals, meal] }));
    setCustomName(""); setCustomCost(""); setCustomIngredients(""); setShowCustomForm(false);
  };

  const removeCustomMeal = (id: string) =>
    setState((s) => ({ ...s, customMeals: s.customMeals.filter((m) => m.id !== id) }));

  const addItem = () => {
    if (!itemName.trim()) return;
    const item = {
      id: `${Date.now()}`,
      name: itemName.trim(),
      section: itemSection,
      price: Math.max(0, parseFloat(itemPrice) || 0),
    };
    setState((s) => ({ ...s, customItems: [...s.customItems, item] }));
    setItemName(""); setItemPrice(""); setShowAddItem(false);
  };

  const removeItem = (id: string) =>
    setState((s) => ({ ...s, customItems: s.customItems.filter((i) => i.id !== id) }));

  const selectedMeals = useMemo(
    () => MEALS.filter((m) => state.selected.includes(m.id)),
    [state.selected]
  );

  const totalCost = useMemo(
    () =>
      selectedMeals.reduce((s, m) => s + mealCost(m), 0) +
      state.customMeals.reduce((s, m) => s + m.cost, 0) +
      state.customItems.reduce((s, i) => s + i.price, 0),
    [selectedMeals, state.customMeals, state.customItems]
  );

  // Merge ingredients across selected library meals
  const groceryList = useMemo(() => {
    const merged = new Map<string, { name: string; qty: number; unit: string; price: number; section: StoreSection }>();
    for (const meal of selectedMeals) {
      for (const i of meal.ingredients) {
        const key = `${i.name}|${i.unit}`;
        const existing = merged.get(key);
        if (existing) {
          existing.qty += i.qty;
          existing.price += i.price;
        } else {
          merged.set(key, { ...i });
        }
      }
    }
    for (const item of state.customItems) {
      merged.set(`ci-${item.id}`, { name: item.name, qty: 1, unit: "", price: item.price, section: item.section });
    }
    const bySection = new Map<StoreSection, { key: string; name: string; qty: number; unit: string; price: number }[]>();
    for (const [key, item] of merged) {
      const list = bySection.get(item.section) || [];
      list.push({ key, ...item });
      bySection.set(item.section, list);
    }
    return SECTION_ORDER.filter((sec) => bySection.has(sec)).map((sec) => ({
      section: sec,
      items: (bySection.get(sec) ?? []).sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, [selectedMeals, state.customItems]);

  const toggleChecked = (key: string) =>
    setState((s) => ({
      ...s,
      checked: s.checked.includes(key) ? s.checked.filter((k) => k !== key) : [...s.checked, key],
    }));

  const listText = useMemo(() => {
    const lines: string[] = ["🛒 Grocery List", ""];
    for (const group of groceryList) {
      lines.push(group.section.toUpperCase());
      for (const item of group.items) {
        const qty = item.qty % 1 === 0 ? item.qty : Number(item.qty.toFixed(1));
        lines.push(`☐ ${item.name}${item.unit ? ` — ${qty} ${item.unit}` : qty > 1 ? ` ×${qty}` : ""}`);
      }
      lines.push("");
    }
    for (const m of state.customMeals) {
      if (m.ingredients) {
        lines.push(m.name.toUpperCase());
        m.ingredients.split("\n").filter(Boolean).forEach((l) => lines.push(`☐ ${l.trim()}`));
        lines.push("");
      }
    }
    if (paid) lines.push(`Estimated total: ${fmt2(totalCost)}`);
    return lines.join("\n");
  }, [groceryList, state.customMeals, totalCost, paid]);

  const copyList = async () => {
    try {
      await navigator.clipboard.writeText(listText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch { /* ignore */ }
  };

  const pct = state.weeklyBudget > 0 ? (totalCost / state.weeklyBudget) * 100 : 0;
  const underBudget = totalCost <= state.weeklyBudget;

  // ---------- Locked / verifying states ----------
  if (verifying) {
    return (
      <div className="container max-w-xl mx-auto px-4 py-16 text-center relative z-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">Confirming your payment…</p>
      </div>
    );
  }

  // The planner is interactive for everyone; calculated prices require access.
  const paidUntil = getPaidUntil();
  return (
    <div className="container max-w-3xl mx-auto px-4 py-6 md:py-10 space-y-6 md:space-y-8 relative z-10">
      <Helmet>
        <title>Your Meal Planner — House Budget Calculator</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <header className="text-center space-y-2">
        <h1 className="text-2xl md:text-4xl font-bold text-foreground">Your Weekly Meal Planner</h1>
        <p className="text-muted-foreground">Pick your meals for the week and build your grocery list.</p>
        {paid && paidUntil && (
          <p className="text-xs text-muted-foreground">
            Your access runs through {new Date(paidUntil).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
          </p>
        )}
      </header>

      {!paid && (
        <section className="border-y border-border py-4 space-y-3 print:hidden" aria-label="Unlock planner prices">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-foreground flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> Unlock costs & budget tracking</h2>
              <p className="text-sm text-muted-foreground mt-1">$5 for 90 days of access. No subscription.</p>
            </div>
            <Button onClick={buy} disabled={checkoutLoading} className="shrink-0">
              {checkoutLoading ? "Opening checkout…" : "Unlock prices — $5"}
            </Button>
          </div>
          <details className="text-sm">
            <summary className="cursor-pointer text-muted-foreground">Already bought it?</summary>
            <form className="mt-3 space-y-2" onSubmit={(event) => { event.preventDefault(); void unlock(); }}>
              <Label htmlFor="unlock-email">Email used at checkout</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input id="unlock-email" type="email" required placeholder="you@example.com" value={unlockEmail} onChange={(e) => setUnlockEmail(e.target.value)} className="min-w-0" />
                <Button type="submit" disabled={unlockState === "checking"}>
                  {unlockState === "checking" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unlock"}
                </Button>
              </div>
              {unlockState === "notfound" && <p role="status" className="text-muted-foreground">No purchase found. Double-check your checkout email.</p>}
            </form>
          </details>
        </section>
      )}

      {/* Budget bar */}
      <Card className="p-4 md:p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1">
            <Label htmlFor="weekly-budget">Your weekly grocery budget</Label>
            <Input
              id="weekly-budget"
              type="number"
              min={0}
              value={state.weeklyBudget}
              onChange={(e) => setState((s) => ({ ...s, weeklyBudget: Math.max(0, +e.target.value) }))}
            />
          </div>
          <div className="text-center sm:text-right">
            <p className="text-sm text-muted-foreground">Planned spend</p>
            <p className={`text-2xl font-bold ${paid ? underBudget ? "text-success" : "text-destructive" : "text-muted-foreground"}`}><PlannerPrice paid={paid} amount={totalCost} /></p>
          </div>
        </div>
        {paid && <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${underBudget ? "bg-success" : "bg-destructive"}`}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>}
        <p className="text-sm text-muted-foreground text-center">
          {!paid ? "Costs & budget tracking locked" : selectedMeals.length + state.customMeals.length === 0
            ? "Pick meals below to start planning."
            : underBudget
              ? `${fmt2(state.weeklyBudget - totalCost)} under budget — nice!`
              : `${fmt2(totalCost - state.weeklyBudget)} over budget — swap a meal or two.`}
        </p>
        <p className="text-xs text-muted-foreground text-center">
          Prices are estimates based on national averages — your actual bill will vary by store and region.
        </p>
      </Card>

      {/* Meal picker */}
      <Card className="p-4 md:p-6 space-y-4">
        <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-primary" /> Pick your meals
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {MEAL_CATEGORIES.map((c) => (
            <Button
              key={c}
              type="button"
              size="sm"
              variant={category === c ? "default" : "outline"}
              className="whitespace-nowrap shrink-0"
              onClick={() => setCategory(c)}
            >
              {c}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MEALS.filter((m) => m.category === category).map((m: Meal) => {
            const isSelected = state.selected.includes(m.id);
            return (
              <Button
                variant="outline"
                key={m.id}
                type="button"
                onClick={() => toggleMeal(m.id)}
                className={`h-auto w-full whitespace-normal flex items-center justify-between gap-2 rounded-lg border p-3 text-left transition-colors ${
                  isSelected ? "border-primary bg-accent" : "border-border bg-card hover:bg-muted/50"
                }`}
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground break-words">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.servings} servings</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold text-foreground"><PlannerPrice paid={paid} amount={mealCost(m)} /></span>
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Custom meals */}
        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Your own meals</h3>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowCustomForm((v) => !v)}>
              <Plus className="h-4 w-4 mr-1" /> Add a meal
            </Button>
          </div>
          {state.customMeals.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-2 rounded-xl border border-primary bg-accent p-3">
              <div className="min-w-0">
                <p className="font-medium text-foreground break-words">{m.name}</p>
                {m.ingredients && <p className="text-xs text-muted-foreground truncate">{m.ingredients.split("\n").filter(Boolean).length} ingredients</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-semibold text-foreground"><PlannerPrice paid={paid} amount={m.cost} /></span>
                <button type="button" onClick={() => removeCustomMeal(m.id)} aria-label={`Remove ${m.name}`} className="text-muted-foreground hover:text-destructive">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {showCustomForm && (
            <div className="rounded-xl border border-border p-3 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="custom-name">Meal name</Label>
                  <Input id="custom-name" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Grandma's lasagna" />
                </div>
                <div>
                  <Label htmlFor="custom-cost">Estimated cost ($)</Label>
                  <Input id="custom-cost" type="number" min={0} step="0.01" value={customCost} onChange={(e) => setCustomCost(e.target.value)} placeholder="12.00" />
                </div>
              </div>
              <div>
                <Label htmlFor="custom-ings">Ingredients (one per line, optional)</Label>
                <Textarea id="custom-ings" value={customIngredients} onChange={(e) => setCustomIngredients(e.target.value)} placeholder={"1 lb ground beef\n1 box lasagna noodles\n1 jar marinara"} rows={3} />
              </div>
              <Button type="button" onClick={addCustomMeal} disabled={!customName.trim()}>Add to my plan</Button>
            </div>
          )}
        </div>
      </Card>

      {/* Grocery list */}
      <Card className="p-4 md:p-6 space-y-4" id="grocery-list">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" /> Your grocery list
          </h2>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={copyList} disabled={groceryList.length === 0 && state.customMeals.length === 0}>
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => window.print()} disabled={groceryList.length === 0 && state.customMeals.length === 0}>
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
          </div>
        </div>

        {groceryList.length === 0 && state.customMeals.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">
            <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
            Pick some meals above, or add your own items below, and your list will build itself here.
          </p>
        ) : (
          <div className="space-y-4">
            {groceryList.map((group) => (
              <div key={group.section}>
                <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-1">{group.section}</h3>
                <ul className="divide-y divide-border">
                  {group.items.map((item) => {
                    const isChecked = state.checked.includes(item.key);
                    const isCustom = item.key.startsWith("ci-");
                    const qty = item.qty % 1 === 0 ? item.qty : item.qty.toFixed(1);
                    return (
                      <li key={item.key} className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleChecked(item.key)}
                          className="flex min-w-0 flex-1 items-center gap-3 py-2 text-left"
                        >
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${isChecked ? "bg-success border-success text-success-foreground" : "border-border"}`}>
                            {isChecked && <Check className="h-3.5 w-3.5" />}
                          </span>
                          <span className={`flex-1 ${isChecked ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {item.name}
                            {!isCustom && <span className="text-muted-foreground text-sm"> — {qty}{item.unit ? ` ${item.unit}` : ""}</span>}
                          </span>
                          <span className="shrink-0 text-sm text-muted-foreground"><PlannerPrice paid={paid} amount={item.price} /></span>
                        </button>
                        {isCustom && (
                          <button
                            type="button"
                            onClick={() => removeItem(item.key.slice(3))}
                            aria-label={`Remove ${item.name}`}
                            className="shrink-0 px-1 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            {state.customMeals.filter((m) => m.ingredients).map((m) => (
              <div key={m.id}>
                <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-1">{m.name}</h3>
                <ul className="divide-y divide-border">
                  {m.ingredients.split("\n").filter(Boolean).map((line, i) => {
                    const key = `${m.id}-${i}`;
                    const isChecked = state.checked.includes(key);
                    return (
                      <li key={key}>
                        <button type="button" onClick={() => toggleChecked(key)} className="flex w-full items-center gap-3 py-2 text-left">
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${isChecked ? "bg-success border-success text-success-foreground" : "border-border"}`}>
                            {isChecked && <Check className="h-3.5 w-3.5" />}
                          </span>
                          <span className={`flex-1 ${isChecked ? "line-through text-muted-foreground" : "text-foreground"}`}>{line.trim()}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            <div className="flex justify-between items-center border-t border-border pt-3">
              <span className="font-semibold text-foreground">Estimated total</span>
              <span className={`text-xl font-bold ${paid ? underBudget ? "text-success" : "text-destructive" : "text-muted-foreground"}`}><PlannerPrice paid={paid} amount={totalCost} /></span>
            </div>
          </div>
        )}

        {/* Add your own items */}
        <div className="border-t border-border pt-3 space-y-2">
          {!showAddItem && (
            <Button type="button" size="sm" variant="outline" onClick={() => setShowAddItem(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add an item
            </Button>
          )}
          {showAddItem && (
            <div className="rounded-xl border border-border p-3 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="item-name">Item</Label>
                  <Input id="item-name" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Coffee" />
                </div>
                <div>
                  <Label htmlFor="item-price">Estimated price ($)</Label>
                  <Input id="item-price" type="number" min={0} step="0.01" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} placeholder="6.50" />
                </div>
              </div>
              <div>
                <Label htmlFor="item-section">Store section</Label>
                <select
                  id="item-section"
                  value={itemSection}
                  onChange={(e) => setItemSection(e.target.value as StoreSection)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                >
                  {SECTION_ORDER.map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="button" onClick={addItem} disabled={!itemName.trim()}>Add to my list</Button>
                <Button type="button" variant="ghost" onClick={() => setShowAddItem(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Bonus spreadsheet */}
      {paid && <Card className="p-4 md:p-6 flex flex-col sm:flex-row items-center gap-4 print:hidden">
        <Download className="h-8 w-8 text-primary shrink-0" />
        <div className="flex-1 text-center sm:text-left">
          <h2 className="font-semibold text-foreground">Bonus: 12-month budget spreadsheet</h2>
          <p className="text-sm text-muted-foreground">Track your actual spending all year. Works in Excel & Google Sheets.</p>
        </div>
        <a href="/downloads/grocery-budget-tracker-2026.xlsx" download>
          <Button variant="outline">Download</Button>
        </a>
      </Card>}

      <p className="text-center"><Link to="/" className="text-sm text-muted-foreground underline">Back to the calculator</Link></p>
    </div>
  );
}
