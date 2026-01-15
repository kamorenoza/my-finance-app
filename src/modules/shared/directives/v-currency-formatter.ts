export default {
  mounted(el: HTMLElement, binding: any) {
    const value = binding.value
    el.textContent = formatCurrency(value)
  },
  updated(el: HTMLElement, binding: any) {
    const value = binding.value
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
