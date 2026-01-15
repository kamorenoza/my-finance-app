// src/plugins/vuetify.ts
import 'vuetify/_styles.scss'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#138ad3',
          secondary: '#7E3FF2',
          background: '#f8f9fa',
          surface: '#FFFFFF',
          onPrimary: '#FFFFFF'
        }
      }
    }
  },
  defaults: {
    global: {
      style: {
        fontFamily: 'PoppinsRegular, sans-serif'
      }
    }
  }
})

export default vuetify
