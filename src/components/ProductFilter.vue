<script setup>
import { ref, onMounted } from 'vue'
import Button from './Button.vue'
// NEU: Store importieren
import { useBannerStore } from '@/stores/banner'

const bannerStore = useBannerStore() // Store nutzen

const emit = defineEmits(['filter-change'])
const searchQuery = ref('')
const selectedCategory = ref('')
const categories = ref([])

onMounted(async () => {
  try {
    const res = await fetch('https://dummyjson.com/recipes/tags')
    const data = await res.json()
    categories.value = data
  } catch (e) {
    console.error('Fehler', e)
  }
})

function emitFilters() {
  emit('filter-change', {
    name: searchQuery.value,
    category: selectedCategory.value
  })
}

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

      <div class="col-md-5">
        <label class="form-label small text-muted fw-bold">Kategorie</label>
        <select 
          v-model="selectedCategory" 
          @change="emitFilters"
          class="form-select rounded-pill px-3 bg-light border-0"
        >
          <option value="">Alle Kategorien</option>
          <option v-for="tag in categories" :key="tag" :value="tag">
            {{ tag }}
          </option>
        </select>
      </div>

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
  margin-top: -30px; /* Normalzustand: Überlappt den Banner leicht */
  position: relative;
  z-index: 10;
  transition: margin-top 0.3s ease; /* Schöner Rutscher-Effekt */
}

/* Spezialklasse für "Banner ist weg" */
.mt-150 {
  margin-top: 120px !important; /* Viel Abstand, damit es unter der Navbar sitzt */
}
</style>