<script setup>
import { computed, ref, onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { fetchMealPlan, updateMealPlanEntry, deleteMealPlanEntry, clearMealPlan } from '@/services/mealPlanService'
import Button from '@/components/Button.vue'

const { getAccessTokenSilently } = useAuth0()

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

async function removeEntry(entry) {
  try {
    await deleteMealPlanEntry(getAccessTokenSilently, entry.id)
    entries.value = entries.value.filter((e) => e.id !== entry.id)
  } catch (e) {
    error.value = e?.message || 'Konnte Eintrag nicht entfernen.'
  }
}

function onDragStart(entry, event) {
  dragId.value = entry.id
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

function onDragOver(event) {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
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
          <button class="btn btn-outline-secondary" type="button" @click="loadPlan">
            Neu laden
          </button>
          <button class="btn btn-outline-danger" type="button" @click="clearAll">
            Alles löschen
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-muted">Lade Wochenplan...</div>
      <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

      <div v-else class="table-responsive">
        <table class="table plan-table align-top">
          <thead>
            <tr>
              <th v-for="day in weekdays" :key="day.code">{{ day.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
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
                    draggable="true"
                    @dragstart="onDragStart(entry, $event)"
                  >
                    <div class="fw-semibold">{{ entry.product?.title }}</div>
                    <div class="d-flex align-items-center gap-2 mt-2">
                      <label class="small text-muted">Portionen</label>
                      <input
                        type="number"
                        min="1"
                        class="form-control form-control-sm rounded-pill servings-input"
                        :value="entry.servings || entry.product?.servings || 1"
                        @change="updateServings(entry, $event.target.value)"
                      />
                      <button
                        class="btn btn-sm btn-outline-secondary"
                        type="button"
                        @click="removeEntry(entry)"
                      >
                        Entfernen
                      </button>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4">
        <router-link to="/profile" class="text-decoration-none">
          <Button variant="secondary">Zurück zum Profil</Button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.plan-card {
  max-width: 1100px;
  border-radius: 30px;
}

.plan-table th {
  background: #fbfbfb;
  border-bottom: 1px solid #eceff2;
  padding: 14px 16px;
  font-weight: 700;
  text-align: left;
}

.plan-cell {
  min-width: 160px;
  padding: 16px;
  border-top: 1px solid #f1f3f5;
  background: #fff;
}

.plan-entry {
  border: 1px solid #eee;
  border-radius: 16px;
  padding: 10px 12px;
  background: #fafaf3;
}

.servings-input {
  max-width: 90px;
}
</style>
