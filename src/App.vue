<template>
  <v-app>
    <v-main>
      <LoadingScreen v-if="authStore.loading" />
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useAuthListener } from '@/modules/auth/composables/useAuthListener'
import { useAuthStore } from './modules/auth/auth.store'
import LoadingScreen from './modules/shared/components/LoadingScreen.vue'

useAuthListener()
const authStore = useAuthStore()
</script>

<style lang="scss">
.text-gray {
  color: $color-grey;
}

.text-medium {
  font-family: $font-medium;
  font-weight: 400;
}
</style>
