<template>
  <div class="budget-toggle">
    <div
      class="budget-toggle__indicator"
      :class="{ right: modelValue === 'real' }"
    />

    <button
      class="budget-toggle__option"
      :class="{ active: modelValue === 'budget' }"
      @click="select('budget')"
    >
      Presupuestado
    </button>

    <button
      class="budget-toggle__option"
      :class="{ active: modelValue === 'real' }"
      @click="select('real')"
    >
      Real
    </button>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  modelValue: {
    type: String,
    default: 'budget'
  }
})

const emit = defineEmits(['update:modelValue'])

const select = (value: any) => {
  emit('update:modelValue', value)
}
</script>
<style lang="scss" scoped>
.budget-toggle {
  position: relative;
  display: flex;
  background: #ede9f4;
  border-radius: 999px;
  padding: 4px;
  width: 245px;
  height: 35px;
}

.budget-toggle__option {
  position: relative;
  z-index: 1;
  border: none;
  background: none;
  padding: 3px 14px 4px;
  font-size: 14px;
  font-weight: 500;
  color: #7a728f;
  cursor: pointer;

  &:first-of-type {
    width: 155px;
  }

  &:last-of-type {
    width: 90px;
  }
}

.budget-toggle__option.active {
  color: #4a3f66;
}

.budget-toggle__indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 152px;
  height: 27px;
  background: white;
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.budget-toggle__indicator.right {
  transform: translateX(162%);
  width: 90px;
}
</style>
