<template>
  <svg
    viewBox="0 0 24 24"
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
      <circle
        cx="11.5"
        cy="11.5"
        r="9.5"
        :stroke="color"
        stroke-width="1.08"
      ></circle>
      <path
        d="M18.5 18.5L22 22"
        :stroke="color"
        stroke-width="1.08"
        stroke-linecap="round"
      ></path>
    </g>
  </svg>
</template>
<script setup lang="ts">
import { colorGrey } from '@/styles/variables.styles'

interface Props {
  color?: string
}

const { color = colorGrey } = defineProps<Props>()
</script>
