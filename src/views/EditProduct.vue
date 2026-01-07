<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import { useAuthStore } from '@/stores/authStore'
import { loadMe } from '@/services/meService'
import Button from '@/components/Button.vue'
import { authFetch } from '@/services/apiAuth'

const route = useRoute()
const router = useRouter()
const { user, isAuthenticated, getAccessTokenSilently } = useAuth0()
const authStore = useAuthStore()

const form = ref({
  title: '',
  categories: [],
  prepTimeMinutes: '',
  image: '',
  ingredients: [{ name: '', amount: '' }],
  steps: [{ text: '' }]
})

const categories = ref([])
const dropdownOpen = ref(false)
const canManage = ref(false)

const selectedCategoryLabels = computed(() => {
  const selected = new Set(form.value.categories || [])
  return categories.value
    .filter((c) => selected.has(c.value))
    .map((c) => c.label || c.value)
})

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

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})
const loading = ref(true)
const error = ref(null)

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

function descriptionToSteps(description) {
  return (description || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text) => ({ text }))
}

function normalizeSteps(input) {
  const base = Array.isArray(input) && input.length ? input : []
  const steps = base.map((s) => ({
    text: (s?.text || '').toString()
  }))
  return steps.length ? steps : [{ text: '' }]
}

async function loadCategories() {
  try {
    const baseUrl = import.meta.env.VITE_API_URL
    const apiRoot = baseUrl.replace(/\/(product|products|recipes)$/, '')

    const res = await fetch(`${apiRoot}/category/translation`)
    if (!res.ok) throw new Error()

    const data = await res.json()
    categories.value = Object.entries(data).map(([value, label]) => ({ value, label }))
  } catch {
    categories.value = [
      { value: 'ASIAN', label: 'Asiatisch' },
      { value: 'ITALIAN', label: 'Italienisch' },
      { value: 'VEGETARIAN', label: 'Vegetarisch' }
    ]
  }
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

// Produktdaten beim Start laden
onMounted(async () => {
  try {
    await loadCategories()
    if (isAuthenticated.value && !authStore.role) {
      authStore.setMe(await loadMe(getAccessTokenSilently))
    }
    const id = route.params.id
    const baseUrl = import.meta.env.VITE_API_URL
    const res = await fetch(`${baseUrl}/${id}`)

    if (!res.ok) {
      throw new Error(`Rezept nicht gefunden (Status ${res.status})`)
    }

    const data = await res.json()

    const ingredients = Array.isArray(data.ingredients) && data.ingredients.length
      ? data.ingredients
      : [{ name: '', amount: '' }]
    const steps = normalizeSteps(
      Array.isArray(data.steps) && data.steps.length ? data.steps : descriptionToSteps(data.description)
    )

    const productCategories = Array.isArray(data.categories)
      ? data.categories
      : data.category
        ? [data.category]
        : []

    const creator = (data.createdByEmail || '').toLowerCase()
    const email = (user.value?.email || '').toLowerCase()
    const isAdmin = authStore.role === 'ADMIN'
    canManage.value = isAdmin || (!!creator && !!email && creator === email)
    if (!canManage.value) {
      throw new Error('Keine Berechtigung zum Bearbeiten dieses Rezepts.')
    }

    form.value = {
      title: data.title,
      categories: productCategories,
      prepTimeMinutes: data.prepTimeMinutes,
      image: data.imageUrl,
      ingredients,
      steps
    }
  } catch (e) {
    console.error(e)
    error.value = e.message
  } finally {
    loading.value = false
  }
})

// UPDATE (Speichern)
async function updateProduct() {
  try {
    if (!canManage.value) {
      alert('Keine Berechtigung.')
      return
    }
    const baseUrl = import.meta.env.VITE_API_URL
    const id = route.params.id

    const ingredients = normalizeIngredients(form.value.ingredients)
    const steps = (form.value.steps || [])
      .map((s) => ({
        text: (s?.text || '').trim()
      }))
      .filter((s) => s.text)
    const description = buildDescription(steps)

    const res = await authFetch(getAccessTokenSilently, `${baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.value.title,
        categories: (form.value.categories || []).filter(Boolean),
        prepTimeMinutes: form.value.prepTimeMinutes,
        imageUrl: form.value.image,
        description,
        instructions: description,
        ingredients,
        steps
      })
    })

    if (!res.ok) {
      throw new Error(`Fehler beim Speichern (Status ${res.status})`)
    }

    alert('Änderungen gespeichert!')
    router.push('/')
  } catch (e) {
    console.error(e)
    alert(e.message)
  }
}

// DELETE (Löschen)
async function deleteProduct() {
  if (!confirm('Wirklich löschen?')) return

  try {
    const baseUrl = import.meta.env.VITE_API_URL
    const id = route.params.id

    const res = await authFetch(getAccessTokenSilently, `${baseUrl}/${id}`, {
      method: 'DELETE'
    })

    if (!res.ok && res.status !== 204) {
      throw new Error(`Fehler beim Löschen (Status ${res.status})`)
    }

    alert('Rezept gelöscht!')
    router.push('/')
  } catch (e) {
    console.error(e)
    alert(e.message)
  }
}
</script>

<template>
  <div class="container py-5">
    <div v-if="loading" class="text-center">Lade Daten...</div>

    <div v-else-if="error" class="text-center text-danger">
      {{ error }}
    </div>

    <div v-else class="form-card bg-white p-5 shadow-sm mx-auto">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold m-0">Rezept bearbeiten</h2>
        <button @click="deleteProduct" class="btn btn-outline-danger rounded-pill px-3">
          Löschen
        </button>
      </div>

      <form @submit.prevent="updateProduct">
        <div class="mb-3">
          <label class="form-label small text-muted">Name</label>
          <input v-model="form.title" class="form-control rounded-pill px-3" />
        </div>

        <div class="row g-3 mb-3">
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
                  v-for="c in categories"
                  :key="c.value"
                  class="category-item"
                >
                  <label class="d-flex align-items-center gap-2 mb-0" @click.stop>
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :value="c.value"
                      v-model="form.categories"
                      @click.stop
                      @change.stop
                    />
                    <span>{{ c.label }} ({{ c.value }})</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <label class="form-label text-muted small">Zeit (Minuten)</label>
            <input
              v-model="form.prepTimeMinutes"
              type="number"
              class="form-control rounded-pill px-3"
            />
          </div>
        </div>

        <div class="mb-4 p-3 bg-light rounded-4 border border-white">
          <label class="form-label text-muted small">Bild URL</label>
          <input
            v-model="form.image"
            type="text"
            class="form-control rounded-pill px-3 mb-2"
          />
          <div v-if="form.image" class="text-center">
            <img
              :src="form.image"
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
        </div>

        <!-- Schritte -->
        <div class="mb-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <label class="form-label text-muted small mb-0">Zubereitungsschritte</label>
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

          <div class="d-flex justify-content-end">
            <button class="btn btn-outline-secondary btn-sm" type="button" @click="addStep">
              + Schritt
            </button>
          </div>
        </div>

        <div class="d-flex gap-2">
          <router-link to="/">
            <Button variant="secondary" type="button">Abbrechen</Button>
          </router-link>
          <Button variant="accent" type="submit">Speichern</Button>
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
textarea {
  border: 1px solid #eee;
  background-color: #f9f9f9;
}
input:focus,
textarea:focus {
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
