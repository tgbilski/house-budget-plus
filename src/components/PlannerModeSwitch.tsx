import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function PlannerModeSwitch({ mode }: { mode: "grocery" | "fodmap" }) {
  return (
    <nav aria-label="Planner type" className="flex justify-end print:hidden">
      <div className="inline-flex max-w-full items-center gap-1 rounded-lg border border-border bg-muted p-1">
        <Button asChild variant={mode === "grocery" ? "default" : "ghost"} className="h-11 px-3 text-sm rounded-md border-0 shadow-none hover:translate-x-0 hover:translate-y-0 hover:shadow-none active:translate-x-0 active:translate-y-0">
          <Link to="/planner" aria-current={mode === "grocery" ? "page" : undefined}>Regular</Link>
        </Button>
        <Button asChild variant={mode === "fodmap" ? "default" : "ghost"} className="h-11 px-3 text-sm rounded-md border-0 shadow-none hover:translate-x-0 hover:translate-y-0 hover:shadow-none active:translate-x-0 active:translate-y-0">
          <Link to="/low-fodmap-planner" aria-current={mode === "fodmap" ? "page" : undefined}>Low-FODMAP</Link>
        </Button>
      </div>
    </nav>
  );
}