---
name: audit-repo-structure
description: Scan the repository for duplicated components, duplicated routes, legacy implementations, unused files, and circular imports. Use when the user asks to audit or clean up the repo structure, find dead code, or identify overlapping implementations.
---

# Audit Repo Structure

This skill guides the agent through systematically auditing a repository for:

- **Duplicated components**
- **Duplicated routes**
- **Legacy or overlapping implementations**
- **Unused files**
- **Circular imports**

The goal is to surface structure issues and propose a consolidation/cleanup plan, not to automatically delete code.

## When to Use

Use this skill when:

- The user asks to "audit", "clean up", or "rationalize" the repo structure.
- The user suspects **duplicated components**, **duplicated routes**, or **legacy implementations**.
- The user wants to find **unused files** or **dead code**.
- The user mentions **circular imports** or strange dependency behavior.

## High-Level Workflow

Follow this checklist in order:

```markdown
Task Progress:
- [ ] 1. Discover project structure
- [ ] 2. Detect duplicated components
- [ ] 3. Detect duplicated routes
- [ ] 4. Identify legacy/overlapping implementations
- [ ] 5. Find unused files
- [ ] 6. Detect circular imports
- [ ] 7. Summarize findings and recommendations
```

Keep notes of findings grouped by category so they can be summarized for the user at the end.

---

## 1. Discover Project Structure

1. **Scan top-level layout**
   - Use the project’s workspace root as the base.
   - Identify primary source directories (for example: `app`, `src`, `modules`, `packages`, `components`).

2. **Map key domains**
   - Note domain folders like `modules/leads`, `modules/auth`, `modules/billing`, etc.
   - Identify where UI components live (for example: `components`, `components/ui`, `modules/*/components`).

3. **Note routing system**
   - For Next.js or similar, identify route roots (for example: `app/`, `pages/`, `routes/`).
   - Capture patterns like dynamic segments (`[id]`) or nested routes.

You may use:
- Glob-style search to list directories and files.
- Code exploration tools to understand how routing is configured.

---

## 2. Detect Duplicated Components

Focus on reusable UI or logic components that appear multiple times with slightly different names or paths.

1. **List component directories**
   - Identify common component roots (for example: `components`, `components/ui`, `modules/*/components`).

2. **Search for similar component names**
   - Group by base name ignoring folder and minor naming differences.
   - Examples: `LeadCard` in different modules, multiple `Button` variants outside the design system.

3. **Check for functional duplication**
   - Read each candidate’s implementation.
   - Compare:
     - Props and public API
     - Visual behavior and layout
     - Domain logic inside

4. **Classify each finding**
   - **Exact duplication**: same logic/layout with trivial differences.
   - **Partial overlap**: mostly similar but with small divergent logic.
   - **Intentional variation**: materially different purposes (do not recommend consolidation without reason).

5. **Record findings**
   - For each group of potential duplicates, record:
     - File paths
     - Short description of what they do
     - Degree of overlap (exact / partial / intentional)
     - Suggested “single source of truth” candidate if consolidation makes sense.

---

## 3. Detect Duplicated Routes

1. **Enumerate routes**
   - For frameworks like Next.js, list directories under `app/` or `pages/`.
   - Include dynamic routes like `[id]`, `[slug]`, etc.

2. **Identify overlapping paths**
   - Look for:
     - Multiple routes handling the same logical resource in different paths (for example: `/leads/[id]` vs `/dashboard/leads/[id]`).
     - Legacy v1 vs v2 route patterns that still exist.

3. **Inspect implementations**
   - Compare the page/route components:
     - What data they load
     - What components they render
     - UX differences (view vs edit vs detail vs admin)

4. **Classify and record**
   - Classify routes as:
     - **Exact duplicate behavior**
     - **Partial overlap** (similar logic/UX)
     - **Legacy** (old route no longer primary)
   - For each, record:
     - File path
     - URL pattern
     - Summary of differences
     - Recommendation (keep primary, deprecate legacy, consolidate logic).

---

## 4. Identify Legacy / Overlapping Implementations

Look for old versions of key features that co-exist with newer ones.

1. **Search for versioning hints**
   - Filenames or folders like:
     - `*Old*`, `*Legacy*`, `*Deprecated*`
     - `v1`, `v2`, `experimental`, `new-*`

2. **Trace usage**
   - For each suspected legacy implementation, search the codebase for imports or references.
   - If something is not imported anywhere or only used from older routes or admin-only areas, mark it as **legacy** or **low-traffic**.

3. **Compare with newer implementations**
   - Identify the “modern” or recommended path.
   - Note the main behavioral and data differences.

4. **Record recommendations**
   - For each legacy candidate, record:
     - File path and/or module
     - Current usage (none, limited, critical)
     - Suggested action (deprecate, migrate behavior into newer code, or keep).

---

## 5. Find Unused Files

Focus on source files (components, utilities, hooks, modules), not on build artifacts.

1. **List candidate files**
   - Target directories like `app`, `src`, `modules`, `components`.
   - Exclude known build/output directories (for example: `.next`, `dist`, `out`).

2. **Check for imports**
   - For each candidate file:
     - Search the repo for its import path or named exports.
   - If there are **no references**, mark as **unused**.

3. **Special cases**
   - Entry points (like `app/layout.tsx`, `app/page.tsx`) may not be imported but are still used by the framework.
   - Configuration files (for example: `next.config.mjs`, `tailwind.config.ts`) are used by tooling, not imports.
   - Test files may only be referenced by the test runner; do not treat them as unused solely due to no imports.

4. **Record unused candidates**
   - For each unused candidate, record:
     - File path
     - Type (component, hook, util, config, test)
     - Any caveats (for example: “Framework entry file, do not delete without framework knowledge”).

Do **not** delete files automatically; instead, present a list of candidates and recommended actions.

---

## 6. Detect Circular Imports

1. **Understand the module graph**
   - Focus on application code (for example: `app`, `src`, `modules`, `components`).
   - Ignore known framework or external library internals.

2. **Search for circular patterns**
   - Where tooling exists (for example: ESLint plugins, TS server diagnostics), consult its output for circular dependency warnings.
   - Otherwise, approximate by:
     - Noting pairs of modules that import each other directly (A imports B and B imports A).
     - Watching for longer cycles when exploring imports (A → B → C → A).

3. **Assess impact**
   - For each detected cycle, identify:
     - What each module is responsible for (UI, data access, shared types).
     - Whether the cycle crosses layers (for example: UI importing data layer that imports UI).
   - Note any runtime symptoms if mentioned (for example: undefined exports at runtime, flaky behavior).

4. **Record and propose refactors**
   - For each cycle, record:
     - Modules involved
     - Nature of shared dependencies (types vs runtime logic)
     - Suggested resolution (for example: extract shared types/utilities to a lower-level module, invert dependency via callbacks or interfaces).

---

## 7. Summarize Findings and Recommendations

When the audit is complete, summarize in a structured format for the user.

Use this template:

```markdown
## Repo Structure Audit Summary

### Duplicated components
- [ ] Item: `path/to/ComponentA` and `path/to/ComponentB` — [exact/partial/intentional]. Recommendation: [...]

### Duplicated routes
- [ ] Route: `/example/[id]` at `app/example/[id]/page.tsx` and `app/legacy-example/[id]/page.tsx`. Recommendation: [...]

### Legacy or overlapping implementations
- [ ] Module: `modules/example/OldFeature.tsx` — used in X places. Recommendation: [...]

### Unused files
- [ ] File: `modules/example/UnusedHelper.ts` — no imports found. Recommendation: safely remove after confirming with team.

### Circular imports
- [ ] Cycle: `modules/a/index.ts` ↔ `modules/b/index.ts` (and any others). Recommendation: [...]
```

Be explicit about:
- Which items are **safe cleanups** vs **need human confirmation**.
- Where consolidating to a **single source of truth** is recommended.
- Any **risks or migration steps** required.

Do **not** make destructive changes (deletion, large refactors) without explicit user consent; instead, surface a clear, prioritized list of issues and proposed next steps.

