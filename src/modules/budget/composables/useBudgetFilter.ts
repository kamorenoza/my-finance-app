import { computed, unref } from 'vue'
import { useBudgetStore } from '../budget.store'
import type { BudgetEntry } from '../budget.interface'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import type { Ref, ComputedRef } from 'vue'

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

interface FilterOptions {
  selectedDate?: Date | Ref<Date | undefined> | ComputedRef<Date | undefined>
  search?: string | Ref<string> | ComputedRef<string>
  initDate?:
    | Date
    | null
    | Ref<Date | null>
    | ComputedRef<Date | null | undefined>
  endDate?:
    | Date
    | null
    | Ref<Date | null>
    | ComputedRef<Date | null | undefined>
}

export function useBudgetFilter(options: FilterOptions = {}) {
  const store = useBudgetStore()

  const filteredAndSortedEntries = computed(() => {
    const selectedDate = unref(options.selectedDate) || new Date()
    const search = unref(options.search) || ''
    const initDate = unref(options.initDate)
    const endDate = unref(options.endDate)

    const selectedMonth = dayjs(selectedDate)
    let entries: BudgetEntry[] = []

    // Aplicar lógica de visibilidad según tipo de budget
    store.entries.forEach(entry => {
      const entryMonth = dayjs(entry.date)
      let shouldShow = false

      // Lógica de visibilidad:
      // 1. Si es fijo (isFixed === true): mostrar siempre desde la fecha de creación en adelante
      // 2. Si se repite (repeat > 0): mostrar desde creación hasta X meses después
      // 3. Si no es fijo ni se repite: mostrar solo en el mes de creación

      if (entry.isFixed === true) {
        // Fijo: mostrar desde la fecha de creación indefinidamente hacia adelante
        shouldShow = selectedMonth.isSameOrAfter(entryMonth, 'month')
      } else if (entry.repeat && entry.repeat > 0) {
        // Con repetición: mostrar desde creación hasta X meses después
        const lastMonth = entryMonth.add(entry.repeat - 1, 'months')
        shouldShow =
          selectedMonth.isSameOrAfter(entryMonth, 'month') &&
          selectedMonth.isSameOrBefore(lastMonth, 'month')
      } else {
        // Normal: mostrar solo en el mes de creación exacto
        shouldShow = selectedMonth.isSame(entryMonth, 'month')
      }

      if (shouldShow) {
        entries.push(entry)
      }
    })

    // Filtrar por búsqueda
    if (search) {
      const searchLower = search.toLowerCase()
      entries = entries.filter(
        e =>
          e.name.toLowerCase().includes(searchLower) ||
          e.category?.toLowerCase().includes(searchLower)
      )
    }

    // Filtrar por fechas (si están especificadas)
    if (initDate) {
      entries = entries.filter(e =>
        dayjs(e.date).isSameOrAfter(dayjs(initDate), 'day')
      )
    }

    if (endDate) {
      entries = entries.filter(e =>
        dayjs(e.date).isSameOrBefore(dayjs(endDate), 'day')
      )
    }

    return entries
  })

  return {
    filteredAndSortedEntries
  }
}
