# Project Instructions — Automation Wireframe

## Critical Rule: Always Test Every Clickable Element

When building any new page or screen:

1. **Before coding**, navigate to the original Vyapar TaxOne page in the browser
2. **Click every single interactive element**: buttons, toggles, checkboxes, dropdowns, links, tabs
3. **Document what each click does**: does the UI change? does a new section appear? does a dialog open?
4. **Test all state combinations**: if there are Yes/No toggles, test all possible combinations (Yes/Yes, Yes/No, No/Yes, No/No)
5. **Check for conditional UI**: some elements only appear when a checkbox is checked or a toggle is in a specific state
6. **Verify narration/extra fields**: when checkboxes are ticked, additional inputs (dropdowns, text fields) may appear inline
7. **Test the header-level checkboxes**: they often act as "select all" for rows below them

## Architecture Notes

- Next.js 14 App Router with dynamic route segments
- Tailwind CSS for pixel-perfect UI
- `lucide-react@0.383` for icons
- Fixed-position dropdowns with `z-[9999]` to avoid parent overflow clipping
- Smart dropdown positioning: opens upward if near bottom of viewport
- `FieldDropdown` component is the standard dropdown — use it everywhere instead of `DropdownSelect`
- Flex layout chain for full-viewport: `h-screen` → `flex-1 overflow-hidden` → `flex-1 min-h-0` → header (fixed) + content (flex-1 overflow-y-auto) + footer (fixed)

## File Structure

- `/src/components/SalesWorkflow.tsx` — All 5 Sales workflow screens (Field Mapping, GST Mapping, Ledger Mapping, Sales Transactions, Sales Table)
- `/src/app/app/da/layout.tsx` — Shared layout with Sidebar
- `/src/app/app/da/bulk-upload/[tab]/page.tsx` — 8 bulk upload tabs
- `/src/app/app/da/sales/[fileId]/field-mapping/page.tsx` — Field Mapping route
- `/src/app/app/da/sales/[fileId]/gst-mapping/page.tsx` — GST Mapping route
- `/src/app/app/da/sales/[fileId]/ledger-mapping/page.tsx` — Ledger Mapping route
- `/src/app/app/da/sales/[fileId]/transactions/page.tsx` — Sales Transactions route
