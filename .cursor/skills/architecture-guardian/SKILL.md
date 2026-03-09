---
name: architecture-guardian
description: Enforce and protect project architecture by checking folder structure consistency, feature ownership, duplicate implementations, cross-module dependencies, and architectural boundary violations before major changes. Use when implementing or refactoring features, modifying core modules, or whenever structural or architectural integrity might be affected.
---

# Architecture Guardian

This skill helps the agent **protect the project architecture and prevent structural degradation**, especially before implementing **major changes** or **cross-cutting features**.

The focus is on:

- **Folder structure consistency**
- **Clear feature ownership** (which module owns which feature)
- **Duplicate or overlapping implementations**
- **Cross-module dependencies**
- **Violations of architectural boundaries**

If an architectural violation is detected, the agent **must not proceed with changes** until the violation is understood and a consolidation strategy is proposed.

---

## When to Use

Apply this skill **before**:

- Implementing or refactoring **major features** (for example: dashboards, main flows, CRUD modules).
- Changing **core domain modules** (for example: leads, auth, billing).
- Introducing **new routes** or significantly changing existing ones.
- Adding or modifying **shared UI components** or **layout structures**.
- Performing **large refactors** that touch multiple modules or layers.

Whenever in doubt whether a change is “major”, assume it is and run this skill.

---

## High-Level Workflow

Use this checklist before making substantial architectural changes:

```markdown
Task Progress:
- [ ] 1. Confirm feature ownership and boundaries
- [ ] 2. Check folder structure consistency
- [ ] 3. Scan for duplicated or overlapping implementations
- [ ] 4. Analyze cross-module dependencies
- [ ] 5. Detect UI vs business logic violations
- [ ] 6. Classify and report architecture violations
- [ ] 7. Propose consolidation and remediation strategy
```

The goal is to **surface architecture risks and propose a clean path forward**, not to block all change. However, **do not apply code changes that worsen architecture violations** without explicit user approval.

---

## 1. Confirm Feature Ownership and Boundaries

1. **Identify the primary feature domain**
   - Determine which module or domain **owns** the feature (for example: `modules/leads` for leads-related functionality).
   - Note any alternative or legacy locations (for example: older implementations under different folders or names).

2. **Map relevant modules and routes**
   - List pages/routes, API handlers, and modules that participate in the feature (for example: dashboards, detail views, side panels, API endpoints).
   - Pay special attention to **multiple dashboards, panels, or timelines** for the same entity (for example: multiple lead dashboards).

3. **Define intended layering**
   - Identify layers such as:
     - **UI components** (presentational, layout, design-system wrappers)
     - **Feature modules** (domain- or feature-specific orchestration)
     - **Data access / API** (fetchers, repositories, services)
     - **Shared utilities / types**
   - Note the expected dependency direction (for example: lower layers should not import higher layers).

Record a short summary of **who owns what** and **which layers should talk to which** before proceeding.

---

## 2. Check Folder Structure Consistency

1. **Review folder layout for the feature**
   - Inspect directories under the primary domain (for example: `modules/leads`, `app/dashboard/leads`, `app/leads`).
   - Verify that components, hooks, services, and types are placed in appropriate subfolders following existing patterns.

2. **Look for competing structures**
   - Multiple folders representing the same concept (for example: `LeadPanel` in different subfolders, multiple leads dashboards).
   - Old vs new structures (for example: `legacy/`, `v1/`, `v2/`, `old-*`, `new-*`).

3. **Flag inconsistencies**
   - Same concept spread across mismatched or ad hoc folder names.
   - Features implemented outside their “home” module when a clear home already exists.

Summarize any **structure anomalies** with paths and a short description.

---

## 3. Scan for Duplicated or Overlapping Implementations

Use this step to detect:

- **Duplicated features**
- **Duplicated routes**
- **Conflicting UI implementations**

1. **Reuse existing structural/audit skills where available**
   - For this project, prefer:
     - `audit-repo-structure` for duplicated components, routes, and legacy implementations.
     - `detect-route-collisions` for overlapping or duplicate routes.
     - `detect-dead-code` for unused or legacy variants.

2. **Search for duplicate feature implementations**
   - Look for multiple components or modules with similar names/roles, for example:
     - Multiple `LeadPanel` implementations.
     - Multiple leads dashboards or timelines.
   - Compare:
     - Props / API surface.
     - Rendered UI.
     - Embedded logic and side effects.

3. **Check for duplicated routes**
   - Enumerate related routes (for example: `/dashboard/leads`, `/leads`, `/leads/[id]`, `/dashboard/leads/[id]`).
   - Identify:
     - Exact duplicates (same behavior, different path).
     - Partial overlaps (similar data and UX with minor differences).
     - Legacy routes kept alongside newer versions.

4. **Detect conflicting UI implementations**
   - Different components implementing the **same screen or panel** with different styles or behaviors.
   - UI that bypasses the design system or reimplements core patterns inconsistently.

Record each candidate duplicate with:

- File path(s)
- Feature or route name
- Degree of overlap (exact / partial / intentional variation)
- A recommended “source of truth” candidate.

---

## 4. Analyze Cross-Module Dependencies

1. **Map imports and dependencies for the feature**
   - Identify which modules import from which:
     - For example: `modules/leads` importing from `modules/auth`, `modules/common`, `components/ui`, etc.
   - Use dependency mapping tools where available (for example: `map-component-dependencies`).

2. **Look for boundary violations**
   - Feature module importing **unrelated domain modules** directly, instead of shared abstractions.
   - Circular dependencies across modules (for example: `modules/leads` ↔ `modules/billing`).
   - Data-access or service code importing UI components.

3. **Assess directionality**
   - Check that:
     - UI depends on feature modules and data access layers, not the other way around.
     - Lower-level utilities and services do not import higher-level UI or feature-specific components.

Document any **cross-module dependencies** that feel suspicious or violate the intended layering.

---

## 5. Detect UI vs Business Logic Violations

This step focuses on cases where **UI components contain business logic** or where **logic is placed in the wrong layer**.

1. **Identify UI components in scope**
   - Focus on:
     - Major screen components (for example: dashboards, panels, timelines).
     - Shared UI used across features (for example: header bars, sidebars, cards).

2. **Look for embedded business logic**
   - UI components:
     - Making API calls directly instead of using a feature/data layer.
     - Containing complex domain rules, state machines, or decision trees.
     - Performing persistence or workflow orchestration (for example: import flows, approvals).

3. **Check for logic in the wrong layer**
   - Business rules that should live in feature/services modules but appear:
     - Inside page components.
     - Inside presentational components or design-system wrappers.
   - Data-access or side-effects inside deeply nested UI instead of in a dedicated hook or service.

4. **Leverage UI audit skills**
   - Where available, use:
     - `audit-ui-system` to ensure consistent use of the design system and styling.
     - `detect-style-conflicts` to detect conflicting UI patterns that might signal architectural drift.

For each violation, capture:

- Component or file path
- Short description of the business logic
- Suggested **target layer** (for example: move to `modules/leads/services`, `modules/leads/hooks`, or an API handler).

---

## 6. Classify and Report Architecture Violations

When an issue is detected, the agent **must**:

1. **Classify the violation**
   - **Duplicated feature**: Multiple components or modules implementing the same feature.
   - **Duplicated route**: Multiple routes serving overlapping or identical behavior.
   - **Conflicting UI**: Multiple UI implementations for the same concept with inconsistent patterns.
   - **Layer violation**: Business logic in UI, data layer depending on UI, or cross-layer imports.
   - **Ownership violation**: Feature logic implemented outside its primary module without a clear reason.

2. **Produce a structured report**

Use this template:

```markdown
## Architecture Violations Detected

### Duplicated features
- Item: [short description]
  - Files: [...]
  - Impact: [low/medium/high]
  - Notes: [...]

### Duplicated routes
- Route: [URL pattern] — [files...]
  - Overlap: [exact/partial/legacy]
  - Notes: [...]

### Conflicting UI implementations
- Concept: [for example: LeadPanel, Leads dashboard]
  - Implementations: [...]
  - Differences: [...]

### Layering / ownership issues
- Location: [file/module]
  - Type: [UI contains business logic / wrong layer / cross-module dependency]
  - Summary: [...]
```

3. **Respect the “no-change” rule**
   - **Do not apply code changes that deepen or proliferate these violations**.
   - If the user explicitly requests a change that would worsen an issue, clearly explain the risk and propose alternatives first.

---

## 7. Propose Consolidation and Remediation Strategy

For each significant violation, propose a **clear consolidation or remediation plan**.

1. **Consolidate multiple implementations**
   - Choose a primary implementation based on:
     - Most up-to-date patterns and design.
     - Best alignment with the current architecture.
     - Lowest migration cost when possible.
   - Propose:
     - Which implementations to keep.
     - Which to deprecate or gradually migrate away from.

2. **Normalize routes**
   - Recommend a single canonical route per primary experience (for example: one main leads dashboard).
   - Suggest:
     - Redirects or deprecations for legacy routes.
     - Shared underlying logic where multiple URLs must coexist.

3. **Refactor to correct layers**
   - Move business logic from UI components into:
     - Feature modules (services/hooks).
     - API routes or backend services.
   - Extract shared utilities or types to lower-level modules to break cross-layer or cross-module cycles.

4. **Document constraints and risks**
   - Call out:
     - Any assumptions about current usage or traffic.
     - Potential migration steps and incremental refactors.

5. **Only then proceed with implementation**
   - After proposing a remediation strategy and, where needed, confirming with the user, proceed to:
     - Implement the consolidation.
     - Update routes.
     - Refactor logic into appropriate layers.

If uncertainty remains high or the impact area is large, prefer to **pause and surface a detailed plan** rather than guessing. The goal of this skill is to **guard the architecture first, then change it deliberately**.

