const vCurrencyFormat = {
  beforeMount(el: HTMLInputElement) {
    const input = el.tagName === 'INPUT' ? el : el.querySelector('input')
    if (!input) return

    input.setAttribute('inputmode', 'numeric')
    input.setAttribute('pattern', '[0-9]*')
    input.setAttribute('maxlength', '12')

    const formatCurrency = (value: string) => {
      const rawValue = value.replace(/[^0-9]/g, '')

      return rawValue ? Number(rawValue).toLocaleString() : ''
    }

    input.addEventListener('input', event => {
      const input = event.target as HTMLInputElement
      input.value = formatCurrency(input.value)
    })
  }
}

export default vCurrencyFormat
