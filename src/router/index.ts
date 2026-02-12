// src/router/index.ts
import { auth } from '@/database/firebase'
import { useAuthStore } from '@/modules/auth/auth.store'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { createRouter, createWebHistory } from 'vue-router'

// Define las rutas. Por ejemplo, incluiremos la ruta de login y otra de presupuesto.
const routes = [
  {
    path: '/',
    component: () => import('@/modules/shared/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'presupuesto',
        component: () => import('@/modules/budget/HomeView.vue')
      },
      {
        path: '/cuentas',
        name: 'cuentas',
        component: () => import('@/modules/accounts/AccountsView.vue')
      },
      {
        path: '/cuentas/detalle/:id',
        name: 'cuentas-detalle',
        component: () => import('@/modules/accounts/AccountDetailsView.vue')
      },
      {
        path: '/gastos',
        name: 'gastos',
        component: () => import('@/modules/expenses/ExpensesView.vue')
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
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const getLocalUser = (): { email?: string } | null => {
  const storedUser = localStorage.getItem('user')

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser) as { email?: string }
  } catch (error) {
    console.error('Error parsing user from localStorage', error)
    return null
  }
}

const getFirebaseUser = (timeoutMs = 5000) =>
  new Promise<User | null>(resolve => {
    let unsubscribe: (() => void) | null = null
    let hasResolved = false

    const timeout = setTimeout(() => {
      if (hasResolved) return
      hasResolved = true

      if (unsubscribe) {
        unsubscribe()
      }
      console.warn('Firebase auth timeout - resolving with null')
      resolve(null)
    }, timeoutMs)

    unsubscribe = onAuthStateChanged(auth, user => {
      if (hasResolved) return
      hasResolved = true

      clearTimeout(timeout)
      if (unsubscribe) {
        unsubscribe()
      }
      resolve(user)
    })
  })

router.beforeEach(async (to, _, next) => {
  const authStore = useAuthStore()
  const localUser = getLocalUser()

  // Si hay usuario en localStorage, permitir la navegación inmediatamente
  if (localUser?.email) {
    authStore.setUser(JSON.parse(localStorage.getItem('user') || '{}'))
    next()
    return
  }

  // Si NO hay usuario local, intentar obtener de Firebase (solo una vez)
  let firebaseUser = auth.currentUser

  if (!firebaseUser) {
    // Timeout corto para obtener usuario de Firebase
    firebaseUser = await getFirebaseUser(2000)
  }

  if (firebaseUser) {
    localStorage.setItem('user', JSON.stringify(firebaseUser))
    authStore.setUser(firebaseUser)
    authStore.setLoading(false)

    if (to.path === '/login') {
      next('/')
    } else {
      next()
    }
  } else {
    // Sin usuario, ir a login
    localStorage.removeItem('user')
    authStore.logout()
    authStore.setLoading(false)

    if (to.path !== '/login') {
      next('/login')
    } else {
      next()
    }
  }
})

export default router
