import { createRouter, createWebHistory } from 'vue-router'

import ProductCatalog from '../views/ProductCatalog.vue'
import ProductDetail from '../views/ProductDetail.vue'
import CreateProduct from '../views/CreateProduct.vue'
import EditProduct from '../views/EditProduct.vue'
import UserProfile from '../views/UserProfile.vue'
import MyRecipes from '../views/MyRecipes.vue'
import Favorites from '../views/Favorites.vue'
import Kontakt from '../views/Kontakt.vue'
import Impressum from '../views/Impressum.vue'
import Datenschutz from '../views/Datenschutz.vue'
import AdminUsers from '../views/AdminUsers.vue'
import AdminTransactions from '../views/AdminTransactions.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'catalog', component: ProductCatalog },

    { path: '/kontakt', name: 'kontakt', component: Kontakt },

    { path: '/product/:id', name: 'product-detail', component: ProductDetail },
    { path: '/create', name: 'create-product', component: CreateProduct, meta: { requiresAuth: true } },
    { path: '/my-recipes', name: 'my-recipes', component: MyRecipes, meta: { requiresAuth: true } },
    { path: '/favorites', name: 'favorites', component: Favorites, meta: { requiresAuth: true } },
    { path: '/edit/:id', name: 'edit-product', component: EditProduct, meta: { requiresAuth: true } },

    // Profile muss Login erzwingen
    { path: '/profile', name: 'user-profile', component: UserProfile, meta: { requiresAuth: true } },

    { path: '/impressum', name: 'impressum', component: Impressum },
    { path: '/datenschutz', name: 'datenschutz', component: Datenschutz },

    // Admin Bereiche
    { path: '/admin/users', name: 'admin-users', component: AdminUsers, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/admin/transactions', name: 'admin-transactions', component: AdminTransactions, meta: { requiresAuth: true, requiresAdmin: true } },

    { path: '/recipes', redirect: '/' },
    { path: '/home', redirect: '/' }
  ]
})

export default router
