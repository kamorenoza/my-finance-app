<template>
  <div class="general-income-item">
    <div class="general-income-item__info">
      <span class="general-income-item__name">{{ income.name }}</span>
      <div class="general-income-item__date-row">
        <span class="general-income-item__date">{{
          dateFormatter(income.date)
        }}</span>
        <span v-if="recurrenceLabel" class="general-income-item__tag">{{
          recurrenceLabel
        }}</span>
      </div>
    </div>
    <div class="general-income-item__right">
      <span class="general-income-item__value">{{
        currencyFormatter(income.value)
      }}</span>
      <button class="general-income-item__btn" @click="handleEdit">
        <edit-icon class="general-income-item__edit-icon" :color="colorGrey" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import type { GeneralIncome } from '../budget.interface'
import { currencyFormatter, dateFormatter } from '@/modules/shared/utils'
import EditIcon from '@/assets/icons/Edit.icon.vue'
import { colorGrey } from '@/styles/variables.styles'

const props = defineProps<{
  income: GeneralIncome
}>()

const emit = defineEmits<{
  edit: [income: GeneralIncome]
}>()

const handleEdit = () => {
  emit('edit', props.income)
}

const recurrenceLabel = computed(() => {
  if (props.income.isFixed) return 'Fijo'
  if (props.income.repeat && props.income.repeat > 1) {
    const lastMonth = dayjs(props.income.date)
      .add(props.income.repeat - 1, 'month')
      .locale('es')
      .format('MMMM YYYY')
    return `Hasta ${lastMonth.charAt(0).toUpperCase()}${lastMonth.slice(1)}`
  }
  return ''
})
</script>

<style scoped lang="scss">
.general-income-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 52px;
  padding: 0 14px;
  background: $green-md;
  border-radius: 12px;
  margin-bottom: 8px;

  &__info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
    min-width: 0;
  }

  &__name {
    font-family: $font-medium;
    font-size: 14px;
    color: $text-dark;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__date-row {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  &__date {
    font-family: $font;
    font-size: 11px;
    color: $text-gray-md;
    white-space: nowrap;
    flex-shrink: 0;
  }

  &__tag {
    font-family: $font-medium;
    font-size: 0.6rem;
    line-height: 1;
    padding: 3px 7px;
    border-radius: 8px;
    background-color: $color-green;
    color: $white;
    white-space: nowrap;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  &__value {
    font-family: $font-medium;
    font-size: 13px;
    color: $color-green;
    white-space: nowrap;
  }

  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    margin-top: -5px;
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:active {
      transform: scale(0.95);
    }
  }

  &__edit-icon {
    width: 18px;
    height: 18px;
  }
}
</style>