// src/router/index.ts
import { auth } from '@/database/firebase'
import { useAuthStore } from '@/modules/auth/auth.store'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { createRouter, createWebHashHistory } from 'vue-router'
import {
  saveLastRoute,
  getLastRoute
} from '@/modules/shared/services/lastRoute.service'

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
      },
      {
        path: '/compras',
        name: 'compras',
        component: () => import('@/modules/shopping/ShoppingView.vue')
      },
      {
        path: '/compras/:id',
        name: 'compras-detalle',
        component: () => import('@/modules/shopping/ShoppingListDetailView.vue')
      },
      {
        path: '/usuario',
        name: 'usuario',
        component: () => import('@/modules/user/UserView.vue')
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
  history: createWebHashHistory('/my-finance-app/'),
  routes
})

// Flag to track if this is the initial navigation
let isInitialNavigation = true

// Save current route when user leaves the app
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const currentPath = router.currentRoute.value.path
    const currentName = router.currentRoute.value.name as string | undefined
    if (currentPath !== '/login') {
      saveLastRoute(currentPath, currentName)
    }
  })
}

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

    // If coming from login, redirect to last route
    if (to.path === '/login') {
      const lastRoute = getLastRoute()
      next(lastRoute || '/')
      return
    }

    // On initial navigation to home, redirect to last route if exists
    if (isInitialNavigation && to.path === '/') {
      const lastRoute = getLastRoute()
      if (lastRoute && lastRoute !== '/') {
        next(lastRoute)
        return
      }
    }

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
      // Redirect to last route or home
      const lastRoute = getLastRoute()
      next(lastRoute || '/')
    } else if (isInitialNavigation && to.path === '/') {
      // On initial navigation to home, redirect to last route if exists
      const lastRoute = getLastRoute()
      if (lastRoute && lastRoute !== '/') {
        next(lastRoute)
      } else {
        next()
      }
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

// Save last route after navigation
router.afterEach(to => {
  // Skip saving on initial navigation to avoid overwriting
  if (isInitialNavigation) {
    isInitialNavigation = false
    return
  }

  // Only save if it's not login and user is authenticated
  if (to.path !== '/login') {
    saveLastRoute(to.path, to.name as string | undefined)
  }
})

export default router
