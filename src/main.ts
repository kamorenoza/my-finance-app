// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { vuetify } from './plugins/vuetify'

import './styles/main.scss'
import { createPinia } from 'pinia'
import router from './router'
import { vNumericOnly } from './modules/shared/directives/v-numeric-only'
import vCurrencyFormat from './modules/shared/directives/v-currency'
import vCurrencyFormatter from './modules/shared/directives/v-currency-formatter'
import vDateFormatter from './modules/shared/directives/v-date-formatter'

// Cargar iconos de Material Design de forma asíncrona
const loadMDIFont = () => {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href =
    'https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css'
  document.head.appendChild(link)
}

// Cargar iconos después de que Vue se monte
setTimeout(loadMDIFont, 0)

const app = createApp(App)

app.directive('numeric-only', vNumericOnly)
app.directive('currency', vCurrencyFormat)
app.directive('currency-formatter', vCurrencyFormatter)
app.directive('date-formatter', vDateFormatter)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')

export const vueApp = app
