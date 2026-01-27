import dayjs from 'dayjs'
import 'dayjs/locale/es'

export default {
  mounted(el: HTMLElement, binding: any) {
    const value = resolveValue(el, binding)
    el.textContent = formatDate(value)
  },
  updated(el: HTMLElement, binding: any) {
    const value = resolveValue(el, binding)
    el.textContent = formatDate(value)
  }
}

function formatDate(value: string | Date | number | undefined | null): string {
  if (value == null) return ''
  const d = dayjs(value).locale('es')
  if (!d.isValid()) return ''
  const formatted = d.format('D MMM YYYY') // e.g. "26 ene 2026"
  // Capitalize month short name (e.g. "ene" -> "Ene")
  const parts = formatted.split(' ')
  if (parts.length >= 2) {
    parts[1] = parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
  }
  return parts.join(' ')
}

function resolveValue(el: HTMLElement, binding: any): string | Date | number | undefined {
  if (binding && typeof binding.value !== 'undefined') return binding.value

  const text = el.textContent ? el.textContent.trim() : ''
  if (!text) return undefined

  // Try parsing ISO / human date strings or timestamps
  // Remove common non-date punctuation
  return text
}
