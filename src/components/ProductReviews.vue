<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { authFetch, getApiRoot } from '@/services/apiAuth'

const props = defineProps({
  productId: {
    type: Number,
    required: true
  }
})

const reviews = ref([])
const loading = ref(true)
const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()

// Formular-States
const userName = ref('')
const stars = ref(5)
const hoverStars = ref(0)
const starValues = [1, 2, 3, 4, 5]
const text = ref('')
const submitLoading = ref(false)
const submitError = ref('')
const submitSuccess = ref('')

// Funktion zum Laden der Reviews
async function fetchReviews() {
  loading.value = true
  try {
    const apiRoot = getApiRoot()

    const res = await fetch(`${apiRoot}/review/product/${props.productId}`)

    if (!res.ok) {
      reviews.value = []
      return
    }

    const data = await res.json()
    reviews.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Fehler beim Laden der Reviews', e)
    reviews.value = []
  } finally {
    loading.value = false
  }
}

async function submitReview() {
  submitError.value = ''
  submitSuccess.value = ''

  if (!isAuthenticated.value) {
    await loginWithRedirect({
      appState: { targetUrl: `/product/${props.productId}` }
    })
    return
  }

  // Frontend-Validierung (schnell & einfach)
  if (!userName.value.trim()) {
    submitError.value = 'Bitte einen Namen eingeben.'
    return
  }
  const s = Number(stars.value)
  if (Number.isNaN(s) || s < 1 || s > 5) {
    submitError.value = 'Bitte Sterne zwischen 1 und 5 wählen.'
    return
  }
  if (!text.value.trim() || text.value.trim().length < 3) {
    submitError.value = 'Bitte einen kurzen Text (mind. 3 Zeichen) eingeben.'
    return
  }

  submitLoading.value = true

  try {
    const apiRoot = getApiRoot()

    const payload = {
      userName: userName.value.trim(),
      stars: s,
      text: text.value.trim(),
      product: { id: props.productId }
    }

    const res = await authFetch(getAccessTokenSilently, `${apiRoot}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) throw new Error(await res.text())

    // Reset + reload
    text.value = ''
    stars.value = 5
    submitSuccess.value = 'Bewertung gespeichert!'
    await fetchReviews()
  } catch (e) {
    console.error('Fehler beim Speichern der Review', e)
    submitError.value = 'Bewertung konnte nicht gespeichert werden.'
  } finally {
    submitLoading.value = false
  }
}

// Beim Start laden
onMounted(fetchReviews)

// Falls sich die ID ändert, neu laden
watch(
  () => props.productId,
  () => {
    fetchReviews()
  }
)
</script>

<template>
  <div class="reviews-section mt-5 pt-5 border-top">
    <h3 class="mb-4 fw-bold">Bewertungen ({{ reviews.length }})</h3>

    <!-- Formular: Bewertung abgeben -->
    <div class="p-3 p-md-4 rounded-4 mb-4 border bg-white">
      <h5 class="fw-bold mb-3">Bewertung abgeben</h5>

      <div v-if="!isAuthenticated" class="alert alert-light border">
        Bitte anmelden, um zu bewerten.
        <button class="btn btn-outline-secondary ms-2" type="button" @click="submitReview">
          Login
        </button>
      </div>

      <div v-else>
        <div v-if="submitError" class="alert alert-danger py-2">{{ submitError }}</div>
        <div v-if="submitSuccess" class="alert alert-success py-2">{{ submitSuccess }}</div>

        <div class="row g-2">
          <div class="col-12 col-md-5">
            <input v-model="userName" class="form-control" type="text" placeholder="Dein Name" />
          </div>

          <div class="col-12 col-md-3">
            <div class="star-input">
              <button
                v-for="s in starValues"
                :key="s"
                type="button"
                class="star-btn"
                :class="{ active: (hoverStars || stars) >= s }"
                @mouseenter="hoverStars = s"
                @mouseleave="hoverStars = 0"
                @click="stars = s"
                :aria-label="`${s} Sterne`"
              >
                &#9733;
              </button>
            </div>
          </div>

          <div class="col-12">
            <textarea
              v-model="text"
              class="form-control"
              rows="3"
              placeholder="Kurz schreiben, wie es dir geschmeckt hat."
            ></textarea>
          </div>

          <div class="col-12 d-flex justify-content-end">
            <button
              class="btn btn-outline-secondary"
              type="button"
              @click="submitReview"
              :disabled="submitLoading"
            >
              {{ submitLoading ? 'Speichern.' : 'Bewertung speichern' }}
            </button>
          </div>
        </div>
      </div>
    </div>

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
          <!-- Avatar -->
          <div
            class="avatar bg-white text-secondary fw-bold rounded-circle d-flex align-items-center justify-content-center me-2 shadow-sm"
          >
            {{ review.userName?.charAt(0)?.toUpperCase() }}
          </div>

          <div>
            <h6 class="m-0 fw-bold text-dark">{{ review.userName }}</h6>
            <div class="review-stars">
              <span
                v-for="s in starValues"
                :key="s"
                class="star"
                :class="{ active: review.stars >= s }"
              >
                &#9733;
              </span>
            </div>
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

.star-input {
  display: inline-flex;
  gap: 4px;
}

.star-btn {
  background: transparent;
  border: none;
  padding: 0;
  font-size: 1.1rem;
  color: #d3d3d3;
  cursor: pointer;
}

.star-btn.active {
  color: #6b6a19;
}

.review-stars {
  display: inline-flex;
  gap: 2px;
}

.star {
  color: #d3d3d3;
  font-size: 0.9rem;
}

.star.active {
  color: #6b6a19;
}
</style>
