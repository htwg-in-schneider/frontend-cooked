<script setup>
import Button from './Button.vue'

defineProps({
  product: Object
})

defineEmits(['show-details'])

const stars = [1, 2, 3, 4, 5]

function isStarActive(rating, value) {
  if (!rating) return false
  return rating >= value - 0.25
}

function formatRating(value) {
  if (!value) return '0.0'
  return Number(value).toFixed(1)
}
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
        <span>Zeit: {{ product.time }}</span>
      </div>

      <div class="d-flex align-items-center gap-2 mb-3 rating-row">
        <div class="stars">
          <span
            v-for="s in stars"
            :key="s"
            class="star"
            :class="{ active: isStarActive(product.ratingAvg, s) }"
          >
            &#9733;
          </span>
        </div>
        <span class="text-muted small">
          {{ product.ratingCount ? formatRating(product.ratingAvg) : 'Keine Bewertungen' }}
        </span>
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

.rating-row {
  color: #6b6a19;
}

.stars {
  display: inline-flex;
  gap: 2px;
}

.star {
  color: #d3d3d3;
  font-size: 0.95rem;
  line-height: 1;
}

.star.active {
  color: #6b6a19;
}
</style>
