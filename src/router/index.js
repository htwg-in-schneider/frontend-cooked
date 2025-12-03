// WICHTIG: Diese Zeile hat gefehlt oder war unvollständig!
import { createRouter, createWebHistory } from 'vue-router'

// Deine Views importieren
import ProductCatalog from '../views/ProductCatalog.vue'
import ProductDetail from '../views/ProductDetail.vue'
import CreateProduct from '../views/CreateProduct.vue'
import EditProduct from '../views/EditProduct.vue'
import UserProfile from '../views/UserProfile.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ProductCatalog
    },
    {
      path: '/product/:id',
      name: 'product-detail',
      component: ProductDetail
    },
    {
      path: '/create',
      name: 'create-product',
      component: CreateProduct
    },
    {
      path: '/edit/:id',
      name: 'edit-product',
      component: EditProduct
    },
    {
      path: '/profile',
      name: 'user-profile',
      component: UserProfile
    }
  ]
})

export default router