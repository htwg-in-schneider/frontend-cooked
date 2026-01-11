<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import ProductCard from '@/components/ProductCard.vue'
import Button from '@/components/Button.vue'
import { fetchFavorites, removeFavorite } from '@/services/favoritesService'
import { getApiRoot } from '@/services/apiAuth'
import { loadCategoryMap, mapCategoryLabels } from '@/services/categoryService'

const router = useRouter()
const { getAccessTokenSilently } = useAuth0()

const products = ref([])
const favoriteIds = ref(new Set())
const loading = ref(true)
const error = ref('')

async function loadFavorites() {
  loading.value = true
  error.value = ''

  try {
    const apiRoot = getApiRoot()

    const data = await fetchFavorites(getAccessTokenSilently)
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
          image: recipe.imageUrl,
          description: recipe.description,
          ratingAvg,
          ratingCount
        }
      })
    )

    products.value = enriched
    favoriteIds.value = new Set(enriched.map(p => p.id))
  } catch (e) {
    console.error(e)
    error.value = 'Konnte Favoriten nicht laden.'
  } finally {
    loading.value = false
  }
}

function goToDetail(product) {
  router.push({ name: 'product-detail', params: { id: product.id } })
}

async function toggleFavorite(product) {
  if (!product?.id) return
  try {
    await removeFavorite(getAccessTokenSilently, product.id)
    favoriteIds.value.delete(product.id)
    favoriteIds.value = new Set(favoriteIds.value)
    products.value = products.value.filter(p => p.id !== product.id)
  } catch (e) {
    console.error(e)
  }
}

onMounted(loadFavorites)
</script>

<template>
  <div class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <h2 class="fw-bold mb-0">Favoriten</h2>
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
      <p class="fs-5 mb-3">Noch keine Favoriten gespeichert.</p>
      <router-link to="/" class="text-decoration-none">
        <Button variant="accent">Rezepte entdecken</Button>
      </router-link>
    </div>

    <div v-else class="row g-4">
      <div class="col-12 col-md-6 col-lg-4" v-for="product in products" :key="product.id">
        <ProductCard
          :product="product"
          :is-favorite="favoriteIds.has(product.id)"
          :can-favorite="true"
          @show-details="goToDetail"
          @toggle-favorite="toggleFavorite"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.pill {
  border-radius: 999px;
}
</style>
