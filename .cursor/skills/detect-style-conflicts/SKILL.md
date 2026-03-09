---
name: detect-style-conflicts
description: Scan the codebase for hard-coded background colors, !important usage, and global button style overrides that conflict with the design system. Use when enforcing design rules around bg-black, bg-neutral-900, !important, or debugging inconsistent button styling.
---

# Detect Style Conflicts

This skill guides the agent to systematically scan for **style conflicts** with the design system, focusing on:

- **Forbidden or risky background colors** like `bg-black` and `bg-neutral-900`
- **`!important` usage** in any styles
- **Global button styles** that override or bypass the design system `Button` component

The goal is to **surface conflicts**, not automatically rewrite everything.

---

## When to Use

Use this skill when:

- The user mentions **bg-black**, **bg-neutral-900**, or **!important**.
- You see **visual inconsistencies** in buttons or backgrounds.
- Auditing UI code for **design system adherence** or **style drift**.
- Before adding new UI features that touch button styling or global styles.

---

## 1. Identify Design System Button and Global Style Entry Points

1. **Locate the design system button**
   - Search for `components/ui/button` or similar imports:
     - `import { Button } from "components/ui/button"`
     - `import { Button } from "@/components/ui/button"`
   - Note the canonical props and variants (for example: `variant`, `size`).

2. **Locate global styles**
   - Look for global CSS or Tailwind entry points such as:
     - `app/globals.css`
     - `styles/*.css` or `styles/globals.css`
   - Note any global `button` selectors, utility classes, or resets.

Keep in mind: **buttons should rely on the design system**, not ad-hoc global styles.

---

## 2. Scan for Forbidden Background Colors

Search for direct usage of problematic background utilities:

1. **Search patterns**
   - `bg-black`
   - `bg-neutral-900`
   - Any other hard-coded dark backgrounds if project rules forbid them.

2. **Where to search**
   - Component files: `*.tsx`, `*.jsx`.
   - Styles: `*.css`, `*.scss`, `*.module.css`, etc.

3. **Classify findings**
   - **High-risk**:
     - `bg-black` or `bg-neutral-900` on core layout containers, headers, buttons, or primary surfaces.
   - **Medium-risk**:
     - Isolated backgrounds on non-critical decorative elements.

4. **Record each violation**
   - File path and component name.
   - Exact class or declaration (for example: `className="bg-black ..."`, `background-color: #000;`).
   - Suggested alternative (for example: semantic background token or design system variant).

---

## 3. Scan for `!important` Usage

Identify all occurrences of `!important` which usually indicate conflicts with the design system:

1. **Search patterns**
   - `!important` in any stylesheet or inline style-like strings.

2. **Where to search**
   - Global CSS and modules: `*.css`, `*.scss`, `*.module.css`.
   - Utility layers, Tailwind overrides, or third-party overrides.

3. **Classify findings**
   - **High-risk**:
     - `!important` applied to colors, typography, spacing, or layout of design system components (for example: `button`, `.btn`, `.Button`).
   - **Medium-risk**:
     - `!important` used to patch third-party library quirks with no better hook.

4. **Record each occurrence**
   - File and selector (for example: `.btn-primary`, `.some-override button`).
   - Property being forced (for example: `background-color`, `color`, `padding`).
   - Note whether it appears to override the design system `Button` or other primitives.

---

## 4. Detect Global Button Styles and Conflicts

Find global button definitions that may conflict with the design system `Button` component.

1. **Search for global button selectors**
   - In CSS files, look for:
     - `button { ... }`
     - `button:hover`, `button:focus`, `button:disabled`, etc.
     - `.btn`, `.button`, `.primary-button`, or similar utility-style classes.

2. **Check for Tailwind-based globals**
   - Look for `@layer base` or `@layer components` blocks that define:
     - `button` selectors with Tailwind utilities.
     - Button-like classes (for example: `.btn-primary`, `.btn-secondary`).

3. **Evaluate conflicts**
   - High-risk patterns:
     - Global `button` styles that define colors, radii, typography, or padding that differ from the design system `Button`.
     - `.btn*` classes used in feature components instead of importing `Button`.
   - Medium-risk patterns:
     - Minimal resets (for example: `button { border: none; background: transparent; }`) that are clearly part of a reset strategy.

4. **Relate to component usage**
   - Cross-check feature components:
     - Look for raw `button` usage in `modules/*/components` and confirm they should be using the design system `Button`.
     - Note any components that combine `button` tags with global button classes.

5. **Record conflicts**
   - File, selector, or class.
   - How it might diverge from or override the design system `Button`.
   - Recommendation (for example: "move styles into the Button component", "replace `.btn-primary` with `Button` variant").

---

## 5. Optional: Check for Inline or Ad-hoc Button Styles

To catch more subtle conflicts, you can also:

1. Search for inline button styling in JSX:
   - `style={{ ... }}` on `button` elements.
   - Hard-coded background or color classes on `button` elements (for example: `className="bg-black text-white"`).

2. Search for alternative button-like patterns:
   - `a` tags or `div` elements styled to look like buttons.
   - Custom components that wrap `button` but re-implement styles instead of delegating to the design system `Button`.

3. Record any high-impact findings with:
   - File and component name.
   - Pattern used (inline style, custom class, etc.).
   - Suggested migration path to the design system.

---

## 6. Summarize Style Conflicts

At the end of the scan, provide a structured summary of style conflicts.

Use this template:

```markdown
## Style Conflict Summary

### Forbidden backgrounds (bg-black, bg-neutral-900)
- [ ] Location: `path/to/File.tsx` — `className="bg-black ..."` on [element]. Recommendation: replace with semantic background token or adjust `Button`/layout variant.

### !important usage
- [ ] Location: `path/to/styles.css` — `.selector { background-color: red !important; }`. Recommendation: remove `!important` and resolve specificity via design system or better selector.

### Global button styles
- [ ] Location: `app/globals.css` — `button { ... }` defines colors and padding. Recommendation: move into `Button` component or align with its variants; keep global rules to minimal resets.

### Ad-hoc button implementations
- [ ] Location: `modules/.../SomeComponent.tsx` — raw `button` or `.btn-primary` class instead of `Button`. Recommendation: migrate to design system `Button` with appropriate variant.
```

Be explicit about:

- Which conflicts are **high priority** (for example: `bg-black` on primary surfaces, `!important` on design system components).
- Where to consolidate to a **single source of truth** for button styles (for example: centralizing in `components/ui/button`).
- Any **follow-up refactors** (for example: introduce new button variants instead of repeatedly applying ad-hoc classes).

