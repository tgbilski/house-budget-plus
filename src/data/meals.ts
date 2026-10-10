// Budget meal library: ingredients with typical US prices (2026 estimates)
export type StoreSection = "Produce" | "Meat & Seafood" | "Dairy & Eggs" | "Bakery" | "Pantry" | "Frozen" | "Household";

export interface Ingredient {
  name: string;
  qty: number; // numeric amount
  unit: string; // "", "lb", "oz", "cup", "can", "clove", etc.
  price: number; // cost for the qty used in this meal
  section: StoreSection;
}

export interface Meal {
  id: string;
  name: string;
  category: string;
  servings: number;
  ingredients: Ingredient[];
}

export const MEAL_CATEGORIES = ["Chicken", "Beef & Pork", "Pasta & Rice", "Vegetarian", "Slow Cooker", "Breakfast", "Soups"] as const;

const ing = (name: string, qty: number, unit: string, price: number, section: StoreSection): Ingredient =>
  ({ name, qty, unit, price, section });

export const MEALS: Meal[] = [
  // Chicken
  { id: "sheet-pan-chicken", name: "Sheet-Pan Chicken & Veggies", category: "Chicken", servings: 4, ingredients: [
    ing("Chicken thighs", 2, "lb", 5.5, "Meat & Seafood"), ing("Potatoes", 2, "lb", 2.5, "Produce"),
    ing("Carrots", 1, "lb", 1.2, "Produce"), ing("Olive oil", 3, "tbsp", 0.6, "Pantry"), ing("Garlic", 3, "clove", 0.3, "Produce")] },
  { id: "chicken-stir-fry", name: "Chicken Stir Fry", category: "Chicken", servings: 4, ingredients: [
    ing("Chicken breast", 1.5, "lb", 6, "Meat & Seafood"), ing("Stir-fry vegetables", 1, "bag (frozen)", 3, "Frozen"),
    ing("White rice", 2, "cup", 1, "Pantry"), ing("Soy sauce", 4, "tbsp", 0.5, "Pantry"), ing("Garlic", 2, "clove", 0.2, "Produce")] },
  { id: "chicken-tacos", name: "Chicken Tacos", category: "Chicken", servings: 4, ingredients: [
    ing("Chicken breast", 1.5, "lb", 6, "Meat & Seafood"), ing("Tortillas", 8, "", 2.5, "Bakery"),
    ing("Taco seasoning", 1, "packet", 1, "Pantry"), ing("Shredded cheese", 1, "cup", 2, "Dairy & Eggs"),
    ing("Lettuce", 1, "head", 2, "Produce"), ing("Salsa", 1, "jar", 3, "Pantry")] },
  { id: "chicken-alfredo", name: "Chicken Alfredo", category: "Chicken", servings: 4, ingredients: [
    ing("Chicken breast", 1, "lb", 4, "Meat & Seafood"), ing("Fettuccine", 1, "box", 1.5, "Pantry"),
    ing("Heavy cream", 1, "cup", 2.5, "Dairy & Eggs"), ing("Parmesan", 0.5, "cup", 2, "Dairy & Eggs"),
    ing("Butter", 4, "tbsp", 0.8, "Dairy & Eggs"), ing("Garlic", 3, "clove", 0.3, "Produce")] },
  { id: "baked-chicken-rice", name: "Baked Chicken & Rice", category: "Chicken", servings: 4, ingredients: [
    ing("Chicken thighs", 2, "lb", 5.5, "Meat & Seafood"), ing("White rice", 2, "cup", 1, "Pantry"),
    ing("Chicken broth", 2, "cup", 1.5, "Pantry"), ing("Onion", 1, "", 0.8, "Produce"), ing("Frozen peas", 1, "cup", 1, "Frozen")] },
  { id: "chicken-quesadillas", name: "Chicken Quesadillas", category: "Chicken", servings: 4, ingredients: [
    ing("Chicken breast", 1, "lb", 4, "Meat & Seafood"), ing("Flour tortillas", 8, "", 2.5, "Bakery"),
    ing("Shredded cheese", 2, "cup", 4, "Dairy & Eggs"), ing("Bell pepper", 1, "", 1.5, "Produce"), ing("Onion", 1, "", 0.8, "Produce")] },
  { id: "chicken-noodle-soup", name: "Chicken Noodle Soup", category: "Chicken", servings: 6, ingredients: [
    ing("Chicken thighs", 1.5, "lb", 4, "Meat & Seafood"), ing("Egg noodles", 1, "bag", 2, "Pantry"),
    ing("Carrots", 1, "lb", 1.2, "Produce"), ing("Celery", 4, "stalk", 1, "Produce"), ing("Onion", 1, "", 0.8, "Produce"), ing("Chicken broth", 6, "cup", 3, "Pantry")] },
  { id: "bbq-chicken-sandwiches", name: "BBQ Chicken Sandwiches", category: "Chicken", servings: 4, ingredients: [
    ing("Chicken breast", 1.5, "lb", 6, "Meat & Seafood"), ing("BBQ sauce", 1, "bottle", 2.5, "Pantry"),
    ing("Hamburger buns", 4, "", 2.5, "Bakery"), ing("Coleslaw mix", 1, "bag", 2, "Produce")] },

  // Beef & Pork
  { id: "spaghetti-meat-sauce", name: "Spaghetti & Meat Sauce", category: "Beef & Pork", servings: 6, ingredients: [
    ing("Ground beef", 1.5, "lb", 7.5, "Meat & Seafood"), ing("Spaghetti", 1, "box", 1.5, "Pantry"),
    ing("Marinara sauce", 1, "jar", 2.5, "Pantry"), ing("Onion", 1, "", 0.8, "Produce"), ing("Garlic", 3, "clove", 0.3, "Produce")] },
  { id: "tacos", name: "Ground Beef Tacos", category: "Beef & Pork", servings: 4, ingredients: [
    ing("Ground beef", 1, "lb", 5, "Meat & Seafood"), ing("Tortillas", 8, "", 2.5, "Bakery"),
    ing("Taco seasoning", 1, "packet", 1, "Pantry"), ing("Shredded cheese", 1, "cup", 2, "Dairy & Eggs"),
    ing("Lettuce", 1, "head", 2, "Produce"), ing("Tomato", 2, "", 2, "Produce")] },
  { id: "chili", name: "Beef Chili", category: "Beef & Pork", servings: 6, ingredients: [
    ing("Ground beef", 1.5, "lb", 7.5, "Meat & Seafood"), ing("Kidney beans", 2, "can", 2.5, "Pantry"),
    ing("Diced tomatoes", 2, "can", 2.5, "Pantry"), ing("Onion", 1, "", 0.8, "Produce"),
    ing("Chili powder", 2, "tbsp", 0.5, "Pantry"), ing("Bell pepper", 1, "", 1.5, "Produce")] },
  { id: "meatloaf", name: "Classic Meatloaf", category: "Beef & Pork", servings: 6, ingredients: [
    ing("Ground beef", 2, "lb", 10, "Meat & Seafood"), ing("Breadcrumbs", 1, "cup", 1, "Pantry"),
    ing("Eggs", 2, "", 0.6, "Dairy & Eggs"), ing("Onion", 1, "", 0.8, "Produce"), ing("Ketchup", 0.5, "cup", 0.8, "Pantry")] },
  { id: "pork-chops", name: "Pan-Seared Pork Chops", category: "Beef & Pork", servings: 4, ingredients: [
    ing("Pork chops", 4, "", 7, "Meat & Seafood"), ing("Potatoes", 2, "lb", 2.5, "Produce"),
    ing("Green beans", 1, "lb", 2.5, "Produce"), ing("Butter", 2, "tbsp", 0.4, "Dairy & Eggs"), ing("Garlic", 2, "clove", 0.2, "Produce")] },
  { id: "sloppy-joes", name: "Sloppy Joes", category: "Beef & Pork", servings: 4, ingredients: [
    ing("Ground beef", 1, "lb", 5, "Meat & Seafood"), ing("Hamburger buns", 4, "", 2.5, "Bakery"),
    ing("Ketchup", 0.5, "cup", 0.8, "Pantry"), ing("Onion", 1, "", 0.8, "Produce"), ing("Brown sugar", 2, "tbsp", 0.2, "Pantry")] },
  { id: "beef-stroganoff", name: "Beef Stroganoff", category: "Beef & Pork", servings: 4, ingredients: [
    ing("Ground beef", 1, "lb", 5, "Meat & Seafood"), ing("Egg noodles", 1, "bag", 2, "Pantry"),
    ing("Sour cream", 1, "cup", 2, "Dairy & Eggs"), ing("Mushrooms", 8, "oz", 2.5, "Produce"), ing("Onion", 1, "", 0.8, "Produce"), ing("Beef broth", 1, "cup", 0.8, "Pantry")] },
  { id: "sausage-peppers", name: "Sausage & Peppers", category: "Beef & Pork", servings: 4, ingredients: [
    ing("Italian sausage", 1.5, "lb", 6, "Meat & Seafood"), ing("Bell pepper", 3, "", 4.5, "Produce"),
    ing("Onion", 1, "", 0.8, "Produce"), ing("Hoagie rolls", 4, "", 3, "Bakery"), ing("Marinara sauce", 1, "cup", 1, "Pantry")] },

  // Pasta & Rice
  { id: "mac-and-cheese", name: "Homemade Mac & Cheese", category: "Pasta & Rice", servings: 6, ingredients: [
    ing("Elbow macaroni", 1, "box", 1.5, "Pantry"), ing("Cheddar cheese", 2, "cup", 4, "Dairy & Eggs"),
    ing("Milk", 1.5, "cup", 0.8, "Dairy & Eggs"), ing("Butter", 4, "tbsp", 0.8, "Dairy & Eggs"), ing("Flour", 3, "tbsp", 0.2, "Pantry")] },
  { id: "fried-rice", name: "Veggie Fried Rice", category: "Pasta & Rice", servings: 4, ingredients: [
    ing("White rice", 2, "cup", 1, "Pantry"), ing("Eggs", 3, "", 0.9, "Dairy & Eggs"),
    ing("Frozen peas & carrots", 2, "cup", 2, "Frozen"), ing("Soy sauce", 4, "tbsp", 0.5, "Pantry"), ing("Onion", 1, "", 0.8, "Produce")] },
  { id: "baked-ziti", name: "Baked Ziti", category: "Pasta & Rice", servings: 6, ingredients: [
    ing("Ziti pasta", 1, "box", 1.5, "Pantry"), ing("Marinara sauce", 1, "jar", 2.5, "Pantry"),
    ing("Ricotta", 1, "cup", 2.5, "Dairy & Eggs"), ing("Mozzarella", 2, "cup", 4, "Dairy & Eggs"), ing("Italian sausage", 0.5, "lb", 2, "Meat & Seafood")] },
  { id: "pesto-pasta", name: "Pesto Pasta", category: "Pasta & Rice", servings: 4, ingredients: [
    ing("Penne pasta", 1, "box", 1.5, "Pantry"), ing("Pesto", 1, "jar", 3.5, "Pantry"),
    ing("Cherry tomatoes", 1, "pint", 3, "Produce"), ing("Parmesan", 0.5, "cup", 2, "Dairy & Eggs")] },
  { id: "rice-beans", name: "Rice & Beans", category: "Pasta & Rice", servings: 4, ingredients: [
    ing("White rice", 2, "cup", 1, "Pantry"), ing("Black beans", 2, "can", 2.5, "Pantry"),
    ing("Onion", 1, "", 0.8, "Produce"), ing("Bell pepper", 1, "", 1.5, "Produce"), ing("Cumin", 1, "tbsp", 0.2, "Pantry"), ing("Salsa", 1, "cup", 1.5, "Pantry")] },
  { id: "pasta-primavera", name: "Pasta Primavera", category: "Pasta & Rice", servings: 4, ingredients: [
    ing("Penne pasta", 1, "box", 1.5, "Pantry"), ing("Zucchini", 2, "", 2.5, "Produce"),
    ing("Bell pepper", 1, "", 1.5, "Produce"), ing("Cherry tomatoes", 1, "pint", 3, "Produce"),
    ing("Olive oil", 3, "tbsp", 0.6, "Pantry"), ing("Parmesan", 0.5, "cup", 2, "Dairy & Eggs"), ing("Garlic", 3, "clove", 0.3, "Produce")] },
  { id: "ramen-stir-fry", name: "Upgraded Ramen Stir Fry", category: "Pasta & Rice", servings: 2, ingredients: [
    ing("Ramen noodles", 3, "pack", 1.5, "Pantry"), ing("Eggs", 2, "", 0.6, "Dairy & Eggs"),
    ing("Frozen stir-fry vegetables", 2, "cup", 2, "Frozen"), ing("Soy sauce", 3, "tbsp", 0.4, "Pantry"), ing("Green onions", 3, "", 0.8, "Produce")] },

  // Vegetarian
  { id: "veggie-bean-burritos", name: "Bean & Cheese Burritos", category: "Vegetarian", servings: 4, ingredients: [
    ing("Refried beans", 2, "can", 3, "Pantry"), ing("Flour tortillas", 8, "", 2.5, "Bakery"),
    ing("Shredded cheese", 1.5, "cup", 3, "Dairy & Eggs"), ing("Salsa", 1, "cup", 1.5, "Pantry"), ing("White rice", 1, "cup", 0.5, "Pantry")] },
  { id: "lentil-soup", name: "Lentil Soup", category: "Vegetarian", servings: 6, ingredients: [
    ing("Lentils", 1, "lb", 2, "Pantry"), ing("Carrots", 1, "lb", 1.2, "Produce"), ing("Celery", 4, "stalk", 1, "Produce"),
    ing("Onion", 1, "", 0.8, "Produce"), ing("Diced tomatoes", 1, "can", 1.2, "Pantry"), ing("Vegetable broth", 6, "cup", 3, "Pantry")] },
  { id: "veggie-omelette", name: "Veggie Omelettes", category: "Vegetarian", servings: 2, ingredients: [
    ing("Eggs", 6, "", 1.8, "Dairy & Eggs"), ing("Bell pepper", 1, "", 1.5, "Produce"),
    ing("Onion", 1, "", 0.8, "Produce"), ing("Shredded cheese", 0.5, "cup", 1, "Dairy & Eggs"), ing("Spinach", 2, "cup", 1.5, "Produce")] },
  { id: "black-bean-tacos", name: "Black Bean Tacos", category: "Vegetarian", servings: 4, ingredients: [
    ing("Black beans", 2, "can", 2.5, "Pantry"), ing("Tortillas", 8, "", 2.5, "Bakery"),
    ing("Shredded cheese", 1, "cup", 2, "Dairy & Eggs"), ing("Lettuce", 1, "head", 2, "Produce"),
    ing("Avocado", 2, "", 3, "Produce"), ing("Salsa", 1, "cup", 1.5, "Pantry")] },
  { id: "grilled-cheese-tomato-soup", name: "Grilled Cheese & Tomato Soup", category: "Vegetarian", servings: 4, ingredients: [
    ing("Bread", 1, "loaf", 2.5, "Bakery"), ing("Cheddar cheese", 8, "slice", 3, "Dairy & Eggs"),
    ing("Butter", 4, "tbsp", 0.8, "Dairy & Eggs"), ing("Tomato soup", 2, "can", 3, "Pantry")] },
  { id: "veggie-curry", name: "Vegetable Curry", category: "Vegetarian", servings: 4, ingredients: [
    ing("Chickpeas", 2, "can", 2.5, "Pantry"), ing("Coconut milk", 1, "can", 2, "Pantry"),
    ing("Curry paste", 3, "tbsp", 1.5, "Pantry"), ing("Sweet potato", 2, "", 2, "Produce"),
    ing("Spinach", 2, "cup", 1.5, "Produce"), ing("White rice", 2, "cup", 1, "Pantry")] },
  { id: "margherita-pizza", name: "Homemade Margherita Pizza", category: "Vegetarian", servings: 4, ingredients: [
    ing("Pizza dough", 1, "", 2.5, "Bakery"), ing("Mozzarella", 2, "cup", 4, "Dairy & Eggs"),
    ing("Marinara sauce", 1, "cup", 1, "Pantry"), ing("Tomato", 2, "", 2, "Produce"), ing("Fresh basil", 1, "bunch", 2, "Produce")] },

  // Slow Cooker
  { id: "pulled-pork", name: "Slow Cooker Pulled Pork", category: "Slow Cooker", servings: 8, ingredients: [
    ing("Pork shoulder", 3, "lb", 9, "Meat & Seafood"), ing("BBQ sauce", 1, "bottle", 2.5, "Pantry"),
    ing("Hamburger buns", 8, "", 4, "Bakery"), ing("Coleslaw mix", 1, "bag", 2, "Produce"), ing("Apple cider vinegar", 2, "tbsp", 0.3, "Pantry")] },
  { id: "pot-roast", name: "Slow Cooker Pot Roast", category: "Slow Cooker", servings: 6, ingredients: [
    ing("Chuck roast", 3, "lb", 15, "Meat & Seafood"), ing("Potatoes", 2, "lb", 2.5, "Produce"),
    ing("Carrots", 1, "lb", 1.2, "Produce"), ing("Onion", 1, "", 0.8, "Produce"), ing("Beef broth", 2, "cup", 1.5, "Pantry")] },
  { id: "chicken-tortilla-soup", name: "Slow Cooker Chicken Tortilla Soup", category: "Slow Cooker", servings: 6, ingredients: [
    ing("Chicken breast", 1.5, "lb", 6, "Meat & Seafood"), ing("Black beans", 1, "can", 1.2, "Pantry"),
    ing("Corn", 1, "can", 1.2, "Pantry"), ing("Diced tomatoes", 2, "can", 2.5, "Pantry"),
    ing("Chicken broth", 4, "cup", 2, "Pantry"), ing("Tortilla chips", 1, "bag", 3, "Pantry"), ing("Taco seasoning", 1, "packet", 1, "Pantry")] },
  { id: "beef-stew", name: "Slow Cooker Beef Stew", category: "Slow Cooker", servings: 6, ingredients: [
    ing("Stew beef", 2, "lb", 12, "Meat & Seafood"), ing("Potatoes", 2, "lb", 2.5, "Produce"),
    ing("Carrots", 1, "lb", 1.2, "Produce"), ing("Celery", 4, "stalk", 1, "Produce"), ing("Beef broth", 4, "cup", 2.5, "Pantry"), ing("Tomato paste", 2, "tbsp", 0.5, "Pantry")] },
  { id: "salsa-chicken", name: "Slow Cooker Salsa Chicken", category: "Slow Cooker", servings: 4, ingredients: [
    ing("Chicken breast", 2, "lb", 8, "Meat & Seafood"), ing("Salsa", 1, "jar", 3, "Pantry"),
    ing("White rice", 2, "cup", 1, "Pantry"), ing("Black beans", 1, "can", 1.2, "Pantry"), ing("Shredded cheese", 1, "cup", 2, "Dairy & Eggs")] },

  // Breakfast
  { id: "pancakes", name: "Pancakes & Eggs", category: "Breakfast", servings: 4, ingredients: [
    ing("Pancake mix", 2, "cup", 2, "Pantry"), ing("Eggs", 6, "", 1.8, "Dairy & Eggs"),
    ing("Milk", 1, "cup", 0.5, "Dairy & Eggs"), ing("Maple syrup", 0.5, "cup", 2, "Pantry"), ing("Bananas", 4, "", 1.2, "Produce")] },
  { id: "breakfast-burritos", name: "Breakfast Burritos", category: "Breakfast", servings: 4, ingredients: [
    ing("Eggs", 8, "", 2.4, "Dairy & Eggs"), ing("Flour tortillas", 4, "", 1.5, "Bakery"),
    ing("Shredded cheese", 1, "cup", 2, "Dairy & Eggs"), ing("Breakfast sausage", 0.5, "lb", 2.5, "Meat & Seafood"), ing("Salsa", 0.5, "cup", 0.8, "Pantry")] },
  { id: "oatmeal", name: "Oatmeal with Fruit", category: "Breakfast", servings: 4, ingredients: [
    ing("Rolled oats", 2, "cup", 1.5, "Pantry"), ing("Milk", 2, "cup", 1, "Dairy & Eggs"),
    ing("Bananas", 3, "", 0.9, "Produce"), ing("Brown sugar", 4, "tbsp", 0.3, "Pantry"), ing("Cinnamon", 1, "tsp", 0.1, "Pantry")] },
  { id: "french-toast", name: "French Toast", category: "Breakfast", servings: 4, ingredients: [
    ing("Bread", 8, "slice", 1.5, "Bakery"), ing("Eggs", 4, "", 1.2, "Dairy & Eggs"),
    ing("Milk", 0.5, "cup", 0.3, "Dairy & Eggs"), ing("Maple syrup", 0.5, "cup", 2, "Pantry"), ing("Cinnamon", 1, "tsp", 0.1, "Pantry")] },
  { id: "yogurt-parfait", name: "Yogurt Parfaits", category: "Breakfast", servings: 4, ingredients: [
    ing("Greek yogurt", 2, "cup", 3, "Dairy & Eggs"), ing("Granola", 1, "cup", 2, "Pantry"),
    ing("Bananas", 2, "", 0.6, "Produce"), ing("Frozen berries", 1, "cup", 2, "Frozen"), ing("Honey", 2, "tbsp", 0.5, "Pantry")] },
  { id: "egg-potato-hash", name: "Egg & Potato Hash", category: "Breakfast", servings: 4, ingredients: [
    ing("Potatoes", 2, "lb", 2.5, "Produce"), ing("Eggs", 6, "", 1.8, "Dairy & Eggs"),
    ing("Bell pepper", 1, "", 1.5, "Produce"), ing("Onion", 1, "", 0.8, "Produce"), ing("Shredded cheese", 0.5, "cup", 1, "Dairy & Eggs")] },

  // Soups
  { id: "tomato-soup", name: "Creamy Tomato Soup", category: "Soups", servings: 4, ingredients: [
    ing("Crushed tomatoes", 2, "can", 3, "Pantry"), ing("Heavy cream", 0.5, "cup", 1.2, "Dairy & Eggs"),
    ing("Onion", 1, "", 0.8, "Produce"), ing("Garlic", 3, "clove", 0.3, "Produce"), ing("Vegetable broth", 2, "cup", 1.5, "Pantry")] },
  { id: "potato-soup", name: "Loaded Potato Soup", category: "Soups", servings: 6, ingredients: [
    ing("Potatoes", 3, "lb", 3.5, "Produce"), ing("Bacon", 0.5, "lb", 3.5, "Meat & Seafood"),
    ing("Cheddar cheese", 1, "cup", 2, "Dairy & Eggs"), ing("Milk", 2, "cup", 1, "Dairy & Eggs"),
    ing("Onion", 1, "", 0.8, "Produce"), ing("Chicken broth", 4, "cup", 2, "Pantry")] },
  { id: "minestrone", name: "Minestrone Soup", category: "Soups", servings: 6, ingredients: [
    ing("Ditalini pasta", 1, "cup", 1, "Pantry"), ing("Kidney beans", 1, "can", 1.2, "Pantry"),
    ing("Diced tomatoes", 2, "can", 2.5, "Pantry"), ing("Zucchini", 1, "", 1.2, "Produce"),
    ing("Carrots", 0.5, "lb", 0.6, "Produce"), ing("Vegetable broth", 6, "cup", 3, "Pantry"), ing("Onion", 1, "", 0.8, "Produce")] },
  { id: "white-chicken-chili", name: "White Chicken Chili", category: "Soups", servings: 6, ingredients: [
    ing("Chicken breast", 1.5, "lb", 6, "Meat & Seafood"), ing("White beans", 2, "can", 2.5, "Pantry"),
    ing("Green chiles", 1, "can", 1.2, "Pantry"), ing("Chicken broth", 4, "cup", 2, "Pantry"),
    ing("Sour cream", 0.5, "cup", 1, "Dairy & Eggs"), ing("Onion", 1, "", 0.8, "Produce")] },
];

export const mealCost = (m: Meal) => m.ingredients.reduce((s, i) => s + i.price, 0);

export interface CustomMeal {
  id: string;
  name: string;
  cost: number;
  ingredients: string; // free text, one per line
  custom: true;
}

export type PlannerMeal = { kind: "library"; meal: Meal } | { kind: "custom"; meal: CustomMeal };

export const plannerMealCost = (p: PlannerMeal) => (p.kind === "library" ? mealCost(p.meal) : p.meal.cost);
export const plannerMealName = (p: PlannerMeal) => p.meal.name;
export const plannerMealId = (p: PlannerMeal) => p.meal.id;
