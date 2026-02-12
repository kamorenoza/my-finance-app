const getUserEmail = () => {
  const userString = localStorage.getItem('user')
  const user = userString ? JSON.parse(userString) : null
  return user ? user.email : null
}

export interface AccountConfig {
  groupBy?: string | null
  orderBy?: string | null
  collapseAll?: boolean
  expandedGroups?: { [key: string]: boolean }
}

export interface BudgetConfig {
  groupBy?: string | null
  orderBy?: string | null
  collapseAll?: boolean
  expandedGroups?: { [key: string]: boolean }
}

export interface ExpensesConfig {
  groupBy?: string | null
  orderBy?: string | null
}

export interface UserConfig {
  accounts?: { [accountId: string]: AccountConfig }
  budget?: BudgetConfig
  expenses?: ExpensesConfig
  lastPage?: string
}

export const configService = {
  loadConfig: (): UserConfig => {
    const userEmail = getUserEmail()
    if (!userEmail) return {}

    const config = localStorage.getItem(`config_${userEmail}`)
    return config ? JSON.parse(config) : {}
  },

  saveAccountConfig: (accountId: string, config: AccountConfig) => {
    const userEmail = getUserEmail()
    if (!userEmail) return

    const userConfig = configService.loadConfig()
    const accounts = userConfig.accounts || {}
    accounts[accountId] = config

    userConfig.accounts = accounts

    localStorage.setItem(`config_${userEmail}`, JSON.stringify(userConfig))
  },

  getAccountConfig: (accountId: string): AccountConfig => {
    const userConfig = configService.loadConfig()
    if (!userConfig.accounts) return {}
    return userConfig?.accounts[accountId] || {}
  },

  clearAccountConfig: (accountId: string) => {
    const userEmail = getUserEmail()
    if (!userEmail) return

    const userConfig = configService.loadConfig()
    if (userConfig.accounts) delete userConfig.accounts[accountId]

    localStorage.setItem(`config_${userEmail}`, JSON.stringify(userConfig))
  },

  saveBudgetConfig: (config: BudgetConfig) => {
    const userEmail = getUserEmail()
    if (!userEmail) return

    const userConfig = configService.loadConfig()
    userConfig.budget = config

    localStorage.setItem(`config_${userEmail}`, JSON.stringify(userConfig))
  },

  getBudgetConfig: (): BudgetConfig => {
    const userConfig = configService.loadConfig()
    return userConfig?.budget || {}
  },

  saveExpensesConfig: (config: ExpensesConfig) => {
    const userEmail = getUserEmail()
    if (!userEmail) return

    const userConfig = configService.loadConfig()
    userConfig.expenses = config

    localStorage.setItem(`config_${userEmail}`, JSON.stringify(userConfig))
  },

  getExpensesConfig: (): ExpensesConfig => {
    const userConfig = configService.loadConfig()
    return userConfig?.expenses || {}
  },

  saveLastPage: (page: string) => {
    const userEmail = getUserEmail()
    if (!userEmail) return

    const userConfig = configService.loadConfig()
    userConfig.lastPage = page

    localStorage.setItem(`config_${userEmail}`, JSON.stringify(userConfig))
  },

  getLastPage: () => {
    const userConfig = configService.loadConfig()
    if (!userConfig.lastPage) return '/'

    return userConfig.lastPage
  }
}
