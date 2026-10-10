# Turn the $5 product into a web-based Meal Planner & Grocery List tool

## Goal
Replace the Excel spreadsheet as the $5 product with an interactive web tool: pick meals → auto grocery list → checked against the user's budget. The free calculator stays free and becomes the funnel into the paid tool.

## What buyers get (the $5 tool at /planner)
- **Meal library**: ~50 budget meals with ingredient lists and typical US prices, browsable by category (chicken, beef, pasta, vegetarian, slow cooker, breakfasts, etc.)
- **Custom meals**: users can add their own meal with an estimated cost and their own ingredients
- **Weekly plan**: pick meals for the week; running total shows spend vs. their weekly budget ("$148 of $166 — under budget")
- **Auto grocery list**: ingredients merged across all meals (3 recipes × onions → "3 onions"), grouped by store section, with checkboxes
- **Copy / print the list** for the store
- **Saved automatically** in the browser (localStorage) — no account needed, their plan is still there when they come back

## Access control (no sign-ups, pay once)
- Buy button → existing Stripe $5 checkout (unchanged price, updated product name/description)
- After payment, Stripe redirects to `/planner?session_id=...` → `verify-template-purchase` confirms payment → we set a "paid" flag in the browser and unlock the tool
- **Recovery**: "Already bought it? Unlock with your email" — same email-lookup flow that already exists, sets the same flag
- Not paid → the planner page shows a locked preview with the buy button

## Changes to existing pieces
1. **New page** `src/pages/MealPlanner.tsx` + route `/planner`
2. **New data file** `src/data/meals.ts` — meal library with ingredients, quantities, prices, store sections
3. **Homepage offer card** — rewrite copy: sell the meal planner + grocery list tool instead of the spreadsheet ("Plan a week of meals, get a grocery list that fits your budget — $5, yours forever")
4. **Checkout function** — update product name/description and success redirect to `/planner`
5. **Verify function** — no change needed (already supports session_id + email)
6. **PurchaseSuccess page** — redirect into `/planner` after verified payment
7. Keep the spreadsheet as a bonus download inside the planner (it's already built — free extra value)

## Verification
- Browser test at mobile + desktop widths: locked state, unlock flow with test email, meal picking, list merging, budget bar, print view
- Confirm no page overflow at 320px
