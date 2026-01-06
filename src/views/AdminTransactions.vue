<script setup>
import { ref, onMounted } from 'vue'

const transactions = ref([])
const loading = ref(false)
const error = ref('')
const search = ref('')

function formatDate(v) {
  if (!v) return ''
  if (Array.isArray(v)) {
    const [Y, M, D, h, m, s] = v
    const pad = (n) => String(n).padStart(2, '0')
    return `${pad(D)}.${pad(M)}.${Y} ${pad(h)}:${pad(m)}:${pad(s)}`
  }
  return String(v).replace('T', ' ').slice(0, 19)
}

function actionLabel(a) {
  const x = (a || '').toUpperCase()
  if (x === 'CREATE') return 'Erstellt'
  if (x === 'UPDATE') return 'Bearbeitet'
  if (x === 'DELETE') return 'Gelöscht'
  return a || '-'
}

function actionClass(a) {
  const x = (a || '').toUpperCase()
  if (x === 'CREATE') return 'badge badge-create'
  if (x === 'UPDATE') return 'badge badge-update'
  if (x === 'DELETE') return 'badge badge-delete'
  return 'badge badge-neutral'
}

function typeLabel(t) {
  const x = (t || '').toUpperCase()
  if (x === 'PRODUCT') return 'Rezept'
  if (x === 'REVIEW') return 'Bewertung'
  if (x === 'USER') return 'Nutzer'
  return t || '-'
}

function userLabel(t) {
  const name = (t?.performedByName || '').trim()
  if (!name || name.toLowerCase() === 'unknown') return 'Unbekannt'
  return name
}

async function loadTransactions() {
  loading.value = true
  error.value = ''

  try {
    const baseUrl = import.meta.env.VITE_API_URL
    const apiRoot = baseUrl.replace(/\/(product|products|recipes)$/, '')

    const res = await fetch(`${apiRoot}/transactions`)
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()

    const q = search.value.trim().toLowerCase()
    transactions.value = !q
      ? data
      : data.filter((t) => {
          const blob = [
            actionLabel(t.action),
            t.action,
            typeLabel(t.entityType),
            t.entityType,
            t.entityId,
            t.performedByName,
            t.details
          ]
            .join(' ')
            .toLowerCase()
          return blob.includes(q)
        })
  } catch (e) {
    console.error(e)
    error.value = 'Konnte Einträge nicht laden.'
    transactions.value = []
  } finally {
    loading.value = false
  }
}

function clearSearch() {
  search.value = ''
  loadTransactions()
}

onMounted(loadTransactions)
</script>

<template>
  <div class="container py-5">
    <div class="bg-white shadow-sm p-4 p-md-5 mx-auto admin-card">
      <!-- Kopfzeile -->
      <div class="d-flex align-items-center justify-content-between gap-3 mb-4">
        <h1 class="fw-bold mb-0">Aktivitätsprotokoll</h1>

        <button class="btn btn-outline-secondary" type="button" @click="loadTransactions">
          Neu laden
        </button>
      </div>

      <!-- Suche -->
      <div class="row g-2 align-items-center mb-4">
        <div class="col-12 col-md">
          <input
            v-model="search"
            class="form-control"
            type="text"
            placeholder="Suchen…"
            @input="loadTransactions"
          />
        </div>

        <div class="col-12 col-md-auto d-flex gap-2">
          <button class="btn btn-outline-secondary" type="button" @click="loadTransactions">
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

      <!-- States -->
      <div v-if="loading" class="text-muted">Lade …</div>

      <div v-else-if="error" class="alert alert-danger mb-0">
        {{ error }}
      </div>

      <div v-else-if="transactions.length === 0" class="text-muted">
        Keine Einträge.
      </div>

      <!-- Tabelle -->
      <div v-else class="table-wrap">
        <div class="table-responsive">
          <table class="table mb-0 align-middle">
            <thead>
              <tr>
                <th>Zeit</th>
                <th>Aktion</th>
                <th>Bereich</th>
                <th>ID</th>
                <th>User</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="t in transactions" :key="t.id">
                <td class="muted">{{ formatDate(t.createdAt) }}</td>

                <td>
                  <span :class="actionClass(t.action)">
                    {{ actionLabel(t.action) }}
                  </span>
                </td>

                <td class="fw-semibold">{{ typeLabel(t.entityType) }}</td>

                <td class="muted">{{ t.entityId }}</td>

                <td class="fw-semibold">{{ userLabel(t) }}</td>

                <td class="muted">{{ t.details || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- Ende -->
    </div>
  </div>
</template>

<style scoped>
.admin-card {
  max-width: 1100px;
  border-radius: 30px;
}

/* Schlichte, einheitliche Umrandung */
.table-wrap {
  border: 1px solid #e9ecef;
  border-radius: 18px;
  overflow: hidden;
}

/* Einheitliche Tabelle */
table thead th {
  background: #fbfbfb;
  border-bottom: 1px solid #eceff2;
  padding: 14px 16px;
  font-weight: 700;
}

table tbody td {
  padding: 14px 16px;
  border-top: 1px solid #f1f3f5;
}

.muted {
  color: #6c757d;
  font-size: 0.95rem;
}

/* Schlichte Badges, alles ruhig */
.badge {
  display: inline-block;
  font-size: 0.85rem;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 700;
  border: 1px solid #e3e6ea;
  background: #f6f7f8;
  color: #2b2f33;
}

.badge-create {
  border-color: #cfd4a6;
  background: #eef1e2;
  color: #3f4216;
}

.badge-update {
  border-color: #d6dde6;
  background: #f1f4f8;
  color: #2b2f33;
}

.badge-delete {
  border-color: #f0c7c7;
  background: #fdecec;
  color: #6b1f1f;
}

.badge-neutral {
  border-color: #e3e6ea;
  background: #f6f7f8;
  color: #2b2f33;
}
</style>
