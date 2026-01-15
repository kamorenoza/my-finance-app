<template>
  <svg
    class="this-icon"
    width="201px"
    height="201px"
    viewBox="0 0 24 24"
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
      <g id="Menu / Close_MD">
        <path
          id="Vector"
          d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18"
          :stroke="color"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </g>
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

<style lang="scss" scoped>
.this-icon {
  width: 22px;
  height: 25px;
}
</style>
