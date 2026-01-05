<script setup>
import { ref, onMounted } from 'vue'
import Button from './Button.vue'
import { useBannerStore } from '@/stores/banner'

const bannerStore = useBannerStore()

// Events für den Parent
const emit = defineEmits(['filter-change'])

// Such-/Filterwerte
const searchQuery = ref('')
const selectedCategory = ref('')

// Kategorien, normalisiert auf { code, label }
const categories = ref([])

onMounted(async () => {
  try {
    // VITE_API_URL zeigt auf die Produkt-Collection, z.B.
    //  - http://localhost:8081/api/product
    //  - http://localhost:8081/api/recipes
    const productBase = import.meta.env.VITE_API_URL

    // "/api/product" oder "/api/recipes" abschneiden -> "/api"
    const apiRoot = productBase.replace(/\/(product|products|recipes)$/, '')

    const res = await fetch(`${apiRoot}/category`)

    if (!res.ok) {
      console.error('Fehler beim Laden der Kategorien:', await res.text())
      categories.value = []
      return
    }

    const data = await res.json()

    if (Array.isArray(data)) {
      if (data.length > 0 && typeof data[0] === 'string') {
        categories.value = data.map(code => ({
          code,
          label: code // Notfalls direkt Enum anzeigen
        }))
      } else {
        categories.value = data.map(item => ({
          code: item.code || item.name || item,
          label:
            item.germanName ||
            item.label ||
            item.code ||
            item.name ||
            String(item)
        }))
      }
    } else {
      categories.value = []
    }
  } catch (e) {
    console.error('Fehler beim Laden der Kategorien', e)
    categories.value = []
  }
})

// Filter nach außen geben
function emitFilters() {
  emit('filter-change', {
    name: searchQuery.value,
    category: selectedCategory.value
  })
}

// Reset-Button
function resetFilter() {
  searchQuery.value = ''
  selectedCategory.value = ''
  emitFilters()
}
</script>

<template>
  <div
    class="filter-card bg-white p-4 shadow-sm mb-5 mx-auto"
    :class="{ 'mt-150': !bannerStore.isVisible }"
  >
    <div class="row g-3 align-items-end">
      <!-- Suche -->
      <div class="col-md-5">
        <label class="form-label small text-muted fw-bold">Suche</label>
        <input
          v-model="searchQuery"
          @input="emitFilters"
          type="text"
          class="form-control rounded-pill px-3 bg-light border-0"
          placeholder="z.B. Pasta..."
        >
      </div>

      <!-- Kategorie -->
      <div class="col-md-5">
        <label class="form-label small text-muted fw-bold">Kategorie</label>
        <select
          v-model="selectedCategory"
          @change="emitFilters"
          class="form-select rounded-pill px-3 bg-light border-0"
        >
          <option value="">Alle Kategorien</option>
          <option
            v-for="tag in categories"
            :key="tag.code"
            :value="tag.code"
          >
            {{ tag.label }}
          </option>
        </select>
      </div>

      <!-- Reset Button -->
      <div class="col-md-2">
        <Button
          variant="secondary"
          class="w-100 btn-sm py-2"
          @click="resetFilter"
        >
          ↺ Reset
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-card {
  border-radius: 30px;
  max-width: 900px;
  margin-top: -30px; /* Normal: überlappt leicht den Banner */
  position: relative;
  z-index: 10;
  transition: margin-top 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08) !important;
}

/* Wenn der Banner weg ist, schieben wir den Filter runter */
.mt-150 {
  margin-top: 120px !important;
}
</style>
