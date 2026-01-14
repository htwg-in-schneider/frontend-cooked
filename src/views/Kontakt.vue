<script setup>
import ContactForm from '@/components/ContactForm.vue'
</script>

<template>
  <div class="container py-5">
    <div class="mx-auto home-card">
      <h1 class="fw-bold mb-2">Cooked</h1>
      <p class="text-muted mb-4">
        Dein digitales Kochbuch – entdecke und verwalte Rezepte.
      </p>

      <ContactForm />
    </div>
  </div>
</template>

<style scoped>
.home-card {
  max-width: 1000px;
}

/* Überschrift im Cooked-Stil */
h1 {
  color: #583722;
  letter-spacing: 0.5px;
}
</style>
