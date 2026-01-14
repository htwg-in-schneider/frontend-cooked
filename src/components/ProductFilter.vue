<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import Button from './Button.vue'
import { useBannerStore } from '@/stores/banner'
import { getApiRoot } from '@/services/apiAuth'

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

const cuisineCodes = new Set([
  'ITALIAN',
  'FRENCH',
  'ASIAN',
  'AMERICAN',
  'GERMAN',
  'MEDITERRANEAN',
  'MEXICAN',
  'INDIAN',
  'MIDDLE_EASTERN',
  'THAI',
  'CHINESE',
  'JAPANESE',
  'SPANISH'
])

const dishTypeCodes = new Set([
  'BREAKFAST',
  'APPETIZER',
  'MAIN',
  'DESSERT',
  'SNACK',
  'SOUP',
  'SIDE'
])

const dietCodes = new Set(['VEGETARIAN', 'VEGAN', 'MEAT', 'SEAFOOD'])

const focusCodes = new Set(['PASTA', 'GRILL', 'DRINKS'])

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

const categoryLabelMap = computed(() => {
  const map = new Map()
  for (const c of categories.value) {
    map.set(c.code, c.label || c.code)
  }
  return map
})

const sortedCategories = computed(() => {
  return filteredCategories.value.slice().sort((a, b) => {
    const selected = new Set(selectedCategories.value || [])
    const aSelected = selected.has(a.code)
    const bSelected = selected.has(b.code)
    if (aSelected && !bSelected) return -1
    if (bSelected && !aSelected) return 1
    const aGroup = groupRank(a.code)
    const bGroup = groupRank(b.code)
    if (aGroup !== bGroup) return aGroup - bGroup
    const aLabel = (a.label || a.code).toLowerCase()
    const bLabel = (b.label || b.code).toLowerCase()
    return aLabel.localeCompare(bLabel, 'de')
  })
})

const selectedCategoryLabelText = computed(() => {
  if (!selectedCategories.value.length) {
    return ''
  }
  const map = categoryLabelMap.value
  const selectedCuisineCode = selectedCuisine.value[0]
  const cuisineLabel = selectedCuisineCode ? map.get(selectedCuisineCode) : null
  const other = selectedCategories.value
    .filter((c) => c !== selectedCuisineCode)
    .map((c) => map.get(c) || c)
    .sort((a, b) => a.localeCompare(b, 'de'))
  return [cuisineLabel, ...other].filter(Boolean).join(', ')
})

const selectedCuisine = computed(() =>
  (selectedCategories.value || []).filter((c) => cuisineCodes.has(c))
)

function groupRank(code) {
  if (dishTypeCodes.has(code)) return 1
  if (cuisineCodes.has(code)) return 2
  if (dietCodes.has(code)) return 3
  if (focusCodes.has(code)) return 4
  return 5
}

function isCuisine(code) {
  return cuisineCodes.has(code)
}

function onCategoryChange(code, event) {
  if (!isCuisine(code)) {
    return
  }
  if (event?.target?.checked) {
    selectedCategories.value = selectedCategories.value.filter(
      (c) => !isCuisine(c) || c === code
    )
  }
}

function resetCategories() {
  selectedCategories.value = []
  categoryQuery.value = ''
}

function toggleDropdown() {
  const next = !dropdownOpen.value
  dropdownOpen.value = next
  if (next) {
    sortDropdownOpen.value = false
  }
}

function closeDropdown() {
  dropdownOpen.value = false
}

function toggleSortDropdown() {
  const next = !sortDropdownOpen.value
  sortDropdownOpen.value = next
  if (next) {
    dropdownOpen.value = false
  }
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
    const apiRoot = getApiRoot()

    const res = await fetch(`${apiRoot}/category/translation`)
    if (!res.ok) {
      console.error('Fehler beim Laden der Kategorien:', await res.text())
      categories.value = []
      return
    }

    const data = await res.json()
    if (data && typeof data === 'object') {
      categories.value = Object.entries(data).map(([code, label]) => ({
        code,
        label
      }))
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

function applyFilters() {
  emitFilters()
}
</script>

<template>
  <div
    class="filter-card bg-white p-4 shadow-sm mb-5 mx-auto"
    :class="{ 'mt-150': !bannerStore.isVisible }"
  >
    <div class="row g-3 align-items-end filter-row">
      <!-- Suche -->
      <div class="col-md-4">
        <label class="form-label small text-muted fw-bold">Suche</label>
        <input
          v-model="searchQuery"
          type="text"
          class="form-control rounded-pill px-3 bg-light border-0 filter-input"
          placeholder="z.B. Pasta..."
        >
      </div>
      <!-- Kategorie -->
      <div class="col-md-4">
        <label class="form-label small text-muted fw-bold">Kategorie</label>
        <div class="category-dropdown">
          <button
            class="form-control rounded-pill px-3 bg-light border-0 filter-input category-toggle"
            type="button"
            @click.stop="toggleDropdown"
          >
            <span v-if="selectedCategoryLabels.length" class="category-label">
              {{ selectedCategoryLabelText }}
            </span>
            <span v-else>Kategorie auswählen</span>
          </button>

          <div v-if="dropdownOpen" class="category-menu shadow-sm">
            <div class="category-menu-header">
              <span class="category-menu-title">Kategorien</span>
              <button
                type="button"
                class="category-reset"
                @click.stop="resetCategories"
                aria-label="Kategorien zuruecksetzen"
              >
                &#x21BA;
              </button>
            </div>
            <div
              v-for="tag in sortedCategories"
              :key="tag.code"
              class="category-item"
            >
              <label
                class="d-flex align-items-center gap-2 mb-0"
                :class="{ 'category-disabled': selectedCuisine.length && isCuisine(tag.code) && !selectedCategories.includes(tag.code) }"
              >
                <input
                  v-model="selectedCategories"
                  type="checkbox"
                  class="form-check-input"
                  :value="tag.code"
                  @change="onCategoryChange(tag.code, $event)"
                />
                <span>{{ tag.label }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

            <!-- Sortieren -->
      <div class="col-md-2">
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
      </div>
      <div class="col-md-2 d-flex flex-column gap-2">
        <div class="reset-wrap align-self-end">
          <Button
            variant="secondary"
            class="btn-sm reset-icon-only"
            @click="resetFilter"
            aria-label="Filter zuruecksetzen"
          >
            &#x21BA;
          </Button>
        </div>
        <Button
          variant="accent"
          class="w-100 btn-sm py-2 search-button"
          @click="applyFilters"
        >
          <span class="search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="presentation" focusable="false">
              <path d="M10 2a8 8 0 0 1 6.32 12.9l4.39 4.38a1 1 0 1 1-1.42 1.42l-4.38-4.39A8 8 0 1 1 10 2zm0 2a6 6 0 1 0 0 12a6 6 0 0 0 0-12z"/>
            </svg>
          </span>
          <span>Suchen</span>
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

.filter-row {
  position: relative;
}

.category-dropdown {
  position: static;
}

.category-toggle {
  text-align: left;
  display: flex;
  align-items: center;
  gap: 6px;
}

.category-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 16px;
  padding: 12px 14px;
  max-height: 320px;
  overflow-y: auto;
  z-index: 5;
  display: grid;
  grid-template-columns: repeat(5, minmax(140px, 1fr));
  grid-template-rows: repeat(5, minmax(0, auto));
  grid-auto-flow: row;
  gap: 6px 10px;
}

.category-menu-header {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.category-menu-title {
  font-weight: 600;
  color: #333;
}

.category-reset {
  border: 0;
  background: #f6f6ef;
  color: #333;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 0.9rem;
  line-height: 1;
  cursor: pointer;
}

.category-reset:hover {
  background: #edeedc;
}

.category-item {
  padding: 4px 2px;
}

.category-item label {
  width: 100%;
}

.category-disabled {
  opacity: 0.45;
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

.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.search-icon {
  width: 16px;
  height: 16px;
  display: inline-flex;
}

.search-icon svg {
  width: 16px;
  height: 16px;
  fill: #fff;
}

.reset-wrap {
  display: flex;
  justify-content: flex-end;
}

.reset-icon-only {
  padding: 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}


</style>



