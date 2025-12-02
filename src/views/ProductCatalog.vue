<script setup>
import { products } from '@/data.js'
import SpecialBanner from '@/components/SpecialBanner.vue' 
import ProductCard from '@/components/ProductCard.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goToDetail(product) {
  router.push({ name: 'product-detail', params: { id: product.id } })
}
</script>

<template>
  <SpecialBanner />

  <main class="container">
    <section class="py-4">
      <h2 class="mb-4">Unsere Vorschläge</h2>
      <div class="row g-4">
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