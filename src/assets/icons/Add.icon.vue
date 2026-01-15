<template class="this-icon">
  <svg
    viewBox="-2.4 -2.4 28.80 28.80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      <path
        d="M17 12L12 12M12 12L7 12M12 12L12 7M12 12L12 17"
        :stroke="color"
        stroke-width="0.92"
        stroke-linecap="round"
      ></path>
    </g>
  </svg>
</template>
<script setup lang="ts">
import { colorPrimary } from '@/styles/variables.styles'

interface Props {
  color?: string
}

const { color = colorPrimary } = defineProps<Props>()
</script>

<style lang="scss" scoped>
.this-icon {
  width: 60px;
  height: 50px;
}
</style>
