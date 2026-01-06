import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createAuth0 } from '@auth0/auth0-vue'
import App from './App.vue'
import router from './router'
import { setupGuards } from './router/guard'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const app = createApp(App)

const redirectUri =
  import.meta.env.VITE_AUTH0_REDIRECT_URI || `${window.location.origin}${import.meta.env.BASE_URL}`

app.use(createPinia())

const auth0 = createAuth0({
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: redirectUri,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE
  },
  cacheLocation: 'localstorage'
})

app.use(auth0)

app.use(router)
setupGuards(router, () => app.config.globalProperties.$auth0)

app.mount('#app')
