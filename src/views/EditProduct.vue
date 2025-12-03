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
  const res = await fetch(`https://dummyjson.com/recipes/${id}`)
  const data = await res.json()
  
  form.value = {
    title: data.name,
    category: data.cuisine,
    prepTimeMinutes: data.prepTimeMinutes,
    instructions: Array.isArray(data.instructions) ? data.instructions.join('\n') : data.instructions
  }
  loading.value = false
})

// UPDATE (Speichern)
async function updateProduct() {
  try {
    const res = await fetch(`https://dummyjson.com/recipes/${route.params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    if (!res.ok) throw new Error('Fehler beim Speichern')
    
    alert('Änderungen gespeichert! (Simulation)')
    router.push('/') // Zurück zur Startseite
  } catch (e) {
    alert(e.message)
  }
}

// DELETE (Löschen)
async function deleteProduct() {
  if (!confirm('Wirklich löschen?')) return

  try {
    const res = await fetch(`https://dummyjson.com/recipes/${route.params.id}`, {
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
</style>