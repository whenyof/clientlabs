---
name: detect-dead-code
description: Detect unused React components, Next.js routes, and API handlers in this project to identify dead code. Use when cleaning up the repo, removing unused files, or auditing for unused components, routes, or API endpoints.
---

# Detect Dead Code

## Scope

This skill helps the agent systematically find:

- Unused React components
- Unused Next.js routes (pages and app router entries)
- Unused API handlers (e.g. `app/api/**`, `pages/api/**`)

Use it for periodic cleanups or when the user suspects dead code.

## Quick Start Checklist

Follow this high-level flow:

1. Clarify whether the user wants **components**, **routes**, **APIs**, or **all**.
2. Build a list of candidate files in each category.
3. For each candidate, search for **imports, references, or route hits**.
4. Classify items as **unused**, **internal-only**, or **cannot-safely-determine**.
5. Present a **concise report** and, only if the user agrees, plan deletions or refactors.

Keep findings **conservative**: when in doubt, mark as "needs review" instead of "unused".

## General Conventions

- Prefer **static analysis** (imports, exports, route usage, HTTP callers) over guessing.
- Respect the project's **design system and module boundaries** when reasoning about where components are used.
- Exclude:
  - Test-only files (e.g. `*.test.*`, `*.spec.*`)
  - Storybook/demo files (e.g. `*.stories.*`, `/**/stories/**`, `/**/examples/**`)
  - Code-generation or build-time tooling unless clearly dead
- When a file is used only in tests or stories, classify as **"test-only usage"** rather than fully unused.

If available, combine this skill with the existing `map-component-dependencies` skill to understand import graphs.

## Detect Unused Components

Use this section for React/Next.js UI components (e.g. under `components/**`, `modules/**/components/**`).

1. **Collect candidate components**
   - Use file globs to find typical component locations:
     - `**/components/**/*.{ts,tsx,js,jsx}`
     - `modules/**/*.{ts,tsx,js,jsx}` where filenames are PascalCase (e.g. `LeadCard.tsx`).
   - Exclude obvious non-component utilities (e.g. `utils`, `hooks` directories) when possible.

2. **For each component file:**
   - Identify **default** and **named** exports (components, hooks, helpers).
   - Search the project for **imports or JSX usage** of those exports:
     - Imports like `import X` or `import { X }`.
     - Direct dynamic imports where relevant (e.g. `() => import(".../X")`).

3. **Classify each component:**
   - **Unused component**
     - No imports or JSX usages anywhere outside the file itself.
   - **Test-only / story-only usage**
     - Only imported in tests, stories, or example/demo files.
   - **Used**
     - Imported or rendered from production code, routes, or other components.
   - **Uncertain**
     - Referenced indirectly (e.g. via string lookups, registry objects, CMS, or dynamic route definitions) where static analysis is inconclusive.

4. **Report format for components**

Use this template when reporting:

```markdown
## Dead Code – Components

- **Unused**
  - `path/to/ComponentA.tsx` – no imports found

- **Test-only usage**
  - `path/to/ComponentB.tsx` – only used in `ComponentB.test.tsx`

- **Uncertain (needs manual review)**
  - `path/to/ComponentC.tsx` – referenced via dynamic registry or string keys
```

Only suggest deletion or consolidation after confirming with the user, especially for "uncertain" cases.

## Detect Unused Routes

Use this section for Next.js routes, both **pages router** (`pages/**`) and **app router** (`app/**`).

1. **Collect route files**
   - App router:
     - `app/**/page.{tsx,jsx,ts,js}`
     - `app/**/layout.{tsx,jsx,ts,js}`
     - API handlers under `app/api/**/route.{ts,js,tsx,jsx}` (see API section below).
   - Pages router:
     - `pages/**/*.{tsx,jsx,ts,js}` excluding `_app`, `_document`, `_error`, and API routes under `pages/api/**`.

2. **Check for collisions and legacy variants**
   - When needed, combine with a route-collision skill (if present) to detect:
     - Multiple routes serving the same URL pattern.
     - Legacy or duplicated routes for the same resource.

3. **Determine usage heuristically**
   - For **static, obvious routes** (e.g. dashboard pages, main app flows), assume used unless clearly replaced.
   - Consider a route **likely unused** when:
     - It is not linked from navigation or other pages/components (no `Link` or `router.push` references).
     - It is not referenced in tests, config, or any redirects.
     - It appears to be a legacy variant (e.g. `old-`, `legacy-`, `v1` naming) and newer alternatives exist.
   - Consider a route **uncertain** if:
     - It might be hit externally (deep links, bookmarks, 3rd party integrations).
     - It is part of a dynamic segment (`[id]`, `[slug]`, etc.) and used through external URLs.

4. **Route report format**

```markdown
## Dead Code – Routes

- **Likely unused**
  - `app/old-dashboard/page.tsx` – no internal links, appears to be legacy

- **Duplicated / overlapping**
  - `/dashboard` served by:
    - `app/dashboard/page.tsx`
    - `app/(legacy)/dashboard/page.tsx`

- **Uncertain (external entry points)**
  - `app/public-landing/page.tsx` – no internal links but may be used via marketing URLs
```

Do not delete routes that may be externally linked without explicit confirmation from the user.

## Detect Unused APIs

Use this section for API handlers such as:

- `app/api/**/route.{ts,js,tsx,jsx}`
- `pages/api/**/*.{ts,js,tsx,jsx}`

1. **Collect API handlers**
   - Map each file path to the **HTTP route** it serves, e.g.:
     - `app/api/leads/[id]/route.ts` → `GET/POST/… /api/leads/[id]`

2. **Search for internal usage**
   - Look for calls to the path or helper wrappers:
     - `fetch("/api/...")`, `axios("/api/...")`, `client("/api/...")`, etc.
     - Custom API client modules that call the handler.
   - Include both server-side and client-side code when searching.

3. **Consider external consumers**
   - APIs may be called by:
     - Mobile apps
     - Third-party services or webhooks
     - Other backend jobs or scripts
   - When the handler looks like an integration point (e.g. `webhooks`, `stripe`, `slack`, `zapier`), classify as **uncertain** unless the user confirms it is unused.

4. **API report format**

```markdown
## Dead Code – APIs

- **No internal callers found**
  - `app/api/old-feature/route.ts` – no references to `/api/old-feature`

- **Internal-only but low-value**
  - `pages/api/debug/route.ts` – used only in internal debug tools

- **Uncertain (possible external use)**
  - `app/api/webhooks/stripe/route.ts` – likely called by Stripe webhooks
```

Never assume external APIs are unused without explicit confirmation.

## Final Output for the User

When using this skill, summarize findings in a **single consolidated report**:

- **Components**: unused, test-only, uncertain.
- **Routes**: likely unused, duplicated/overlapping, uncertain.
- **APIs**: no internal callers, internal-only, uncertain/external.

End with a short **proposed action plan**, for example:

- **Safe to remove now**: list items with no usage and no external dependencies.
- **Needs manual review**: items with possible external use, dynamic access, or legacy routes.
- **Follow-up suggestions**: consolidate duplicates, add comments or documentation, or add monitoring/analytics before removal.

Only modify or delete files when the user explicitly agrees to the plan.

