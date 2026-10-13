import { PlannerCore, type PlannerConfig } from "./MealPlanner";
import { FODMAP_MEALS, FODMAP_CATEGORIES } from "@/data/fodmapMeals";

const fodmapConfig: PlannerConfig = {
  product: "fodmap",
  paidKey: "fodmap_planner_paid",
  stateKey: "fodmap_planner_state",
  meals: FODMAP_MEALS,
  categories: FODMAP_CATEGORIES,
  title: "Low-FODMAP Meal Planner & Grocery List",
  subtitle: "Pick FODMAP-safe meals for the week and get a grocery list that fits your budget — no onion, no garlic, no guesswork.",
  helmetTitle: "Low-FODMAP Meal Planner & Grocery List (2026) | House Budget Calculator",
  helmetDescription:
    "Plan a week of low-FODMAP meals and get an auto-built grocery list with estimated costs. 30+ FODMAP-safe recipes — no onion, no garlic, lactose-smart. Free to try, no sign-up.",
  noindex: false,
  showSpreadsheet: false,
  backLinkTo: "/",
  backLinkLabel: "Back to the grocery budget calculator",
  seoContent: (
    <section className="space-y-6 border-t border-border pt-8" aria-label="About low-FODMAP meal planning">
      <div className="space-y-3">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Why low-FODMAP grocery shopping is so hard</h2>
        <p className="text-muted-foreground">
          If you have IBS or a sensitive gut, you already know the drill: onion and garlic are in
          everything, "healthy" staples like apples, wheat bread, and beans can trigger symptoms, and
          most meal planners ignore all of it. Every meal in this planner is built on standard
          low-FODMAP guidelines (the Monash University approach): garlic-infused oil instead of garlic,
          chives and scallion tops instead of onion, lactose-free dairy or hard cheeses, and
          gluten-free pasta and bread where it matters.
        </p>
      </div>
      <div className="space-y-3">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">How this low-FODMAP grocery list works</h2>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li>Pick your meals from 30+ FODMAP-safe recipes — chicken, beef, fish, vegetarian, breakfast, and soups.</li>
          <li>Add your own safe meals and any extra items you need.</li>
          <li>Your grocery list builds itself, merged across meals and grouped by store section.</li>
          <li>Copy it or print it for the store. Unlock to see estimated costs and track against your weekly budget.</li>
        </ol>
      </div>
      <div className="space-y-3">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">A note on portions and triggers</h2>
        <p className="text-muted-foreground">
          FODMAP tolerance is personal — many foods are safe only up to a certain serving size, and your
          triggers may differ from someone else's. This planner follows widely used low-FODMAP
          guidelines, but it isn't medical advice. If you're newly diagnosed, work with a registered
          dietitian on the elimination and reintroduction phases, and adjust any meal here to fit what
          your gut tolerates.
        </p>
      </div>
    </section>
  ),
};

export default function FodmapPlanner() {
  return <PlannerCore config={fodmapConfig} />;
}
