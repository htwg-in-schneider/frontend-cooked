<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { useAuthStore } from '@/stores/authStore'
import Button from '@/components/Button.vue'
import { loadMe } from '@/services/meService'
import { authFetch, getApiRoot } from '@/services/apiAuth'

const { user, isAuthenticated, getAccessTokenSilently, logout } = useAuth0()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const saving = ref(false)
const editMode = ref(false)

const nameInput = ref('')
const avatarInput = ref('')

const isAdmin = computed(() => authStore.role === 'ADMIN')

const displayName = computed(() => {
  return authStore.me?.name || user.value?.name || user.value?.email || 'Profil'
})

const displayEmail = computed(() => {
  return authStore.me?.email || user.value?.email || ''
})

const displayAvatar = computed(() => {
  return authStore.me?.avatarUrl || user.value?.picture || ''
})

onMounted(async () => {
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

  nameInput.value = authStore.me?.name || user.value?.name || ''
  avatarInput.value = authStore.me?.avatarUrl || user.value?.picture || ''
})

function doLogout() {
  authStore.clear()
  logout({ logoutParams: { returnTo: window.location.origin + '/frontend-cooked/' } })
}

function startEdit() {
  editMode.value = true
  nameInput.value = authStore.me?.name || user.value?.name || ''
  avatarInput.value = authStore.me?.avatarUrl || user.value?.picture || ''
}

function cancelEdit() {
  editMode.value = false
  error.value = ''
}

async function saveProfile() {
  if (!isAuthenticated.value) return
  saving.value = true
  error.value = ''

  try {
    const apiRoot = getApiRoot()

    const res = await authFetch(getAccessTokenSilently, `${apiRoot}/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: nameInput.value.trim(),
        avatarUrl: avatarInput.value.trim()
      })
    })

    if (!res.ok) {
      const msg = await res.text()
      throw new Error(msg || 'Konnte Profil nicht speichern.')
    }

    const updated = await res.json()
    authStore.setMe(updated)
    editMode.value = false
  } catch (e) {
    console.error(e)
    error.value = 'Profil konnte nicht gespeichert werden.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="container py-5">
    <div class="profile-card bg-white p-5 shadow-sm mx-auto">
      <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap profile-header">
        <div>
          <h2 class="fw-bold mb-1">Profil</h2>
          <p class="text-muted mb-0">
            Name: <strong>{{ displayName }}</strong>
          </p>
          <p class="text-muted mb-0" v-if="displayEmail">
            E-Mail: <strong>{{ displayEmail }}</strong>
          </p>
          <p class="text-muted mb-0" v-if="authStore.role">
            Rolle: <strong>{{ authStore.role }}</strong>
          </p>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary pill" type="button" @click="startEdit">
            Bearbeiten
          </button>
          <button class="btn btn-outline-secondary pill" type="button" @click="doLogout">
            Logout
          </button>
        </div>
      </div>

      <div class="avatar-wrap mt-4 mb-4">
        <div class="avatar-frame">
          <img v-if="displayAvatar" :src="displayAvatar" alt="Profilbild" class="avatar-img" />
          <div v-else class="avatar-placeholder">?</div>
        </div>
      </div>

      <div v-if="loading" class="alert alert-light border mt-4">Lade.</div>
      <div v-else-if="error" class="alert alert-danger mt-4">{{ error }}</div>

      <div v-if="editMode" class="profile-edit mt-4">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label small text-muted">Name</label>
            <input v-model="nameInput" class="form-control rounded-pill px-3" type="text" />
          </div>
          <div class="col-md-6">
            <label class="form-label small text-muted">Profilbild URL</label>
            <input v-model="avatarInput" class="form-control rounded-pill px-3" type="text" />
          </div>
        </div>

        <div class="d-flex gap-2 mt-3">
          <Button variant="secondary" type="button" @click="cancelEdit">Abbrechen</Button>
          <Button variant="accent" type="button" :disabled="saving" @click="saveProfile">
            {{ saving ? 'Speichert.' : 'Speichern' }}
          </Button>
        </div>
      </div>

      <hr class="my-4" />

      <div class="d-flex flex-column flex-md-row gap-2">
        <router-link to="/create" class="text-decoration-none">
          <Button variant="accent" class="px-4 py-3 fw-bold fs-5">
            + Neues Rezept erstellen
          </Button>
        </router-link>
        <router-link to="/favorites" class="text-decoration-none">
          <Button variant="secondary" class="px-4 py-3 fw-bold fs-5">
            Favoriten
          </Button>
        </router-link>
        <router-link to="/my-recipes" class="text-decoration-none">
          <Button variant="secondary" class="px-4 py-3 fw-bold fs-5">
            Meine Rezepte
          </Button>
        </router-link>
      </div>

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
.profile-card {
  max-width: 900px;
  border-radius: 40px;
  position: relative;
  padding-top: 90px;
}
.pill { border-radius: 999px; }

.profile-header {
  position: relative;
  z-index: 2;
}

.avatar-wrap {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  width: 100%;
  pointer-events: none;
  z-index: 1;
}

.avatar-frame {
  width: 140px;
  height: 140px;
  border-radius: 999px;
  overflow: hidden;
  border: 3px solid rgba(107, 106, 25, 0.2);
  background: #f6f6ef;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-weight: 700;
  color: #8b8b5a;
  font-size: 1.6rem;
}
</style>
