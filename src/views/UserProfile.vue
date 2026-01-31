<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import { useAuthStore } from '@/stores/authStore'
import Button from '@/components/Button.vue'
import ProductCard from '@/components/RecipeCard.vue'
import { loadMe } from '@/services/meService'
import { authFetch, getApiRoot } from '@/services/apiAuth'
import { loadCategoryMap, mapCategoryLabels } from '@/services/categoryService'
import { fetchFavoriteIds, addFavorite, removeFavorite } from '@/services/favoritesService'
import { fetchMyRecipes } from '@/services/recipeService'
import { fetchReviewStats } from '@/services/reviewService'
import defaultAvatar from '@/assets/default_avatar.webp'

const router = useRouter()
const { user, isAuthenticated, getAccessTokenSilently, logout, loginWithRedirect } = useAuth0()
const authStore = useAuthStore()

const loadingProfile = ref(false)
const errorProfile = ref('')
const saving = ref(false)
const editMode = ref(false)

const nameInput = ref('')
const emailInput = ref('')
const avatarInput = ref('')
const bioInput = ref('')

// Meine Rezepte (unterhalb des weißen Kastens)
const myProducts = ref([])
const loadingMy = ref(false)
const errorMy = ref('')
const previewCount = 6
const previewProducts = computed(() => myProducts.value.slice(0, previewCount))

// Favoriten-State (für Herz/Like überall)
const favoriteIds = ref(new Set())

const isAdmin = computed(() => authStore.role === 'ADMIN')

const displayName = computed(() => {
  return authStore.me?.name || user.value?.name || user.value?.email || 'Profil'
})

const defaultAvatarUrl = defaultAvatar

const displayAvatar = computed(() => {
  const saved = (authStore.me?.avatarUrl || '').trim()
  if (!saved) return defaultAvatarUrl
  return saved
})


const isPlaceholderAvatar = computed(() => displayAvatar.value === defaultAvatarUrl)

const displayBio = computed(() => {
  return (authStore.me?.bio || '').toString().trim()
})

const displayEmail = computed(() => {
  return authStore.me?.email || user.value?.email || ''
})

async function ensureMeLoaded() {
  if (!isAuthenticated.value) return
  if (authStore.role) return

  try {
    loadingProfile.value = true
    errorProfile.value = ''
    authStore.setMe(await loadMe(getAccessTokenSilently))
  } catch (e) {
    console.error(e)
    errorProfile.value = 'Profil konnte nicht geladen werden.'
  } finally {
    loadingProfile.value = false
  }
}

function fillInputsFromStore() {
  nameInput.value = authStore.me?.name || user.value?.name || ''
  emailInput.value = authStore.me?.email || user.value?.email || ''
  avatarInput.value = authStore.me?.avatarUrl || ''
  bioInput.value = authStore.me?.bio || ''
}

function doLogout() {
  authStore.clear()
  favoriteIds.value = new Set()
  logout({ logoutParams: { returnTo: window.location.origin + '/frontend-cooked/' } })
}

function startEdit() {
  editMode.value = true
  fillInputsFromStore()
}

function cancelEdit() {
  editMode.value = false
  errorProfile.value = ''
  fillInputsFromStore()
}

async function saveProfile() {
  if (!isAuthenticated.value) return
  saving.value = true
  errorProfile.value = ''

  try {
    const apiRoot = getApiRoot()

    const res = await authFetch(getAccessTokenSilently, `${apiRoot}/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: nameInput.value.trim(),
        avatarUrl: avatarInput.value.trim(),
        bio: (bioInput.value || '').toString()
      })
    })

    if (!res.ok) {
      const msg = await res.text()
      throw new Error(msg || 'Konnte Profil nicht speichern.')
    }

    const updated = await res.json()
    authStore.setMe(updated)
    editMode.value = false
  } catch (e) {
    console.error(e)
    errorProfile.value = 'Profil konnte nicht gespeichert werden.'
  } finally {
    saving.value = false
  }
}

function goToDetail(product) {
  router.push({ name: 'product-detail', params: { id: product.id }, query: { from: 'profile' } })
}

async function loadMyRecipes() {
  if (!isAuthenticated.value) return

  loadingMy.value = true
  errorMy.value = ''

  try {
    const data = await fetchMyRecipes(getAccessTokenSilently)
    const recipes = Array.isArray(data) ? data : []

    const categoryMap = await loadCategoryMap()

    const enriched = await Promise.all(
      recipes.map(async (recipe) => {
        const { ratingAvg, ratingCount } = await fetchReviewStats(recipe.id)

        const categoryCodes = Array.isArray(recipe.categories)
          ? recipe.categories
          : recipe.category
            ? [recipe.category]
            : []

        return {
          id: recipe.id,
          title: recipe.title,
          categories: mapCategoryLabels(categoryCodes, categoryMap),
          categoryCodes,
          time: recipe.prepTimeMinutes + ' min',
          durationMinutes: Number(recipe.prepTimeMinutes) || 0,
          image: recipe.imageUrl,
          description: recipe.description,
          ratingAvg,
          ratingCount
        }
      })
    )

    myProducts.value = enriched
  } catch (e) {
    console.error(e)
    errorMy.value = 'Konnte deine Rezepte nicht laden.'
    myProducts.value = []
  } finally {
    loadingMy.value = false
  }
}

async function loadFavorites() {
  if (!isAuthenticated.value) {
    favoriteIds.value = new Set()
    return
  }
  try {
    const ids = await fetchFavoriteIds(getAccessTokenSilently)
    favoriteIds.value = new Set(ids)
  } catch {
    favoriteIds.value = new Set()
  }
}

async function toggleFavorite(product) {
  if (!product?.id) return

  if (!isAuthenticated.value) {
    await loginWithRedirect({ appState: { target: router.currentRoute.value.fullPath } })
    return
  }

  const isFav = favoriteIds.value.has(product.id)
  try {
    const ids = isFav
      ? await removeFavorite(getAccessTokenSilently, product.id)
      : await addFavorite(getAccessTokenSilently, product.id)
    favoriteIds.value = new Set(ids)
  } catch (e) {
    console.error(e)
  }
}

watch(isAuthenticated, () => {
  loadFavorites()
})

onMounted(async () => {
  await ensureMeLoaded()
  fillInputsFromStore()
  loadFavorites()
  loadMyRecipes()
})
</script>

<template>
  <div class="container py-5">
    <div :class="['profile-shell', { 'profile-shell--admin': isAdmin }]">
      <div :class="['profile-layout', { 'profile-layout--admin': isAdmin }]">
        <!-- PROFIL -->
        <div
          :class="[
            'profile-card',
            'bg-white',
            'p-5',
            'shadow-sm',
            { 'mx-auto': !isAdmin }
          ]"
        >
          <div class="d-flex justify-content-end gap-2 flex-wrap profile-actions">
            <button class="btn btn-outline-secondary pill btn-olive-outline" type="button" @click="startEdit">
              Bearbeiten
            </button>
            <button class="btn btn-outline-secondary pill btn-olive-outline" type="button" @click="doLogout">
              Logout
            </button>
          </div>

          <div class="avatar-wrap">
            <div class="avatar-frame">
              <!-- Immer ein Bild: eigenes Avatar oder grauer Standard -->
              <img
                :src="displayAvatar"
                alt="Profilbild"
                :class="['avatar-img', { 'avatar-img--placeholder': isPlaceholderAvatar }]"
              />
            </div>
          </div>

          <div class="text-center mt-3">
            <h2 class="fw-bold mb-1 name-title">{{ displayName }}</h2>

            <p v-if="!editMode && displayBio" class="bio-text mx-auto mb-0">
              {{ displayBio }}
            </p>

            <p v-else-if="!editMode && !displayBio" class="bio-empty text-muted mb-0">
              Noch keine Bio. Klick auf „Bearbeiten“.
            </p>
          </div>

          <div v-if="loadingProfile" class="alert alert-light border mt-4">Lade.</div>
          <div v-else-if="errorProfile" class="alert alert-danger mt-4">{{ errorProfile }}</div>

          <div v-if="editMode" class="profile-edit mt-4">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label small text-muted">Name</label>
                <input v-model="nameInput" class="form-control rounded-pill px-3" type="text" />
              </div>

              <div class="col-md-6">
                <label class="form-label small text-muted">Profilbild URL</label>
                <input v-model="avatarInput" class="form-control rounded-pill px-3" type="text" />
              </div>

              <div class="col-12">
                <label class="form-label small text-muted">Über mich (Bio)</label>
                <textarea
                  v-model="bioInput"
                  class="form-control rounded-4 p-3"
                  rows="3"
                  maxlength="300"
                  placeholder="Schreib kurz etwas über dich..."
                ></textarea>
                <div class="small text-muted mt-1">
                  {{ (bioInput || '').length }}/300
                </div>
              </div>

              <div class="col-12" v-if="displayEmail">
                <label class="form-label small text-muted">E-Mail</label>
                <input :value="displayEmail" class="form-control rounded-pill px-3" type="text" disabled />
              </div>
            </div>

            <div class="d-flex gap-2 mt-3">
              <Button variant="secondary" type="button" @click="cancelEdit">Abbrechen</Button>
              <Button variant="accent" type="button" :disabled="saving" @click="saveProfile">
                {{ saving ? 'Speichert.' : 'Speichern' }}
              </Button>
            </div>
          </div>

          <hr class="my-4" />

          <!-- Buttons -->
          <div class="profile-cta">
            <router-link to="/week-plan" class="text-decoration-none">
              <button class="cta-btn cta-secondary" type="button">Mein Wochenplan</button>
            </router-link>

            <router-link to="/favorites" class="text-decoration-none">
              <button class="cta-btn cta-favs" type="button">Favoriten</button>
            </router-link>

            <router-link to="/shopping-list" class="text-decoration-none">
              <button class="cta-btn cta-secondary" type="button">Einkaufsliste</button>
            </router-link>

            <router-link to="/create" class="text-decoration-none">
              <button class="cta-btn cta-create" type="button">+ Neues Rezept erstellen</button>
            </router-link>
          </div>
        </div>

        <!-- ADMIN -->
        <div v-if="isAdmin" class="admin-card bg-white p-5 shadow-sm">
          <h3 class="fw-bold mb-3 admin-title">Admin Dashboard</h3>

          <div class="d-grid gap-3">
            <router-link to="/admin/transactions" class="admin-link">
              <button class="admin-btn" type="button">Aktivitätsprotokoll</button>
            </router-link>

            <router-link to="/admin/users" class="admin-link">
              <button class="admin-btn" type="button">Nutzerverwaltung</button>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Meine Rezepte -->
    <div class="mt-5">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h3 class="fw-bold mb-0">Meine Rezepte</h3>

        <router-link
          to="/my-recipes"
          class="btn btn-outline-secondary pill btn-olive-outline btn-olive-white"
        >
          Alle anzeigen
        </router-link>
      </div>

      <div v-if="loadingMy" class="text-center py-4">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <div v-else-if="errorMy" class="alert alert-danger">
        {{ errorMy }}
      </div>

      <div v-else-if="myProducts.length === 0" class="text-center py-4 text-muted">
        <p class="mb-3">Du hast noch keine Rezepte erstellt.</p>
        <router-link to="/create" class="text-decoration-none">
          <Button variant="accent">+ Erstes Rezept erstellen</Button>
        </router-link>
      </div>

      <div v-else class="row g-4">
        <div class="col-12 col-md-6 col-lg-4" v-for="product in previewProducts" :key="product.id">
          <ProductCard
            :product="product"
            :is-favorite="favoriteIds.has(product.id)"
            :can-favorite="isAuthenticated"
            @show-details="goToDetail"
            @toggle-favorite="toggleFavorite"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Layout (unverändert) */
.profile-shell {
  width: 100%;
}

.profile-shell--admin {
  max-width: 1600px;
  margin: 0 auto;
}

.profile-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 22px;
  align-items: start;
}

.profile-layout--admin {
  grid-template-columns: minmax(0, 1fr) 420px;
  column-gap: 14px;
}

.profile-card {
  max-width: 1000px;
  border-radius: 40px;
  position: relative;
  padding-top: 70px;
  width: 100%;
}

.profile-layout--admin .profile-card {
  max-width: 1180px;
}

.admin-card {
  border-radius: 40px;
  height: fit-content;
}

.pill {
  border-radius: 999px;
}

.profile-actions {
  position: absolute;
  top: 18px;
  right: 18px;
}

.avatar-wrap {
  display: flex;
  justify-content: center;
  margin-top: -120px;
  margin-bottom: 10px;
}

.avatar-frame {
  width: 150px;
  height: 150px;
  border-radius: 999px;
  overflow: hidden;
  border: 3px solid rgba(107, 106, 25, 0.2);
  background: #f6f6ef;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-img--placeholder {
  object-fit: cover;
  padding: 0;
  background: #e9ecef;

  /* Zoom + nach unten schieben */
  transform: scale(1.28) translateY(6px);
  transform-origin: center;
}



.name-title {
  line-height: 1.1;
}

.bio-text {
  max-width: 650px;
  color: rgba(0, 0, 0, 0.68);
  line-height: 1.55;
}

.bio-empty {
  opacity: 0.9;
}

/* CTA Buttons (unverändert) */
.profile-cta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  align-items: stretch;
}

.cta-btn {
  width: 100%;
  height: 56px;
  border-radius: 999px;
  font-weight: 800;
  letter-spacing: 0.2px;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 18px;
  transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;
}

.cta-favs {
  background: #f3f2df;
  color: #5f5e22;
  border-color: rgba(107, 106, 25, 0.35);
}

.cta-favs:hover {
  filter: brightness(1.02);
  box-shadow: 0 10px 18px rgba(107, 106, 25, 0.18);
  transform: translateY(-1px);
}

.cta-secondary {
  background: #f6f6ef;
  color: #5f5e22;
  border-color: rgba(107, 106, 25, 0.25);
}

.cta-secondary:hover {
  filter: brightness(1.02);
  box-shadow: 0 10px 18px rgba(107, 106, 25, 0.12);
  transform: translateY(-1px);
}

.cta-create {
  background: #6b6a19;
  color: #fff;
  border-color: #6b6a19;
}
.cta-create:hover {
  filter: brightness(1.03);
  box-shadow: 0 10px 18px rgba(107, 106, 25, 0.25);
  transform: translateY(-1px);
}

/* Admin Buttons (unverändert) */
.admin-title {
  text-align: center;
}

.admin-link {
  text-decoration: none;
  display: block;
}

.admin-btn {
  width: 100%;
  height: 56px;
  border-radius: 999px;
  font-weight: 800;
  letter-spacing: 0.2px;
  background: #f3f2df;
  color: #5f5e22;
  border: 1px solid rgba(107, 106, 25, 0.35);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 18px;
  transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;
}

.admin-btn:hover {
  filter: brightness(1.02);
  box-shadow: 0 10px 18px rgba(107, 106, 25, 0.18);
  transform: translateY(-1px);
}

/* Olive Outline */
.btn-olive-outline {
  border-color: #6b6a19 !important;
  color: #6b6a19 !important;
  background: transparent !important;
}

.btn-olive-outline.btn-olive-white {
  background: #fff !important;
}

.btn-olive-outline.btn-olive-white:hover,
.btn-olive-outline.btn-olive-white:focus {
  background: #fff !important;
  box-shadow: inset 0 0 0 999px rgba(107, 106, 25, 0.12) !important;
}

.btn-olive-outline.btn-olive-white:active {
  background: #fff !important;
  box-shadow: inset 0 0 0 999px rgba(107, 106, 25, 0.12) !important;
}

.btn-olive-outline:hover,
.btn-olive-outline:focus {
  border-color: #6b6a19 !important;
  color: #6b6a19 !important;
  background: rgba(107, 106, 25, 0.08) !important;
}

.btn-olive-outline:active {
  background: rgba(107, 106, 25, 0.12) !important;
}

/* Responsive */
@media (max-width: 992px) {
  .profile-shell--admin {
    max-width: none;
  }
  .profile-layout--admin {
    grid-template-columns: 1fr;
  }
  .profile-card {
    max-width: 1000px;
  }
}

@media (max-width: 768px) {
  .profile-actions {
    position: static;
    justify-content: center;
    margin-bottom: 8px;
  }

  .avatar-wrap {
    margin-top: 0;
  }

  .avatar-frame {
    width: 130px;
    height: 130px;
  }

  .profile-cta {
    grid-template-columns: 1fr;
  }
}
</style>
