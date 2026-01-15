<template>
  <svg
    viewBox="-2.4 -2.4 28.80 28.80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g
      id="SVGRepo_bgCarrier"
      stroke-width="0"
      transform="translate(3.959999999999999,3.959999999999999), scale(0.67)"
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
        stroke-width="1.2"
      ></circle>
      <path
        d="M8.5 12.5L10.5 14.5L15.5 9.5"
        :stroke="color"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>
    </g>
  </svg>
</template>
<script setup lang="ts">
import { colorWhite, green } from '@/styles/variables.styles'

interface Props {
  color?: string
  backgroundColor?: string
}

const { color = green, backgroundColor = colorWhite } = defineProps<Props>()
</script>
<style lang="scss" scoped>
.this-icon {
  width: 35px;
  height: 35px;
}
</style>
