<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import Button from '@/components/Button.vue'
import RecipeReviews from '@/components/RecipeReviews.vue'
import { authFetch, getApiCollection } from '@/services/apiAuth'
import { useAuthStore } from '@/stores/authStore'
import { loadMe } from '@/services/meService'
import { fetchFavoriteIds, addFavorite, removeFavorite } from '@/services/favoritesService'
import { loadCategoryMap, mapCategoryLabels } from '@/services/categoryService'
import { resolveImageUrl } from '@/services/imageService'
import { addMealPlanEntry } from '@/services/mealPlanService'
import { scaleIngredientAmount } from '@/services/ingredientScale'

const route = useRoute()
const router = useRouter()
const { user, getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useAuth0()
const authStore = useAuthStore()

const product = ref(null)
const loading = ref(true)
const error = ref(null)
const isFavorite = ref(false)

const deleting = ref(false)
const deleteError = ref('')
const desiredServings = ref(1)
const planOpen = ref(false)
const planLoading = ref(false)
const planError = ref('')
const planSuccess = ref('')

const weekdays = [
  { code: 'MONDAY', label: 'Montag' },
  { code: 'TUESDAY', label: 'Dienstag' },
  { code: 'WEDNESDAY', label: 'Mittwoch' },
  { code: 'THURSDAY', label: 'Donnerstag' },
  { code: 'FRIDAY', label: 'Freitag' },
  { code: 'SATURDAY', label: 'Samstag' },
  { code: 'SUNDAY', label: 'Sonntag' }
]

function descriptionToSteps(description) {
  return (description || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text) => ({ text, ingredients: [] }))
}

async function loadProduct() {
  loading.value = true
  error.value = null

  try {
    if (isAuthenticated.value && !authStore.role) {
      authStore.setMe(await loadMe(getAccessTokenSilently))
    }

    const id = route.params.id
    const res = await fetch(`${getApiCollection()}/${id}`)
    if (!res.ok) throw new Error('Rezept nicht gefunden')

    const data = await res.json()

    const steps = Array.isArray(data.steps) && data.steps.length
      ? data.steps
      : descriptionToSteps(data.description)
    const ingredients = Array.isArray(data.ingredients) ? data.ingredients : []
    const categoryCodes = Array.isArray(data.categories)
      ? data.categories
      : data.category
        ? [data.category]
        : []

    const categoryMap = await loadCategoryMap()

    product.value = {
      id: data.id,
      title: data.title,
      categories: mapCategoryLabels(categoryCodes, categoryMap),
      categoryCodes,
      time: data.prepTimeMinutes + ' min',
      servings: data.servings ?? 1,
      image: resolveImageUrl(data.imageUrl),
      description: data.description,
      ingredients,
      steps,
      createdByEmail: data.createdByEmail || ''
    }
    desiredServings.value = product.value.servings || 1
    await loadFavoriteStatus()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function deleteRecipe() {
  if (!product.value?.id) return

  deleteError.value = ''

  const ok = confirm(
    `Möchtest du das Rezept "${product.value.title}" wirklich entfernen?\nDiese Aktion kann nicht rückgängig gemacht werden.`
  )
  if (!ok) return

  deleting.value = true

  try {
    const res = await authFetch(
      getAccessTokenSilently,
      `${getApiCollection()}/${product.value.id}`,
      { method: 'DELETE' }
    )

    if (!res.ok) throw new Error(await res.text())

    router.push(backTo.value)
  } catch (e) {
    console.error(e)
    deleteError.value = 'Rezept konnte nicht entfernt werden.'
  } finally {
    deleting.value = false
  }
}

onMounted(loadProduct)

watch(isAuthenticated, () => {
  loadFavoriteStatus()
})

async function loadFavoriteStatus() {
  if (!isAuthenticated.value || !product.value?.id) {
    isFavorite.value = false
    return
  }
  try {
    const ids = await fetchFavoriteIds(getAccessTokenSilently)
    isFavorite.value = ids.includes(product.value.id)
  } catch {
    isFavorite.value = false
  }
}

async function toggleFavorite() {
  if (!product.value?.id) return
  if (!isAuthenticated.value) {
    await loginWithRedirect({ appState: { target: router.currentRoute.value.fullPath } })
    return
  }
  try {
    if (isFavorite.value) {
      await removeFavorite(getAccessTokenSilently, product.value.id)
      isFavorite.value = false
    } else {
      await addFavorite(getAccessTokenSilently, product.value.id)
      isFavorite.value = true
    }
  } catch (e) {
    console.error(e)
  }
}

const canManage = computed(() => {
  if (!isAuthenticated.value) return false
  if (authStore.role === 'ADMIN') return true
  const email = user.value?.email
  const createdBy = product.value?.createdByEmail
  return !!email && !!createdBy && createdBy.toLowerCase() === email.toLowerCase()
})

const backTo = computed(() => {
  const from = route.query?.from
  if (from === 'profile') return '/profile'
  if (from === 'my-recipes') return '/my-recipes'
  if (from === 'favorites') return '/favorites'
  return '/'
})

const scaledIngredients = computed(() => {
  if (!product.value) return []
  const base = product.value.servings || 1
  const factor = desiredServings.value / base
  return (product.value.ingredients || []).map((ing) => ({
    name: ing.name,
    amount: scaleIngredientAmount(ing.amount, factor)
  }))
})

async function addToPlan(dayCode) {
  if (!product.value) return
  if (!isAuthenticated.value) {
    await loginWithRedirect({ appState: { target: router.currentRoute.value.fullPath } })
    return
  }
  planLoading.value = true
  planError.value = ''
  planSuccess.value = ''
  try {
    await addMealPlanEntry(getAccessTokenSilently, {
      productId: product.value.id,
      weekday: dayCode,
      servings: desiredServings.value
    })
    planOpen.value = false
    const label = weekdays.find((d) => d.code === dayCode)?.label || 'Tag'
    planSuccess.value = `Zum Wochenplan hinzugefügt/aktualisiert (${label}).`
  } catch (e) {
    planError.value = e?.message || 'Konnte nicht speichern.'
  } finally {
    planLoading.value = false
  }
}
</script>

<template>
  <div class="container py-5">
    <!-- Laden -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <!-- Fehler -->
    <div v-else-if="error" class="text-center py-5 text-white">
      <h2>Oje!</h2>
      <p>{{ error }}</p>
      <router-link :to="backTo" class="text-white">Zurück zur Übersicht</router-link>
    </div>

    <!-- Inhalt -->
    <div v-else-if="product" class="detail-card bg-white p-4 shadow-sm mx-auto">
      <div class="detail-actions">
        <router-link :to="backTo" class="text-decoration-none">
          <Button variant="secondary" class="btn-sm">Zurück zur Übersicht</Button>
        </router-link>
        <button
          class="favorite-fab"
          :class="{ active: isFavorite, disabled: !isAuthenticated }"
          type="button"
          title="Favorit"
          @click="toggleFavorite"
        >
          &#9829;
        </button>
      </div>

      <div class="row g-4">
        <div class="col-md-6">
          <img
            :src="product.image"
            :alt="product.title"
            class="img-fluid w-100 detail-image shadow-sm"
          />

          <div v-if="product.categories && product.categories.length" class="mt-3">
            <div class="d-flex flex-wrap gap-2">
              <span
                v-for="cat in product.categories"
                :key="cat"
                class="badge bg-light text-dark px-3 py-2 rounded-pill border"
              >
                {{ cat }}
              </span>
            </div>
          </div>

          <div class="mt-4 ingredients-row">
            <div class="ingredients-col">
              <h5 class="mb-3">Zutaten</h5>
              <ul v-if="scaledIngredients.length" class="ingredient-list">
                <li v-for="(ing, idx) in scaledIngredients" :key="idx">
                  <span v-if="ing.amount" class="fw-semibold ingredient-amount">{{ ing.amount }}</span>
                  <span>{{ ing.name }}</span>
                </li>
              </ul>
              <p v-else class="text-muted small mb-0">Keine Zutaten angegeben.</p>
            </div>

            <div class="servings-control">
              <label class="form-label small text-muted mb-0">Portionen</label>
              <input
                v-model.number="desiredServings"
                type="number"
                min="1"
                class="form-control rounded-pill px-3 servings-input"
              />
            </div>
          </div>
        </div>

        <div class="col-md-6 d-flex flex-column">
          <div>
            <h1 class="fw-bold mb-2 text-dark title-offset">{{ product.title }}</h1>

            <div class="text-muted mb-4">
              Zubereitung: <strong>{{ product.time }}</strong>
            </div>

            <div class="d-flex flex-wrap align-items-center gap-3 mb-3 plan-control">
              <div class="plan-dropdown">
              <button
                class="btn btn-outline-secondary pill btn-olive-outline px-4"
                type="button"
                @click="planOpen = !planOpen"
               :disabled="planLoading"
               >
               Zum Wochenplan hinzufügen
              </button>

                <div v-if="planOpen" class="plan-menu shadow-sm">
                  <button
                    v-for="day in weekdays"
                    :key="day.code"
                    class="plan-item"
                    type="button"
                    @click="addToPlan(day.code)"
                  >
                    {{ day.label }}
                  </button>
                </div>
              </div>
            </div>

            <div v-if="planError" class="text-danger small mb-2">
              {{ planError }}
            </div>
          </div>

          <div class="mb-4">
            <h5 class="mb-3">Zubereitung</h5>
            <div v-if="product.steps && product.steps.length" class="steps">
              <div v-for="(step, idx) in product.steps" :key="idx" class="step-item">
                <div class="fw-semibold mb-1">
                  {{ step.title?.trim() || `Schritt ${idx + 1}` }}
                </div>
                <div class="instructions-text mb-2">
                  {{ step.text }}
                </div>
              </div>
            </div>
            <p v-else class="instructions-text mb-0">
              {{ product.description }}
            </p>
          </div>

          <div class="mt-auto">
            <div v-if="canManage" class="mt-4 pt-4 border-top">
              <p class="text-muted small mb-2">Rezept verwalten</p>

              <div class="d-flex flex-column gap-2">
                <router-link :to="'/edit/' + product.id" class="text-decoration-none">
                  <Button variant="secondary" class="btn-sm w-100">
                    Rezept bearbeiten
                  </Button>
                </router-link>

                <!-- SCHLICHTER DELETE BUTTON -->
                <button
                  class="delete-soft-btn w-100"
                  type="button"
                  @click="deleteRecipe"
                  :disabled="deleting"
                >
                  <span v-if="deleting">Wird entfernt.</span>
                  <span v-else>Rezept entfernen</span>
                </button>

                <div v-if="deleteError" class="alert alert-danger py-2 mb-0">
                  {{ deleteError }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RecipeReviews :productId="product.id" />
    </div>
  </div>

  <div v-if="planSuccess" class="plan-toast">
    {{ planSuccess }}
  </div>
</template>

<style scoped>
.detail-card {
  border-radius: 30px;
  max-width: 1100px;
  position: relative;
}

.detail-image {
  border-radius: 20px;
  object-fit: cover;
  min-height: 300px;
  max-height: 500px;
}

.instructions-text {
  color: #555;
  line-height: 1.5;
  white-space: pre-line;
}

.ingredient-list {
  padding-left: 18px;
  margin-bottom: 0;
  color: #555;
}

.ingredient-amount {
  margin-right: 6px;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.step-item {
  padding: 12px 14px;
  border: 1px solid #eee;
  border-radius: 16px;
  background: #fafaf3;
}

/* SCHLICHTER DELETE BUTTON - COOKED STYLE */
.delete-soft-btn {
  background-color: transparent;
  border: 1px solid rgba(107, 106, 25, 0.4);
  color: #6b6a19;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.delete-soft-btn:hover {
  background-color: rgba(107, 106, 25, 0.08);
}

.delete-soft-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.detail-actions {
  position: absolute;
  top: 18px;
  right: 18px;
  display: flex;
  gap: 10px;
  align-items: center;
  z-index: 2;
}

.favorite-fab {
  border: 0;
  background: #f4f4ef;
  color: #b7b7b7;
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 1.2rem;
  line-height: 1;
  transition: transform 0.15s ease, background 0.15s ease, color 0.15s ease;
}

.favorite-fab:hover {
  transform: translateY(-1px);
  color: #d66b6b;
}

.favorite-fab.active {
  color: #e03a3a;
  background: #ffe6e6;
}

.favorite-fab.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.title-offset {
  margin-top: 36px;
}

.ingredients-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.ingredients-col {
  flex: 1;
  min-width: 0;
}

.servings-control {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
}

.servings-input {
  max-width: 64px;
  text-align: center;
}

.plan-dropdown {
  position: relative;
}

.plan-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 220px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 16px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 3;
}

.plan-item {
  border: 0;
  background: #f6f6ef;
  color: #333;
  border-radius: 999px;
  padding: 6px 12px;
  text-align: left;
}

.plan-item:hover {
  background: #edeedc;
}

.plan-toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  padding: 10px 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  color: #333;
  font-weight: 600;
  z-index: 20;
}
/* gleiche Button-Styles wie im Profil */
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

</style>
