<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import Button from '@/components/Button.vue'
import { authFetch } from '@/services/apiAuth'

const router = useRouter()
const { getAccessTokenSilently } = useAuth0()

const defaultImage = 'https://placehold.co/600x400?text=Neues+Rezept'

const form = ref({
  title: '',
  category: '',
  prepTimeMinutes: '',
  image: '',
  instructions: ''
})

const errors = ref({
  title: '',
  category: '',
  prepTimeMinutes: '',
  instructions: '',
  general: ''
})

const categories = ref([]) // [{ value: "ASIAN", label: "Asiatisch" }, ...]

function resetErrors() {
  errors.value = {
    title: '',
    category: '',
    prepTimeMinutes: '',
    instructions: '',
    general: ''
  }
}

function validate() {
  resetErrors()

  const title = form.value.title.trim()
  const category = form.value.category.trim()
  const minutes = Number(form.value.prepTimeMinutes)
  const instructions = form.value.instructions.trim()

  let ok = true

  if (!title) {
    errors.value.title = 'Bitte gib einen Rezeptnamen ein.'
    ok = false
  } else if (title.length < 3) {
    errors.value.title = 'Der Rezeptname sollte mindestens 3 Zeichen haben.'
    ok = false
  }

  if (!category) {
    errors.value.category = 'Bitte wähle eine Kategorie aus.'
    ok = false
  }

  if (!form.value.prepTimeMinutes || Number.isNaN(minutes)) {
    errors.value.prepTimeMinutes = 'Bitte gib eine gültige Zahl in Minuten ein.'
    ok = false
  } else if (minutes <= 0) {
    errors.value.prepTimeMinutes = 'Die Zubereitungszeit muss größer als 0 sein.'
    ok = false
  } else if (minutes > 9999) {
    errors.value.prepTimeMinutes = 'Die Zubereitungszeit ist zu groß.'
    ok = false
  }

  if (!instructions) {
    errors.value.instructions = 'Bitte gib eine Zubereitung an.'
    ok = false
  } else if (instructions.length < 10) {
    errors.value.instructions = 'Die Zubereitung sollte mindestens 10 Zeichen haben.'
    ok = false
  }

  return ok
}

async function loadCategories() {
  try {
    // VITE_API_URL ist bei euch z.B. http://localhost:8081/api/recipes
    const baseUrl = import.meta.env.VITE_API_URL
    const apiRoot = baseUrl.replace(/\/(product|products|recipes)$/, '')

    // Backend: /api/category/translation liefert z.B. { ASIAN: "Asiatisch", ... }
    const res = await fetch(`${apiRoot}/category/translation`)
    if (!res.ok) throw new Error()

    const data = await res.json()
    categories.value = Object.entries(data).map(([value, label]) => ({ value, label }))
  } catch {
    // Fallback, falls der Endpoint nicht erreichbar ist
    categories.value = [
      { value: 'ASIAN', label: 'Asiatisch' },
      { value: 'ITALIAN', label: 'Italienisch' },
      { value: 'VEGETARIAN', label: 'Vegetarisch' }
    ]
  }
}

async function createProduct() {
  if (!validate()) return

  // Image default
  if (!form.value.image) {
    form.value.image = defaultImage
  }

  try {
    errors.value.general = ''

    const baseUrl = import.meta.env.VITE_API_URL

    const payload = {
      title: form.value.title.trim(),
      category: form.value.category.trim(),
      prepTimeMinutes: Number(form.value.prepTimeMinutes),
      imageUrl: form.value.image.trim(),
      // bei euch heißt es im Backend "description" (wird als Anleitung genutzt)
      description: form.value.instructions.trim()
    }

    const res = await authFetch(getAccessTokenSilently, `${baseUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const msg = await res.text()
      throw new Error(msg || 'Fehler beim Erstellen')
    }

    alert('Rezept erfolgreich erstellt!')
    router.push('/')
  } catch (e) {
    errors.value.general = 'Rezept konnte nicht erstellt werden. ' + (e?.message || '')
  }
}

onMounted(() => {
  loadCategories()
})
</script>

<template>
  <div class="container py-5">
    <div class="form-card bg-white p-5 shadow-sm mx-auto">
      <h2 class="mb-4 fw-bold">Neues Rezept erstellen</h2>

      <div v-if="errors.general" class="alert alert-danger">
        {{ errors.general }}
      </div>

      <form @submit.prevent="createProduct">
        <!-- Titel -->
        <div class="mb-3">
          <label class="form-label text-muted small">Rezept Name</label>
          <input
            v-model="form.title"
            type="text"
            class="form-control rounded-pill px-3"
            placeholder="z.B. Marry Me Chicken Ramen"
          />
          <div v-if="errors.title" class="text-danger small mt-1 ps-2">
            {{ errors.title }}
          </div>
        </div>

        <div class="row g-3 mb-3">
          <!-- Kategorie -->
          <div class="col-md-6">
            <label class="form-label text-muted small">Kategorie</label>

            <!-- Dropdown statt freiem Text -->
            <select v-model="form.category" class="form-select rounded-pill px-3">
              <option value="" disabled>Bitte wählen…</option>
              <option v-for="c in categories" :key="c.value" :value="c.value">
                {{ c.label }} ({{ c.value }})
              </option>
            </select>

            <div v-if="errors.category" class="text-danger small mt-1 ps-2">
              {{ errors.category }}
            </div>
          </div>

          <!-- Minuten -->
          <div class="col-md-6">
            <label class="form-label text-muted small">Zeit (Minuten)</label>
            <input
              v-model="form.prepTimeMinutes"
              type="number"
              class="form-control rounded-pill px-3"
              placeholder="z.B. 40"
              min="1"
            />
            <div v-if="errors.prepTimeMinutes" class="text-danger small mt-1 ps-2">
              {{ errors.prepTimeMinutes }}
            </div>
          </div>
        </div>

        <!-- Bild -->
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

        <!-- Anleitung -->
        <div class="mb-4">
          <label class="form-label text-muted small">Zubereitung</label>
          <textarea
            v-model="form.instructions"
            class="form-control rounded-4 p-3"
            rows="5"
            placeholder="Schritt für Schritt…"
          ></textarea>

          <div v-if="errors.instructions" class="text-danger small mt-1 ps-2">
            {{ errors.instructions }}
          </div>
        </div>

        <div class="d-flex gap-2">
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
.form-card {
  max-width: 700px;
  border-radius: 40px;
}

input,
textarea,
select {
  border: 1px solid #eee;
  background-color: #f9f9f9;
}

input:focus,
textarea:focus,
select:focus {
  background-color: white;
  border-color: #81801f;
  box-shadow: none;
}
</style>
