import { useAuthStore } from '@/stores/authStore'
import { loadMe } from '@/services/meService'

export function setupGuards(router, getAuth0) {
  router.beforeEach(async (to) => {
    const auth0 = getAuth0?.()
    if (!auth0) {
      return true
    }

    const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = auth0
    const authStore = useAuthStore()

    // 1) Wenn Route Auth benötigt -> Login erzwingen
    if (to.meta?.requiresAuth && !isAuthenticated.value) {
      await loginWithRedirect({
        appState: { targetUrl: to.fullPath }
      })
      return false
    }

    // 2) Wenn eingeloggt, aber "me/role" noch nicht bekannt ist -> vom Backend holen
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
