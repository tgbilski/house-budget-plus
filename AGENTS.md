# Architecture rules

- Use the same interactive planner for visitors and buyers, and gate price rendering and exported totals on paid access; this keeps preview plans intact after purchase without duplicating planning logic.
- Render locked prices as placeholder values rather than actual blurred amounts; this avoids exposing prices through accessibility text, copying, or printing in the preview.
- The Regular/Low-FODMAP switch maps each page to its counterpart (calculator↔calculator, planner↔planner); each version has its own calculator page, planner, and checkout product so the funnels stay parallel.
- Keep mobile tap sizing in shared form controls and use wrapping category navigation and long-label buttons; this keeps both planning funnels usable on narrow phones.