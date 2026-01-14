<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import Button from '@/components/Button.vue'
import { fetchMealPlan, deleteMealPlanEntry } from '@/services/mealPlanService'
import { fetchShoppingChecks, setShoppingCheck } from '@/services/shoppingService'
import { scaleIngredientAmount } from '@/services/ingredientScale'

const { getAccessTokenSilently } = useAuth0()

const entries = ref([])
const checks = ref(new Set())
const loading = ref(false)
const error = ref('')

function makeKey(productId, name, amount) {
  return `${productId}::${name || ''}::${amount || ''}`
}

const grouped = computed(() => {
  const map = new Map()
  for (const entry of entries.value) {
    const product = entry.product
    if (!product) continue
    const current = map.get(product.id) || {
      product,
      totalServings: 0
    }
    current.totalServings += entry.servings || product.servings || 1
    map.set(product.id, current)
  }

  return Array.from(map.values()).map((group) => {
    const base = group.product.servings || 1
    const factor = group.totalServings / base
    const items = (group.product.ingredients || []).map((ing) => {
      const amount = scaleIngredientAmount(ing.amount, factor)
      const key = makeKey(group.product.id, ing.name, amount)
      return {
        name: ing.name,
        amount,
        key,
        checked: checks.value.has(key)
      }
    })

    const sorted = items
      .slice()
      .sort((a, b) => (a.checked === b.checked ? 0 : a.checked ? 1 : -1))

    return {
      product: group.product,
      totalServings: group.totalServings,
      items: sorted
    }
  })
})

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const [plan, checkList] = await Promise.all([
      fetchMealPlan(getAccessTokenSilently),
      fetchShoppingChecks(getAccessTokenSilently)
    ])
    entries.value = plan
    checks.value = new Set(checkList.map((c) => c.ingredientKey))
  } catch (e) {
    error.value = 'Einkaufsliste konnte nicht geladen werden.'
  } finally {
    loading.value = false
  }
}

async function toggleCheck(item, productId) {
  const checked = !checks.value.has(item.key)
  try {
    await setShoppingCheck(getAccessTokenSilently, {
      productId,
      ingredientKey: item.key,
      checked
    })
    if (checked) {
      checks.value.add(item.key)
    } else {
      checks.value.delete(item.key)
    }
    checks.value = new Set(checks.value)
  } catch (e) {
    error.value = e?.message || 'Konnte Eintrag nicht aktualisieren.'
  }
}

async function removeRecipe(productId) {
  const targets = entries.value.filter((e) => e.product?.id === productId)
  if (!targets.length) return
  try {
    await Promise.all(
      targets.map((entry) => deleteMealPlanEntry(getAccessTokenSilently, entry.id))
    )
    await loadData()
  } catch (e) {
    error.value = e?.message || 'Konnte Rezept nicht entfernen.'
  }
}

onMounted(loadData)
</script>

<template>
  <div class="container py-5">
    <div class="list-card bg-white shadow-sm p-4 p-md-5 mx-auto">
      <div class="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-4">
        <h1 class="fw-bold mb-0">Einkaufsliste</h1>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary pill btn-olive-outline" type="button" @click="loadData">
            Neu laden
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-muted">Lade Einkaufsliste...</div>
      <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

      <div v-else-if="grouped.length === 0" class="text-muted">
        Keine Einträge im Wochenplan.
      </div>

      <div v-else class="d-flex flex-column gap-4">
        <div v-for="group in grouped" :key="group.product.id" class="recipe-block">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h4 class="fw-bold mb-0">{{ group.product.title }}</h4>
            <div class="d-flex align-items-center gap-2">
              <span class="text-muted small">
                Portionen: {{ group.totalServings }}
              </span>
              <button
                class="btn btn-sm btn-outline-secondary pill btn-olive-outline"
                type="button"
                @click="removeRecipe(group.product.id)"
              >
                Entfernen
              </button>
            </div>
          </div>

          <ul class="list-unstyled mb-0">
            <li
              v-for="item in group.items"
              :key="item.key"
              class="d-flex align-items-start gap-2 list-item"
            >
              <input
                class="form-check-input mt-1 shopping-check"
                type="checkbox"
                :checked="item.checked"
                @change="toggleCheck(item, group.product.id)"
              />
              <div :class="{ checked: item.checked }">
                <span v-if="item.amount" class="fw-semibold amount">{{ item.amount }}</span>
                <span>{{ item.name }}</span>
              </div>
            </li>
          </ul>
        </div>
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
.list-card {
  max-width: 900px;
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

.recipe-block {
  border: 1px solid #eee;
  border-radius: 18px;
  padding: 16px 18px;
  background: #fafaf3;
}

.list-item {
  padding: 6px 0;
}

.checked {
  text-decoration: line-through;
  opacity: 0.6;
}

.amount {
  margin-right: 8px;
}

.shopping-check {
  accent-color: #6b6a19;
  border-color: #6b6a19;
}

.shopping-check:checked {
  background-color: #6b6a19 !important;
  border-color: #6b6a19 !important;
}

.shopping-check:focus {
  box-shadow: 0 0 0 0.2rem rgba(107, 106, 25, 0.15);
}
</style>
