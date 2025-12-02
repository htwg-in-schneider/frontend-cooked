<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { products } from '@/data.js'
import Button from '@/components/Button.vue'

const route = useRoute()

const product = computed(() => {
  const id = parseInt(route.params.id)
  return products.find(p => p.id === id)
})
</script>

<template>
  <div class="container py-5" v-if="product">
    <div class="row align-items-center">
      <div class="col-md-6 mb-4">
        <img :src="product.image" :alt="product.title" class="img-fluid rounded-4 shadow" />
      </div>
      
      <div class="col-md-6">
        <div class="badge bg-secondary mb-2">{{ product.category }}</div>
        <h1 class="display-5 fw-bold">{{ product.title }}</h1>
        <p class="text-muted fs-5">⏱ Zubereitung: {{ product.time }}</p>
        <p class="lead my-4">{{ product.description }}</p>
        
        <router-link to="/" class="text-decoration-none">
          <Button variant="secondary">← Zurück zur Übersicht</Button>
        </router-link>
      </div>
    </div>
  </div>

  <div v-else class="container py-5 text-center">
    <h2>Produkt nicht gefunden 😢</h2>
    <router-link to="/">Zurück nach Hause</router-link>
  </div>
</template>