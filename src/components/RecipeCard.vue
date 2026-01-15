<script setup>
import { computed, onMounted, ref } from 'vue'
import Button from './Button.vue'
import { loadCategoryMap, mapCategoryLabels } from '@/services/categoryService'

const props = defineProps({
  product: Object,
  isFavorite: Boolean,
  canFavorite: Boolean
})

defineEmits(['show-details', 'toggle-favorite'])

const stars = [1, 2, 3, 4, 5]

const categoryMap = ref({})

onMounted(async () => {
  categoryMap.value = await loadCategoryMap()
})

function isStarActive(rating, value) {
  if (!rating) return false
  return rating >= value - 0.25
}

function formatRating(value) {
  if (!value) return '0.0'
  return Number(value).toFixed(1)
}

const categories = computed(() => {
  const codes = Array.isArray(props.product?.categoryCodes) ? props.product.categoryCodes : null
  if (codes && codes.length) {
    return mapCategoryLabels(codes, categoryMap.value)
  }
  const raw = props.product?.categories ?? props.product?.category ?? []
  if (Array.isArray(raw)) return raw.filter(Boolean)
  if (!raw) return []
  return [raw]
})
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
      <div class="category-row mb-2">
        <div class="d-flex flex-wrap gap-2">
          <span
            v-for="cat in categories"
            :key="cat"
            class="badge bg-light text-dark"
          >
            {{ cat }}
          </span>
        </div>
        <button
          class="favorite-btn"
          :class="{ active: isFavorite, disabled: !canFavorite }"
          type="button"
          :title="canFavorite ? 'Favorit' : 'Bitte einloggen'"
          @click="$emit('toggle-favorite', product)"
        >
          &#9829;
        </button>
      </div>
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

.favorite-btn {
  border: 0;
  background: #f4f4ef;
  color: #b7b7b7;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 1.1rem;
  line-height: 1;
  transition: transform 0.15s ease, background 0.15s ease, color 0.15s ease;
}

.favorite-btn:hover {
  transform: translateY(-1px);
  color: #d66b6b;
}

.favorite-btn.active {
  color: #e03a3a;
  background: #ffe6e6;
}

.favorite-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.category-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
</style>
