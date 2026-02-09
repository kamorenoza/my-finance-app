<template>
  <svg
    viewBox="0 -0.55 46.439 46.439"
    xmlns="http://www.w3.org/2000/svg"
    fill="#000000"
    class="icon"
  >
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      <g transform="translate(-824.507 -32.514)">
        <path
          d="M849.477,73.36h-3V34.831a1.644,1.644,0,0,1,1.6-1.817h-.209a1.65,1.65,0,0,1,1.609,1.817Z"
          fill="none"
          :stroke="color"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
        ></path>
        <line
          x2="12"
          transform="translate(833.477 40.36)"
          stroke-width="1.5"
          :stroke="color"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"
        ></line>
        <line
          x2="11"
          transform="translate(850.477 40.36)"
          stroke-width="1.5"
          :stroke="color"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"
        ></line>
        <path
          d="M834,73.36h27.727c.346,0,.753.781.753,1.161V76.4c0,.38-.407.96-.753.96H834c-.347,0-.52-.58-.52-.96V74.521C833.477,74.141,833.65,73.36,834,73.36Z"
          fill="none"
          :stroke="color"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
        ></path>
        <path
          d="M825.164,59.36l8.188-19,6.438,19"
          fill="none"
          :stroke="color"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
        ></path>
        <path
          d="M832.477,66.3a7.024,7.024,0,0,0,7.312-6.936H825.164A7.025,7.025,0,0,0,832.477,66.3Z"
          fill="none"
          :stroke="color"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
        ></path>
        <path
          d="M870.289,59.36l-8.187-19-6.437,19"
          fill="none"
          :stroke="color"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
        ></path>
        <path
          d="M862.977,66.3a7.025,7.025,0,0,1-7.313-6.936h14.625A7.024,7.024,0,0,1,862.977,66.3Z"
          fill="none"
          :stroke="color"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
        ></path>
      </g>
    </g>
  </svg>
</template>
<script setup lang="ts">
import { blue } from '@/styles/variables.styles'

interface Props {
  color?: string
}

const { color = blue } = defineProps<Props>()
</script>
