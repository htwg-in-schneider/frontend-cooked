<script setup>
import { ref, onMounted } from 'vue' // 'onMounted' brauchen wir zum Laden beim Start
import SpecialBanner from '@/components/SpecialBanner.vue'
import ProductCard from '@/components/ProductCard.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const products = ref([]) // Startet als leeres Array
const loading = ref(true) // Lade-Status
const error = ref(null)   // Fehler-Status

// API Abrufen
onMounted(async () => {
  try {
    // Wir holen 12 Rezepte von der echten API
    const res = await fetch('https://dummyjson.com/recipes?limit=12')
    
    if (!res.ok) throw new Error('Fehler beim Laden der Daten')
    
    const data = await res.json()
    
    // WICHTIG: Mapping!
    // Die API liefert Felder wie "name", "cuisine" etc.
    // Deine App erwartet aber "title", "category" etc.
    // Hier übersetzen wir das:
    products.value = data.recipes.map(recipe => ({
      id: recipe.id,
      title: recipe.name,
      category: recipe.cuisine,
      time: recipe.prepTimeMinutes + ' min', // Minuten anhängen
      image: recipe.image,
      description: recipe.difficulty // Im Katalog zeigen wir nur die Schwierigkeit als Kurztext
    }))
    
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

function goToDetail(product) {
  router.push({ name: 'product-detail', params: { id: product.id } })
}
</script>

<template>
  <SpecialBanner />

  <main class="container">
    <section class="py-4">
      <h2 class="mb-4">Unsere neuesten Rezepte</h2>
      
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Lädt...</span>
        </div>
      </div>

      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
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