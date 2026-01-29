import { onMounted, onUnmounted } from 'vue'

/**
 * Composable para prevenir la navegación hacia atrás
 * Bloquea el botón atrás del navegador reemplazando el historial
 */
export function usePreventBack() {
  onMounted(() => {
    // Agregar una entrada al historial para que no se pueda ir atrás
    window.history.pushState(null, '', window.location.href)

    // Escuchar el evento popstate (cuando intenta ir atrás)
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href)
    }

    window.addEventListener('popstate', handlePopState)

    onUnmounted(() => {
      window.removeEventListener('popstate', handlePopState)
    })
  })
}
