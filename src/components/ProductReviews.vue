<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  productId: {
    type: Number,
    required: true
  }
})

const reviews = ref([])
const loading = ref(true)

// Funktion zum Laden der Reviews
async function fetchReviews() {
  loading.value = true
  try {
    // Basis-URL aus .env, z.B. http://localhost:8081/api/recipes
    const baseUrl = import.meta.env.VITE_API_URL
    // auf /api/review/product/... umbauen
    const reviewBaseUrl = baseUrl.replace('recipes', 'review/product')

    const res = await fetch(`${reviewBaseUrl}/${props.productId}`)

    if (!res.ok) {
      reviews.value = []
      return
    }

    const data = await res.json()
    // Backend liefert direkt ein Array von Reviews
    reviews.value = data
  } catch (e) {
    console.error('Fehler beim Laden der Reviews', e)
    reviews.value = []
  } finally {
    loading.value = false
  }
}

// Beim Start laden
onMounted(fetchReviews)

// Falls sich die ID ändert, neu laden
watch(() => props.productId, () => {
  fetchReviews()
})
</script>

<template>
  <div class="reviews-section mt-5 pt-5 border-top">
    <h3 class="mb-4 fw-bold">Bewertungen ({{ reviews.length }})</h3>

    <!-- Loading -->
    <div v-if="loading" class="text-muted">Lade Bewertungen...</div>

    <!-- Keine Bewertungen -->
    <div v-else-if="reviews.length === 0" class="text-muted fst-italic">
      Noch keine Bewertungen für dieses Rezept. Sei der Erste!
    </div>

    <!-- Liste der Bewertungen -->
    <div v-else class="review-list">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="review-card mb-3 bg-light p-3 rounded-4"
      >
        <div class="d-flex align-items-center mb-2">
          <!-- Kleiner Avatar (aus userName) -->
          <div
            class="avatar bg-white text-secondary fw-bold rounded-circle d-flex align-items-center justify-content-center me-2 shadow-sm"
          >
            {{ review.userName?.charAt(0)?.toUpperCase() }}
          </div>
          <div>
            <h6 class="m-0 fw-bold text-dark">{{ review.userName }}</h6>
            <small class="text-muted">★ {{ review.stars }}/5</small>
          </div>
        </div>
        <p class="mb-0 text-secondary">{{ review.text }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.avatar {
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
}
.review-card {
  border: 1px solid #f0f0f0;
}
</style>
