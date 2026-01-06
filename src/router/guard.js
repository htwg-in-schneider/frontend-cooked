import { useAuth0 } from '@auth0/auth0-vue'
import { useAuthStore } from '@/stores/authStore'
import { loadMe } from '@/services/meService'

export function setupGuards(router) {
  router.beforeEach(async (to) => {
    const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()
    const authStore = useAuthStore()

    // 1) Wenn Route Auth benötigt -> Login erzwingen
    if (to.meta?.requiresAuth && !isAuthenticated.value) {
      await loginWithRedirect({
        appState: { targetUrl: to.fullPath }
      })
      return false
    }

    // 2) Wenn eingeloggt, aber wir kennen "me/role" noch nicht -> vom Backend holen
    if (isAuthenticated.value && !authStore.role) {
      try {
        const me = await loadMe(getAccessTokenSilently)
        authStore.setMe(me)
      } catch (e) {
        console.error(e)
        // falls token/Backend kaputt: rauswerfen
        authStore.clear()
      }
    }

    // 3) Admin-Route -> Rolle prüfen
    if (to.meta?.requiresAdmin) {
      if (authStore.role !== 'ADMIN') {
        return { path: '/profile' }
      }
    }

    return true
  })
}
