<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import Button from './Button.vue'
import { useBannerStore } from '@/stores/banner'

const bannerStore = useBannerStore()

// Events für den Parent
const emit = defineEmits(['filter-change'])

// Such-/Filterwerte
const searchQuery = ref('')
const selectedCategories = ref([])
const dropdownOpen = ref(false)
const categoryQuery = ref('')
const selectedSort = ref('published_desc')
const sortDropdownOpen = ref(false)

const sortOptions = [
  { value: 'published_desc', label: 'Neueste' },
  { value: 'published_asc', label: 'Älteste' },
  { value: 'duration_asc', label: 'Dauer kurz' },
  { value: 'duration_desc', label: 'Dauer lang' },
  { value: 'rating_desc', label: 'Bewertung hoch' },
  { value: 'rating_asc', label: 'Bewertung niedrig' }
]

const selectedSortLabel = computed(() => {
  const match = sortOptions.find((o) => o.value === selectedSort.value)
  return match ? match.label : 'Sortieren'
})

// Kategorien, normalisiert auf { code, label }
const categories = ref([])
const filteredCategories = computed(() => {
  const q = categoryQuery.value.trim().toLowerCase()
  if (!q) return categories.value
  return categories.value.filter((c) => {
    const hay = `${c.label} ${c.code}`.toLowerCase()
    return hay.includes(q)
  })
})

const selectedCategoryLabels = computed(() => {
  const selected = new Set(selectedCategories.value || [])
  return categories.value
    .filter((c) => selected.has(c.code))
    .map((c) => c.label || c.code)
})

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

function closeDropdown() {
  dropdownOpen.value = false
}

function toggleSortDropdown() {
  sortDropdownOpen.value = !sortDropdownOpen.value
}

function closeSortDropdown() {
  sortDropdownOpen.value = false
}

function onDocumentClick(event) {
  const categoryDrop = event.target.closest('.category-dropdown')
  const sortDrop = event.target.closest('.sort-dropdown')
  if (!categoryDrop) {
    closeDropdown()
  }
  if (!sortDrop) {
    closeSortDropdown()
  }
}

onMounted(async () => {
  document.addEventListener('click', onDocumentClick)
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

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})

// Filter nach außen geben
function emitFilters() {
  emit('filter-change', {
    name: searchQuery.value,
    categories: selectedCategories.value,
    sortBy: selectedSort.value
  })
}

function selectSort(value) {
  selectedSort.value = value
  emitFilters()
  closeSortDropdown()
}

// Reset-Button
function resetFilter() {
  searchQuery.value = ''
  selectedCategories.value = []
  categoryQuery.value = ''
  selectedSort.value = 'published_desc'
  sortDropdownOpen.value = false
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
      <div class="col-md-4">
        <label class="form-label small text-muted fw-bold">Suche</label>
        <input
          v-model="searchQuery"
          @input="emitFilters"
          type="text"
          class="form-control rounded-pill px-3 bg-light border-0 filter-input"
          placeholder="z.B. Pasta..."
        >
      </div>
      <!-- Kategorie -->
      <div class="col-md-3">
        <label class="form-label small text-muted fw-bold">Kategorie</label>
        <div class="category-dropdown">
          <button
            class="form-control rounded-pill px-3 bg-light border-0 filter-input category-toggle"
            type="button"
            @click.stop="toggleDropdown"
          >
            <span v-if="selectedCategoryLabels.length">
              {{ selectedCategoryLabels.join(', ') }}
            </span>
            <span v-else>Kategorie auswählen</span>
          </button>

          <div v-if="dropdownOpen" class="category-menu shadow-sm">
            <input
              v-model="categoryQuery"
              type="text"
              class="form-control rounded-pill px-3 mb-2"
              placeholder="Kategorie suchen"
              @input="emitFilters"
            />

            <div
              v-for="tag in filteredCategories"
              :key="tag.code"
              class="category-item"
            >
              <label class="d-flex align-items-center gap-2 mb-0">
                <input
                  v-model="selectedCategories"
                  type="checkbox"
                  class="form-check-input"
                  :value="tag.code"
                  @change="emitFilters"
                />
                <span>{{ tag.label }}</span>
              </label>
            </div>

            <div v-if="filteredCategories.length === 0" class="form-text small ps-2">
              Keine Kategorien gefunden.
            </div>
          </div>
        </div>
      </div>

            <!-- Sortieren -->
      <div class="col-md-3">
        <label class="form-label small text-muted fw-bold">Sortieren</label>
        <div class="sort-dropdown">
          <button
            class="form-control rounded-pill px-3 bg-light border-0 filter-input sort-toggle"
            type="button"
            @click.stop="toggleSortDropdown"
          >
            {{ selectedSortLabel }}
          </button>

          <div v-if="sortDropdownOpen" class="sort-menu shadow-sm">
            <button
              v-for="opt in sortOptions"
              :key="opt.value"
              type="button"
              class="sort-item"
              @click="selectSort(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
      </div>      <!-- Reset Button -->
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
.filter-input {
  height: 38px;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.filter-input:focus,
.filter-input:active {
  outline: none;
}

.filter-input:focus {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.mt-150 {
  margin-top: 120px !important;
}

.category-dropdown {
  position: relative;
}

.category-toggle {
  text-align: left;
}

.category-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 16px;
  padding: 10px 12px;
  max-height: 220px;
  overflow-y: auto;
  z-index: 5;
}

.category-item {
  padding: 6px 4px;
}

.category-menu .form-check-input {
  accent-color: #6b6a19;
  border-color: #6b6a19;
}

.category-menu .form-check-input:checked {
  background-color: #6b6a19 !important;
  border-color: #6b6a19 !important;
}

.category-menu .form-check-input:focus {
  box-shadow: 0 0 0 0.2rem rgba(107, 106, 25, 0.15);
}

.sort-dropdown {
  position: relative;
}

.sort-toggle {
  text-align: left;
}

.sort-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 16px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 5;
}

.sort-item {
  border: 0;
  background: #f6f6ef;
  color: #333;
  border-radius: 999px;
  padding: 6px 12px;
  text-align: left;
}

.sort-item:hover {
  background: #edeedc;
}
</style>
