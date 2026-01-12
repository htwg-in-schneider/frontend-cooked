<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import Button from '@/components/Button.vue'
import { authFetch, getApiCollection, getApiRoot } from '@/services/apiAuth'
import { resolveImageUrl } from '@/services/imageService'

const router = useRouter()
const { getAccessTokenSilently } = useAuth0()

const defaultImage = 'https://placehold.co/600x400?text=Neues+Rezept'
const previewImage = computed(() => resolveImageUrl(form.value.image))

const form = ref({
  title: '',
  categories: [],
  prepTimeMinutes: '',
  image: '',
  ingredients: [{ name: '', amount: '' }],
  steps: [{ text: '' }]
})

const errors = ref({
  title: '',
  categories: '',
  prepTimeMinutes: '',
  ingredients: '',
  steps: '',
  general: ''
})

const categories = ref([]) // [{ value: "ASIAN", label: "Asiatisch" }, ...]
const dropdownOpen = ref(false)

const cuisineCodes = new Set([
  'ITALIAN',
  'FRENCH',
  'ASIAN',
  'AMERICAN',
  'GERMAN',
  'MEDITERRANEAN',
  'MEXICAN',
  'INDIAN',
  'MIDDLE_EASTERN',
  'THAI',
  'CHINESE',
  'JAPANESE',
  'SPANISH'
])

const dishTypeCodes = new Set([
  'BREAKFAST',
  'APPETIZER',
  'MAIN',
  'DESSERT',
  'SNACK',
  'SOUP',
  'SIDE'
])

const dietCodes = new Set(['VEGETARIAN', 'VEGAN', 'MEAT', 'SEAFOOD'])

const focusCodes = new Set(['PASTA', 'GRILL', 'DRINKS'])

const categoryLabelMap = computed(() => {
  const map = new Map()
  for (const c of categories.value) {
    map.set(c.value, c.label || c.value)
  }
  return map
})

const selectedCategoryLabels = computed(() => {
  const selected = (form.value.categories || []).filter(Boolean)
  if (!selected.length) return []

  const map = categoryLabelMap.value
  const selectedCuisineCode = selected.find((c) => cuisineCodes.has(c))
  const cuisineLabel = selectedCuisineCode ? map.get(selectedCuisineCode) : null
  const other = selected
    .filter((c) => c !== selectedCuisineCode)
    .map((c) => map.get(c) || c)
    .sort((a, b) => a.localeCompare(b, 'de'))
  return [cuisineLabel, ...other].filter(Boolean)
})

const sortedCategories = computed(() => {
  const selected = new Set(form.value.categories || [])
  return categories.value.slice().sort((a, b) => {
    const aSelected = selected.has(a.value)
    const bSelected = selected.has(b.value)
    if (aSelected && !bSelected) return -1
    if (bSelected && !aSelected) return 1
    const aGroup = groupRank(a.value)
    const bGroup = groupRank(b.value)
    if (aGroup !== bGroup) return aGroup - bGroup
    const aLabel = (a.label || a.value).toLowerCase()
    const bLabel = (b.label || b.value).toLowerCase()
    return aLabel.localeCompare(bLabel, 'de')
  })
})

const selectedCuisine = computed(() =>
  (form.value.categories || []).filter((c) => cuisineCodes.has(c))
)

function groupRank(code) {
  if (dishTypeCodes.has(code)) return 1
  if (cuisineCodes.has(code)) return 2
  if (dietCodes.has(code)) return 3
  if (focusCodes.has(code)) return 4
  return 5
}

function isCuisine(code) {
  return cuisineCodes.has(code)
}

function onCategoryChange(code, event) {
  if (!isCuisine(code)) {
    return
  }
  if (event?.target?.checked) {
    form.value.categories = (form.value.categories || []).filter(
      (c) => !isCuisine(c) || c === code
    )
  }
}

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

function closeDropdown() {
  dropdownOpen.value = false
}

function onDocumentClick(event) {
  const dropdown = event.target.closest('.category-dropdown')
  if (!dropdown) {
    closeDropdown()
  }
}

function resetErrors() {
  errors.value = {
    title: '',
    categories: '',
    prepTimeMinutes: '',
    ingredients: '',
    steps: '',
    general: ''
  }
}

function normalizeIngredients(list) {
  return (list || [])
    .map((i) => ({
      name: (i?.name || '').trim(),
      amount: (i?.amount || '').trim()
    }))
    .filter((i) => i.name || i.amount)
}

function buildDescription(steps) {
  return steps.map((s) => s.text).filter(Boolean).join('\n')
}

function validateIngredients(list) {
  for (const i of list || []) {
    const name = (i?.name || '').trim()
    const amount = (i?.amount || '').trim()
    if (!name && amount) {
      return 'Bitte gib einen Namen zur Mengenangabe an.'
    }
  }
  return ''
}

function validate() {
  resetErrors()

  const title = form.value.title.trim()
  const categories = Array.isArray(form.value.categories) ? form.value.categories : []
  const minutes = Number(form.value.prepTimeMinutes)

  let ok = true

  if (!title) {
    errors.value.title = 'Bitte gib einen Rezeptnamen ein.'
    ok = false
  } else if (title.length < 3) {
    errors.value.title = 'Der Rezeptname sollte mindestens 3 Zeichen haben.'
    ok = false
  }

  if (categories.length === 0) {
    errors.value.categories = 'Bitte wähle mindestens eine Kategorie aus.'
    ok = false
  }

  if (!form.value.prepTimeMinutes || Number.isNaN(minutes)) {
    errors.value.prepTimeMinutes = 'Bitte gib eine gültige Zahl in Minuten ein.'
    ok = false
  } else if (minutes <= 0) {
    errors.value.prepTimeMinutes = 'Die Zubereitungszeit muss größer als 0 sein.'
    ok = false
  } else if (minutes > 9999) {
    errors.value.prepTimeMinutes = 'Die Zubereitungszeit ist zu groß.'
    ok = false
  }

  const ingredientError = validateIngredients(form.value.ingredients)
  if (ingredientError) {
    errors.value.ingredients = ingredientError
    ok = false
  }

  const normalizedIngredients = normalizeIngredients(form.value.ingredients)
  if (normalizedIngredients.length === 0) {
    errors.value.ingredients = 'Bitte gib mindestens eine Zutat an.'
    ok = false
  }

  let hasStepText = false
  for (const step of form.value.steps) {
    const text = (step?.text || '').trim()
    if (text) {
      hasStepText = true
    }
  }
  if (!hasStepText) {
    errors.value.steps = 'Bitte gib mindestens einen Zubereitungsschritt an.'
    ok = false
  }

  return ok
}

function addIngredient() {
  form.value.ingredients.push({ name: '', amount: '' })
}

function removeIngredient(index) {
  if (form.value.ingredients.length > 1) {
    form.value.ingredients.splice(index, 1)
  }
}

function addStep() {
  form.value.steps.push({ text: '' })
}

function removeStep(index) {
  if (form.value.steps.length > 1) {
    form.value.steps.splice(index, 1)
  }
}

async function loadCategories() {
  try {
    // VITE_API_URL ist bei euch z.B. http://localhost:8081/api/recipes
    const apiRoot = getApiRoot()

    // Backend: /api/category/translation liefert z.B. { ASIAN: "Asiatisch", ... }
    const res = await fetch(`${apiRoot}/category/translation`)
    if (!res.ok) throw new Error()

    const data = await res.json()
    categories.value = Object.entries(data).map(([value, label]) => ({ value, label }))
  } catch {
    // Fallback, falls der Endpoint nicht erreichbar ist
    categories.value = [
      { value: 'ITALIAN', label: 'Italienisch' },
      { value: 'ASIAN', label: 'Asiatisch' },
      { value: 'VEGETARIAN', label: 'Vegetarisch' },
      { value: 'VEGAN', label: 'Vegan' },
      { value: 'AMERICAN', label: 'Amerikanisch' },
      { value: 'DESSERT', label: 'Dessert' },
      { value: 'GERMAN', label: 'Deutsch' },
      { value: 'MEDITERRANEAN', label: 'Mediterran' },
      { value: 'MEXICAN', label: 'Mexikanisch' },
      { value: 'INDIAN', label: 'Indisch' },
      { value: 'FRENCH', label: 'Französisch' },
      { value: 'SPANISH', label: 'Spanisch' },
      { value: 'MIDDLE_EASTERN', label: 'Orientalisch' },
      { value: 'THAI', label: 'Thailändisch' },
      { value: 'CHINESE', label: 'Chinesisch' },
      { value: 'JAPANESE', label: 'Japanisch' },
      { value: 'BREAKFAST', label: 'Frühstück' },
      { value: 'SOUP', label: 'Suppe' },
      { value: 'SALAD', label: 'Salat' },
      { value: 'PASTA', label: 'Pasta' },
      { value: 'BAKING', label: 'Backen' },
      { value: 'GRILL', label: 'Grillen' },
      { value: 'SEAFOOD', label: 'Fisch und Meeresfrüchte' },
      { value: 'MEAT', label: 'Fleisch' },
      { value: 'SIDE', label: 'Beilage' },
      { value: 'MAIN', label: 'Hauptgericht' },
      { value: 'APPETIZER', label: 'Vorspeise' },
      { value: 'SNACK', label: 'Snack' },
      { value: 'DRINKS', label: 'Getränke' }
    ]
  }
}

async function createProduct() {
  if (!validate()) return

  // Image default
  if (!form.value.image) {
    form.value.image = defaultImage
  }

  try {
    errors.value.general = ''

    const baseUrl = getApiCollection()
    const ingredients = normalizeIngredients(form.value.ingredients)
    const steps = (form.value.steps || [])
      .map((s) => ({
        text: (s?.text || '').trim()
      }))
      .filter((s) => s.text)
    const description = buildDescription(steps)

    const payload = {
      title: form.value.title.trim(),
      categories: (form.value.categories || []).filter(Boolean),
      prepTimeMinutes: Number(form.value.prepTimeMinutes),
      imageUrl: form.value.image.trim(),
      description,
      instructions: description,
      ingredients,
      steps
    }

    const res = await authFetch(getAccessTokenSilently, `${baseUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const msg = await res.text()
      throw new Error(msg || 'Fehler beim Erstellen')
    }

    alert('Rezept erfolgreich erstellt!')
    router.push('/')
  } catch (e) {
    errors.value.general = 'Rezept konnte nicht erstellt werden. ' + (e?.message || '')
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  loadCategories()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <div class="container py-5">
    <div class="form-card bg-white p-5 shadow-sm mx-auto">
      <h2 class="mb-4 fw-bold">Neues Rezept erstellen</h2>

      <div v-if="errors.general" class="alert alert-danger">
        {{ errors.general }}
      </div>

      <form @submit.prevent="createProduct">
        <!-- Titel -->
        <div class="mb-3">
          <label class="form-label text-muted small">Rezept Name</label>
          <input
            v-model="form.title"
            type="text"
            class="form-control rounded-pill px-3"
            placeholder="z.B. Marry Me Chicken Ramen"
          />
          <div v-if="errors.title" class="text-danger small mt-1 ps-2">
            {{ errors.title }}
          </div>
        </div>

        <div class="row g-3 mb-3">
          <!-- Kategorie -->
          <div class="col-md-6">
            <label class="form-label text-muted small">Kategorien</label>
            <div class="category-dropdown">
              <button
                class="form-control rounded-pill px-3 category-toggle"
                type="button"
                @click.stop="toggleDropdown"
              >
                <span v-if="selectedCategoryLabels.length">
                  {{ selectedCategoryLabels.join(', ') }}
                </span>
                <span v-else>Kategorie auswählen</span>
              </button>

              <div v-if="dropdownOpen" class="category-menu shadow-sm">
                <div
                  v-for="c in sortedCategories"
                  :key="c.value"
                  class="category-item"
                >
                  <label
                    class="d-flex align-items-center gap-2 mb-0"
                    :class="{ 'category-disabled': selectedCuisine.length && isCuisine(c.value) && !form.categories.includes(c.value) }"
                    @click.stop
                  >
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :value="c.value"
                      v-model="form.categories"
                      @click.stop
                      @change.stop="onCategoryChange(c.value, $event)"
                    />
                    <span>{{ c.label }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div v-if="errors.categories" class="text-danger small mt-1 ps-2">
              {{ errors.categories }}
            </div>
          </div>

          <!-- Minuten -->
          <div class="col-md-6">
            <label class="form-label text-muted small">Zeit (Minuten)</label>
            <input
              v-model="form.prepTimeMinutes"
              type="number"
              class="form-control rounded-pill px-3"
              placeholder="z.B. 40"
              min="1"
            />
            <div v-if="errors.prepTimeMinutes" class="text-danger small mt-1 ps-2">
              {{ errors.prepTimeMinutes }}
            </div>
          </div>
        </div>

        <!-- Bild -->
        <div class="mb-4 p-3 bg-light rounded-4 border border-white">
          <label class="form-label text-muted small">Bild URL (optional)</label>
          <input
            v-model="form.image"
            type="url"
            class="form-control rounded-pill px-3 mb-2"
            placeholder="https://..."
          />
          <div class="form-text small ps-3 mb-3">
            Lasse es leer für ein Standardbild.
          </div>

          <div v-if="form.image" class="text-center">
            <img
              :src="previewImage"
              class="img-fluid rounded-4 shadow-sm"
              style="height: 200px; object-fit: cover;"
              alt="Bild Vorschau"
              @error="form.image = ''"
            />
          </div>
        </div>

        <!-- Zutaten -->
        <div class="mb-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <label class="form-label text-muted small mb-0">Zutaten</label>
            <button class="btn btn-outline-secondary btn-sm" type="button" @click="addIngredient">
              + Zutat
            </button>
          </div>

          <div v-for="(ing, idx) in form.ingredients" :key="idx" class="row g-2 mb-2">
            <div class="col-7">
              <input
                v-model="ing.name"
                type="text"
                class="form-control rounded-pill px-3"
                placeholder="Zutat"
              />
            </div>
            <div class="col-4">
              <input
                v-model="ing.amount"
                type="text"
                class="form-control rounded-pill px-3"
                placeholder="Menge"
              />
            </div>
            <div class="col-1 d-flex align-items-center justify-content-end">
              <button
                class="btn btn-outline-secondary btn-sm"
                type="button"
                @click="removeIngredient(idx)"
                :disabled="form.ingredients.length === 1"
              >
                -
              </button>
            </div>
          </div>

          <div v-if="errors.ingredients" class="text-danger small mt-1 ps-2">
            {{ errors.ingredients }}
          </div>
        </div>

        <!-- Schritte -->
        <div class="mb-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <label class="form-label text-muted small mb-0">Zubereitungsschritte</label>
            <button class="btn btn-outline-secondary btn-sm" type="button" @click="addStep">
              + Schritt
            </button>
          </div>

          <div v-for="(step, stepIndex) in form.steps" :key="stepIndex" class="step-card mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div class="fw-semibold">Schritt {{ stepIndex + 1 }}</div>
              <button
                class="btn btn-outline-secondary btn-sm"
                type="button"
                @click="removeStep(stepIndex)"
                :disabled="form.steps.length === 1"
              >
                Entfernen
              </button>
            </div>

            <textarea
              v-model="step.text"
              class="form-control rounded-4 p-3 mb-3"
              rows="3"
              placeholder="Beschreibe den Schritt."
            ></textarea>
          </div>

          <div v-if="errors.steps" class="text-danger small mt-1 ps-2">
            {{ errors.steps }}
          </div>
        </div>

        <div class="d-flex gap-2">
          <router-link to="/">
            <Button variant="secondary" type="button">Abbrechen</Button>
          </router-link>
          <Button variant="accent" type="submit">Rezept speichern</Button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-card {
  max-width: 800px;
  border-radius: 40px;
}

input,
textarea,
select {
  border: 1px solid #eee;
  background-color: #f9f9f9;
}

input:focus,
textarea:focus,
select:focus {
  background-color: white;
  border-color: #81801f;
  box-shadow: none;
}

.step-card {
  border: 1px solid #eee;
  border-radius: 20px;
  padding: 16px;
  background: #fafaf3;
}

.category-dropdown {
  position: relative;
}

.category-toggle {
  text-align: left;
  background: #f9f9f9;
  border: 1px solid #eee;
}

.category-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 16px;
  padding: 10px 12px;
  max-height: 220px;
  overflow-y: auto;
  z-index: 5;
}

.category-item {
  padding: 6px 4px;
}

.category-disabled {
  opacity: 0.45;
}

.category-menu .form-check-input {
  accent-color: #6b6a19;
  border-color: #6b6a19;
}

.category-menu .form-check-input:checked {
  background-color: #6b6a19 !important;
  border-color: #6b6a19 !important;
}

.category-menu .form-check-input:focus {
  box-shadow: 0 0 0 0.2rem rgba(107, 106, 25, 0.15);
}
</style>
