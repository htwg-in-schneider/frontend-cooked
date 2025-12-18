<script setup>
import { ref, onMounted } from 'vue'

const users = ref([])
const loading = ref(false)
const error = ref('')
const search = ref('')

async function loadUsers() {
  loading.value = true
  error.value = ''

  try {
    const productBase = import.meta.env.VITE_API_URL
    const apiRoot = productBase.replace(/\/(product|products|recipes)$/, '')

    const q = search.value.trim()
    const url = q
      ? `${apiRoot}/users?search=${encodeURIComponent(q)}`
      : `${apiRoot}/users`

    const res = await fetch(url)
    if (!res.ok) throw new Error(await res.text())

    users.value = await res.json()
  } catch (e) {
    error.value = 'Konnte Nutzer nicht laden.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

function clearSearch() {
  search.value = ''
  loadUsers()
}

onMounted(loadUsers)
</script>

<template>
  <div class="container py-5">
    <div class="bg-white shadow-sm p-4 p-md-5 mx-auto admin-card">
      <h1 class="fw-bold mb-3">Admin – Nutzerverwaltung</h1>
      <p class="text-muted mb-4">Übersicht aller Nutzer (Stammdaten).</p>

      <div class="row g-2 align-items-center mb-4">
        <div class="col-12 col-md">
          <input
            v-model="search"
            class="form-control"
            type="text"
            placeholder="Suchen (Name oder E-Mail)…"
            @input="loadUsers"
          />
        </div>

        <div class="col-12 col-md-auto d-flex gap-2">
          <button class="btn btn-outline-secondary" type="button" @click="loadUsers">
            Suchen
          </button>
          <button
            class="btn btn-outline-secondary"
            type="button"
            @click="clearSearch"
            :disabled="!search.trim()"
          >
            Zurücksetzen
          </button>
        </div>
      </div>

      <div v-if="loading">Lade Nutzer …</div>

      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div v-else-if="users.length === 0" class="alert alert-light border">
        Keine Nutzer gefunden.
      </div>

      <ul v-else class="list-group">
        <li
          v-for="u in users"
          :key="u.id"
          class="list-group-item d-flex justify-content-between align-items-center"
        >
          <div>
            <div class="fw-bold">{{ u.name }}</div>
            <div class="text-muted small">{{ u.email }}</div>
          </div>

          <span class="role-badge" :class="u.role === 'ADMIN' ? 'role-admin' : 'role-user'">
            {{ u.role }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.admin-card {
  max-width: 1000px;
  border-radius: 30px;
}

.role-badge {
  font-size: 0.75rem;
  padding: 6px 14px;
  border-radius: 999px;
  font-weight: 600;
}

.role-admin {
  background-color: #eef1e2;
  color: #4a4a1a;
  border: 1px solid #cfd4a6;
}

.role-user {
  background-color: #f1f1f1;
  color: #555;
  border: 1px solid #ddd;
}
</style>
