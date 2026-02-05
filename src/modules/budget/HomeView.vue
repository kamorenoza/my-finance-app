<template>
  <div class="home">
    <div class="general-header">
      <p class="general-title">Mi presupuesto</p>
    </div>

    <div class="home__header">
      <div class="home__selector">
        <MonthYearSelector v-model="currentDate" />
      </div>

      <BudgetSummary />
    </div>

    <div class="home__content"></div>
    <AddBudget />
  </div>

  <CategoryManager />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import MonthYearSelector from '@/modules/shared/components/MonthYearSelector.vue'
import CategoryManager from '@/modules/categories/CategoryManager.vue'
import BudgetSummary from '@/modules/budget/components/BudgetSummary.vue'
import AddBudget from '@/modules/budget/components/AddBudget.vue'

const currentDate = ref(new Date())

onMounted(() => {
  /*onAuthStateChanged(auth, user => {
    if (!user) {
      router.push({ name: 'login' })
    } else {
      if (!userLocal) {
        localStorage.setItem('user', JSON.stringify(user))
      }
    }
  })*/
})
</script>

<style scoped lang="scss">
.home {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;

  @media (min-width: 960px) {
    padding-left: 20px;
  }
  &__header {
    @media (min-width: 960px) {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }

  &__selector {
    display: flex;
    align-items: center;
    gap: 15px;
    justify-content: center;
  }

  &__content {
    height: calc(100dvh - 300px);
    padding: 12px;
    padding-bottom: 280px;
  }
}
</style>
