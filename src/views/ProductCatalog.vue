<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SpecialBanner from '@/components/SpecialBanner.vue'
import ProductCard from '@/components/ProductCard.vue'
import ProductFilter from '@/components/ProductFilter.vue'
import Button from '@/components/Button.vue'

const router = useRouter()
const products = ref([])
const loading = ref(true)
const error = ref(null)
const activeSort = ref('published')

// Die Haupt-Funktion zum Laden der Produkte
async function fetchProducts(filters = {}) {
  loading.value = true
  error.value = null
  if (filters.sortBy) {
    activeSort.value = filters.sortBy
  }
  
  try {
    // 1. Basis-URL aus der .env Datei laden (z.B. http://localhost:8081/api/product)
    const baseUrl = import.meta.env.VITE_API_URL
    
    // Wir nutzen URLSearchParams, um die URL sauber zusammenzubauen
    const url = new URL(baseUrl)
    
    // 2. Parameter für dein Spring Boot Backend setzen
    if (filters.name) {
      url.searchParams.append('name', filters.name)
    }
    if (filters.category) {
      url.searchParams.append('category', filters.category)
    }

    // 3. Daten abrufen
    const res = await fetch(url.toString())
    if (!res.ok) throw new Error('Fehler beim Laden')
    
    const data = await res.json()

    const apiRoot = baseUrl.replace(/\/(product|products|recipes)$/, '')
    const recipes = Array.isArray(data) ? data : []

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

        return {
          id: recipe.id,
          title: recipe.title,
          category: recipe.category,
          time: recipe.prepTimeMinutes + ' min',
          durationMinutes: Number(recipe.prepTimeMinutes) || 0,
          image: recipe.imageUrl,
          description: recipe.description,
          ratingAvg,
          ratingCount
        }
      })
    )

    products.value = sortProducts(enriched, activeSort.value)

  } catch (e) {
    error.value = e.message
    console.error(e)
  } finally {
    loading.value = false
  }
}

// Initial laden
onMounted(() => {
  fetchProducts()
})

// Filter-Änderungen behandeln
function handleFilterChange(newFilters) {
  fetchProducts(newFilters)
}

function sortProducts(list, sortBy) {
  const sorted = [...list]
  if (sortBy === 'duration_asc') {
    sorted.sort((a, b) => (a.durationMinutes || 0) - (b.durationMinutes || 0))
    return sorted
  }
  if (sortBy === 'duration_desc') {
    sorted.sort((a, b) => (b.durationMinutes || 0) - (a.durationMinutes || 0))
    return sorted
  }
  if (sortBy === 'rating_asc') {
    sorted.sort((a, b) => (a.ratingAvg || 0) - (b.ratingAvg || 0))
    return sorted
  }
  if (sortBy === 'rating_desc') {
    sorted.sort((a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0))
    return sorted
  }
  if (sortBy === 'published_asc') {
    sorted.sort((a, b) => (a.id || 0) - (b.id || 0))
    return sorted
  }
  // published_desc: newest first (higher id)
  sorted.sort((a, b) => (b.id || 0) - (a.id || 0))
  return sorted
}

function goToDetail(product) {
  router.push({ name: 'product-detail', params: { id: product.id } })
}
</script>

<template>
  <SpecialBanner />

  <main class="container">
    <div class="text-center mb-4">
      <h2 class="display-6 fw-bold text-dark mb-3">
        Unsere Rezepte
      </h2>

      <router-link to="/create" class="text-decoration-none">
        <Button variant="accent">
          + Neues Rezept
        </Button>
      </router-link>
    </div>

    <div :class="{ 'mt-huge': !false }">
      <ProductFilter @filter-change="handleFilterChange" />
    </div>

    <section class="py-4">
      
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <div v-else-if="error" class="alert alert-danger">
        Verbindung fehlgeschlagen: {{ error }} <br>
        <small>Läuft das Backend auf Port 8081?</small>
      </div>

      <div v-else-if="products.length === 0" class="text-center py-5 text-muted">
        <p class="fs-4">Keine Rezepte gefunden.</p>
        <button class="btn btn-link" @click="fetchProducts()">Alle anzeigen</button>
      </div>

      <div v-else class="row g-4">
        <div 
          class="col-12 col-md-6 col-lg-4" 
          v-for="product in products" 
          :key="product.id"
        >
          <ProductCard 
            :product="product" 
            @show-details="goToDetail" 
          />
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.mt-huge { margin-top: 120px; }
</style>
