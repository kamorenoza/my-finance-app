import { h, render } from 'vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { vueApp } from '@/main'

export const useConfirm = () => {
  return (options: {
    title: string
    message: string
    confirmColor?: string
    confirmText?: string
    cancelText?: string
  }): Promise<boolean> => {
    return new Promise(resolve => {
      const container = document.createElement('div')
      document.body.appendChild(container)

      const onConfirm = () => {
        cleanup()
        resolve(true)
      }

      const onCancel = () => {
        cleanup()
        resolve(false)
      }

      const vnode = h(ConfirmDialog, {
        ...options,
        onConfirm,
        onCancel
      })

      vnode.appContext = vueApp._context
      render(vnode, container)

      const cleanup = () => {
        render(null, container)
        document.body.removeChild(container)
      }
    })
  }
}
