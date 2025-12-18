<script setup>
import { ref, onMounted } from 'vue'

const users = ref([])
const loading = ref(false)
const error = ref('')

async function loadUsers() {
  loading.value = true
  error.value = ''

  try {
    const productBase = import.meta.env.VITE_API_URL
    const apiRoot = productBase.replace(/\/(product|products|recipes)$/, '')

    const res = await fetch(`${apiRoot}/users`)
    if (!res.ok) throw new Error(await res.text())

    users.value = await res.json()
  } catch (e) {
    error.value = 'Konnte Nutzer nicht laden.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(loadUsers)
</script>

<template>
  <div class="container py-5">
    <div class="bg-white shadow-sm p-4 p-md-5 mx-auto admin-card">
      <h1 class="fw-bold mb-3">Admin – Nutzerverwaltung</h1>
      <p class="text-muted mb-4">
        Übersicht aller Nutzer (Stammdaten).
      </p>

      <div v-if="loading">Lade Nutzer …</div>

      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
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

          <!-- NUR HIER Änderung -->
          <span
            class="role-badge"
            :class="u.role === 'ADMIN' ? 'role-admin' : 'role-user'"
          >
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

/* Liste bleibt neutral */
.list-group-item {
  border-color: #e5e5e5;
}

/* Basis für beide Badges */
.role-badge {
  font-size: 0.75rem;
  padding: 6px 14px;
  border-radius: 999px;
  font-weight: 600;
}

/* 👇 ADMIN: NICHT mehr knallig grün */
.role-admin {
  background-color: #eef1e2;   /* sehr helles Olive */
  color: #4a4a1a;
  border: 1px solid #cfd4a6;
}

/* USER: neutral grau wie vorher */
.role-user {
  background-color: #f1f1f1;
  color: #555;
  border: 1px solid #ddd;
}
</style>
