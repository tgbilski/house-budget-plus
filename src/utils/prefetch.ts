// Route prefetching map - matches lazy() imports in App.tsx
const routeImports: Record<string, () => Promise<unknown>> = {
  '/': () => import('@/pages/MonthlyBudget'),
  '/budget': () => import('@/pages/MonthlyBudget'),
  '/expenses': () => import('@/pages/Expenses'),
  '/savings': () => import('@/pages/SavingsGoals'),
  '/vacation': () => import('@/pages/Vacation'),
  '/gifts': () => import('@/pages/Gifts'),
  '/blog': () => import('@/pages/Blog'),
  '/ai-insights': () => import('@/pages/AIInsights'),
  '/house-comparison': () => import('@/pages/HouseComparison'),
  '/settings': () => import('@/pages/UserSettings'),
  '/admin': () => import('@/pages/Admin'),
  '/about': () => import('@/pages/AboutUs'),
  '/contact': () => import('@/pages/ContactUs'),
};

const prefetchedRoutes = new Set<string>();

export const prefetchRoute = (path: string) => {
  if (prefetchedRoutes.has(path)) return;
  const loader = routeImports[path];
  if (loader) {
    prefetchedRoutes.add(path);
    loader();
  }
};
