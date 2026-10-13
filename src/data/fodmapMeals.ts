// Low-FODMAP meal library: ingredients with typical US prices (2026 estimates)
// Built on standard low-FODMAP guidelines (Monash University): no onion/garlic
// (garlic-infused oil and chive/scallion tops instead), lactose-free dairy or
// hard cheeses, gluten-free pasta/bread, and low-FODMAP produce portions.
import type { Meal, Ingredient, StoreSection } from "./meals";

export const FODMAP_CATEGORIES = ["Chicken & Turkey", "Beef & Pork", "Fish & Seafood", "Vegetarian", "Breakfast", "Soups & Sides"] as const;

const ing = (name: string, qty: number, unit: string, price: number, section: StoreSection): Ingredient =>
  ({ name, qty, unit, price, section });

export const FODMAP_MEALS: Meal[] = [
  // Chicken & Turkey
  { id: "lf-lemon-herb-chicken", name: "Lemon Herb Chicken (Garlic-Infused Oil)", category: "Chicken & Turkey", servings: 4, ingredients: [
    ing("Chicken breast", 1.5, "lb", 6, "Meat & Seafood"), ing("Potatoes", 2, "lb", 2.5, "Produce"),
    ing("Carrots", 1, "lb", 1.2, "Produce"), ing("Garlic-infused olive oil", 3, "tbsp", 1, "Pantry"), ing("Lemon", 1, "", 0.6, "Produce")] },
  { id: "lf-chicken-rice-bowls", name: "Chicken & Rice Bowls", category: "Chicken & Turkey", servings: 4, ingredients: [
    ing("Chicken breast", 1.5, "lb", 6, "Meat & Seafood"), ing("White rice", 2, "cup", 1, "Pantry"),
    ing("Bell pepper", 1, "", 1.5, "Produce"), ing("Zucchini", 1, "", 1.2, "Produce"),
    ing("Soy sauce", 3, "tbsp", 0.4, "Pantry"), ing("Chives", 1, "bunch", 1.5, "Produce")] },
  { id: "lf-chicken-stir-fry", name: "Low-FODMAP Chicken Stir Fry", category: "Chicken & Turkey", servings: 4, ingredients: [
    ing("Chicken breast", 1.5, "lb", 6, "Meat & Seafood"), ing("Bell pepper", 2, "", 3, "Produce"),
    ing("Carrots", 0.5, "lb", 0.6, "Produce"), ing("White rice", 2, "cup", 1, "Pantry"),
    ing("Soy sauce", 4, "tbsp", 0.5, "Pantry"), ing("Fresh ginger", 1, "tbsp", 0.4, "Produce"), ing("Garlic-infused olive oil", 2, "tbsp", 0.7, "Pantry")] },
  { id: "lf-turkey-tacos", name: "Turkey Tacos (Corn Tortillas)", category: "Chicken & Turkey", servings: 4, ingredients: [
    ing("Ground turkey", 1, "lb", 5, "Meat & Seafood"), ing("Corn tortillas", 8, "", 2.5, "Bakery"),
    ing("Cumin & paprika", 1, "tbsp", 0.3, "Pantry"), ing("Cheddar cheese", 1, "cup", 2, "Dairy & Eggs"),
    ing("Lettuce", 1, "head", 2, "Produce"), ing("Tomato", 2, "", 2, "Produce"), ing("Lactose-free sour cream", 0.5, "cup", 1.5, "Dairy & Eggs")] },
  { id: "lf-chicken-parmesan", name: "Chicken Parmesan (GF)", category: "Chicken & Turkey", servings: 4, ingredients: [
    ing("Chicken breast", 1.5, "lb", 6, "Meat & Seafood"), ing("Gluten-free breadcrumbs", 1, "cup", 2, "Pantry"),
    ing("Marinara sauce (no onion/garlic)", 1, "jar", 3.5, "Pantry"), ing("Mozzarella", 1.5, "cup", 3, "Dairy & Eggs"),
    ing("Parmesan", 0.5, "cup", 2, "Dairy & Eggs"), ing("Gluten-free spaghetti", 1, "box", 3, "Pantry")] },
  { id: "lf-herb-roast-chicken", name: "Herb-Roasted Chicken & Potatoes", category: "Chicken & Turkey", servings: 4, ingredients: [
    ing("Chicken thighs", 2, "lb", 5.5, "Meat & Seafood"), ing("Potatoes", 2, "lb", 2.5, "Produce"),
    ing("Green beans", 1, "lb", 2.5, "Produce"), ing("Garlic-infused olive oil", 3, "tbsp", 1, "Pantry"), ing("Rosemary & thyme", 1, "tbsp", 0.3, "Pantry")] },

  // Beef & Pork
  { id: "lf-beef-potato-skillet", name: "Beef & Potato Skillet", category: "Beef & Pork", servings: 4, ingredients: [
    ing("Ground beef", 1, "lb", 5, "Meat & Seafood"), ing("Potatoes", 2, "lb", 2.5, "Produce"),
    ing("Bell pepper", 1, "", 1.5, "Produce"), ing("Cheddar cheese", 1, "cup", 2, "Dairy & Eggs"), ing("Chives", 1, "bunch", 1.5, "Produce")] },
  { id: "lf-maple-pork-chops", name: "Maple-Glazed Pork Chops", category: "Beef & Pork", servings: 4, ingredients: [
    ing("Pork chops", 4, "", 7, "Meat & Seafood"), ing("Maple syrup", 3, "tbsp", 1, "Pantry"),
    ing("Carrots", 1, "lb", 1.2, "Produce"), ing("White rice", 2, "cup", 1, "Pantry"), ing("Butter", 2, "tbsp", 0.4, "Dairy & Eggs")] },
  { id: "lf-beef-fried-rice", name: "Beef Fried Rice", category: "Beef & Pork", servings: 4, ingredients: [
    ing("Ground beef", 1, "lb", 5, "Meat & Seafood"), ing("White rice", 2, "cup", 1, "Pantry"),
    ing("Eggs", 3, "", 0.9, "Dairy & Eggs"), ing("Frozen peas & carrots", 1, "cup", 1, "Frozen"),
    ing("Soy sauce", 4, "tbsp", 0.5, "Pantry"), ing("Scallion tops (green only)", 3, "", 0.8, "Produce")] },
  { id: "lf-bunless-burgers", name: "Bunless Burgers & Oven Fries", category: "Beef & Pork", servings: 4, ingredients: [
    ing("Ground beef", 1.5, "lb", 7.5, "Meat & Seafood"), ing("Potatoes", 2, "lb", 2.5, "Produce"),
    ing("Cheddar cheese", 4, "slice", 1.5, "Dairy & Eggs"), ing("Lettuce", 1, "head", 2, "Produce"),
    ing("Tomato", 2, "", 2, "Produce"), ing("Ketchup", 4, "tbsp", 0.4, "Pantry")] },
  { id: "lf-steak-carrots", name: "Steak with Roasted Carrots", category: "Beef & Pork", servings: 4, ingredients: [
    ing("Sirloin steak", 1.5, "lb", 12, "Meat & Seafood"), ing("Carrots", 1.5, "lb", 1.8, "Produce"),
    ing("Potatoes", 2, "lb", 2.5, "Produce"), ing("Butter", 2, "tbsp", 0.4, "Dairy & Eggs"), ing("Garlic-infused olive oil", 2, "tbsp", 0.7, "Pantry")] },

  // Fish & Seafood
  { id: "lf-baked-salmon", name: "Baked Salmon with Lemon & Dill", category: "Fish & Seafood", servings: 4, ingredients: [
    ing("Salmon fillets", 1.5, "lb", 12, "Meat & Seafood"), ing("Lemon", 1, "", 0.6, "Produce"),
    ing("Fresh dill", 1, "bunch", 2, "Produce"), ing("White rice", 2, "cup", 1, "Pantry"), ing("Zucchini", 2, "", 2.5, "Produce")] },
  { id: "lf-shrimp-fried-rice", name: "Shrimp Fried Rice", category: "Fish & Seafood", servings: 4, ingredients: [
    ing("Shrimp (peeled)", 1, "lb", 8, "Frozen"), ing("White rice", 2, "cup", 1, "Pantry"),
    ing("Eggs", 3, "", 0.9, "Dairy & Eggs"), ing("Frozen peas & carrots", 1, "cup", 1, "Frozen"),
    ing("Soy sauce", 4, "tbsp", 0.5, "Pantry"), ing("Scallion tops (green only)", 3, "", 0.8, "Produce")] },
  { id: "lf-tuna-pasta", name: "Tuna & Tomato Pasta (GF)", category: "Fish & Seafood", servings: 4, ingredients: [
    ing("Canned tuna", 2, "can", 3, "Pantry"), ing("Gluten-free penne", 1, "box", 3, "Pantry"),
    ing("Cherry tomatoes", 1, "pint", 3, "Produce"), ing("Garlic-infused olive oil", 3, "tbsp", 1, "Pantry"), ing("Parmesan", 0.5, "cup", 2, "Dairy & Eggs"), ing("Fresh basil", 1, "bunch", 2, "Produce")] },
  { id: "lf-fish-tacos", name: "Fish Tacos (Corn Tortillas)", category: "Fish & Seafood", servings: 4, ingredients: [
    ing("White fish fillets", 1.5, "lb", 9, "Meat & Seafood"), ing("Corn tortillas", 8, "", 2.5, "Bakery"),
    ing("Coleslaw mix", 1, "bag", 2, "Produce"), ing("Lime", 2, "", 1, "Produce"),
    ing("Lactose-free sour cream", 0.5, "cup", 1.5, "Dairy & Eggs"), ing("Cumin", 1, "tsp", 0.2, "Pantry")] },

  // Vegetarian
  { id: "lf-spinach-feta-omelette", name: "Spinach & Feta Omelettes", category: "Vegetarian", servings: 2, ingredients: [
    ing("Eggs", 6, "", 1.8, "Dairy & Eggs"), ing("Spinach", 2, "cup", 1.5, "Produce"),
    ing("Feta cheese", 0.5, "cup", 2, "Dairy & Eggs"), ing("Tomato", 1, "", 1, "Produce"), ing("Gluten-free toast", 4, "slice", 1.5, "Bakery")] },
  { id: "lf-quinoa-veggie-bowl", name: "Quinoa Veggie Bowls", category: "Vegetarian", servings: 4, ingredients: [
    ing("Quinoa", 1.5, "cup", 3, "Pantry"), ing("Zucchini", 1, "", 1.2, "Produce"),
    ing("Bell pepper", 1, "", 1.5, "Produce"), ing("Cherry tomatoes", 1, "pint", 3, "Produce"),
    ing("Feta cheese", 0.5, "cup", 2, "Dairy & Eggs"), ing("Lemon-tahini dressing", 4, "tbsp", 1.5, "Pantry")] },
  { id: "lf-gf-pasta-primavera", name: "Pasta Primavera (GF)", category: "Vegetarian", servings: 4, ingredients: [
    ing("Gluten-free penne", 1, "box", 3, "Pantry"), ing("Zucchini", 2, "", 2.5, "Produce"),
    ing("Bell pepper", 1, "", 1.5, "Produce"), ing("Cherry tomatoes", 1, "pint", 3, "Produce"),
    ing("Garlic-infused olive oil", 3, "tbsp", 1, "Pantry"), ing("Parmesan", 0.5, "cup", 2, "Dairy & Eggs")] },
  { id: "lf-baked-potato-bar", name: "Loaded Baked Potato Bar", category: "Vegetarian", servings: 4, ingredients: [
    ing("Russet potatoes", 4, "large", 3, "Produce"), ing("Cheddar cheese", 1, "cup", 2, "Dairy & Eggs"),
    ing("Lactose-free sour cream", 1, "cup", 3, "Dairy & Eggs"), ing("Chives", 1, "bunch", 1.5, "Produce"),
    ing("Bacon bits", 0.5, "cup", 2.5, "Meat & Seafood"), ing("Butter", 4, "tbsp", 0.8, "Dairy & Eggs")] },
  { id: "lf-tofu-fried-rice", name: "Tofu Veggie Fried Rice", category: "Vegetarian", servings: 4, ingredients: [
    ing("Firm tofu", 14, "oz", 2.5, "Produce"), ing("White rice", 2, "cup", 1, "Pantry"),
    ing("Eggs", 2, "", 0.6, "Dairy & Eggs"), ing("Frozen peas & carrots", 1, "cup", 1, "Frozen"),
    ing("Soy sauce", 4, "tbsp", 0.5, "Pantry"), ing("Fresh ginger", 1, "tbsp", 0.4, "Produce")] },

  // Breakfast
  { id: "lf-yogurt-parfait", name: "Lactose-Free Yogurt Parfaits", category: "Breakfast", servings: 4, ingredients: [
    ing("Lactose-free yogurt", 2, "cup", 4, "Dairy & Eggs"), ing("Strawberries", 1, "lb", 3, "Produce"),
    ing("Blueberries", 1, "cup", 3, "Produce"), ing("Low-FODMAP granola", 1, "cup", 2.5, "Pantry"), ing("Maple syrup", 2, "tbsp", 0.6, "Pantry")] },
  { id: "lf-eggs-gf-toast", name: "Scrambled Eggs & GF Toast", category: "Breakfast", servings: 4, ingredients: [
    ing("Eggs", 8, "", 2.4, "Dairy & Eggs"), ing("Gluten-free bread", 8, "slice", 3, "Bakery"),
    ing("Butter", 2, "tbsp", 0.4, "Dairy & Eggs"), ing("Spinach", 2, "cup", 1.5, "Produce"), ing("Oranges", 4, "", 3, "Produce")] },
  { id: "lf-blueberry-oatmeal", name: "Blueberry Maple Oatmeal", category: "Breakfast", servings: 4, ingredients: [
    ing("Rolled oats (GF)", 2, "cup", 2, "Pantry"), ing("Lactose-free milk", 2, "cup", 1.5, "Dairy & Eggs"),
    ing("Blueberries", 1, "cup", 3, "Produce"), ing("Maple syrup", 4, "tbsp", 1.2, "Pantry"), ing("Cinnamon", 1, "tsp", 0.1, "Pantry")] },
  { id: "lf-banana-pancakes", name: "Banana Oat Pancakes", category: "Breakfast", servings: 4, ingredients: [
    ing("Rolled oats (GF)", 2, "cup", 2, "Pantry"), ing("Firm bananas", 3, "", 0.9, "Produce"),
    ing("Eggs", 4, "", 1.2, "Dairy & Eggs"), ing("Lactose-free milk", 0.5, "cup", 0.4, "Dairy & Eggs"), ing("Maple syrup", 0.5, "cup", 2, "Pantry")] },
  { id: "lf-egg-potato-hash", name: "Egg & Potato Hash (No Onion)", category: "Breakfast", servings: 4, ingredients: [
    ing("Potatoes", 2, "lb", 2.5, "Produce"), ing("Eggs", 6, "", 1.8, "Dairy & Eggs"),
    ing("Bell pepper", 1, "", 1.5, "Produce"), ing("Chives", 1, "bunch", 1.5, "Produce"),
    ing("Cheddar cheese", 0.5, "cup", 1, "Dairy & Eggs"), ing("Garlic-infused olive oil", 2, "tbsp", 0.7, "Pantry")] },

  // Soups & Sides
  { id: "lf-carrot-ginger-soup", name: "Carrot & Ginger Soup", category: "Soups & Sides", servings: 6, ingredients: [
    ing("Carrots", 2, "lb", 2.4, "Produce"), ing("Fresh ginger", 2, "tbsp", 0.8, "Produce"),
    ing("Potatoes", 1, "lb", 1.2, "Produce"), ing("Chicken broth (no onion/garlic)", 6, "cup", 4, "Pantry"),
    ing("Lactose-free milk", 1, "cup", 0.8, "Dairy & Eggs"), ing("Garlic-infused olive oil", 2, "tbsp", 0.7, "Pantry")] },
  { id: "lf-chicken-rice-soup", name: "Chicken & Rice Soup", category: "Soups & Sides", servings: 6, ingredients: [
    ing("Chicken breast", 1.5, "lb", 6, "Meat & Seafood"), ing("White rice", 1, "cup", 0.5, "Pantry"),
    ing("Carrots", 1, "lb", 1.2, "Produce"), ing("Celery", 4, "stalk", 1, "Produce"),
    ing("Chicken broth (no onion/garlic)", 6, "cup", 4, "Pantry"), ing("Fresh parsley", 1, "bunch", 1.5, "Produce")] },
  { id: "lf-tomato-soup", name: "Creamy Tomato Soup (LF)", category: "Soups & Sides", servings: 4, ingredients: [
    ing("Crushed tomatoes", 2, "can", 3, "Pantry"), ing("Lactose-free cream", 0.5, "cup", 1.8, "Dairy & Eggs"),
    ing("Vegetable broth (no onion/garlic)", 2, "cup", 2, "Pantry"), ing("Fresh basil", 1, "bunch", 2, "Produce"),
    ing("Garlic-infused olive oil", 2, "tbsp", 0.7, "Pantry"), ing("Gluten-free bread", 4, "slice", 1.5, "Bakery")] },
  { id: "lf-roasted-veggies", name: "Roasted Low-FODMAP Veggie Medley", category: "Soups & Sides", servings: 4, ingredients: [
    ing("Potatoes", 1.5, "lb", 1.8, "Produce"), ing("Carrots", 1, "lb", 1.2, "Produce"),
    ing("Zucchini", 2, "", 2.5, "Produce"), ing("Bell pepper", 1, "", 1.5, "Produce"),
    ing("Garlic-infused olive oil", 3, "tbsp", 1, "Pantry"), ing("Rosemary", 1, "tbsp", 0.3, "Pantry")] },
];
