// src/router/index.ts
import HomeView from '@/modules/budget/HomeView.vue'
import MainLayout from '@/modules/shared/layouts/MainLayout.vue'
import { createRouter, createWebHistory } from 'vue-router'

// Define las rutas. Por ejemplo, incluiremos la ruta de login y otra de presupuesto.
const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', name: 'presupuesto', component: HomeView },
      {
        path: '/cuentas',
        name: 'cuentas',
        component: () => import('@/modules/accounts/AccountsView.vue')
      },
      {
        path: '/cuentas/detalle/:id',
        name: 'cuentas-detalle',
        component: () => import('@/modules/accounts/AccountDetailsView.vue')
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/modules/auth/LoginView.vue')
  }
  // Puedes agregar más rutas aquí, por ejemplo:
  // { path: '/deudas', component: () => import('@/modules/debts/views/DebtsView.vue') },
  // { path: '/gastos', component: () => import('@/modules/expenses/views/ExpensesView.vue') },
  // { path: '/notas', component: () => import('@/modules/notes/views/NotesView.vue') },
  // { path: '/compras', component: () => import('@/modules/shopping/views/ShoppingView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
