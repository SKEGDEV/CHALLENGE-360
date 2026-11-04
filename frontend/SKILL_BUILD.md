---
name: react-ts-project-scaffold
description: Creates a brand-new React + TypeScript (Vite) project from scratch with a strict layered architecture (global components, SCSS Modules, Lucide icons by name, layer aliases like @components/@core). It interviews the user first and only generates the modules they need - TanStack Router, TanStack Query, global state (useReducer + Context + localStorage), pre-built pages. Use only when starting a project from zero; for adding features to an existing project use react-ts-feature-builder.
---

# React + TS Project Scaffold

Creates the base project. It generates **only what the user confirms they need**. Nothing is added "just in case".

## 0. Operating contract (read first, applies to every step)

1. **You have no discretion.** You must not use your own judgment to fill gaps, pick defaults, choose names, choose libraries, choose values, or interpret vague answers.
2. **If anything is unclear, ambiguous, missing, or contradictory: STOP and ask the user, then wait for the answer.** Do not continue building "meanwhile". Do not offer a default and proceed; you may *suggest* an option, but the user must pick it.
3. Only create what the interview answers and this skill explicitly require. No sample data, no demo components, no extra pages, no extra dependencies, no devtools, no auth, no tests unless the user asked.
4. Never skip the interview, even if the user's first message seems to answer everything. Re-confirm via the summary in step 2.
5. Ask using the `AskUserQuestion` tool when it is available (max 4 questions per call, 2-4 options each). For free-form answers (lists of pages, names, values) ask in plain text. If the tool is unavailable, ask in plain text. After asking, **end your turn and wait**.

### Stop-and-ask triggers (non-exhaustive)

- An answer is "I don't know", "whatever", "default", or "you decide" → ask for a concrete choice; you may list options but never choose.
- Pages are requested but routing is "no" (or the reverse conflict) → ask which one is true.
- Routing is "yes" but no page maps to `/` → ask what `/` should do.
- A page name or path is missing, duplicated, or has dynamic params not described → ask.
- Global state is "yes" but no slices/initial state are described → ask.
- API is "yes" but no base URL source is given → ask.
- The target directory is not empty, or the project name is invalid → ask.
- A command fails, a version conflict appears, or a template in this skill cannot be applied literally → stop, report the exact error, ask how to proceed.
- You feel tempted to add something that is not listed in this skill → ask.

## 1. Interview

### Batch A: basics (always)

1. **Project name / target directory** (plain text). Must be a valid npm package name.
2. **Package manager**: npm / pnpm / yarn / bun.
3. **Design tokens**: the user either provides initial token values (colors, spacing, radius), or explicitly approves neutral placeholder tokens to be replaced later. Never invent values without an explicit approval.

### Batch B: module questions (always ask all four)

4. **Does the project use routing?** (yes/no)
   → yes: TanStack Router (file-based). no: no router at all.
5. **Does the project need pre-built pages?**
   - Routing = yes: ask for the list. For each page: **name**, **route path** (including dynamic params like `$userId` if any), and a **one-line purpose**. Pages are generated as empty placeholders only.
   - Routing = no: ask whether to pre-build **one** page rendered directly by `App`, and its name; or none (blank `App`).
6. **Does the project consume an API?** (yes/no)
   → yes: TanStack Query + HTTP client. Also ask for the **API base URL** (or confirm it will be filled in `.env` later and left empty in `.env.example`).
7. **Does the project use global state?** (yes/no)
   → yes: `useReducer` + `useContext` persisted in localStorage. Ask for the **initial slices**: name and state shape of each (e.g. the user may want a `ui` slice with `theme` and `sidebarOpen`; offer it as an option, never assume it).

## 2. Confirm the plan

Present a short summary and wait for explicit approval ("yes/confirm") before creating anything:

- project name, package manager
- routing / pages (name → path) / API (+ base URL) / global state (+ slices)
- the exact list of **dependencies** that will be installed
- the exact list of **folders** that will be created, and the ones that are intentionally NOT created

Any edit the user requests → update the summary and confirm again.

## 3. What gets generated (conditional matrix)

| Module | Created when | Not created when |
|---|---|---|
| `app/`, `components/Icon`, `styles/`, `main.tsx`, `pages/` (if any page) | always | n/a |
| `routes/`, `routeTree.gen.ts`, `app/router.ts`, router plugin in Vite | routing = yes | routing = no |
| `core/http`, `core/config/env.ts`, `app/queryClient.ts`, `QueryClientProvider`, `.env.example` | API = yes | API = no |
| `core/storage`, `store/` (createStore, StoreProvider, slices) | global state = yes | global state = no |
| `app/AppProviders.tsx` | API = yes OR global state = yes | both no |
| `services/`, `hooks/`, `layouts/` | **never at scaffold time** (the feature skill creates them on first use) | n/a |

Rules:
- A folder is created only if it will contain at least one file. Every created layer folder gets an `index.ts` barrel.
- Aliases, `tsconfig` paths and ESLint layer rules are generated for **every layer allowed in this project** (all layers except `services`/`store` when API/state are disabled), even if the folder does not exist yet.
- Install only the dependencies of enabled modules (section 4).

## 4. Dependencies

Always: `react`, `react-dom`, `clsx`, `lucide-react`, `sass` (dev), `typescript`, ESLint + `@vitejs/plugin-react` from the Vite template.
Routing: `@tanstack/react-router`, `@tanstack/router-plugin` (dev).
API: `@tanstack/react-query`.
Global state: nothing extra.

Do **not** install devtools, Tailwind, form libraries, UI kits, or anything else.

## 5. Procedure

1. `npm create vite@latest <name> -- --template react-ts` (adapt to the chosen package manager). If the directory exists and is not empty → stop and ask.
2. Remove Vite boilerplate (`App.css`, `index.css`, sample assets, demo content in `App.tsx`).
3. Install dependencies (section 4).
4. Configure `tsconfig.app.json` (strict + paths) and `vite.config.ts` (aliases, router plugin if routing).
5. Create folders/files from the matrix, using the templates below, adapted to the module flags.
6. Create the placeholder pages and route files (if any).
7. Generate ESLint layer rules (section 8).
8. Write `.project-profile.json` and `ARCHITECTURE.md` (section 9).
9. Verify: `tsc -b`, `lint`, `build`. Fix only what is caused by your own generated code; any other failure → stop and ask.
10. Report to the user: what was created, what was intentionally left out, how to run it. Mention that the feature skill (`react-ts-feature-builder`) is the next step.

## 6. Architecture the scaffold must produce

Layers and aliases (`@app`, `@assets`, `@components`, `@core`, `@hooks`, `@layouts`, `@pages`, `@services`, `@store`, `@styles`).

Dependency direction (downward only):
```
app → routes → pages → layouts → components → core / styles
                 │         │
                 └─────────┴──→ hooks → services → core
                           └──→ store → core
```
- `components`: pure UI, controlled by props; imports only `@core` utils and `@styles`; never `@hooks`, `@store`, `@services`, `@pages`, `@layouts`, `@tanstack/*`.
- `services` / `store` / `core`: no React UI, never import `@components`, `@pages`, `@layouts`, `@hooks`.
- Cross-layer imports go through the layer barrel (`@components`). Deep alias (`@components/Icon`) only inside the same layer. Never `../`.

## 7. Templates

### 7.1 `tsconfig.app.json` paths

Generate one pair per allowed layer:
```jsonc
"paths": {
  "@app": ["./src/app"], "@app/*": ["./src/app/*"],
  "@components": ["./src/components"], "@components/*": ["./src/components/*"]
  // ...same pattern for every allowed layer
}
```

### 7.2 `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
// routing only:
import { tanstackRouter } from '@tanstack/router-plugin/vite';

const layers = [/* allowed layers, e.g. 'app','assets','components','core','hooks','layouts','pages','styles' */] as const;
const alias = Object.fromEntries(
  layers.map((l) => [`@${l}`, fileURLToPath(new URL(`./src/${l}`, import.meta.url))]),
);

export default defineConfig({
  // router plugin must come BEFORE react (routing only)
  plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), react()],
  resolve: { alias },
});
```
Without routing: `plugins: [react()]` and no router import.

### 7.3 Styles (always)

`styles/_tokens.scss` uses CSS custom properties. **Names are fixed, values come from the user (or the approved placeholders):**
```scss
:root {
  --color-bg: /* user */;
  --color-text: /* user */;
  --color-primary: /* user */;
  --space-2: /* user */;
  --space-4: /* user */;
  --radius-md: /* user */;
}
```
Extra tokens (more colors, spacing steps, dark theme under `[data-theme='dark']`) are added **only if the user provided them**. `styles/_index.scss` → `@forward 'tokens';`. `styles/global.scss` → minimal reset + `@use './tokens';`. `main.tsx` imports `'@styles/global.scss'`.

Component styles always use `@use '@styles' as *;` and `var(--token)`.

### 7.4 Icon component (always)

`components/Icon/iconRegistry.ts`: a typed registry mapping kebab-case names to Lucide components. **Start with only the icons the user's placeholder pages need; if none, start with an empty-but-typed registry only if the user approves; otherwise ask which icons to register.**
```ts
import { /* registered icons */ } from 'lucide-react';
export const iconRegistry = { /* 'kebab-name': Component */ } as const;
export type IconName = keyof typeof iconRegistry;
```
`components/Icon/Icon.tsx`:
```tsx
import type { LucideProps } from 'lucide-react';
import clsx from 'clsx';
import { iconRegistry, type IconName } from './iconRegistry';
import styles from './Icon.module.scss';

const SIZES = { sm: 16, md: 20, lg: 24 } as const;

export interface IconProps extends Omit<LucideProps, 'ref' | 'size'> {
  name: IconName;
  size?: keyof typeof SIZES | number;
  label?: string; // informative icon when set, decorative (aria-hidden) otherwise
}

export function Icon({ name, size = 'md', label, className, ...rest }: IconProps) {
  const Component = iconRegistry[name];
  return (
    <Component
      size={typeof size === 'number' ? size : SIZES[size]}
      className={clsx(styles.icon, className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      {...rest}
    />
  );
}
```
`Icon.module.scss` → `.icon { flex-shrink: 0; }`. `components/Icon/index.ts` exports `Icon`, `IconProps`, `IconName`. `components/index.ts` → `export * from './Icon';`.
Adding an icon later = one line in the registry. `lucide-react` may be imported **only** inside `components/Icon`.

### 7.5 Placeholder page (per requested page)

```tsx
// pages/UsersPage/UsersPage.tsx
import styles from './UsersPage.module.scss';

export function UsersPage() {
  return (
    <main className={styles.page}>
      <h1>Users</h1>
    </main>
  );
}
```
`UsersPage.module.scss` → `.page { padding: var(--space-4); }` (only if the token exists). `UsersPage/index.ts` → `export { UsersPage } from './UsersPage';`. `pages/index.ts` re-exports every page. No logic, no data, no extra content.

### 7.6 Routing (routing = yes)

`routes/__root.tsx`:
- API = yes → `createRootRouteWithContext<{ queryClient: QueryClient }>()({ component: Outlet })`
- API = no → `createRootRoute({ component: Outlet })`

Page route (path `/users` → `routes/users/index.tsx`; `/users/$userId` → `routes/users/$userId.tsx`):
```tsx
import { createFileRoute } from '@tanstack/react-router';
import { UsersPage } from '@pages';

export const Route = createFileRoute('/users/')({ component: UsersPage });
```
`app/router.ts`:
```ts
import { createRouter } from '@tanstack/react-router';
import { routeTree } from '../routeTree.gen';
// API only: import { queryClient } from './queryClient';

export const router = createRouter({
  routeTree,
  // API only: context: { queryClient },
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
```
(`../routeTree.gen` is the single allowed relative import, because the generated file sits outside every layer; add an ESLint override for `src/app/router.ts`.) `app/index.ts` exports `router`, and `AppProviders` if it exists.

No loaders, no search-param validation, no 404 component at scaffold time.

### 7.7 API (API = yes)

`core/config/env.ts`:
```ts
export const env = { apiUrl: import.meta.env.VITE_API_URL as string };
```
Add typing in `src/vite-env.d.ts` (`ImportMetaEnv { readonly VITE_API_URL: string }`) and `.env.example` (`VITE_API_URL=` + user-provided value or empty).

`core/http/ApiError.ts` and `core/http/httpClient.ts`:
```ts
export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}
```
```ts
import { env } from '../config';
import { ApiError } from './ApiError';

type Params = Record<string, string | number | boolean | undefined>;
interface RequestOptions extends Omit<RequestInit, 'body'> { params?: Params; body?: unknown }

async function request<T>(path: string, { params, body, headers, ...init }: RequestOptions = {}): Promise<T> {
  const query = params
    ? '?' + new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]),
      )
    : '';
  const res = await fetch(`${env.apiUrl}${path}${query}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new ApiError(res.status, res.statusText, await res.json().catch(() => undefined));
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export const http = {
  get: <T>(p: string, o?: RequestOptions) => request<T>(p, { ...o, method: 'GET' }),
  post: <T>(p: string, b?: unknown, o?: RequestOptions) => request<T>(p, { ...o, method: 'POST', body: b }),
  put: <T>(p: string, b?: unknown, o?: RequestOptions) => request<T>(p, { ...o, method: 'PUT', body: b }),
  delete: <T>(p: string, o?: RequestOptions) => request<T>(p, { ...o, method: 'DELETE' }),
};
```
`core/index.ts` re-exports `config`, `http`, (`storage` if enabled). `app/queryClient.ts`:
```ts
import { QueryClient } from '@tanstack/react-query';
export const queryClient = new QueryClient();
```
Do **not** set custom `defaultOptions` (staleTime, retry...) — those are the user's decisions; ask only if the user brings them up.

No authentication headers: out of scope; if the user mentions auth → stop and ask.

### 7.8 Global state (global state = yes)

`core/storage/storage.ts`:
```ts
const PREFIX = 'app';
interface Envelope<T> { v: number; data: T }

export const storage = {
  read<T>(key: string, version: number): T | null {
    try {
      const raw = localStorage.getItem(`${PREFIX}:${key}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Envelope<T>;
      return parsed.v === version ? parsed.data : null;
    } catch { return null; }
  },
  write<T>(key: string, version: number, data: T): void {
    try { localStorage.setItem(`${PREFIX}:${key}`, JSON.stringify({ v: version, data } satisfies Envelope<T>)); }
    catch { /* quota or private mode */ }
  },
  remove(key: string): void {
    try { localStorage.removeItem(`${PREFIX}:${key}`); } catch { /* noop */ }
  },
};
```
`store/createStore.tsx` (React 19 `<Context value>`; for React 18 use `.Provider`):
```tsx
import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode, type Reducer } from 'react';
import { storage } from '@core';

interface CreateStoreOptions<S, A> {
  name: string;
  version: number;
  reducer: Reducer<S, A>;
  initialState: S;
  partialize?: (state: S) => Partial<S>;
}

export function createStore<S, A>({ name, version, reducer, initialState, partialize = (s) => s }: CreateStoreOptions<S, A>) {
  const StateContext = createContext<S | null>(null);
  const DispatchContext = createContext<Dispatch<A> | null>(null);

  const hydrate = (initial: S): S => {
    const saved = storage.read<Partial<S>>(name, version);
    return saved ? { ...initial, ...saved } : initial;
  };

  function StoreProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState, hydrate);
    useEffect(() => { storage.write(name, version, partialize(state)); }, [state]);
    return (
      <DispatchContext value={dispatch}>
        <StateContext value={state}>{children}</StateContext>
      </DispatchContext>
    );
  }
  function useStoreState(): S {
    const ctx = useContext(StateContext);
    if (ctx === null) throw new Error(`[${name}] used outside its provider`);
    return ctx;
  }
  function useStoreDispatch(): Dispatch<A> {
    const ctx = useContext(DispatchContext);
    if (ctx === null) throw new Error(`[${name}] used outside its provider`);
    return ctx;
  }
  return { StoreProvider, useStoreState, useStoreDispatch };
}
```
Each slice the user asked for lives in `store/<slice>/`: `<slice>.types.ts` (state + discriminated actions with `'<slice>/actionName'` types), `<slice>.reducer.ts`, `<slice>.store.tsx` (calls `createStore`, exports `<Slice>Provider` and a semantic hook `use<Slice>()` that returns state plus memoized action functions, never raw `dispatch`), `index.ts`. `store/StoreProvider.tsx` nests all slice providers; `store/index.ts` exports `StoreProvider` and every slice hook. `version` starts at `1`.

Slice contents (state fields, actions) come **only** from the user's answers. Side effects like applying a theme to `document.documentElement` are created only if the user asked for them.

### 7.9 `AppProviders` and `main.tsx`

`app/AppProviders.tsx` nests only the enabled providers (`QueryClientProvider` for API, `StoreProvider` for global state).

`main.tsx` composition:
- Root element: `<RouterProvider router={router} />` if routing, otherwise `<App />` (`app/App.tsx` renders the single page, or an empty fragment if none was requested).
- Wrapped in `<AppProviders>` only if it exists.
- Always imports `'@styles/global.scss'` and uses `StrictMode`.

## 8. ESLint layer rules

Extend the Vite ESLint flat config. Build the rules from the layers present in the profile:
```js
const noParent = { group: ['../*', '../../*', '../../../*'], message: 'Use layer aliases (@core, @components...) or ./' };
const lucide = { group: ['lucide-react'], message: 'Use <Icon name="..." />' };
const deep = (l) => ({ group: [`@${l}/*`], message: `Import from '@${l}' (barrel), not deep paths` });
// 'styles' and 'assets' are excluded: they are imported by file (@styles/global.scss)
const ALL = [/* allowed layers except styles/assets */];
const deepExcept = (own) => ALL.filter((l) => l !== own).map(deep);

export default [
  // ...base configs
  { ignores: ['src/routeTree.gen.ts'] },
  { files: ['src/**/*.{ts,tsx}'], rules: { 'no-restricted-imports': ['error', { patterns: [noParent, lucide, ...ALL.map(deep)] }] } },
  { files: ['src/components/Icon/**'], rules: { 'no-restricted-imports': ['error', { patterns: [noParent, ...deepExcept('components')] }] } },
  {
    files: ['src/components/**'], ignores: ['src/components/Icon/**'],
    rules: { 'no-restricted-imports': ['error', { patterns: [noParent, lucide, ...deepExcept('components'),
      { group: ['@hooks', '@store', '@services', '@pages', '@layouts', '@app', '@tanstack/*'], message: 'components is pure UI' }] }] },
  },
  ...['hooks', 'layouts', 'pages', 'services', 'store', 'core', 'app'].filter((l) => ALL.includes(l)).map((layer) => ({
    files: [`src/${layer}/**`],
    rules: { 'no-restricted-imports': ['error', { patterns: [noParent, lucide, ...deepExcept(layer),
      ...(['services', 'store', 'core'].includes(layer)
        ? [{ group: ['@components', '@pages', '@layouts', '@hooks'], message: 'Dependencies only go downward' }] : [])] }] },
  })),
  // routing only: the generated route tree import is the single allowed relative import
  { files: ['src/app/router.ts'], rules: { 'no-restricted-imports': ['error', { patterns: [lucide, ...deepExcept('app')] }] } },
];
```

## 9. Profile files (the contract with the feature skill)

`.project-profile.json` (project root):
```json
{
  "profileVersion": 1,
  "name": "<project>",
  "packageManager": "<npm|pnpm|yarn|bun>",
  "routing": true,
  "api": { "enabled": true, "baseUrlEnvVar": "VITE_API_URL" },
  "globalState": { "enabled": true, "slices": ["ui"] },
  "allowedLayers": ["app", "assets", "components", "core", "hooks", "layouts", "pages", "services", "store", "styles"],
  "pages": [{ "name": "UsersPage", "path": "/users" }]
}
```
`ARCHITECTURE.md` (project root): short document listing the enabled modules, the folder tree actually created, the layer dependency rules (section 6), alias/barrel rules, and a note: "New features must be created with the `react-ts-feature-builder` skill". Do not copy implementation details; keep it factual and generated from the profile.

## 10. Hard restrictions

- Never create a module the user answered "no" to, nor install its dependencies.
- Never add Tailwind, UI kits, devtools, auth, i18n, testing setup, CI, or Docker unless explicitly requested.
- Never use `export default` (except where a tool requires it, e.g. config files).
- Never use `../` imports (single exception: `app/router.ts` → `../routeTree.gen`).
- Never import `lucide-react` outside `components/Icon`.
- Never write global CSS for components; only SCSS Modules (`*.module.scss`).
- Never leave unrequested placeholder content, TODO folders, or empty barrels.
