import type { Directive } from 'vue'

export const vNumericOnly: Directive = {
  mounted(el) {
    const input = el.tagName === 'INPUT' ? el : el.querySelector('input')
    if (!input) return

    input.setAttribute('inputmode', 'numeric')
    input.setAttribute('pattern', '[0-9]*')

    const handler = () => {
      const cleaned = input.value.replace(/[^0-9.]/g, '')
      if (input.value !== cleaned) {
        input.value = cleaned
        setTimeout(() => {
          input.dispatchEvent(new Event('input'))
        }, 0)
      }
    }

    input.addEventListener('input', handler)
  }
}
