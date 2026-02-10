<template>
  <div class="account-expense">
    <div>
      <div
        v-bind="props"
        icon
        class="account-expense__category"
        :style="{
          backgroundColor: expense?.category?.backgroundColor || '#9e9e9e'
        }"
      >
        <component
          :is="getIconComponent(expense.category?.icon || '')"
          :color="colorWhite"
        />
      </div>
    </div>
    <div class="account-expense__content">
      <div class="account-expense__details">
        <p class="account-expense__desc">{{ expense.description }}</p>
        <p v-date-formatter="expense.date" class="account-expense__date"></p>
        <p class="account-expense__comments">{{ expense.comments }}</p>
      </div>
      <div class="account-expense__info">
        <p
          v-currency-formatter="expense.value"
          class="account-expense__value"
          :class="expense.type === 'ingreso' ? 'positive' : 'negative'"
        ></p>
        <div class="account-expense__actions">
          <v-btn
            icon
            variant="plain"
            v-bind="props"
            :ripple="false"
            class="btn-label account-expense__edit"
            @click="editExpense"
          >
            <slot>
              <v-icon size="24">mdi-chevron-right</v-icon>
            </slot>
          </v-btn>
        </div>
      </div>
    </div>
  </div>
  <AddAccountExpenseMore
    :accountId="accountId"
    :edit-view="true"
    @closeEditExpense="onCloseEdit"
    :drawerOpen="drawer"
    v-if="!isMobile"
  />
</template>

<script setup lang="ts">
import { colorWhite } from '@/styles/variables.styles'
import type { Expense } from '../accounts.interface'
import { useAccountsStore } from '../accounts.store'
import AddAccountExpenseMore from './AddAccountExpenseMore.vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getIcon } from '@/modules/categories/categories.constants'

interface Props {
  expense: Expense
  accountId: string
}
const props = defineProps<Props>()

const accountStore = useAccountsStore()

const drawer = ref(false)
const screenWidth = ref(window.innerWidth)

onMounted(() => {
  window.addEventListener('resize', updateSize)
})

onUnmounted(() => {
  window.addEventListener('resize', updateSize)
})

const isMobile = computed(() => {
  return screenWidth.value < 960
})

const updateSize = () => {
  screenWidth.value = window.innerWidth
}

const editExpense = () => {
  drawer.value = true
  accountStore.setSelectedExpense(props.expense)
}

const getIconComponent = (icon: string) => {
  return getIcon(icon)
}

const onCloseEdit = () => {
  drawer.value = false
}
</script>

<style scoped lang="scss">
.account-expense {
  margin-bottom: 10px;
  display: flex;
  gap: 8px;
  width: 100%;
  padding: 10px;
  align-items: center;
  border-radius: 20px;
  background-color: $bg-item;

  &__category {
    border-radius: 10px !important;
    width: 30px !important;
    height: 30px !important;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    .icon {
      width: 22px !important;
      height: 22px !important;
    }
  }

  &__content {
    display: flex;
    justify-content: space-between;
    flex-grow: 1;
    padding-right: 20px;
    position: relative;
    align-items: center;
  }

  &__info {
    p {
      text-align: right;
    }
  }

  &__desc {
    line-height: 1rem;
    font-size: 0.9rem;
    color: $text-gray;
  }

  &__value {
    font-family: $font-medium;
    line-height: 1rem;
    font-size: 0.9rem;

    &.positive {
      color: $color-green;
    }

    &.negative {
      color: $color-red;
    }
  }

  &__date {
    font-size: 0.6rem;
    color: $text-gray-md;
  }

  &__comments {
    font-size: 0.7rem;
    color: $text-gray-md;
  }

  &__actions {
    position: absolute;
    top: 48%;
    right: -15px;
    transform: translateY(-50%);
  }
}
</style>
