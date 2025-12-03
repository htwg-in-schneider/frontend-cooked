<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from '@/components/Button.vue'

const router = useRouter()

// Das Standard-Bild merken wir uns hier
const defaultImage = 'https://placehold.co/600x400?text=Neues+Rezept'

const form = ref({
  title: '',
  category: '',
  prepTimeMinutes: '',
  image: '', // Wir starten LEER (bessere UX)
  instructions: ''
})

async function createProduct() {
  // Wenn der Nutzer kein Bild eingetragen hat, nehmen wir den Platzhalter
  if (!form.value.image) {
    form.value.image = defaultImage
  }

  try {
    // URL aus .env Variable nutzen
    const baseUrl = import.meta.env.VITE_API_URL
    const res = await fetch(`${baseUrl}/recipes/add`, {
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
        <!-- Name -->
        <div class="mb-3">
          <label class="form-label text-muted small">Rezept Name</label>
          <input v-model="form.title" type="text" class="form-control rounded-pill px-3" required />
        </div>

        <!-- Kategorie & Zeit -->
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

        <!-- HIER IST DAS BILD-FELD MIT VORSCHAU -->
        <div class="mb-4 p-3 bg-light rounded-4 border border-white">
          <label class="form-label text-muted small">Bild URL (optional)</label>
          <input 
            v-model="form.image" 
            type="url" 
            class="form-control rounded-pill px-3 mb-2" 
            placeholder="https://..." 
          />
          <div class="form-text small ps-3 mb-3">
            Lasse es leer für ein Standardbild.
          </div>

          <!-- Live Vorschau: Zeigt das Bild an, sobald eine URL drin steht -->
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

        <!-- Zubereitung -->
        <div class="mb-4">
          <label class="form-label text-muted small">Zubereitung</label>
          <textarea v-model="form.instructions" class="form-control rounded-4 p-3" rows="5" required></textarea>
        </div>

        <!-- Buttons -->
        <div class="d-flex gap-2">
          <!-- Button bricht ab und geht zurück zum Profil -->
          <router-link to="/profile">
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
input:focus, textarea:focus { background-color: white; border-color: #81801f; box-shadow: none; }
</style>