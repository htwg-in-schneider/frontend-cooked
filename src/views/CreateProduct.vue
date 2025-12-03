<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from '@/components/Button.vue'

const router = useRouter()
const form = ref({
  title: '',
  category: '',
  prepTimeMinutes: '',
  image: 'https://placehold.co/600x400?text=Neues+Rezept',
  instructions: ''
})

async function createProduct() {
  try {
    const res = await fetch('https://dummyjson.com/recipes/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })

    if (!res.ok) throw new Error('Fehler beim Erstellen')
    
    alert('Produkt erfolgreich erstellt! (Simulation)')
    router.push('/')

  } catch (e) {
    alert('Fehler: ' + e.message)
  }
}
</script>

<template>
  <div class="container py-5">
    <div class="form-card bg-white p-5 shadow-sm mx-auto">
      <h2 class="mb-4 fw-bold">Neues Rezept erstellen</h2>
      
      <form @submit.prevent="createProduct">
        <div class="mb-3">
          <label class="form-label text-muted small">Rezept Name</label>
          <input v-model="form.title" type="text" class="form-control rounded-pill px-3" required />
        </div>

        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <label class="form-label text-muted small">Kategorie</label>
            <input v-model="form.category" type="text" class="form-control rounded-pill px-3" required />
          </div>
          <div class="col-md-6">
            <label class="form-label text-muted small">Zeit (Minuten)</label>
            <input v-model="form.prepTimeMinutes" type="number" class="form-control rounded-pill px-3" required />
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label text-muted small">Zubereitung</label>
          <textarea v-model="form.instructions" class="form-control rounded-4 p-3" rows="5" required></textarea>
        </div>

        <div class="d-flex gap-2">
          <router-link to="/">
            <Button variant="secondary" type="button">Abbrechen</Button>
          </router-link>
          <Button variant="accent" type="submit">Rezept speichern</Button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-card { max-width: 700px; border-radius: 40px; }
input, textarea { border: 1px solid #eee; background-color: #f9f9f9; }
</style>