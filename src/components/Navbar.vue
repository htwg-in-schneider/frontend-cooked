<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function waitForEl(selector, timeoutMs = 2000) {
  return new Promise((resolve) => {
    const start = performance.now()
    const tick = () => {
      const el = document.querySelector(selector)
      if (el) return resolve(el)
      if (performance.now() - start > timeoutMs) return resolve(null)
      requestAnimationFrame(tick)
    }
    tick()
  })
}

async function scrollToHash(hash) {
  const targetHash = hash.startsWith('#') ? hash : `#${hash}`

  if (router.currentRoute.value.path !== '/' || router.currentRoute.value.hash !== targetHash) {
    await router.push({ path: '/', hash: targetHash })
  }

  const el = await waitForEl(targetHash, 3000)
  if (el) {
    const y = el.getBoundingClientRect().top + window.pageYOffset - 80
    window.scrollTo({ top: y, behavior: 'auto' })
  }
}
</script>

<template>
  <nav class="navbar navbar-expand-lg">
    <div class="container-fluid px-5 d-flex align-items-center justify-content-between">
        <router-link to="/">
          <img class="brand-logo" src="@/assets/logo.png" alt="Cooked Logo" />
        </router-link>
        
        <div class="d-flex flex-wrap gap-2 ms-auto">
          <router-link to="/" class="button" exact-active-class="active">
            Home
          </router-link>
          <button class="button" type="button" @click="scrollToHash('#recipes')">Kategorien</button>
          <button class="button" type="button" @click="scrollToHash('#kontakt')">Kontakt</button>

          <router-link to="/about" class="button" active-class="active">Über uns</router-link>

          
          <router-link to="/profile" class="button" active-class="active">
            Profil
          </router-link>
        </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background-color: transparent; 
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.brand-logo {
  height: 70px;
  transition: transform 0.2s;
}

.brand-logo:hover {
  transform: scale(1.05);
}

.button {
  text-decoration: none;
  background: transparent;
  border: 0;
  color: white;
  font-weight: 500;
  padding: 8px 20px;
  border-radius: 20px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.active {
  background-color: #6b6a19;
  color: white;
}
</style>
