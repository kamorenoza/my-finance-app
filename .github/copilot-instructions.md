## Repository guidance for AI coding agents

This repo is a Vue 3 + TypeScript + Vite single-page app with Pinia and Vuetify. Use the pointers below to be productive quickly.

- **High-level architecture:**
  - Frontend-only app scaffolded with Vite: entry at [src/main.ts](src/main.ts).
  - Feature modules under [src/modules](src/modules) (e.g., `accounts`, `auth`, `budget`, `categories`). Each module commonly contains: `*.service.ts` (business logic / persistence), `*.store.ts` (Pinia stores), `*.interface.ts`, view components and a `components/` folder.
  - Global routing in [src/router/index.ts](src/router/index.ts) using Vue Router with nested layout `MainLayout.vue`.
  - Firebase is used for authentication and Firestore user records: see [src/database/firebase.ts](src/database/firebase.ts) and [src/modules/auth/firebaseAuth.ts](src/modules/auth/firebaseAuth.ts).

- **Persistence patterns (important):**
  - Module services handle persistence; for example `src/modules/accounts/accounts.service.ts` stores account data in `localStorage` keyed by the authenticated user's email (not in Firestore). Don't assume backend storage for accounts—check the service before changing persistence.

- **State management:**
  - Pinia stores via `defineStore` are used across modules (see `src/modules/accounts/accounts.store.ts`). Stores call service methods (e.g., `accountService.loadAccounts()`) rather than directly manipulating storage.

- **Project scripts / build / dev:**
  - Start dev server: `npm run dev` (invokes `vite --host`).
  - Typecheck + build: `npm run build` (runs `vue-tsc -b && vite build`).
  - Preview production build: `npm run preview`.
  - The repo uses `vite-plugin-pwa` and has built service worker artifacts in `dev-dist/`—be cautious when testing PWA behavior locally.

- **Conventions & patterns to follow**
  - Keep UI/state/service separation: Components call store actions; stores call services; services handle persistence/external APIs.
  - Use existing composables and directives in `src/modules/shared/` (e.g., directives in `shared/directives`, composables in `shared/composables`). Register new global directives in `src/main.ts` if needed.
  - Follow TypeScript types in `*.interface.ts` files for domain models.

- **Integration points to inspect when changing behavior**
  - Authentication flow: [src/modules/auth/firebaseAuth.ts](src/modules/auth/firebaseAuth.ts) and `src/database/firebase.ts` (Firebase config and exports).
  - Account persistence: [src/modules/accounts/accounts.service.ts](src/modules/accounts/accounts.service.ts) — localStorage usage.
  - Global UI/theme: [src/plugins/vuetify.ts](src/plugins/vuetify.ts) and [src/styles/main.scss](src/styles/main.scss).

- **Examples to reference in PRs / fixes**
  - To change routing or add views, update [src/router/index.ts](src/router/index.ts) and add views under `src/modules/<feature>/`.
  - To add a new domain model, mimic module layout: `<feature>.interface.ts`, `<feature>.service.ts`, `<feature>.store.ts`, and view components.

- **What NOT to change without explicit verification**
  - Do not move account storage into Firestore without coordinating auth and migration—accounts are currently localStorage-per-user.
  - Avoid changing Firebase config in `src/database/firebase.ts` unless you have new credentials.

If anything here is unclear or you want additional details (tests, CI, coding style rules), tell me which section to expand or any files you want me to inspect next.
