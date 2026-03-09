---
name: audit-ui-system
description: Audit UI code for consistent use of the design system, avoiding raw HTML where components exist, detecting styling overrides, and flagging inconsistent variants. Use when reviewing UI changes, debugging visual inconsistencies, or enforcing design system rules.
---

# Audit UI System

This skill guides the agent through systematically auditing the UI layer for:

- **Usage of design system components**
- **Raw HTML elements where components exist**
- **Styling overrides that fight the design system**
- **Inconsistent or ad-hoc variants**

The goal is to surface design-system violations and propose normalization to a single, consistent UI system, not to automatically rewrite everything.

## When to Use

Use this skill when:

- The user mentions **design system**, **UI consistency**, or **visual drift**.
- The user asks to **audit components**, **find raw HTML**, or **enforce design tokens/variants**.
- You are reviewing **new UI features** or **refactors** and need to ensure they follow the system.

---

## 1. Discover the UI System

1. **Identify the design system entry points**
   - Look for shared UI libraries such as `components/ui/*`, `@/components/ui`, or similar.
   - Note core primitives like `Button`, `Input`, `Textarea`, `Select`, `Card`, `Badge`, `Tag`, `Dialog`, etc.

2. **Map canonical variants and props**
   - For each core primitive, note:
     - Variant prop names (for example: `variant`, `size`, `tone`, `intent`).
     - Allowed variant values (for example: `primary`, `secondary`, `ghost`, `outline`).
     - Any props that control color, emphasis, or hierarchy.

3. **Capture any project-specific rules**
   - If the repo or user rules forbid patterns (for example: `bg-black`, `!important`, inline `style`), record them as violations to check for.

Keep a short list of design system components and their expected variants to reference in later steps.

---

## 2. Check Usage of Design System Components

Focus on where design system primitives **should** be used but might not be.

1. **Search for raw HTML tags that map to components**
   - Examples:
     - `button` → `Button`
     - `input` → `Input`
     - `textarea` → `Textarea`
     - `select` → `Select`
     - `a` used as a button → `Button` or a dedicated link component.
   - Use code search to find these tags in feature modules (for example: `modules/*/components`) outside the core design system directory.

2. **Classify findings**
   - Acceptable:
     - Semantic-only usage where no design system equivalent exists (for example: `table`, `thead`, `tbody`, basic layout wrappers when no layout component exists).
   - Potential violations:
     - Raw `button`, `input`, `textarea`, `select` where a design system primitive exists.
     - Custom `a` tags styled as buttons instead of using the system.

3. **Record violations**
   - For each violation, record:
     - File path and component name.
     - Raw element used and the likely design system replacement.
     - Any context (for example: "used inside lead details header").

---

## 3. Detect Styling Overrides

Look for styling patterns that bypass or fight the design system.

1. **Search for forbidden or suspicious patterns**
   - Inline `style={...}` objects on interactive elements.
   - CSS `!important` in stylesheets, CSS modules, or class names.
   - Hard-coded colors or tokens that bypass the system, for example:
     - Tailwind classes like `bg-black`, `bg-white`, `text-red-500`, `border-gray-300` where the system expects semantic tokens.
     - Arbitrary values like `bg-[#000000]`, `text-[13px]`.

2. **Check component props that duplicate style concerns**
   - Props such as `primary`, `danger`, `kind`, `level` that coexist with `variant` may signal ad-hoc styling paths.
   - Custom boolean props that toggle classes instead of using canonical variants.

3. **Evaluate necessity**
   - Mark as **high-risk** overrides:
     - `!important` usage.
     - Hard-coded colors on design system primitives that should inherit tokens.
   - Mark as **medium-risk** overrides:
     - One-off spacing tweaks (`mt-[3px]`, `gap-[7px]`).
     - Local layout-only overrides that do not change the visual language.

4. **Record findings**
   - For each override, note:
     - Location (file and component).
     - Type of override (inline style, `!important`, hard-coded color, arbitrary spacing).
     - Suggested refactor (for example: "introduce `size='sm'` variant" or "use semantic token class").

---

## 4. Audit Variant Usage and Consistency

Ensure that variant props are used consistently and match the design system contract.

1. **Enumerate canonical variants**
   - For each core primitive (for example: `Button`), list allowed variants and sizes from the design system implementation.
   - Note any deprecated or alias values if present.

2. **Search for all usages of key components**
   - Use code search for imports like:
     - `import { Button } from "components/ui/button"`
     - `import { Button } from "@/components/ui/button"`
   - Collect variant usages such as `variant="primary"`, `variant="ghost"`, `size="sm"`, etc.

3. **Flag inconsistent or ad-hoc variants**
   - Values not defined in the canonical list (for example: `variant="primaryGhost"` when only `primary` and `ghost` exist).
   - Variants created by combining multiple boolean props instead of a single variant prop.
   - Components that hard-code classes instead of using the variant system.

4. **Check cross-feature consistency**
   - Compare how similar actions (for example: "Save", "Cancel", "Delete", "Import") are styled across modules.
   - Flag cases where the same action uses different variants, tones, or sizes without a clear reason.

5. **Record findings**
   - For each inconsistent variant, record:
     - Component and location.
     - Variant/size values used.
     - Expected canonical variant.
     - Recommendation (for example: "normalize to `variant='outline'` for secondary actions").

---

## 5. Summarize Findings and Recommendations

At the end of the audit, provide a structured summary.

Use this template:

```markdown
## UI System Audit Summary

### Design system usage
- [ ] Location: `path/to/File.tsx` — raw `button` used. Recommendation: replace with `Button` from the design system.

### Raw HTML elements
- [ ] Location: `path/to/File.tsx` — `input` and `textarea` used directly. Recommendation: migrate to `Input` and `Textarea` components.

### Styling overrides
- [ ] Location: `path/to/File.tsx` — uses `bg-black` and `!important`. Recommendation: use semantic color tokens and remove `!important`.

### Inconsistent variants
- [ ] Component: `Button` in `path/to/Feature.tsx` — `variant="primaryGhost"` not in canonical list. Recommendation: normalize to existing variants or extend design system in one place.
```

Be explicit about:

- Which violations are **high priority** (for example: breaking design tokens or accessibility).
- Where to consolidate to a **single source of truth** in the design system (for example: adding a new variant instead of hand-rolling styles).
- Any **follow-up refactors** needed (for example: introduce new semantic variants, deprecate legacy props).

