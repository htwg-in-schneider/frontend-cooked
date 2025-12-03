<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '@/components/Button.vue'

const route = useRoute()
const router = useRouter()
const form = ref({})
const loading = ref(true)

// Daten beim Start laden
onMounted(async () => {
  const id = route.params.id
  // URL aus .env nutzen
  const baseUrl = import.meta.env.VITE_API_URL
  const res = await fetch(`${baseUrl}/recipes/${id}`)
  const data = await res.json()
  
  form.value = {
    title: data.name,
    category: data.cuisine,
    prepTimeMinutes: data.prepTimeMinutes,
    image: data.image, // WICHTIG: Das Bild laden wir jetzt auch!
    instructions: Array.isArray(data.instructions) ? data.instructions.join('\n') : data.instructions
  }
  loading.value = false
})

// UPDATE (Speichern)
async function updateProduct() {
  try {
    const baseUrl = import.meta.env.VITE_API_URL
    const res = await fetch(`${baseUrl}/recipes/${route.params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    if (!res.ok) throw new Error('Fehler beim Speichern')
    
    alert('Änderungen gespeichert! (Simulation)')
    router.push('/') 
  } catch (e) {
    alert(e.message)
  }
}

// DELETE (Löschen)
async function deleteProduct() {
  if (!confirm('Wirklich löschen?')) return

  try {
    const baseUrl = import.meta.env.VITE_API_URL
    const res = await fetch(`${baseUrl}/recipes/${route.params.id}`, {
      method: 'DELETE'
    })
    if (!res.ok) throw new Error('Fehler beim Löschen')

    alert('Produkt gelöscht! (Simulation)')
    router.push('/')
  } catch (e) {
    alert(e.message)
  }
}
</script>

<template>
  <div class="container py-5">
    <div v-if="loading" class="text-center">Lade Daten...</div>
    
    <div v-else class="form-card bg-white p-5 shadow-sm mx-auto">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold m-0">Rezept bearbeiten</h2>
        <button @click="deleteProduct" class="btn btn-outline-danger rounded-pill px-3">
          🗑 Löschen
        </button>
      </div>

      <form @submit.prevent="updateProduct">
        <div class="mb-3">
          <label class="form-label small text-muted">Name</label>
          <input v-model="form.title" class="form-control rounded-pill px-3" />
        </div>

        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <label class="form-label text-muted small">Kategorie</label>
            <input v-model="form.category" type="text" class="form-control rounded-pill px-3" />
          </div>
          <div class="col-md-6">
            <label class="form-label text-muted small">Zeit (Minuten)</label>
            <input v-model="form.prepTimeMinutes" type="number" class="form-control rounded-pill px-3" />
          </div>
        </div>
        
        <!-- HIER IST DAS BILD-FELD (wie bei Create) -->
        <div class="mb-4 p-3 bg-light rounded-4 border border-white">
          <label class="form-label text-muted small">Bild URL</label>
          <input 
            v-model="form.image" 
            type="url" 
            class="form-control rounded-pill px-3 mb-2" 
          />
          <!-- Vorschau -->
          <div v-if="form.image" class="text-center">
            <img 
              :src="form.image" 
              class="img-fluid rounded-4 shadow-sm" 
              style="height: 200px; object-fit: cover;" 
              alt="Bild Vorschau"
              @error="form.image = ''" 
            />
          </div>
        </div>
        
        <div class="mb-4">
          <label class="form-label small text-muted">Zubereitung</label>
          <textarea v-model="form.instructions" class="form-control rounded-4 p-3" rows="5"></textarea>
        </div>

        <div class="d-flex gap-2">
          <router-link to="/">
            <Button variant="secondary" type="button">Abbrechen</Button>
          </router-link>
          <Button variant="accent" type="submit">Speichern</Button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-card { max-width: 700px; border-radius: 40px; }
input, textarea { border: 1px solid #eee; background-color: #f9f9f9; }
input:focus, textarea:focus { background-color: white; border-color: #81801f; box-shadow: none; }
</style>