<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { useAuthStore } from '@/stores/authStore'
import Button from '@/components/Button.vue'
import { loadMe } from '@/services/meService'

const { user, isAuthenticated, getAccessTokenSilently, logout } = useAuth0()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')

const isAdmin = computed(() => authStore.role === 'ADMIN')

onMounted(async () => {
  // router-guard lädt me normalerweise schon
  // aber falls user direkt reload auf /profile macht, laden wir hier zur Sicherheit nochmal
  if (isAuthenticated.value && !authStore.role) {
    try {
      loading.value = true
      authStore.setMe(await loadMe(getAccessTokenSilently))
    } catch (e) {
      console.error(e)
      error.value = 'Profil konnte nicht geladen werden.'
    } finally {
      loading.value = false
    }
  }
})

function doLogout() {
  authStore.clear()
  logout({ logoutParams: { returnTo: window.location.origin + '/frontend-cooked/' } })
}
</script>

<template>
  <div class="container py-5">
    <div class="profile-card bg-white p-5 shadow-sm mx-auto">
      <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">
        <div>
          <h2 class="fw-bold mb-1">Profil</h2>
          <p class="text-muted mb-0" v-if="user">
            Eingeloggt als: <strong>{{ user.email || user.name }}</strong>
          </p>
          <p class="text-muted mb-0" v-if="authStore.role">
            Rolle: <strong>{{ authStore.role }}</strong>
          </p>
        </div>

        <button class="btn btn-outline-secondary pill" type="button" @click="doLogout">
          Logout
        </button>
      </div>

      <div v-if="loading" class="alert alert-light border mt-4">Lade…</div>
      <div v-else-if="error" class="alert alert-danger mt-4">{{ error }}</div>

      <hr class="my-4" />

      <router-link to="/create" class="text-decoration-none">
        <Button variant="accent" class="px-4 py-3 fw-bold fs-5">
          + Neues Rezept erstellen
        </Button>
      </router-link>

      <!-- Admin Dashboard -->
      <div v-if="isAdmin" class="mt-4">
        <h3 class="fw-bold mb-3">Admin Dashboard</h3>

        <div class="d-flex flex-column flex-md-row gap-2">
          <router-link class="btn btn-outline-secondary pill" to="/admin/transactions">
            Aktivitätsprotokoll
          </router-link>
          <router-link class="btn btn-outline-secondary pill" to="/admin/users">
            Nutzerverwaltung
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-card { max-width: 800px; border-radius: 40px; }
.pill { border-radius: 999px; }
</style>
