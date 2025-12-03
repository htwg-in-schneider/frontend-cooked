<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Button from '@/components/Button.vue'
import ProductReviews from '@/components/ProductReviews.vue'

const route = useRoute()
const product = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const id = route.params.id
    
    // HIER IST DIE ÄNDERUNG: Wir nutzen die Variable aus der .env Datei
    const res = await fetch(`${import.meta.env.VITE_API_URL}/recipes/${id}`)
    
    if (!res.ok) throw new Error('Rezept nicht gefunden')
    const data = await res.json()
    
    product.value = {
      id: data.id,
      title: data.name,
      category: data.cuisine,
      time: data.prepTimeMinutes + ' min',
      image: data.image,
      instructions: data.instructions 
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container py-5">
    
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else-if="error" class="text-center py-5 text-white">
      <h2>Oje! 😕</h2>
      <p>{{ error }}</p>
      <router-link to="/" class="text-white">Zurück zur Übersicht</router-link>
    </div>

    <div v-else-if="product" class="detail-card bg-white p-4 shadow-sm mx-auto">
      
      <div class="row g-4">
        <div class="col-md-6">
          <img :src="product.image" :alt="product.title" class="img-fluid w-100 detail-image shadow-sm" />
        </div>
        
        <div class="col-md-6 d-flex flex-column">
          <div>
            <div class="badge bg-light text-dark mb-2 px-3 py-2 rounded-pill border">
              {{ product.category }}
            </div>
            <h1 class="fw-bold mb-2 text-dark">{{ product.title }}</h1>
            <div class="text-muted mb-4">
              ⏱ Zubereitung: <strong>{{ product.time }}</strong>
            </div>
          </div>
          
          <h5 class="mb-3">Zubereitung:</h5>
          <ol class="instructions-list ps-3 mb-4">
            <li v-for="(step, index) in product.instructions" :key="index" class="mb-2">
              {{ step }}
            </li>
          </ol>
          
          <div class="mt-auto">
            <router-link to="/" class="text-decoration-none">
              <Button variant="accent">← Zurück zur Übersicht</Button>
            </router-link>

            <div class="mt-4 pt-4 border-top">
              <p class="text-muted small mb-2">Rezept verwalten:</p>
              <router-link :to="'/edit/' + product.id" class="text-decoration-none">
                <Button variant="secondary" class="btn-sm w-100">
                  ✎ Rezept bearbeiten
                </Button>
              </router-link>
            </div>

          </div>
        </div>
      </div>

      <ProductReviews :productId="product.id" />

    </div>
  </div>
</template>

<style scoped>
.detail-card { border-radius: 30px; max-width: 1100px; }
.detail-image { border-radius: 20px; object-fit: cover; min-height: 300px; max-height: 500px; }
.instructions-list li { color: #555; line-height: 1.5; }
</style>