<script setup>
import Button from '@/components/Button.vue'
</script>

<template>
  <div class="container py-5">
    <div class="profile-card bg-white p-5 shadow-sm mx-auto text-center">
      
      <div class="mb-4">
        <img src="https://placehold.co/150x150/81801f/white?text=Chef" class="rounded-circle shadow-sm" alt="Profilbild">
      </div>
      
      <h2 class="fw-bold mb-3">Hallo, Küchenchef!</h2>
      <p class="text-muted mb-5">Was möchtest du heute tun?</p>

      <router-link to="/create" class="text-decoration-none">
        <Button variant="accent" class="px-4 py-3 fw-bold fs-5">
          + Neues Rezept erstellen
        </Button>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.profile-card { max-width: 600px; border-radius: 40px; }
</style>