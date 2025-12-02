<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { products } from '@/data.js'
// Wir nutzen deinen schicken Button!
import Button from '@/components/Button.vue' 

const route = useRoute()
const product = computed(() => {
  const id = parseInt(route.params.id)
  return products.find(p => p.id === id)
})
</script>

<template>
  <div class="container py-5">
    <div v-if="product" class="detail-card bg-white p-4 p-md-5 shadow-sm mx-auto">
      
      <div class="row align-items-center g-5">
        <div class="col-md-6">
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
            <span>⏱ Zubereitungszeit: <strong>{{ product.time }}</strong></span>
          </div>
          
          <p class="lead text-secondary mb-5" style="line-height: 1.8;">
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

    <div v-else class="text-center py-5 text-white">
      <h2>Produkt nicht gefunden 😢</h2>
      <router-link to="/" class="text-white">Zurück nach Hause</router-link>
    </div>
  </div>
</template>

<style scoped>
/* Die Box für die Details */
.detail-card {
  border-radius: 40px; /* Schön rund wie deine Karten */
  max-width: 1100px;
}

/* Das Bild */
.detail-image {
  border-radius: 30px;
  object-fit: cover;
}
</style>