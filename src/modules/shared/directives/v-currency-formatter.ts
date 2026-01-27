export default {
  mounted(el: HTMLElement, binding: any) {
    const value = resolveValue(el, binding) || 0
    el.textContent = formatCurrency(value)
  },
  updated(el: HTMLElement, binding: any) {
    const value = resolveValue(el, binding) || 0
    el.textContent = formatCurrency(value)
  }
}

function formatCurrency(value: number): string {
  if (typeof value !== 'number') {
    return '$ 0'
  }
  return `$ ${value.toLocaleString('es-CO', {
    minimumFractionDigits: 0
  })}`
}

function resolveValue(el: HTMLElement, binding: any): number | undefined {
  // If the directive is used with a value: v-currency-formatter="expense.value"
  if (binding && typeof binding.value !== 'undefined') return binding.value

  // Otherwise, try to parse the element's text content (e.g., <p v-currency-formatter>{{ value }}</p>)
  const text = el.textContent ? el.textContent.trim() : ''
  if (!text) return undefined

  // Remove currency symbols and non-number characters except dot and minus
  const cleaned = text.replace(/[^0-9.-]+/g, '')
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : undefined
}
