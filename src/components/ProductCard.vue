<script setup>
import Button from './Button.vue'

defineProps({
  product: Object
})

defineEmits(['show-details'])
</script>

<template>
  <article class="card h-100 shadow-sm border-0 cooked-card">
    <div class="p-3">
      <img
        class="square rounded-4 w-100"
        :src="product.image"
        :alt="product.title"
        style="object-fit: cover; aspect-ratio: 1/1;"
      />
    </div>
    <div class="card-body pt-2 pb-5">
      <div class="badge bg-light text-dark mb-2">{{ product.category }}</div>
      <h3 class="card-title h5">{{ product.title }}</h3>
      
      <div class="d-flex align-items-center gap-2 text-muted small mb-3">
        <span>⏱ {{ product.time }}</span>
      </div>

      <Button
        variant="accent"
        class="w-100"
        @click="$emit('show-details', product)"
      >
        Details ansehen
      </Button>

    </div>
  </article>
</template>

<style scoped>
.cooked-card {
  border-radius: 25px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.cooked-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 1rem 3rem rgba(0,0,0,.175)!important;
}
</style>