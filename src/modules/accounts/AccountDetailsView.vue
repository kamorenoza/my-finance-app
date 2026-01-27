<template>
  <div class="account-preview__content">
    <div class="pr15">
      <NormalCard :account="account" :from-preview="true" />
    </div>

    <div class="account-preview__header pr15">
      <AccountDetailsFilter @filterChange="onFilterChange" />
    </div>
    <AccountDetailsExpensesNormal
      :account-id="accountId"
      :filters="currentFilter"
    />

    <AddAccountExpense class="fixed-bottom" :accountId="accountId" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAccountsStore } from '@/modules/accounts/accounts.store'
import AddAccountExpense from './components/AddAccountExpense.vue'
import NormalCard from './components/NormalCard.vue'
import AccountDetailsFilter from './components/AccountDetailsFilter.vue'
import AccountDetailsExpensesNormal from './components/AccountDetailsExpensesNormal.vue'

const route = useRoute()
const store = useAccountsStore()
const accountId = route.params.id as string
const account = computed(() => store.getAccountById(accountId)!)

const currentFilter = ref({
  search: '',
  groupBy: 'category' as string | null,
  orderBy: null as string | null
})

const onFilterChange = (filter: {
  search: string
  groupBy: string | null
  orderBy: string | null
}) => {
  currentFilter.value = filter
}
</script>

<style scoped lang="scss">
.account-preview {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 0 10px;

    .subtitle {
      font-size: 0.9rem !important;
    }

    .more {
      font-size: 14px;
      font-family: $font-medium;
      color: $purple;
      padding-right: 15px;
    }
  }

  &__content {
    position: relative;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    padding-left: 15px;
    margin-top: 20px;
    height: calc(100dvh - 100px);
    padding-bottom: 90px;
  }

  &__expenses {
    overflow-y: auto;
    flex-grow: 1;
    height: calc(100dvh - 516px);
    padding-right: 15px;

    .expense-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid $border-general;
      padding-right: 10px;

      &__value {
        font-family: $font-medium;
      }

      &__description {
        color: $gray-text;
      }
    }
  }

  &__completed {
    margin-bottom: 10px;
    margin-top: 40px;

    &.not-pending {
      margin-top: 0;
    }

    span {
      font-size: 0.8rem;
      color: $text-light-gray;
    }

    i {
      font-size: 1.2rem;
      color: $text-light-gray;
    }
  }

  &__group {
    font-weight: 600;
    font-size: 0.9rem;
    margin: 20px 0 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    user-select: none;

    &:first-of-type {
      margin-top: 0;
    }

    .group-header-content {
      display: flex;
      align-items: center;
    }

    .group-chevron {
      font-size: 18px;
      transition: transform 0.2s ease;
    }

    .group-total {
      font-size: 0.85rem;
      font-weight: 700;
    }
  }
}

.pr15 {
  padding-right: 15px;
}
</style>
