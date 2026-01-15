// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { vuetify } from './plugins/vuetify'
import '@mdi/font/css/materialdesignicons.css'

import './styles/main.scss'
import { createPinia } from 'pinia'
import router from './router'
import { vNumericOnly } from './modules/shared/directives/v-numeric-only'
import vCurrencyFormat from './modules/shared/directives/v-currency'
import vCurrencyFormatter from './modules/shared/directives/v-currency-formatter'

const app = createApp(App)

app.directive('numeric-only', vNumericOnly)
app.directive('currency', vCurrencyFormat)
app.directive('currency-formatter', vCurrencyFormatter)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')

export const vueApp = app
