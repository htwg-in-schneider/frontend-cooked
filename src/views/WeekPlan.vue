<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import { fetchMealPlan, updateMealPlanEntry, deleteMealPlanEntry, clearMealPlan } from '@/services/mealPlanService'
import Button from '@/components/Button.vue'

const { getAccessTokenSilently } = useAuth0()
const router = useRouter()

const entries = ref([])
const loading = ref(false)
const error = ref('')
const dragId = ref(null)

const weekdays = [
  { code: 'MONDAY', label: 'Montag' },
  { code: 'TUESDAY', label: 'Dienstag' },
  { code: 'WEDNESDAY', label: 'Mittwoch' },
  { code: 'THURSDAY', label: 'Donnerstag' },
  { code: 'FRIDAY', label: 'Freitag' },
  { code: 'SATURDAY', label: 'Samstag' },
  { code: 'SUNDAY', label: 'Sonntag' }
]

const grouped = computed(() => {
  const map = {}
  for (const day of weekdays) {
    map[day.code] = []
  }
  for (const entry of entries.value) {
    if (!map[entry.weekday]) {
      map[entry.weekday] = []
    }
    map[entry.weekday].push(entry)
  }
  return map
})

async function loadPlan() {
  loading.value = true
  error.value = ''
  try {
    entries.value = await fetchMealPlan(getAccessTokenSilently)
  } catch (e) {
    error.value = 'Wochenplan konnte nicht geladen werden.'
  } finally {
    loading.value = false
  }
}

async function updateServings(entry, value) {
  const servings = Number(value)
  if (!servings || servings <= 0) return
  try {
    const updated = await updateMealPlanEntry(getAccessTokenSilently, entry.id, { servings })
    entries.value = entries.value.map((e) => (e.id === updated.id ? updated : e))
  } catch (e) {
    error.value = e?.message || 'Konnte Portionen nicht speichern.'
  }
}

function onDragStart(entry, event) {
  dragId.value = entry.id
  event.dataTransfer.setData('text/plain', String(entry.id))
  event.dataTransfer.effectAllowed = 'move'
}

async function onDrop(dayCode) {
  if (!dragId.value) return
  try {
    const updated = await updateMealPlanEntry(getAccessTokenSilently, dragId.value, { weekday: dayCode })
    entries.value = entries.value.map((e) => (e.id === updated.id ? updated : e))
  } catch (e) {
    error.value = e?.message || 'Konnte Eintrag nicht verschieben.'
  } finally {
    dragId.value = null
  }
}

async function onTrashDrop() {
  if (!dragId.value) return
  try {
    await deleteMealPlanEntry(getAccessTokenSilently, dragId.value)
    await loadPlan()
  } catch (e) {
    error.value = e?.message || 'Konnte Eintrag nicht entfernen.'
  } finally {
    dragId.value = null
  }
}

function onDragOver(event) {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
}

function onDragEnd() {
  dragId.value = null
}

async function clearAll() {
  if (!confirm('Wochenplan wirklich komplett löschen?')) return
  try {
    await clearMealPlan(getAccessTokenSilently)
    entries.value = []
  } catch (e) {
    error.value = e?.message || 'Konnte Wochenplan nicht löschen.'
  }
}

onMounted(loadPlan)
</script>

<template>
  <div class="container py-5">
    <div class="plan-card bg-white shadow-sm p-4 p-md-5 mx-auto">
      <div class="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-4">
        <h1 class="fw-bold mb-0">Mein Wochenplan</h1>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary pill btn-olive-outline" type="button" @click="loadPlan">
            Neu laden
          </button>
          <button class="btn btn-sm btn-outline-danger pill" type="button" @click="clearAll">
            Alles löschen
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-muted">Lade Wochenplan...</div>
      <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

      <div v-else class="plan-scroll">
        <div class="plan-grid">
          <div class="plan-grid-head">
            <div v-for="day in weekdays" :key="day.code" class="plan-head-cell">
              {{ day.label }}
            </div>
          </div>
          <div class="plan-grid-body">
            <div
              v-for="day in weekdays"
              :key="day.code"
              class="plan-cell"
              @dragover="onDragOver"
              @drop="onDrop(day.code)"
            >
              <div v-if="grouped[day.code].length === 0" class="text-muted small">
                Kein Eintrag
              </div>
              <div v-else class="d-flex flex-column gap-2">
                <div
                  v-for="entry in grouped[day.code]"
                  :key="entry.id"
                  class="plan-entry"
                  :class="{ 'is-dragging': dragId === entry.id }"
                  draggable="true"
                  @dragstart="onDragStart(entry, $event)"
                  @dragend="onDragEnd"
                >
                  <button
                    class="plan-title"
                    type="button"
                    @click="router.push({ name: 'product-detail', params: { id: entry.product?.id } })"
                  >
                    {{ entry.product?.title }}
                  </button>
                      <div class="d-flex align-items-center gap-2 mt-2">
                        <label class="small text-muted">Portionen</label>
                        <input
                          type="number"
                          inputmode="numeric"
                          pattern="[0-9]*"
                          class="form-control form-control-sm rounded-pill servings-input no-spin"
                          min="1"
                          :value="entry.servings || entry.product?.servings || 1"
                          @change="updateServings(entry, $event.target.value)"
                        />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <router-link to="/profile" class="text-decoration-none">
          <Button variant="secondary">Zurück zum Profil</Button>
        </router-link>
      </div>

      <div
        v-if="dragId"
        class="trash-zone mt-4"
        @dragover="onDragOver"
        @drop="onTrashDrop"
      >
        <span class="trash-icon" aria-hidden="true">🗑️</span>
        <span>Rezept hierher ziehen zum Entfernen</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.plan-card {
  max-width: 1600px;
  width: 100%;
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

/* Löschen Button softer (wie Nutzerverwaltung) */
.btn-outline-danger:hover {
  background-color: #fdecec !important;
  border-color: #c94c4c !important;
  color: #8a1f1f !important;
}

.plan-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.plan-scroll {
  overflow-x: auto;
  padding-bottom: 6px;
}

.plan-grid-head,
.plan-grid-body {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 12px;
}

.plan-head-cell {
  background: #fbfbfb;
  border: 1px solid #eceff2;
  border-radius: 16px;
  padding: 12px 10px;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
}

.plan-cell {
  min-width: 0;
  padding: 12px;
  border: 1px solid #f1f3f5;
  border-radius: 16px;
  background: #fff;
  min-height: 180px;
}

.plan-entry {
  border: 1px solid #eee;
  border-radius: 16px;
  padding: 10px 12px;
  background: #fafaf3;
  cursor: grab;
  user-select: none;
}

.plan-entry .fw-semibold {
  font-size: 0.85rem;
  line-height: 1.2;
  word-break: break-word;
  hyphens: auto;
}

.plan-title {
  border: 0;
  background: transparent;
  padding: 0;
  text-align: left;
  color: #2b2f33;
  font-weight: 600;
  font-size: 0.85rem;
  line-height: 1.2;
  cursor: pointer;
  word-break: break-word;
  hyphens: auto;
}

.plan-title:hover {
  text-decoration: underline;
}

.plan-entry.is-dragging {
  opacity: 0.2;
  filter: saturate(0.6);
}

.servings-input {
  max-width: 90px;
  text-align: center;
}

.no-spin::-webkit-outer-spin-button,
.no-spin::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.no-spin {
  -moz-appearance: textfield;
}

.trash-zone {
  border: 2px dashed rgba(0, 0, 0, 0.15);
  border-radius: 20px;
  padding: 16px;
  text-align: center;
  color: rgba(0, 0, 0, 0.55);
  background: rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 600;
}

.trash-icon {
  font-size: 1.4rem;
}

@media (max-width: 1200px) {
  .plan-grid {
    min-width: 980px;
  }
  .plan-card {
    padding: 20px;
  }
  .plan-grid-head,
  .plan-grid-body {
    gap: 8px;
  }
  .plan-cell {
    padding: 10px;
  }
  .plan-head-cell {
    padding: 10px 8px;
    font-size: 0.9rem;
  }
}
</style>
