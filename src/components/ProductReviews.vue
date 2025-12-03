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
    // 1. Basis-URL aus .env holen
    const baseUrl = import.meta.env.VITE_API_URL
    
    // 2. URL zusammenbauen (DummyJSON Trick: Comments für Posts nutzen)
    const res = await fetch(`${baseUrl}/comments/post/${props.productId}`)
    
    if (!res.ok) {
      reviews.value = []
      return
    }
    
    const data = await res.json()
    reviews.value = data.comments
  } catch (e) {
    console.error('Fehler beim Laden der Reviews', e)
  } finally {
    loading.value = false
  }
}

// Beim Start laden
onMounted(() => {
  fetchReviews()
})

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
      <div v-for="review in reviews" :key="review.id" class="review-card mb-3 bg-light p-3 rounded-4">
        <div class="d-flex align-items-center mb-2">
          <!-- Kleiner Avatar (Fake) -->
          <div class="avatar bg-white text-secondary fw-bold rounded-circle d-flex align-items-center justify-content-center me-2 shadow-sm">
            {{ review.user.username.charAt(0).toUpperCase() }}
          </div>
          <div>
            <h6 class="m-0 fw-bold text-dark">{{ review.user.username }}</h6>
            <small class="text-muted">Verifizierter Genießer</small>
          </div>
        </div>
        <p class="mb-0 text-secondary">{{ review.body }}</p>
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