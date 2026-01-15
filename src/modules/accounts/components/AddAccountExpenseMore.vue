<template>
  <v-menu v-model="menu" location="top end" :close-on-content-click="false">
    <template #activator="{ props }">
      <v-btn
        icon
        variant="plain"
        v-bind="props"
        :ripple="false"
        class="btn-label add-budget__button"
      >
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>

    <v-card width="280" class="pa-3 d-flex flex-column gap-2">
      <v-switch
        v-model="localEntry.isPending"
        label="Pendiente"
        inset
        density="compact"
        hide-details
        :color="localEntry.isPending ? 'success' : undefined"
        class="ma-0 pa-0 mb-3 subtitle"
        @change="updateEntry"
      />

      <v-text-field
        ref="commentsInput"
        v-model="localEntry.comments"
        type="text"
        label="Comentarios"
        hide-details
        @focus="scrollIntoView(commentsInput)"
        @keyup="updateEntry"
        class="general-input"
      >
      </v-text-field>

      <DateSelector @on-change="onChangeDate" v-model="localEntry.date" />

      <v-btn
        type="button"
        class="btn-primary mt-5"
        @click="saveAccount"
        :disabled="!entryData.description || !entryData.value"
      >
        Guardar
      </v-btn>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import type { EntryType } from '@/modules/budget/budget.interface'
import DateSelector from '@/modules/shared/components/DateSelector.vue'
import { ref } from 'vue'

const props = defineProps({
  entryData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['updateData', 'save'])
const commentsInput = ref()

const menu = ref(false)

const localEntry: any = ref({
  isPending: props.entryData.isPending,
  comments: props.entryData.comments,
  date: new Date()
})

const updateEntry = () => {
  emit('updateData', {
    ...props.entryData,
    isPending: localEntry.value.isPending,
    comments: localEntry.value.comments,
    date: localEntry.value.date
  })
}

const onChangeDate = () => {
  updateEntry()
}

const scrollIntoView = (refEl: any) => {
  setTimeout(() => {
    refEl?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 100)
}

const saveAccount = () => {
  menu.value = false
  localEntry.value = {
    description: '',
    value: 0,
    type: 'gasto' as EntryType,
    isPending: false,
    comments: '',
    date: new Date()
  }
  emit('save', localEntry.value)
}
</script>

<style scoped lang="scss">
.add-budget__button {
  width: 20px;
  padding-left: 8px;

  @media (min-width: 960px) {
    width: 40px;
  }
}
</style>
