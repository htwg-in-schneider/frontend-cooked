<script setup>
import { RouterView } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
</script>

<template>
  <Navbar />

  <RouterView />

  <Footer />
</template>

<style>
body {
  background: linear-gradient(to bottom, #bab86c 0%, #bab86c 15%, #f5f5bc 100%);
  
  min-height: 100vh; 
  
  margin: 0;
  background-attachment: fixed;
}
</style>