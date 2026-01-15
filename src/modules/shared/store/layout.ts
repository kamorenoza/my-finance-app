import { defineStore } from 'pinia'

export const useLayoutStore = defineStore('layout', {
  state: () => ({
    rail: JSON.parse(localStorage.getItem('rail') || 'false'),
  }),
  actions: {
    toggleRail() {
      this.rail = !this.rail
      localStorage.setItem('rail', JSON.stringify(this.rail))
    },
    setRail(value: boolean) {
      this.rail = value
      localStorage.setItem('rail', JSON.stringify(this.rail))
    },
  },
})
