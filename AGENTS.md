# Architecture rules

- Use the same interactive planner for visitors and buyers, and gate price rendering and exported totals on paid access; this keeps preview plans intact after purchase without duplicating planning logic.
- Render locked prices as placeholder values rather than actual blurred amounts; this avoids exposing prices through accessibility text, copying, or printing in the preview.
- Use a shared route-based planner mode switch on the calculator and both planners; this keeps navigation consistent while retaining separate plans and paid access for each product.