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

// Die Haupt-Funktion zum Laden der Produkte
async function fetchProducts(filters = {}) {
  loading.value = true
  error.value = null
  
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
    
    // 4. Mapping: Backend-Daten -> Frontend-Struktur
    // WICHTIG: Dein Backend liefert direkt das Array (data), kein "recipes"-Objekt!
    products.value = data.map(recipe => ({
      id: recipe.id,
      title: recipe.title,           // Backend: title
      category: recipe.category,     // Backend: category
      time: recipe.prepTimeMinutes + ' min', // Backend: prepTimeMinutes
      image: recipe.imageUrl,        // Backend: imageUrl
      description: recipe.description // Backend: description
    }))

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

function goToDetail(product) {
  router.push({ name: 'product-detail', params: { id: product.id } })
}
</script>

<template>
  <SpecialBanner />

  <main class="container">
    
    <div :class="{ 'mt-huge': !false }"> <ProductFilter @filter-change="handleFilterChange" />
    </div>

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

      <div v-else-if="error" class="alert alert-danger">
        Verbindung fehlgeschlagen: {{ error }} <br>
        <small>Läuft das Backend auf Port 8081?</small>
      </div>

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

<style scoped>
.mt-huge { margin-top: 120px; }
</style>