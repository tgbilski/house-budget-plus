import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PATHS = {
  calculator: { grocery: "/", fodmap: "/low-fodmap-grocery-budget-calculator" },
  planner: { grocery: "/planner", fodmap: "/low-fodmap-planner" },
} as const;

const cls = "h-11 px-3 text-sm rounded-md border-0 shadow-none hover:translate-x-0 hover:translate-y-0 hover:shadow-none active:translate-x-0 active:translate-y-0";

export function PlannerModeSwitch({ mode, page = "calculator" }: { mode: "grocery" | "fodmap"; page?: "calculator" | "planner" }) {
  const paths = PATHS[page];
  return (
    <nav aria-label="Regular or low-FODMAP" className="flex justify-end print:hidden">
      <div className="inline-flex max-w-full items-center gap-1 rounded-lg border border-border bg-muted p-1">
        <Button asChild variant={mode === "grocery" ? "default" : "ghost"} className={cls}>
          <Link to={paths.grocery} aria-current={mode === "grocery" ? "page" : undefined}>Regular</Link>
        </Button>
        <Button asChild variant={mode === "fodmap" ? "default" : "ghost"} className={cls}>
          <Link to={paths.fodmap} aria-current={mode === "fodmap" ? "page" : undefined}>Low-FODMAP</Link>
        </Button>
      </div>
    </nav>
  );
}
