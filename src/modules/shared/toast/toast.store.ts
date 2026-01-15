import { defineStore } from 'pinia'
import { ToastType } from './toast.interface'

export const useToastStore = defineStore('toast', {
  state: () => ({
    show: false,
    message: '',
    color: ToastType.info,
    timeout: 1500
  }),
  actions: {
    trigger(message: string, color: ToastType = ToastType.info) {
      this.message = message
      this.color = color
      this.show = true
    },

    success(message: string) {
      this.trigger(message, ToastType.success)
    },

    error(message: string) {
      this.trigger(message, ToastType.error)
    },

    info(message: string) {
      this.trigger(message, ToastType.info)
    },

    close() {
      this.show = false
    }
  }
})
