---
name: map-component-dependencies
description: Build and visualize React/Next.js component dependency trees by scanning imports and usages. Use when analyzing what a component depends on, who uses a component, or when the user asks for a dependency map or impact analysis of UI components.
---

# Map Component Dependencies

## Goal

Build a clear dependency map of components by following import relationships, then present the result as an indented tree, for example:

```text
LeadPanel
 → LeadHeader
 → LeadTimeline
 → LeadSidebar
```

Applies primarily to React/Next.js components in `.tsx` / `.jsx` files.

---

## When to Use This Skill

Use this skill when:

- The user asks **"what does component X depend on?"**
- The user asks **"who uses component X?"** or **"where is X used?"**
- The user wants an **impact analysis** before changing or deleting a component
- The user asks for a **dependency tree**, **composition map**, or **hierarchy** of components for a feature or route

---

## Conventions & Scope

1. **Components**: Focus on React components (functions or classes whose names start with a capital letter) and Next.js route components.
2. **Files of interest**:
   - `app/**` (route/page/layout components)
   - `components/**` (shared UI, design system, layout components)
   - `modules/**` (feature-level components like leads, accounts, etc.)
3. **Edges in the graph**:
   - A **parent → child** edge exists when parent imports and renders child.
   - Global utility imports (e.g. `lib/**`, hooks, store, constants) are **not** part of the component *hierarchy* tree unless the user explicitly wants them.

---

## Core Workflow

Follow this workflow whenever the user asks for a component dependency map.

### 1. Identify the Target Component(s)

1. Use the user-provided name(s) as **root nodes**, for example `LeadPanel`.
2. If the file path is not given:
   - Search for the component definition by name using `Grep` with a pattern like:
     - `^export (default )?function LeadPanel`
     - `^export (const|function|class) LeadPanel`
   - Restrict search to likely directories (`modules/**`, `components/**`, `app/**`) when helpful.
3. If multiple matches exist, inspect each candidate briefly and:
   - Prefer `.tsx` under feature/module folders (e.g. `modules/leads/components/LeadPanel.tsx`) over generic names.
   - If ambiguity remains, note it explicitly and choose the most likely match based on directory context.

### 2. Build a Forward Dependency Tree (What the Component Uses)

For each root component, recursively discover the components it directly and indirectly depends on.

1. **Locate the file** for the component and read it.
2. **Collect local component imports**:
   - Scan import statements that reference local files (paths starting with `./`, `../`, or project-relative aliases like `modules/`, `components/`, `app/`).
   - From these imports, keep only those that are **components**, not utilities:
     - Look for imported identifiers that start with a capital letter (e.g. `LeadHeader`, `LeadTimeline`).
     - Optionally cross-check by searching for a React component definition in the imported file.
3. **Avoid design-system explosion**:
   - By default, **collapse design system imports** like `components/ui/button` into a single pseudo-node such as `DesignSystem` unless the user cares about low-level UI primitives.
   - You can still mention key design-system components separately if they are important to the question.
4. **Recurse**:
   - For each discovered child component, repeat steps 1–3, unless:
     - The component has already been visited (avoid cycles), or
     - The user asked for only a 1-level deep map.

### 3. Build a Reverse Dependency Map (Who Uses This Component) — Optional

Use this if the user asks where a component is used or wants impact analysis.

1. Use `Grep` to find all import statements that bring in the target component name.
2. For each importing file:
   - Confirm that it is a component (usually `.tsx` under `modules/**`, `components/**`, or `app/**`).
   - Add an edge `Importer → TargetComponent`.
3. Present results as:
   - A flat list of parents, or
   - A small tree rooted at the target, with parents above it, depending on what the user requested.

---

## Presenting the Dependency Tree

Always present the primary result as a clear, indented text tree.

### Output Format

For **forward (composition) trees**, use this pattern:

```text
[RootComponent]
 → [DirectChildA]
   → [GrandChildA1]
   → [GrandChildA2]
 → [DirectChildB]
```

For **multiple roots**, separate them with a blank line:

```text
LeadPanel
 → LeadHeader
 → LeadTimeline
 → LeadSidebar

LeadRow
 → LeadQuickActions
 → TagPill
```

You may also include a compact summary, for example:

- `LeadPanel`: 3 direct children, 7 total descendants
- `LeadTimeline`: 2 direct children

### Example

If the user asks for a dependency map of `LeadPanel`, a good response is:

```text
LeadPanel
 → LeadHeader
 → LeadTimeline
   → TagPill
 → LeadSidebar
```

Optionally follow with a short explanation, such as:

- `LeadPanel` composes high-level lead detail sections.
- `LeadTimeline` itself depends on `TagPill` for rendering tags.

---

## Practical Tips

- **Be explicit about scope**: If you only covered a subset of folders (e.g. `modules/leads/**`), state that clearly.
- **Handle aliases carefully**: When you see imports like `@/modules/leads/components/LeadHeader`, treat them as local components and resolve the path if needed.
- **Cycles**: If you detect circular dependencies (A imports B and B imports A), mention them explicitly and avoid infinite recursion.
- **Granularity**: Default to 2–3 levels deep unless the user asks for "full tree" or "all descendants".

---

## Quick Checklist

Before answering the user:

- [ ] Identified the correct file(s) for the target component(s)
- [ ] Built a forward dependency tree by following local component imports
- [ ] (Optional) Built a reverse dependency list if the user cares who uses the component
- [ ] Presented the tree as a clear, indented text structure
- [ ] Noted any ambiguities, skipped areas, or cycles

