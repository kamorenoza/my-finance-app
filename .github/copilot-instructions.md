## Repository Guidance for AI Coding Agents

This is a **Vue 3 + TypeScript + Vite** personal finance app with Pinia state management and Vuetify UI. The app is frontend-only, uses Firebase for auth, and localStorage for data persistence (intentionally not Firestore for accounts/budgets).

### Architecture Overview

**Three-tier data flow:**

1. **Components** (Vue SFC with `<script setup lang="ts">`) → call store actions
2. **Stores** (Pinia via `defineStore`) → call service methods
3. **Services** (e.g., `accounts.service.ts`) → handle localStorage persistence + user-scoped keys

**Feature modules** under [src/modules](src/modules):

- `accounts/`: Bank account tracking, credit cards, expenses per account
- `budget/`: Budget entries and summaries
- `categories/`: Expense categories with icons and colors
- `auth/`: Firebase Google login, user state management
- `shared/`: Reusable UI components, directives, composables, toast notifications

**Routing:** [src/router/index.ts](src/router/index.ts) — nested routes under `MainLayout.vue`; `/login` is the only unauthenticated route.

### Critical Patterns & Implementation

**Persistence (NOT Firestore for accounts):**

- Services scope localStorage by user email: e.g., `localStorage.getItem('accounts_' + userEmail)`
- Extract user from `localStorage.getItem('user')` → parse and access `.email`
- Always null-check user before persisting (return early if not authenticated)
- Example: [src/modules/accounts/accounts.service.ts](src/modules/accounts/accounts.service.ts) methods like `loadAccounts()` and `addAccount()`

**State Management pattern:**

- Store owns reactive state (`state()`) and loads initial data from service
- Getters filter/compute (e.g., `filteredAccounts` in accounts store)
- Actions mutate state AND call service to persist
- See [src/modules/accounts/accounts.store.ts](src/modules/accounts/accounts.store.ts) for the standard pattern

**Vue component conventions:**

- Use `<script setup lang="ts">` for all components
- Import types with `import type { TypeName } from '...'`
- Use `v-if`/`v-for` with `:key` binding for lists
- Directives: `v-numeric-only`, `v-currency`, `v-currency-formatter`, `v-date-formatter` (registered in [src/main.ts](src/main.ts))

**Firebase auth flow:**

- [src/modules/auth/firebaseAuth.ts](src/modules/auth/firebaseAuth.ts): `loginWithGoogle()` signs in via popup, creates Firestore user doc, saves user to localStorage
- [src/modules/auth/auth.store.ts](src/modules/auth/auth.store.ts): stores `user` (Firebase User object) and loading state
- Composable [src/modules/auth/composables/useAuthListener.ts](src/modules/auth/composables/useAuthListener.ts) likely watches auth state

### Build & Dev Commands

- `npm run dev` → Vite dev server (uses `--host` flag)
- `npm run build` → Type-check with `vue-tsc -b` then `vite build`
- `npm run preview` → Local preview of production build
- **Note:** PWA artifacts in `dev-dist/` (service worker, workbox). Be cautious with local PWA caching during development.

### Key Files to Know

| File                                                       | Purpose                                               |
| ---------------------------------------------------------- | ----------------------------------------------------- |
| [src/main.ts](src/main.ts)                                 | App entry; registers global directives and plugins    |
| [src/database/firebase.ts](src/database/firebase.ts)       | Firebase config & auth/provider exports               |
| [src/plugins/vuetify.ts](src/plugins/vuetify.ts)           | Vuetify theme + component config                      |
| [src/styles/main.scss](src/styles/main.scss)               | Global styles; check `_variables.scss` for theme vars |
| [src/modules/shared/utils.ts](src/modules/shared/utils.ts) | Utility functions like `generateId()`                 |

### Common Tasks

**Add a new module feature:**

1. Create folder under [src/modules](src/modules): `src/modules/newfeature/`
2. Create `newfeature.interface.ts` (TypeScript types)
3. Create `newfeature.service.ts` (localStorage logic with user-scoped keys)
4. Create `newfeature.store.ts` (Pinia store: state, getters, actions)
5. Create view component and register in [src/router/index.ts](src/router/index.ts)

**Modify account/budget storage:**

- DO NOT move to Firestore without migration planning
- Service layer is the source of truth; update service first, then store actions that call it
- Test user-scoped localStorage keys work correctly

**Add a new global directive:**

- Create file under `src/modules/shared/directives/`
- Import and register in [src/main.ts](src/main.ts) with `app.directive()`

### What NOT To Do

- ❌ Store account/budget data in Firestore—they live in localStorage scoped by user email
- ❌ Call service methods directly from components—always go through the store
- ❌ Modify Firebase config without confirming credentials
- ❌ Add authentication to routes without checking [src/router/index.ts](src/router/index.ts) for existing patterns

### Dependency Highlights

- **Vue 3**, **Vue Router 4**, **Pinia 3**, **Vuetify 3**
- **Firebase 11** (auth + Firestore for user docs only)
- **Chart.js + vue-chartjs** (budget visualizations)
- **dayjs** (date formatting)
- **Vite 6** + `vite-plugin-pwa` (PWA support)
- **SCSS** for styling + Material Design Icons via `@mdi/font`
