<template>
  <svg
    viewBox="-2.4 -2.4 28.80 28.80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g
      id="SVGRepo_bgCarrier"
      stroke-width="0"
      transform="translate(4.199999999999999,4.199999999999999), scale(0.65)"
    >
      <rect
        x="-2.4"
        y="-2.4"
        width="28.80"
        height="28.80"
        rx="14.4"
        :fill="backgroundColor"
        strokewidth="0"
      ></rect>
    </g>
    <g
      id="SVGRepo_tracerCarrier"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      <circle
        cx="12"
        cy="12"
        r="10"
        :stroke="color"
        stroke-width="1.656"
      ></circle>
      <path
        d="M12 17V11"
        :stroke="color"
        stroke-width="1.656"
        stroke-linecap="round"
      ></path>
      <circle
        cx="1"
        cy="1"
        r="1"
        transform="matrix(1 0 0 -1 11 9)"
        fill="#777"
      ></circle>
    </g>
  </svg>
</template>
<script setup lang="ts">
import { blue, colorWhite } from '@/styles/variables.styles'

interface Props {
  color?: string
  backgroundColor?: string
}

const { color = blue, backgroundColor = colorWhite } = defineProps<Props>()
</script>
<style lang="scss" scoped>
.this-icon {
  width: 35px;
  height: 35px;
}
</style>
