<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Button from '@/components/Button.vue'

const route = useRoute()
const product = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const id = route.params.id
    const res = await fetch(`https://dummyjson.com/recipes/${id}`)
    if (!res.ok) throw new Error('Rezept nicht gefunden')
    const data = await res.json()
    
    product.value = {
      id: data.id,
      title: data.name,
      category: data.cuisine,
      time: data.prepTimeMinutes + ' min',
      image: data.image,
      description: data.instructions.join('\n\n') 
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

    <div v-else-if="product" class="detail-card bg-white p-4 p-md-5 shadow-sm mx-auto">
      <div class="row align-items-start g-5">
        
        <div class="col-md-4 offset-md-2">
          <img 
            :src="product.image" 
            :alt="product.title" 
            class="img-fluid w-100 detail-image shadow-sm" 
          />
        </div>
        
        <div class="col-md-6">
          <div class="badge bg-light text-dark mb-3 px-3 py-2 rounded-pill border">
            {{ product.category }}
          </div>
          
          <h1 class="display-5 fw-bold mb-3 text-dark">{{ product.title }}</h1>
          
          <div class="d-flex align-items-center gap-2 text-muted fs-5 mb-4">
            <span>⏱ Zubereitung: <strong>{{ product.time }}</strong></span>
          </div>
          
          <p class="lead text-secondary mb-5" style="line-height: 1.8; white-space: pre-line;">
            {{ product.description }}
          </p>
          
          <router-link to="/" class="text-decoration-none">
            <Button variant="accent">
              ← Zurück zur Übersicht
            </Button>
          </router-link>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.detail-card {
  border-radius: 40px;
  max-width: 1100px;
}
.detail-image {
  border-radius: 30px;
  object-fit: cover;
}
</style>