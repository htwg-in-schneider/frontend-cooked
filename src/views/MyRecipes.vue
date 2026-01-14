<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import ProductCard from '@/components/ProductCard.vue'
import Button from '@/components/Button.vue'
import { authFetch, getApiCollection, getApiRoot } from '@/services/apiAuth'
import { loadCategoryMap, mapCategoryLabels } from '@/services/categoryService'
import { resolveImageUrl } from '@/services/imageService'

const router = useRouter()
const { getAccessTokenSilently } = useAuth0()

const products = ref([])
const loading = ref(true)
const error = ref('')

async function loadMyRecipes() {
  loading.value = true
  error.value = ''

  try {
    const baseUrl = getApiCollection()
    const apiRoot = getApiRoot()

    const res = await authFetch(getAccessTokenSilently, `${baseUrl}/mine`)
    if (!res.ok) throw new Error('Fehler beim Laden')

    const data = await res.json()
    const recipes = Array.isArray(data) ? data : []

    const categoryMap = await loadCategoryMap()

    const enriched = await Promise.all(
      recipes.map(async recipe => {
        let ratingAvg = 0
        let ratingCount = 0
        try {
          const reviewRes = await fetch(`${apiRoot}/review/product/${recipe.id}`)
          if (reviewRes.ok) {
            const reviews = await reviewRes.json()
            if (Array.isArray(reviews) && reviews.length) {
              ratingCount = reviews.length
              ratingAvg = reviews.reduce((sum, r) => sum + (Number(r.stars) || 0), 0) / ratingCount
            }
          }
        } catch {
          // ignore rating errors
        }

        const categoryCodes = Array.isArray(recipe.categories)
          ? recipe.categories
          : recipe.category
            ? [recipe.category]
            : []

        return {
          id: recipe.id,
          title: recipe.title,
          categories: mapCategoryLabels(categoryCodes, categoryMap),
          categoryCodes,
          time: recipe.prepTimeMinutes + ' min',
          durationMinutes: Number(recipe.prepTimeMinutes) || 0,
          image: resolveImageUrl(recipe.imageUrl),
          description: recipe.description,
          ratingAvg,
          ratingCount
        }
      })
    )

    products.value = enriched
  } catch (e) {
    console.error(e)
    error.value = 'Konnte deine Rezepte nicht laden.'
  } finally {
    loading.value = false
  }
}

function goToDetail(product) {
  router.push({ name: 'product-detail', params: { id: product.id } })
}

onMounted(loadMyRecipes)
</script>

<template>
  <div class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <h2 class="fw-bold mb-0">Meine Rezepte</h2>
      <router-link to="/profile" class="btn btn-outline-secondary pill">
        Zurück zum Profil
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="products.length === 0" class="text-center py-5 text-muted">
      <p class="fs-5 mb-3">Noch keine Rezepte erstellt.</p>
      <router-link to="/create" class="text-decoration-none">
        <Button variant="accent">+ Neues Rezept erstellen</Button>
      </router-link>
    </div>

    <div v-else class="row g-4">
      <div class="col-12 col-md-6 col-lg-4" v-for="product in products" :key="product.id">
        <ProductCard :product="product" @show-details="goToDetail" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.pill {
  border-radius: 999px;
}
</style>
