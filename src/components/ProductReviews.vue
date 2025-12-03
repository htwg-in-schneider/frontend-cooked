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
    // Trick: Wir nutzen den "Post Comments" Endpoint von DummyJSON
    // und tun so, als wäre die Rezept-ID eine Post-ID.
    const res = await fetch(`https://dummyjson.com/comments/post/${props.productId}`)
    
    if (!res.ok) {
      // Wenn es keine Kommentare gibt (404), lassen wir die Liste einfach leer
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

// Falls sich die ID ändert (z.B. wenn man von Rezept 1 zu 2 wechselt), neu laden
watch(() => props.productId, () => {
  fetchReviews()
})
</script>

<template>
  <div class="reviews-section mt-5 pt-5 border-top">
    <h3 class="mb-4 fw-bold">Bewertungen ({{ reviews.length }})</h3>

    <div v-if="loading" class="text-muted">Lade Bewertungen...</div>

    <div v-else-if="reviews.length === 0" class="text-muted fst-italic">
      Noch keine Bewertungen für dieses Rezept. Sei der Erste!
    </div>

    <div v-else class="review-list">
      <div v-for="review in reviews" :key="review.id" class="review-card mb-3 bg-light p-3 rounded-4">
        <div class="d-flex align-items-center mb-2">
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