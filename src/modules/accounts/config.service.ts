const getUserEmail = () => {
  const userString = localStorage.getItem('user')
  const user = userString ? JSON.parse(userString) : null
  return user ? user.email : null
}

export interface AccountConfig {
  groupBy?: string | null
  orderBy?: string | null
}

export interface UserConfig {
  [accountId: string]: AccountConfig
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
    userConfig[accountId] = config

    localStorage.setItem(`config_${userEmail}`, JSON.stringify(userConfig))
  },

  getAccountConfig: (accountId: string): AccountConfig => {
    const userConfig = configService.loadConfig()
    return userConfig[accountId] || {}
  },

  clearAccountConfig: (accountId: string) => {
    const userEmail = getUserEmail()
    if (!userEmail) return

    const userConfig = configService.loadConfig()
    delete userConfig[accountId]

    localStorage.setItem(`config_${userEmail}`, JSON.stringify(userConfig))
  }
}
