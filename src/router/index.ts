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
        path: '/notas',
        name: 'notas',
        component: () => import('@/modules/notes/NotesView.vue')
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

let hasAppliedLastPageRedirect = false

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

const getFirebaseUser = () =>
  new Promise<User | null>(resolve => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      unsubscribe()
      resolve(user)
    })
  })

const resolveUserEmail = (
  localUser: { email?: string } | null,
  firebaseUser: User | null
) => {
  if (localUser?.email) {
    return localUser.email
  }

  if (firebaseUser?.email) {
    return firebaseUser.email
  }

  const authStore = useAuthStore()
  return authStore.user?.email ?? null
}

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const localUser = getLocalUser()
  const firebaseUser = auth.currentUser ?? (await getFirebaseUser())

  if (!localUser || (firebaseUser && localUser.email !== firebaseUser.email)) {
    if (firebaseUser) {
      localStorage.setItem('user', JSON.stringify(firebaseUser))
      authStore.setUser(firebaseUser)
      authStore.setLoading(false)

      if (to.path === '/login') {
        next('/')
        return
      }
    } else {
      localStorage.removeItem('user')
      authStore.logout()
      authStore.setLoading(false)

      if (to.path !== '/login') {
        next('/login')
        return
      }
    }
  }

  if (hasAppliedLastPageRedirect || to.path !== '/') {
    next()
    return
  }

  const email = resolveUserEmail(localUser, firebaseUser)

  if (!email) {
    hasAppliedLastPageRedirect = true
    next()
    return
  }

  const configKey = `config_${email}`
  const storedConfig = localStorage.getItem(configKey)

  if (!storedConfig) {
    hasAppliedLastPageRedirect = true
    next()
    return
  }

  try {
    const parsedConfig = JSON.parse(storedConfig) as { lastpage?: string }
    const lastPage = parsedConfig.lastpage

    if (lastPage && lastPage !== to.fullPath) {
      hasAppliedLastPageRedirect = true
      next(lastPage)
      return
    }
  } catch (error) {
    console.error('Error parsing config in localStorage', error)
  }

  hasAppliedLastPageRedirect = true
  next()
})

export default router
