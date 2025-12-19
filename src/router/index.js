// WICHTIG: Diese Zeile hat gefehlt oder war unvollständig!
import { createRouter, createWebHistory } from 'vue-router'

// Deine Views importieren
import ProductCatalog from '../views/ProductCatalog.vue'
import ProductDetail from '../views/ProductDetail.vue'
import CreateProduct from '../views/CreateProduct.vue'
import EditProduct from '../views/EditProduct.vue'
import UserProfile from '../views/UserProfile.vue'
import Home from '../views/Home.vue'
import Impressum from '../views/Impressum.vue'
import Datenschutz from '../views/Datenschutz.vue'
import AdminUsers from '../views/AdminUsers.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'catalog',
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
    },
    {
      path: '/home',
      name: 'home',
      component: Home
    },
    {
      path: '/impressum',
      name: 'impressum',
      component: Impressum
    },
    {
      path: '/datenschutz',
      name: 'datenschutz',
      component: Datenschutz
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: AdminUsers
    }

    



  ]
})

export default router