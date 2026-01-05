import { createRouter, createWebHistory } from 'vue-router'

import ProductCatalog from '../views/ProductCatalog.vue'
import ProductDetail from '../views/ProductDetail.vue'
import CreateProduct from '../views/CreateProduct.vue'
import EditProduct from '../views/EditProduct.vue'
import UserProfile from '../views/UserProfile.vue'
import Kontakt from '../views/Kontakt.vue'
import Impressum from '../views/Impressum.vue'
import Datenschutz from '../views/Datenschutz.vue'
import AdminUsers from '../views/AdminUsers.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Startseite = Rezepte
    { path: '/', name: 'catalog', component: ProductCatalog },

    { path: '/kontakt', name: 'kontakt', component: Kontakt },

    { path: '/product/:id', name: 'product-detail', component: ProductDetail },
    { path: '/create', name: 'create-product', component: CreateProduct },
    { path: '/edit/:id', name: 'edit-product', component: EditProduct },

    { path: '/profile', name: 'user-profile', component: UserProfile },

    { path: '/impressum', name: 'impressum', component: Impressum },
    { path: '/datenschutz', name: 'datenschutz', component: Datenschutz },

    { path: '/admin/users', name: 'admin-users', component: AdminUsers },

    // optional: falls jemand /recipes aufruft -> umleiten auf /
    { path: '/recipes', redirect: '/' },

    // optional: falls jemand /home aufruft -> umleiten auf /
    { path: '/home', redirect: '/' }
  ]
})

export default router
