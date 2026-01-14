<script setup>
import { ref, onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { authFetch, getApiRoot, getApiCollection } from '@/services/apiAuth'

const { getAccessTokenSilently } = useAuth0()

const transactions = ref([])
const loading = ref(false)
const error = ref('')
const search = ref('')

const recipeTitleById = ref(new Map())

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
  if (x === 'FAVORITE_ADD') return 'Favorisiert'
  if (x === 'FAVORITE_REMOVE') return 'Favorit entfernt'
  return a || '-'
}

function actionClass(a) {
  const x = (a || '').toUpperCase()
  if (x === 'CREATE') return 'badge badge-create'
  if (x === 'UPDATE') return 'badge badge-update'
  if (x === 'DELETE') return 'badge badge-delete'
  if (x === 'FAVORITE_ADD') return 'badge badge-create'
  if (x === 'FAVORITE_REMOVE') return 'badge badge-neutral'
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

async function ensureRecipeTitle(recipeId) {
  const id = Number(recipeId)
  if (!id) return null
  if (recipeTitleById.value.has(id)) return recipeTitleById.value.get(id)

  try {
    const baseUrl = getApiCollection()
    const res = await authFetch(getAccessTokenSilently, `${baseUrl}/${id}`)
    if (!res.ok) throw new Error('recipe fetch failed')

    const data = await res.json()
    const title = (data?.title || '').toString().trim() || `Rezept #${id}`
    recipeTitleById.value.set(id, title)
    return title
  } catch {
    const fallback = `Rezept #${id}`
    recipeTitleById.value.set(id, fallback)
    return fallback
  }
}

/* ✅ findet IDs in mehreren Formaten:
   - "#353"
   - "Rezept 353"
   - "Product 353"
   - "ID 353" / "id:353" / "entityId=353"
*/
function extractRecipeIdFromText(text) {
  const s = (text || '').toString()

  // #353
  let m = s.match(/#\s*(\d+)/)
  if (m?.[1]) return Number(m[1])

  // Rezept 353 / Product 353
  m = s.match(/\b(?:Rezept|Recipe|Product)\s*#?\s*(\d+)\b/i)
  if (m?.[1]) return Number(m[1])

  // id:353 / ID 353 / entityId=353 / productId=353 / recipeId=353
  m = s.match(/\b(?:id|entityid|productid|recipeid)\s*[:= ]\s*(\d+)\b/i)
  if (m?.[1]) return Number(m[1])

  return null
}

async function formatDetails(t) {
  const raw = (t?.details || '').toString()
  if (!raw) return '-'

  let text = raw

  // 1) Begriffe vereinheitlichen
  text = text.replaceAll('Product', 'Rezept').replaceAll('PRODUCT', 'Rezept')

  // 2) ID finden (egal welches Format)
  const rid = extractRecipeIdFromText(text)
  if (rid) {
    const title = await ensureRecipeTitle(rid)

    // 3) Ersetze verschiedene ID-Formen durch den Titel
    //    - "#353" -> "Spaghetti ..."
    text = text.replace(/#\s*\d+/, title)
    //    - "Rezept 353" oder "Rezept #353" -> "Rezept Spaghetti ..."
    text = text.replace(/\bRezept\s*#?\s*\d+\b/i, `Rezept ${title}`)
    //    - "Product 353" falls noch irgendwo
    text = text.replace(/\bProduct\s*#?\s*\d+\b/i, `Rezept ${title}`)
  }

  // 4) Falls du sowas bekommst wie "Rezept Rezept XYZ" -> auf eins reduzieren
  text = text.replace(/\bRezept\s+Rezept\b/g, 'Rezept')

  // 5) Optional: "Review" einheitlicher
  text = text.replace(/\bReview\b/gi, 'Bewertung')

  return text
}

async function loadTransactions() {
  loading.value = true
  error.value = ''

  try {
    const apiRoot = getApiRoot()
    const res = await authFetch(getAccessTokenSilently, `${apiRoot}/transactions`)
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()

    // IDs vorladen (besserer UX)
    const preloadIds = new Set()
    for (const t of data) {
      const rid = extractRecipeIdFromText(t?.details || '')
      if (rid) preloadIds.add(rid)
    }
    await Promise.all([...preloadIds].slice(0, 50).map((id) => ensureRecipeTitle(id)))

    const q = search.value.trim().toLowerCase()
    const filtered = !q
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

    const pretty = await Promise.all(
      filtered.map(async (t) => ({
        ...t,
        detailsPretty: await formatDetails(t)
      }))
    )
    transactions.value = pretty
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
      <div class="d-flex align-items-center justify-content-between gap-3 mb-4 flex-wrap">
        <h1 class="fw-bold mb-0">Aktivitätsprotokoll</h1>

        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary pill btn-olive-outline" type="button" @click="loadTransactions">
            Neu laden
          </button>
          <router-link to="/profile" class="btn btn-outline-secondary pill btn-olive-outline">
            Zurück zum Dashboard
          </router-link>
        </div>
      </div>

      <div class="row g-2 align-items-center mb-4">
        <div class="col-12 col-md">
          <input
            v-model="search"
            class="form-control"
            type="text"
            placeholder="Suchen."
            @input="loadTransactions"
          />
        </div>

        <div class="col-12 col-md-auto d-flex gap-2">
          <button class="btn btn-outline-secondary pill btn-olive-outline" type="button" @click="loadTransactions">
            Suchen
          </button>
          <button
            class="btn btn-outline-secondary pill btn-olive-outline"
            type="button"
            @click="clearSearch"
            :disabled="!search.trim()"
          >
            Zurücksetzen
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-muted">Lade...</div>

      <div v-else-if="error" class="alert alert-danger mb-0">
        {{ error }}
      </div>

      <div v-else-if="transactions.length === 0" class="text-muted">
        Keine Einträge.
      </div>

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
                <td class="muted">{{ t.detailsPretty || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-card {
  max-width: 1100px;
  border-radius: 30px;
}

.pill {
  border-radius: 999px;
}

.btn-olive-outline {
  border-color: #6b6a19 !important;
  color: #6b6a19 !important;
  background: transparent !important;
}

.btn-olive-outline:hover,
.btn-olive-outline:focus {
  border-color: #6b6a19 !important;
  color: #6b6a19 !important;
  background: rgba(107, 106, 25, 0.08) !important;
}

.btn-olive-outline:active {
  background: rgba(107, 106, 25, 0.12) !important;
}

.btn-olive-outline:disabled,
.btn-olive-outline.disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.table-wrap {
  border: 1px solid #e9ecef;
  border-radius: 18px;
  overflow: hidden;
}

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
