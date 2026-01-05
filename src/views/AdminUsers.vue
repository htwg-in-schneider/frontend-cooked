<script setup>
import { ref, onMounted } from 'vue'

const users = ref([])
const loading = ref(false)
const error = ref('')
const search = ref('')

// Edit-State
const editingId = ref(null)
const editForm = ref({ name: '', email: '', role: '' })
const saveLoading = ref(false)
const saveError = ref('')

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

function startEdit(u) {
  saveError.value = ''
  editingId.value = u.id
  editForm.value = {
    name: u.name ?? '',
    email: u.email ?? '',
    role: u.role ?? 'USER'
  }
}

function cancelEdit() {
  editingId.value = null
  editForm.value = { name: '', email: '', role: '' }
  saveError.value = ''
}

function validateForm() {
  const name = editForm.value.name.trim()
  const email = editForm.value.email.trim()
  const role = editForm.value.role.trim()

  if (!name) return 'Name darf nicht leer sein'
  if (!email) return 'E-Mail darf nicht leer sein'
  if (!email.includes('@')) return 'E-Mail muss gültig sein'
  if (!role) return 'Rolle darf nicht leer sein'
  return ''
}

async function saveUser(id) {
  const msg = validateForm()
  if (msg) {
    saveError.value = msg
    return
  }

  saveLoading.value = true
  saveError.value = ''

  try {
    const productBase = import.meta.env.VITE_API_URL
    const apiRoot = productBase.replace(/\/(product|products|recipes)$/, '')

    const res = await fetch(`${apiRoot}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editForm.value.name.trim(),
        email: editForm.value.email.trim(),
        role: editForm.value.role.trim()
      })
    })

    if (!res.ok) {
      // Backend schickt ResponseStatusException Texte -> wir zeigen sie an
      const txt = await res.text()
      throw new Error(txt || 'Speichern fehlgeschlagen')
    }

    const updated = await res.json()

    // Liste lokal updaten (ohne neu laden)
    users.value = users.value.map(u => (u.id === id ? updated : u))

    cancelEdit()
  } catch (e) {
    console.error(e)
    saveError.value = (e?.message || 'Speichern fehlgeschlagen')
  } finally {
    saveLoading.value = false
  }
}

onMounted(loadUsers)
</script>

<template>
  <div class="container py-5">
    <div class="bg-white shadow-sm p-4 p-md-5 mx-auto admin-card">
      <h1 class="fw-bold mb-3">Admin – Nutzerverwaltung</h1>
      <p class="text-muted mb-4">Übersicht aller Nutzer (Stammdaten).</p>

      <!-- Suche -->
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

      <!-- Status -->
      <div v-if="loading">Lade Nutzer …</div>

      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div v-else-if="users.length === 0" class="alert alert-light border">
        Keine Nutzer gefunden.
      </div>

      <!-- Liste -->
      <ul v-else class="list-group">
        <li
          v-for="u in users"
          :key="u.id"
          class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2"
        >
          <!-- Anzeige -->
          <div v-if="editingId !== u.id" class="flex-grow-1">
            <div class="fw-bold">{{ u.name }}</div>
            <div class="text-muted small">{{ u.email }}</div>
          </div>

          <!-- Edit -->
          <div v-else class="flex-grow-1 w-100">
            <div class="row g-2">
              <div class="col-12 col-md-4">
                <input v-model="editForm.name" class="form-control" type="text" placeholder="Name" />
              </div>
              <div class="col-12 col-md-5">
                <input v-model="editForm.email" class="form-control" type="email" placeholder="E-Mail" />
              </div>
              <div class="col-12 col-md-3">
                <select v-model="editForm.role" class="form-select">
                  <option value="ADMIN">ADMIN</option>
                  <option value="USER">USER</option>
                </select>
              </div>
            </div>

            <div v-if="saveError" class="text-danger small mt-2">
              {{ saveError }}
            </div>
          </div>

          <!-- Rechts: Rolle/Buttons -->
          <div class="d-flex align-items-center gap-2">
            <span
              v-if="editingId !== u.id"
              class="role-badge"
              :class="u.role === 'ADMIN' ? 'role-admin' : 'role-user'"
            >
              {{ u.role }}
            </span>

            <button
              v-if="editingId !== u.id"
              class="btn btn-sm btn-outline-secondary"
              type="button"
              @click="startEdit(u)"
            >
              Bearbeiten
            </button>

            <template v-else>
              <button
                class="btn btn-sm btn-outline-secondary"
                type="button"
                @click="cancelEdit"
                :disabled="saveLoading"
              >
                Abbrechen
              </button>
              <button
                class="btn btn-sm btn-success cooked-save"
                type="button"
                @click="saveUser(u.id)"
                :disabled="saveLoading"
              >
                Speichern
              </button>
            </template>
          </div>
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

/* Speichern-Button softer als Bootstrap-grün */
.cooked-save {
  background-color: #6b6a19 !important;
  border-color: #6b6a19 !important;
}
.cooked-save:hover {
  background-color: #7a7922 !important;
  border-color: #7a7922 !important;
}
.cooked-save:focus,
.cooked-save:active,
.cooked-save:focus-visible {
  box-shadow: none !important;
}
</style>
