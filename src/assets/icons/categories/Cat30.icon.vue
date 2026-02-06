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
      <circle cx="12" cy="12" r="10" :stroke="color" stroke-width="1"></circle>
      <path
        d="M12 6V18"
        :stroke="color"
        stroke-width="1"
        stroke-linecap="round"
      ></path>
      <path
        d="M15 9.5C15 8.11929 13.6569 7 12 7C10.3431 7 9 8.11929 9 9.5C9 10.8807 10.3431 12 12 12C13.6569 12 15 13.1193 15 14.5C15 15.8807 13.6569 17 12 17C10.3431 17 9 15.8807 9 14.5"
        :stroke="color"
        stroke-width="1"
        stroke-linecap="round"
      ></path>
    </g>
  </svg>
</template>
<script setup lang="ts">
import { textGraymd } from '@/styles/variables.styles'

interface Props {
  color?: string
}

const { color = textGraymd } = defineProps<Props>()
</script>
