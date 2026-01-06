<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import Button from '@/components/Button.vue'
import ProductReviews from '@/components/ProductReviews.vue'
import { authFetch } from '@/services/apiAuth'

const route = useRoute()
const router = useRouter()
const { getAccessTokenSilently } = useAuth0()

const product = ref(null)
const loading = ref(true)
const error = ref(null)

const deleting = ref(false)
const deleteError = ref('')

async function loadProduct() {
  loading.value = true
  error.value = null

  try {
    const id = route.params.id
    const res = await fetch(`${import.meta.env.VITE_API_URL}/${id}`)
    if (!res.ok) throw new Error('Rezept nicht gefunden')

    const data = await res.json()

    product.value = {
      id: data.id,
      title: data.title,
      category: data.category,
      time: data.prepTimeMinutes + ' min',
      image: data.imageUrl,
      description: data.description
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function deleteRecipe() {
  if (!product.value?.id) return

  deleteError.value = ''

  const ok = confirm(
    `Möchtest du das Rezept "${product.value.title}" wirklich entfernen?\nDiese Aktion kann nicht rückgängig gemacht werden.`
  )
  if (!ok) return

  deleting.value = true

  try {
    const res = await authFetch(
      getAccessTokenSilently,
      `${import.meta.env.VITE_API_URL}/${product.value.id}`,
      { method: 'DELETE' }
    )

    if (!res.ok) throw new Error(await res.text())

    router.push('/')
  } catch (e) {
    console.error(e)
    deleteError.value = 'Rezept konnte nicht entfernt werden.'
  } finally {
    deleting.value = false
  }
}

onMounted(loadProduct)
</script>

<template>
  <div class="container py-5">
    <!-- Laden -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <!-- Fehler -->
    <div v-else-if="error" class="text-center py-5 text-white">
      <h2>Oje!</h2>
      <p>{{ error }}</p>
      <router-link to="/" class="text-white">Zurück zur Übersicht</router-link>
    </div>

    <!-- Inhalt -->
    <div v-else-if="product" class="detail-card bg-white p-4 shadow-sm mx-auto">
      <div class="row g-4">
        <div class="col-md-6">
          <img
            :src="product.image"
            :alt="product.title"
            class="img-fluid w-100 detail-image shadow-sm"
          />
        </div>

        <div class="col-md-6 d-flex flex-column">
          <div>
            <div class="badge bg-light text-dark mb-2 px-3 py-2 rounded-pill border">
              {{ product.category }}
            </div>

            <h1 class="fw-bold mb-2 text-dark">{{ product.title }}</h1>

            <div class="text-muted mb-4">
              Zubereitung: <strong>{{ product.time }}</strong>
            </div>
          </div>

          <h5 class="mb-3">Zubereitung</h5>
          <p class="instructions-text mb-4">
            {{ product.description }}
          </p>

          <div class="mt-auto">
            <router-link to="/" class="text-decoration-none">
              <Button variant="accent">Zurück zur Übersicht</Button>
            </router-link>

            <div class="mt-4 pt-4 border-top">
              <p class="text-muted small mb-2">Rezept verwalten</p>

              <div class="d-flex flex-column gap-2">
                <router-link :to="'/edit/' + product.id" class="text-decoration-none">
                  <Button variant="secondary" class="btn-sm w-100">
                    Rezept bearbeiten
                  </Button>
                </router-link>

                <!-- SCHLICHTER DELETE BUTTON -->
                <button
                  class="delete-soft-btn w-100"
                  type="button"
                  @click="deleteRecipe"
                  :disabled="deleting"
                >
                  <span v-if="deleting">Wird entfernt…</span>
                  <span v-else>Rezept entfernen</span>
                </button>

                <div v-if="deleteError" class="alert alert-danger py-2 mb-0">
                  {{ deleteError }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProductReviews :productId="product.id" />
    </div>
  </div>
</template>

<style scoped>
.detail-card {
  border-radius: 30px;
  max-width: 1100px;
}

.detail-image {
  border-radius: 20px;
  object-fit: cover;
  min-height: 300px;
  max-height: 500px;
}

.instructions-text {
  color: #555;
  line-height: 1.5;
  white-space: pre-line;
}

/* SCHLICHTER DELETE BUTTON – COOKED STYLE */
.delete-soft-btn {
  background-color: transparent;
  border: 1px solid rgba(107, 106, 25, 0.4);
  color: #6b6a19;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.delete-soft-btn:hover {
  background-color: rgba(107, 106, 25, 0.08);
}

.delete-soft-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
