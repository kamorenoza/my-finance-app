<template>
  <v-app>
    <div :style="layoutStyle">
      <router-view />
    </div>
    <BottomMenu />
    <NotificationToast />
  </v-app>
</template>

<script setup lang="ts">
import BottomMenu from '@/modules/shared/components/BottomMenu.vue'
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useLayoutStore } from '@/modules/shared/store/layout'
import NotificationToast from '../toast/NotificationToast.vue'

const layout = useLayoutStore()
const { mdAndUp } = useDisplay()

const isDesktop = computed(() => mdAndUp.value)

const layoutStyle = computed(() => {
  if (!isDesktop.value) return {}

  const paddingLeft = layout.rail ? '72px' : '276px' // ajusta si usas otro ancho
  const paddingTop = '80px' // navbar flotante (64px alto + margen)

  return {
    paddingLeft,
    paddingTop
  }
})
</script>
