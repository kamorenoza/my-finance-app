import dayjs from 'dayjs'

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

export const currencyFormatter = (value: number, locale = 'es-ES'): string => {
  if (value === null || value === undefined || isNaN(value)) return '$ 0'
  const formattedValue = new Intl.NumberFormat(locale).format(value)

  return `$ ${formattedValue}`
}

export const dateFormatter = (date: string | Date): string => {
  if (date == null) return ''
  const d = dayjs(date).locale('es')
  if (!d.isValid()) return ''
  const formatted = d.format('D MMM YYYY') // e.g. "26 ene 2026"
  // Capitalize month short name (e.g. "ene" -> "Ene")
  const parts = formatted.split(' ')
  if (parts.length >= 2) {
    parts[1] = parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
  }
  return parts.join(' ')
}
