<script setup>
import { RouterView } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
</script>

<template>
  <div class="app-shell">
    <Navbar />

    <main class="app-content">
      <RouterView />
    </main>

    <Footer />
  </div>
</template>

<style>
html, body {
  height: 100%;
  margin: 0;
}

body {
  background: linear-gradient(to bottom, #bab86c 0%, #bab86c 15%, #f5f5bc 100%);
  background-attachment: fixed;
  font-family: "Comfortaa", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}

.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-content {
  flex: 1;   
}
</style>
