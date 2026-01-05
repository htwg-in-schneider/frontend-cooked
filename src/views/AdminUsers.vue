<script setup>
import { ref, onMounted, watch } from 'vue'

const users = ref([])
const loading = ref(false)
const error = ref('')
const search = ref('')

// Edit-State
const editingId = ref(null)
const editForm = ref({ name: '', email: '', role: 'USER' })
const saveLoading = ref(false)
const saveError = ref('')

// ---- API Root (aus VITE_API_URL ableiten) ----
function getApiRoot() {
  // VITE_API_URL = http://localhost:8081/api/recipes
  const base = import.meta.env.VITE_API_URL || ''
  // -> http://localhost:8081/api
  return base.replace(/\/(product|products|recipe|recipes)$/i, '')
}

// ---- Debounce: Suche nicht bei jedem Buchstaben sofort ----
let searchTimer = null
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadUsers(), 300)
})

async function loadUsers() {
  loading.value = true
  error.value = ''

  try {
    const apiRoot = getApiRoot()
    const q = search.value.trim()

    const url = q
      ? `${apiRoot}/users?search=${encodeURIComponent(q)}`
      : `${apiRoot}/users`

    const res = await fetch(url)
    if (!res.ok) throw new Error(await res.text())

    users.value = await res.json()
  } catch (e) {
    console.error(e)
    error.value = 'Konnte Nutzer nicht laden.'
    users.value = []
  } finally {
    loading.value = false
  }
}

function clearSearch() {
  search.value = ''
  // loadUsers wird durch watch(search) eh nochmal getriggert
}

function startEdit(u) {
  saveError.value = ''
  editingId.value = u.id
  editForm.value = {
    name: (u.name ?? '').toString(),
    email: (u.email ?? '').toString(),
    role: (u.role ?? 'USER').toString()
  }
}

function cancelEdit() {
  editingId.value = null
  editForm.value = { name: '', email: '', role: 'USER' }
  saveError.value = ''
}

function validateForm() {
  const name = editForm.value.name.trim()
  const email = editForm.value.email.trim()
  const role = editForm.value.role.trim()

  if (!name) return 'Name darf nicht leer sein'
  if (name.length < 2) return 'Name ist zu kurz (mind. 2 Zeichen)'
  if (!email) return 'E-Mail darf nicht leer sein'
  // simple, aber ok:
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'E-Mail muss gültig sein'
  if (!role) return 'Rolle darf nicht leer sein'
  if (role !== 'ADMIN' && role !== 'USER') return 'Rolle muss ADMIN oder USER sein'
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
    const apiRoot = getApiRoot()

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
      const txt = await res.text()
      throw new Error(txt || 'Speichern fehlgeschlagen')
    }

    const updated = await res.json()
    users.value = users.value.map(u => (u.id === id ? updated : u))
    cancelEdit()
  } catch (e) {
    console.error(e)
    saveError.value = e?.message || 'Speichern fehlgeschlagen'
  } finally {
    saveLoading.value = false
  }
}

onMounted(loadUsers)
</script>

<template>
  <div class="container py-5">
    <div class="bg-white shadow-sm p-4 p-md-5 mx-auto admin-card">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
        <div>
          <h1 class="fw-bold mb-1">Admin – Nutzerverwaltung</h1>
          <p class="text-muted mb-0">Admins können Nutzer sehen und bearbeiten (kein Anlegen nötig).</p>
        </div>
      </div>

      <!-- Suche -->
      <div class="row g-2 align-items-center mb-4">
        <div class="col-12 col-md">
          <input
            v-model="search"
            class="form-control search-input"
            type="text"
            placeholder="Suchen (Name oder E-Mail)…"
          />
          <div class="small text-muted mt-1">
            Tipp: Suche funktioniert auf <b>Name</b> und <b>E-Mail</b>.
          </div>
        </div>

        <div class="col-12 col-md-auto d-flex gap-2">
          <button class="btn btn-outline-secondary pill" type="button" @click="loadUsers">
            Suchen
          </button>
          <button
            class="btn btn-outline-secondary pill"
            type="button"
            @click="clearSearch"
            :disabled="!search.trim()"
          >
            Zurücksetzen
          </button>
        </div>
      </div>

      <!-- Status -->
      <div v-if="loading" class="alert alert-light border">Lade Nutzer …</div>

      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div v-else-if="users.length === 0" class="alert alert-light border">
        Keine Nutzer gefunden.
      </div>

      <!-- Liste -->
      <ul v-else class="list-group list-group-flush">
        <li
          v-for="u in users"
          :key="u.id"
          class="list-group-item py-3 d-flex justify-content-between align-items-start flex-wrap gap-2"
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
                <label class="form-label small text-muted fw-bold">Name</label>
                <input v-model="editForm.name" class="form-control pill-input" type="text" />
              </div>

              <div class="col-12 col-md-5">
                <label class="form-label small text-muted fw-bold">E-Mail</label>
                <input v-model="editForm.email" class="form-control pill-input" type="email" />
              </div>

              <div class="col-12 col-md-3">
                <label class="form-label small text-muted fw-bold">Rolle</label>
                <select v-model="editForm.role" class="form-select pill-select">
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
          <div class="d-flex align-items-center gap-2 ms-auto">
            <span
              v-if="editingId !== u.id"
              class="role-badge"
              :class="u.role === 'ADMIN' ? 'role-admin' : 'role-user'"
            >
              {{ u.role }}
            </span>

            <button
              v-if="editingId !== u.id"
              class="btn btn-sm btn-outline-secondary pill"
              type="button"
              @click="startEdit(u)"
            >
              Bearbeiten
            </button>

            <template v-else>
              <button
                class="btn btn-sm btn-outline-secondary pill"
                type="button"
                @click="cancelEdit"
                :disabled="saveLoading"
              >
                Abbrechen
              </button>
              <button
                class="btn btn-sm btn-success cooked-save pill"
                type="button"
                @click="saveUser(u.id)"
                :disabled="saveLoading"
              >
                {{ saveLoading ? 'Speichert…' : 'Speichern' }}
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

/* Cooked Look */
.pill {
  border-radius: 999px;
}
.search-input {
  border-radius: 999px;
}
.pill-input, .pill-select {
  border-radius: 999px;
  background: #f8f8f0;
}

/* Dropdown schöner: etwas “soft” */
.pill-select {
  border: 1px solid rgba(107, 106, 25, 0.25);
}

/* Rolle */
.role-badge {
  font-size: 0.75rem;
  padding: 6px 14px;
  border-radius: 999px;
  font-weight: 700;
  letter-spacing: 0.3px;
}
.role-admin {
  background-color: #eef1e2;
  color: #4a4a1a;
  border: 1px solid #cfd4a6;
}
.role-user {
  background-color: #f2f2f2;
  color: #555;
  border: 1px solid #ddd;
}

/* Speichern-Button softer */
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
