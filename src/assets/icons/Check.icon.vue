<template>
  <svg
    viewBox="-2.4 -2.4 28.80 28.80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="icon"
  >
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      <path
        d="M4 12.6111L8.92308 17.5L20 6.5"
        :stroke="color"
        stroke-width="1.272"
        stroke-linecap="round"
        stroke-linejoin="round"
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
  width: 22px;
  height: 25px;
}
</style>
