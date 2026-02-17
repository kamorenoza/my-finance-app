/**
 * Service to manage the last visited route
 * This data is stored locally per device and is NOT synchronized via backup
 */

const LAST_ROUTE_KEY = 'lastRoute'

/**
 * Get user email from localStorage
 */
const getUserEmail = (): string | null => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  try {
    const user = JSON.parse(userStr)
    return user?.email || null
  } catch {
    return null
  }
}

/**
 * Get user-scoped storage key
 */
const getUserKey = (baseKey: string): string => {
  const email = getUserEmail()
  return email ? `${baseKey}_${email}` : baseKey
}

/**
 * Save the last visited route path
 */
export const saveLastRoute = (path: string, routeName?: string): void => {
  const email = getUserEmail()
  if (!email) return

  // Only save if it's not the login route
  if (path === '/login') {
    return
  }

  const key = getUserKey(LAST_ROUTE_KEY)
  // Save both path and name for better restoration
  const routeData = JSON.stringify({
    path,
    name: routeName || null,
    timestamp: Date.now()
  })
  localStorage.setItem(key, routeData)
}

/**
 * Get the last visited route path
 */
export const getLastRoute = (): string | null => {
  const email = getUserEmail()
  if (!email) return null

  const key = getUserKey(LAST_ROUTE_KEY)
  const data = localStorage.getItem(key)

  if (!data) return null

  try {
    const routeData = JSON.parse(data)
    return routeData.path || null
  } catch {
    // Fallback for old format (plain string)
    return data
  }
}

/**
 * Clear the last route
 */
export const clearLastRoute = (): void => {
  const email = getUserEmail()
  if (!email) return

  const key = getUserKey(LAST_ROUTE_KEY)
  localStorage.removeItem(key)
}
