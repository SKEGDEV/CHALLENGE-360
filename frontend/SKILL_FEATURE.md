---
name: react-ts-feature-builder
description: Builds a new feature (page, section, endpoint integration, or special logic) inside an existing React + TypeScript project that follows the layered architecture (global components, SCSS Modules, Lucide Icon component, TanStack Router/Query, useReducer + Context store, layer aliases). It interviews the user first (semantic HTML map, endpoint details, special logic with Mermaid flowchart, global state), reuses what already exists, and stops to ask whenever something is ambiguous. Use for any new feature in a project created with react-ts-project-scaffold.
---

# React + TS Feature Builder

Adds one feature to an existing project **strictly following the project's architecture** and **reusing what already exists**.

## 0. Operating contract (read first, applies to every step)

1. **You have no discretion.** You must not use your own judgment to fill gaps, choose designs, pick icons, invent tokens, invent endpoints or response shapes, name things that were not named, choose between two valid approaches, or interpret vague input.
2. **If anything is unclear, ambiguous, missing, or contradictory: STOP and ask the user, then wait for the answer.** Do not keep coding "meanwhile". A suggestion is allowed, but the user must choose.
3. **Documented conventions in this skill are not "judgment".** Where this skill prescribes a pattern (file layout, naming, query keys, barrels...), follow it literally. Where it is silent, ask.
4. **Reuse first, create last.** Never create something that already exists in the project. Never create a new global component without the user's approval (section 5).
5. **Do exactly what was asked.** No bonus features, refactors of existing code, dependency upgrades, or "while I'm here" changes. Modifying existing shared code (components, hooks, services, store slices, tokens) beyond what section 8 explicitly allows requires the user's approval.
6. Ask with the `AskUserQuestion` tool when available (max 4 questions per call, 2-4 options each); for free-form input (HTML maps, JSON samples, diagrams) ask in plain text. After asking, **end your turn and wait**.

### Stop-and-ask triggers (non-exhaustive)

- No semantic map or description of the UI was provided for a visual feature.
- The semantic map needs a component, token, breakpoint, or icon that does not exist or is not identifiable.
- Two existing components could satisfy the same part of the UI.
- The endpoint's method, path, params, body, response type, or error behavior is not fully specified.
- The feature calls an endpoint but the project's profile says `api.enabled: false` (or needs global state while `globalState.enabled: false`, or needs a route while `routing: false`).
- The special-logic description and the Mermaid flowchart disagree, or a node/edge is unclear.
- A feature name, route path, query-param name, or slice name could collide with an existing one.
- Existing code contradicts this skill's architecture rules (report it; do not "fix" it silently).
- A verification command fails for a reason not caused by your own code.
- You are tempted to write "reasonable defaults", "TODO", or placeholder values.

## 1. Pre-flight (before asking anything)

1. Read `.project-profile.json` and `ARCHITECTURE.md` at the project root. If either is missing or inconsistent with the repo → stop and ask the user how to proceed.
2. Take inventory of what exists (read, do not modify):
   - `src/components/**` and its barrel: names, props, variants of every global component.
   - `src/components/Icon/iconRegistry.ts`: registered icon names.
   - `src/styles/**`: available tokens (CSS variables), mixins.
   - `src/hooks/**`, `src/services/**`, `src/store/**`, `src/routes/**`, `src/pages/**`: existing domains, slices, routes.
3. Keep this inventory; section 5 depends on it.

## 2. Interview

Ask only what applies, but always ask A, B, C, D (E and F depend on profile/answers).

### A. Feature identity
- Name of the feature and a one-sentence purpose.
- Where it lives:
  - **New page**: page name + route path (only if `routing: true`), including dynamic params (`$id`) and search params (names, types).
  - **Section/component inside an existing page**: which page.
  - **Non-visual** (logic/data only): no UI.

### B. Semantic HTML map (visual features)
Ask the user to provide the **semantic HTML structure** the feature should follow, as **HTML + Tailwind classes or HTML + plain CSS**. Make clear how it will be used (section 6): it is **an example of structure and look only**, never code to copy.
If the user has no map, ask for a precise description of the layout instead. Never design it yourself.

### C. Endpoint consumption
Ask: **does this feature consume an endpoint?** If yes, for **each** endpoint:
- HTTP method and path (and base-URL expectations if different from the configured one)
- Path params, query params (names, types, optional/required)
- Request body shape (TypeScript type or JSON sample)
- **Response type**: TypeScript type or a real JSON sample (single object, list, paginated envelope...)
- Error responses that matter and how the UI should react
- Is it read (query) or write (mutation)?

### D. Special logic
Ask: **does the feature run any special logic** (with the endpoint or without any endpoint)? Examples to prompt the user (never to assume): polling, retries, optimistic updates, dependent or parallel calls, merging/transforming responses, debounce/throttle, derived calculations, permissions, file upload, multi-step flows.
If yes:
- Ask for a written description **and a Mermaid flowchart** of the flow. The user supplies the diagram.
- If the user asks you to draft the diagram, draft it, show it, and **wait for explicit approval** before implementing.
- Implement the flowchart faithfully, node by node. Ambiguous node → ask.

### E. Global state (only if `globalState.enabled: true`)
Ask: does the feature read or write persisted global state? Which existing slice, or a **new slice** (name, state shape, actions, persisted fields)? If `globalState.enabled: false` and the feature needs it → stop and report (section 8, "Missing modules").

### F. Icons (only if the UI uses icons)
If the semantic map does not name the Lucide icon explicitly (e.g. `lucide:trash-2`), ask which icon to use for each spot. Never choose an icon by guessing.

After the interview, write a **plan** for the user (short):
- files to create / files to modify
- existing components reused (by name) and which part of the UI each covers
- any proposed **new global component** with props (needs approval, section 5)
- any new icon to register, new tokens needed (needs approval)

**Proceed without waiting only if the plan creates no new global component, no new token, and modifies no existing shared code except the allowed items in section 8.** Otherwise wait for approval.

## 3. How the project works (architecture reference)

### 3.1 Layers (`src/`)

| Layer (alias) | Holds | Never holds |
|---|---|---|
| `core` (`@core`) | HTTP client, `storage`, `env`, pure utils, global types | React UI, concrete endpoints |
| `services` (`@services`) | Per-domain API functions, DTO types, mappers. Plain TS | React, hooks, caching |
| `store` (`@store`) | Reducers, contexts, persistence, semantic hooks (`useUi()`) | Server data, JSX |
| `hooks` (`@hooks`) | Query keys, `queryOptions`, `useQuery`/`useMutation` hooks, page view-models, utility hooks | JSX, styles |
| `components` (`@components`) | Global reusable **pure** UI controlled by props | Data hooks, store, services, routes |
| `layouts` (`@layouts`) | Connected shells (header + sidebar + outlet) that use hooks/store | Business logic of their own |
| `pages` (`@pages`) | One folder per screen; composition only | `fetch`, reducers, business rules |
| `routes` (no alias) | File-based route config: path, loader, search validation, which page | JSX/markup |
| `app` (`@app`) | Providers, router, queryClient | Feature UI |
| `styles` (`@styles`) | Tokens, mixins, reset | Component styles |

Only layers listed in `.project-profile.json` → `allowedLayers` exist for this project.

### 3.2 Dependency direction (downward only)
```
app → routes → pages → layouts → components → core / styles
                 │         │
                 └─────────┴──→ hooks → services → core
                           └──→ store → core
```
- `components` imports only `@core` utils and `@styles`.
- `services` / `store` import only `@core`. `hooks` import `@services`, `@store`, `@core`.
- `pages` import `@components`, `@layouts`, `@hooks`, `@store` (its hooks), `@core`.
- `core` imports nothing from other layers.

### 3.3 Imports
- Never `../`. Same folder → `./`. Other layer → alias barrel (`import { Button } from '@components'`).
- Deep alias (`@components/Icon`) **only inside the same layer**. Never import a layer's own root barrel from inside it (cycles).
- Every folder that is a unit (component, page, domain) has an `index.ts` exporting its public API; every layer root has an `index.ts` re-exporting its units. **When you add something, you also add it to the barrel chain.**
- If a layer folder or its root `index.ts` does not exist yet because nothing used it before (typically `services/`, `hooks/`, `layouts/`), create it with the first unit **only if the layer is listed in `allowedLayers`**, and create its barrel. The alias for it is already configured by the scaffold.
- Named exports only (no `export default`).

### 3.4 Where each kind of data lives
| Data | Owner |
|---|---|
| Server data | TanStack Query (`@hooks`), never copied into the store |
| Persisted client state (preferences, etc.) | `@store` |
| State shareable via URL (filters, page, sort) | Router search params |
| Ephemeral UI state (open/closed, hover) | local `useState` |

### 3.5 Non-negotiable restrictions
1. Components and pages: JSX + styles only. No `fetch`, `useQuery`, `dispatch`, `localStorage`, business rules. Purely visual local state is allowed.
2. Logic reaches the UI via hooks (`@hooks`, `@store`) — pages call a view-model hook and render its result.
3. Styles: SCSS Modules only (`*.module.scss`), colocated with the component. No global CSS, no inline styles for static values, no Tailwind classes, no `!important`.
4. Icons: only `<Icon name="..." />`. `lucide-react` is imported only inside `components/Icon`.
5. TypeScript `strict`, no `any`, no non-null assertions to bypass types. DTOs are mapped to domain models in `services`.
6. Route files are configuration only.

## 4. Implementation order and patterns

Build in this order, skipping what the feature does not need. File names follow the domain, e.g. `products`.

### 4.1 Service (`services/<domain>/`) — only if there is an endpoint
Files: `<domain>.types.ts` (DTOs + domain models), `<domain>.mapper.ts`, `<domain>.service.ts`, `index.ts`; add `export * from './<domain>';` to `services/index.ts` (create `services/index.ts` if this is the first domain and the layer is allowed).
```ts
import { http } from '@core';
import { toProduct, toProducts } from './products.mapper';
import type { ProductDto } from './products.types';

export const productsService = {
  list: async (params?: { search?: string }, signal?: AbortSignal) =>
    toProducts(await http.get<ProductDto[]>('/products', { params, signal })),
  detail: async (id: string, signal?: AbortSignal) =>
    toProduct(await http.get<ProductDto>(`/products/${id}`, { signal })),
};
```
Rules: pure TS; accept `signal` on reads; types come from the response type the user gave; endpoints/paths exactly as given.

### 4.2 Hooks (`hooks/<domain>/`)
Files: `<domain>.keys.ts`, `<domain>.queries.ts`, `<domain>.mutations.ts` (if any write), `use<Feature>Page.ts` (view-model, if it has a page), `index.ts`; export from `hooks/index.ts`.
```ts
// products.keys.ts
export const productsKeys = {
  all: ['products'] as const,
  lists: () => [...productsKeys.all, 'list'] as const,
  list: (params?: { search?: string }) => [...productsKeys.lists(), params ?? {}] as const,
  detail: (id: string) => [...productsKeys.all, 'detail', id] as const,
};
```
```ts
// products.queries.ts
import { queryOptions, useQuery } from '@tanstack/react-query';
import { productsService } from '@services';
import { productsKeys } from './products.keys';

export const productsQueries = {
  list: (params?: { search?: string }) =>
    queryOptions({ queryKey: productsKeys.list(params), queryFn: ({ signal }) => productsService.list(params, signal) }),
};
export const useProductsQuery = (params?: { search?: string }) => useQuery(productsQueries.list(params));
```
```ts
// products.mutations.ts
export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: productsKeys.lists() }), // documented default
  });
}
```
```ts
// useProductsPage.ts — view-model: everything the page needs, already prepared
export function useProductsPage() {
  const { data, isPending, error, refetch } = useProductsQuery();
  return { products: data ?? [], isLoading: isPending, errorMessage: error?.message, onRetry: () => void refetch() };
}
```
Rules: every query key comes from `<domain>Keys`; mutations invalidate the same domain's `lists()` key (documented default — any other cache strategy requires the user's instruction); special logic from section 2D lives **here** (or in `services`/`core` if pure), never in the page.

### 4.3 Store slice (only if section 2E says so)
Folder `store/<slice>/`: `<slice>.types.ts` (state + discriminated actions typed `'<slice>/actionName'`), `<slice>.reducer.ts`, `<slice>.store.tsx` (uses `createStore({ name, version: 1, reducer, initialState, partialize? })`, exports `<Slice>Provider` and semantic hook `use<Slice>()` returning state + memoized action functions, never raw `dispatch`), `index.ts`. Nest the new provider in `store/StoreProvider.tsx` and export the hook from `store/index.ts`. Existing slice changes → bump its `version` **and ask the user first**.

### 4.4 Global components (only the ones approved in the plan) — see section 5.

### 4.5 Page (`pages/<Feature>Page/`)
Files: `<Feature>Page.tsx`, `<Feature>Page.module.scss`, `index.ts`; export from `pages/index.ts`.
```tsx
import { PageLayout, Spinner, ErrorState } from '@components'; // only components that exist
import { useProductsPage } from '@hooks';
import styles from './ProductsPage.module.scss';

export function ProductsPage() {
  const { products, isLoading, errorMessage, onRetry } = useProductsPage();
  return (
    <main className={styles.page}>
      {/* structure derived from the semantic map, built with existing components */}
    </main>
  );
}
```
Sub-components used by this page only live **inside the page folder** (`ProductsPage/ProductsTable.tsx`) and are promoted to `@components` only with user approval. Never import from another page.

### 4.6 Route (only if `routing: true` and the feature is a page)
`/products` → `routes/products/index.tsx`; `/products/$id` → `routes/products/$id.tsx`.
```tsx
import { createFileRoute } from '@tanstack/react-router';
import { ProductsPage } from '@pages';
import { productsQueries } from '@hooks';

export const Route = createFileRoute('/products/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQueries.list()), // documented default for the page's primary query
  component: ProductsPage,
});
```
- Loader with `ensureQueryData` only when the page has a primary query and the profile has `api.enabled`. Without API: no loader.
- Search params → `validateSearch` exactly as the user described them.
- Route files contain no markup. Never edit `routeTree.gen.ts` (it regenerates on `vite`/build).

### 4.7 Icons
New icon → add **one line** to `components/Icon/iconRegistry.ts` (kebab-case key → Lucide component) using the icon the user specified. Use it as `<Icon name="trash-2" />`.

## 5. Global components: reuse, create, and use

### 5.1 Decision flow (follow in order, no shortcuts)
1. Does an existing component cover the need **as is** (props/variants)? → use it.
2. Can existing components cover it **by composition** (e.g. `Stack` + `Card` + `Button`)? → compose them.
3. Does one existing component almost fit but lacks a variant/prop? → **ask the user**: extend it, or build a local sub-component. Never extend on your own.
4. Nothing fits → **ask the user** whether to create (a) a new global component in `@components` or (b) a component local to the page. Include the proposed name and props in the question.

### 5.2 Creating a global component (only after approval)
Location: `components/ui/` (primitives: Button, Input, Card...), `components/layout/` (Container, Stack, Grid, PageLayout...), `components/feedback/` (Spinner, EmptyState, ErrorState, Toast...). If the right category is unclear → ask. Create the category folder + its barrel if it does not exist and add it to `components/index.ts`.

Files, one folder per component:
```
components/ui/Badge/
├── Badge.tsx
├── Badge.module.scss
├── Badge.types.ts      # when props are non-trivial
└── index.ts            # export { Badge } from './Badge'; export type { BadgeProps } from './Badge.types';
```
Then export it from the category barrel (`components/ui/index.ts`).

Requirements:
- **Pure and controlled by props**: data and callbacks in; no data fetching, no store, no router, no domain knowledge (a `Badge` does not know what a "product" is).
- Extend native attributes (`ComponentPropsWithoutRef<'button'>`) and accept `className`; merge classes with `clsx`.
- Variants/sizes through typed props mapped to module classes; defaults only for values the user specified.
- Accessible: correct element/role, labels, focus-visible, keyboard support, `aria-*` where applicable.
- Styles in its `*.module.scss`, `@use '@styles' as *;`, values from `var(--token)`.
- Icons via `import { Icon } from '@components/Icon'` (deep alias, same layer).
```tsx
import clsx from 'clsx';
import styles from './Badge.module.scss';
import type { BadgeProps } from './Badge.types';

export function Badge({ tone = 'neutral', className, children, ...rest }: BadgeProps) {
  return <span className={clsx(styles.badge, styles[tone], className)} {...rest}>{children}</span>;
}
```

### 5.3 Using global components
- Always `import { Badge, Icon } from '@components';` in pages/layouts.
- Pass data/handlers via props; compose; never reach into a component's internals or styles.
- Override layout details only through the `className` prop and the page's own module, never by editing the global component.
- Never wrap or duplicate an existing component to change it slightly; follow the decision flow.

## 6. Using the semantic HTML map (example only)

The map is an **example of structure and look**. The implementation must be built from the project's own parts.

1. **Keep the semantics**: preserve the semantic elements, hierarchy, landmark roles, labels, and ARIA of the map (`header`, `nav`, `main`, `section`, `ul/li`, `form/label`, `button`...). Do not swap them for `div`s.
2. **Replace markup with existing components** wherever the inventory has a match (section 5.1). Raw HTML remains only for structure with no matching component.
3. **Translate styling, don't copy it**: Tailwind utility classes and raw CSS values are converted into the page's `*.module.scss` using existing tokens (`var(--space-4)`, `var(--color-primary)`...). The project does not use Tailwind; no `className="flex gap-4"` ever appears.
4. **Token mapping must be unambiguous.** If a value in the map has no matching token (a color, spacing step, radius, font size) → ask the user how to map it (use an existing token, or add a new one). Never hardcode a literal value and never invent a token on your own.
5. **Responsive classes** (`md:`, media queries) → if the project has no breakpoint tokens/mixins → ask how to handle them.
6. **Icons**: named icons only per section 2F.
7. **Do not carry over** content (copy, images, data) from the map as real data; wire it to the data the feature actually provides, or ask.
8. If the map contradicts the architecture (e.g. data fetching in markup, inline scripts) → ignore that part, tell the user.

## 7. Hard restrictions (summary)

- No new dependencies unless the user explicitly approves (state package + reason when asking).
- No Tailwind, no CSS-in-JS, no inline static styles, no global CSS.
- No `../` imports, no deep imports across layers, no `export default`.
- No `lucide-react` imports outside `components/Icon`.
- No `any`, no placeholder/TODO/fake data left behind, no `console.log`.
- No data fetching, store access, or business logic inside `components/` or `pages/`.
- No server data copied into the store.
- No edits to `routeTree.gen.ts`, to the profile's rules, to ESLint/Vite/tsconfig (except as noted below) without approval.

## 8. Allowed edits to existing shared files (no approval needed)

Only these additive, convention-mandated changes:
- Adding the feature's exports to existing barrels (`index.ts`), and creating a missing layer barrel as described in 3.3.
- Adding one registry line to `iconRegistry.ts` for an icon the user specified.
- Nesting a newly approved slice provider in `StoreProvider.tsx`.
- Adding a new page/slice/domain entry to `.project-profile.json` and `ARCHITECTURE.md` (keep them accurate).

Everything else touching existing code (changing a component, token, hook, service, slice, config) → ask first.

### Missing modules
If the feature needs a module the profile disabled (routing, API, global state), **stop and tell the user**: the feature cannot be built as described without that module. Ask whether to (a) enable the module — then apply the corresponding templates of the `react-ts-project-scaffold` skill, update the profile, and continue — or (b) change the feature. Never enable a module on your own.

## 9. Verify, then report

1. Run `tsc -b` (or the project's typecheck), the linter, and the build. Fix problems caused by your code. Anything else → stop and ask.
2. Self-check against section 7 and the layer rules (grep your new files for `../`, `lucide-react`, `fetch(`, `localStorage`, `export default`).
3. If a Mermaid flowchart was provided: confirm each node/edge maps to implemented code and say where.
4. Report to the user, briefly:
   - files created / modified
   - existing components reused (and any approved new ones)
   - how each endpoint/flow was wired
   - anything left open or that you asked and was decided
Do not recap every step.
