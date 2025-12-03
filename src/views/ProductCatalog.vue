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

// Die Haupt-Funktion zum Laden der Produkte (mit Filter-Logik)
async function fetchProducts(filters = {}) {
  loading.value = true
  error.value = null
  
  try {
    let url = 'https://dummyjson.com/recipes'
    
    // API Logik simulieren:
    if (filters.name) {
      url = `https://dummyjson.com/recipes/search?q=${filters.name}`
    } else if (filters.category) {
      url = `https://dummyjson.com/recipes/tag/${filters.category}`
    } else {
      url = 'https://dummyjson.com/recipes?limit=12'
    }

    const res = await fetch(url)
    if (!res.ok) throw new Error('Fehler beim Laden')
    const data = await res.json()
    
    // Mapping der Daten
    products.value = data.recipes.map(recipe => ({
      id: recipe.id,
      title: recipe.name,
      category: recipe.cuisine,
      time: recipe.prepTimeMinutes + ' min',
      image: recipe.image,
      description: recipe.difficulty 
    }))

  } catch (e) {
    error.value = e.message
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

function goToDetail(product) {
  router.push({ name: 'product-detail', params: { id: product.id } })
}
</script>

<template>
  <SpecialBanner />

  <main class="container">
    
    <ProductFilter @filter-change="handleFilterChange" />

    <section class="py-5">
      
      <div class="text-center mb-5">
        <h2 class="display-6 fw-bold text-dark mb-3">
          Unsere Rezepte
        </h2>
        
        <router-link to="/create" class="text-decoration-none">
          <Button variant="accent">
            + Neues Rezept
          </Button>
        </router-link>
      </div>
      
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

      <div v-else-if="products.length === 0" class="text-center py-5 text-muted">
        <p class="fs-4">Keine Rezepte gefunden 🍽️</p>
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