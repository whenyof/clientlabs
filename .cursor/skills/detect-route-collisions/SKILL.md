---
name: detect-route-collisions
description: Detects duplicated and overlapping routes in Next.js (especially app router) projects by mapping filesystem paths to URL patterns and surfacing collisions, legacy variants, and ambiguous dynamic segments. Use when users report routing bugs, 404s, unexpected pages, or ask to audit routes for duplicates, overlaps, or alternative/legacy paths.
---

# Detect Route Collisions

This skill guides the agent through **systematically detecting duplicated, overlapping, or ambiguous routes** in a Next.js (or similar file-based routing) project, with a focus on the `app` router.

The goal is to **build a single, consolidated view of all routes**, flag potential collisions, and propose a consolidation plan — **not** to delete or change routes automatically.

## When to Use

- The user mentions:
  - "duplicate routes", "route collisions", "overlapping routes", or "multiple pages for the same URL".
  - Unexpected pages rendering for a path (for example, a detail view vs a list view at the same URL).
  - 404s or navigation bugs where the wrong route is hit.
  - Multiple versions of the same feature under different URLs (for example: `/dashboard/leads` vs `/leads`).
- Before introducing **new routes**, to ensure they do not silently collide with existing ones.
- When auditing specific areas such as:
  - `/dashboard/leads`
  - `/dashboard/other/leads`
  - `app/dashboard/leads/page.tsx` vs related routes.

---

## Quick-Start Checklist

Use this checklist to structure the analysis:

```markdown
Task Progress:
- [ ] 1. Identify routing system and roots
- [ ] 2. Enumerate all route files
- [ ] 3. Normalize routes to URL patterns
- [ ] 4. Detect exact collisions
- [ ] 5. Detect overlapping and legacy routes
- [ ] 6. Inspect implementations for true duplication
- [ ] 7. Summarize collisions and recommendations
```

Keep notes grouped by **route pattern** (for example, `/dashboard/leads`, `/dashboard/leads/[id]`) so you can later present a clean summary.

---

## 1. Identify Routing System and Roots

1. Confirm the project uses a **file-based router** (for example, Next.js `app` router).
2. Identify **route roots**, typically:
   - `app/` (Next.js app router)
   - `pages/` (Next.js pages router, if present)
3. Note whether both `app/` and `pages/` exist; if they do, treat them as **separate route systems** but still record potential **URL-level overlaps** between them.

---

## 2. Enumerate All Route Files

1. In each route root (`app/`, `pages/`, etc.), list all files that define routes:
   - For Next.js app router:
     - `**/page.{ts,tsx,js,jsx}`
     - `**/route.{ts,tsx,js,jsx}` (API/route handlers)
   - For Next.js pages router:
     - `**/*.{ts,tsx,js,jsx}` under `pages/`, excluding `_app`, `_document`, etc.
2. For each route file record:
   - **Filesystem path** (for example, `app/dashboard/leads/page.tsx`).
   - **Route kind** (page vs route handler vs API).
   - **Segment path** (folder path from route root without file name).

You can use glob-style tools to generate these lists efficiently.

---

## 3. Normalize Routes to URL Patterns

### 3.1. Basic normalization rules (Next.js app router)

For each route file under `app/`:

1. Start from the segment path under `app/`. Example:
   - File: `app/dashboard/leads/page.tsx`
   - Segment path: `dashboard/leads`
2. Split the segment path by `/` to get **segments**.
3. For each segment:
   - **Route groups** `(group)` are **ignored** in the URL:
     - `(marketing)` → `""` (skip)
   - **Parallel routes** `@slot` are **ignored** in the URL; treat them as the same path:
     - `@feed` → `""` (skip)
   - **Dynamic segments**:
     - `[id]` → `[id]` (keep as a parameter)
     - `[slug]` → `[slug]`
   - **Catch-all / optional catch-all**:
     - `[...slug]` → `[...slug]`
     - `[[...slug]]` → `[[...slug]]`
   - Else, keep the static segment name.
4. Join the remaining segments with `/` and prefix with `/` to get the **URL pattern**.
   - `dashboard/leads` → `/dashboard/leads`
   - `(app)/dashboard/leads` → `/dashboard/leads`
   - `dashboard/[id]` → `/dashboard/[id]`

For route handlers (`route.ts`/`route.tsx`), use the **same normalized path**, but also mark them as **API/handler**.

### 3.2. Pages router normalization (if applicable)

For `pages/`:

1. Strip the extension and any special files:
   - Ignore `_app`, `_document`, `_error`, `api/*` (treat API separately).
2. Map folder and file names to URL segments using similar rules for dynamic segments (`[id]`, `[...slug]`, etc.).
3. Prefix with `/` to get URL patterns.

### 3.3. Build a route map

Construct a structure like:

```text
/dashboard/leads:
  - app/dashboard/leads/page.tsx (page)
/dashboard/other/leads:
  - app/dashboard/other/leads/page.tsx (page)
/dashboard/leads/[id]:
  - app/dashboard/leads/[id]/page.tsx (page)
```

Use this map as the **single source of truth** for further analysis.

---

## 4. Detect Exact Collisions

An **exact collision** occurs when **multiple files normalize to the same URL pattern**.

Examples:

- `app/dashboard/leads/page.tsx` and `app/(app)/dashboard/leads/page.tsx` → both `/dashboard/leads`.
- `pages/dashboard/leads.tsx` and `app/dashboard/leads/page.tsx` → both `/dashboard/leads` (different routing systems, same URL).

Steps:

1. For each URL pattern in the route map, check how many route entries exist.
2. If **more than one** entry shares the same URL pattern:
   - Flag this as a **collision**.
   - Note:
     - File paths
     - Route type (page vs API vs layout/other if considered)
     - Route system (`app` vs `pages`).

These are **high-priority** issues, as they can cause confusing routing behavior.

---

## 5. Detect Overlapping and Legacy Routes

Not all issues are exact collisions; many are **overlapping** or **legacy** routes that serve similar purposes under different URLs.

### 5.1. Pattern-based overlaps

Look for patterns where paths are **very similar**, particularly:

- Same base, different prefixes:
  - `/dashboard/leads` vs `/dashboard/other/leads`
- Same resource in different scopes:
  - `/leads` vs `/dashboard/leads`
  - `/dashboard/leads/[id]` vs `/leads/[id]`
- Static vs dynamic variants:
  - `/dashboard/leads` vs `/dashboard/leads/[id]` vs `/dashboard/leads/[...slug]`

Steps:

1. Group URL patterns by their **last segment** and/or **resource keyword** (for example, "leads").
2. Within each group, compare the **prefix** segments to detect:
   - Same resource in different parent paths.
   - Variants that likely belong to the same feature family.
3. Flag groups that might indicate:
   - **Legacy routes** (v1 vs v2 paths still present).
   - **Split UX** (same feature exposed under multiple URLs).

### 5.2. Dynamic vs static overlaps

Pay special attention to:

- Catch-all routes like `/dashboard/leads/[...slug]` that can **shadow** more specific routes.
- Optional catch-all routes like `/dashboard/leads/[[...slug]]` that may overlap with `/dashboard/leads` and `/dashboard/leads/[id]`.

Flag any case where:

- A catch-all can **match the same URLs** as more specific routes.
- The ordering or precedence between these routes may be unclear to the user.

---

## 6. Inspect Implementations for True Duplication

After detecting candidate collisions/overlaps, inspect the actual route implementations to determine whether they are truly duplicates or intentional variations.

For each URL pattern (and its associated files):

1. Open the corresponding route files (for example, `app/dashboard/leads/page.tsx`).
2. Compare:
   - **Data loading**:
     - What APIs or services are called?
     - Are the same entities being fetched (for example, leads list vs single lead)?
   - **Rendered components**:
     - Are the same major components used (for example, `LeadHeader`, `LeadTable`, `LeadSidebar`)?
   - **Layout and UX**:
     - List view vs detail view vs admin/settings.
3. Classify each group as:
   - **Exact duplicate behavior**: Essentially the same page/handler under multiple URLs.
   - **Partial overlap**: Similar feature, but with meaningful differences.
   - **Intentional variant**: Different UX/role/scope; less likely to be a bug, but still worth documenting.
4. Note any evidence of:
   - Legacy naming (`old`, `legacy`, `v1`, `v2`, `deprecated` in paths or comments).
   - Feature flags or toggles that suggest gradual migration.

---

## 7. Summarize Collisions and Recommendations

When the analysis is complete, summarize findings in a structured format.

Use this template:

```markdown
## Route Collision Audit Summary

### Exact collisions (same URL pattern)
- [ ] Path: `/dashboard/leads`
      Files:
      - `app/dashboard/leads/page.tsx`
      - `app/(app)/dashboard/leads/page.tsx`
      Classification: exact duplicate / partial / intentional
      Recommendation: pick a single primary route; deprecate or remove legacy variant after migration.

### Overlapping routes (similar/related URLs)
- [ ] Group: leads
      Patterns:
      - `/dashboard/leads` (`app/dashboard/leads/page.tsx`)
      - `/dashboard/other/leads` (`app/dashboard/other/leads/page.tsx`)
      - `/leads` (`app/leads/page.tsx`)
      Classification: overlapping / legacy / split UX
      Recommendation: define a single canonical path and redirect or deprecate others.

### Dynamic and catch-all overlaps
- [ ] Pattern family:
      - `/dashboard/leads`
      - `/dashboard/leads/[id]`
      - `/dashboard/leads/[...slug]`
      Notes: catch-all may shadow specific routes.
      Recommendation: ensure ordering and intended matching are clear; consider narrowing catch-all usage.
```

Be explicit about:

- **Primary / canonical route** you recommend for each resource.
- Which routes appear **legacy** and likely candidates for deprecation.
- Any **risks or migration steps** required if routes are removed or redirected.

---

## Notes and Best Practices

- Prefer **consolidation to a single source of truth** for each logical feature or resource.
- Do **not** delete or refactor routes without explicit user approval; instead:
  - Present a prioritized list of issues.
  - Suggest non-destructive steps like adding redirects or feature flags.
- When new routes are requested, always:
  - Run at least a **localized collision check** around the requested path.
  - Confirm there is no existing route that already serves the same purpose under a different URL.

