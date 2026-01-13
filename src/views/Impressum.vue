<script setup>
const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || ''
</script>

<template>
  <div class="container py-5">
    <div class="bg-white shadow-sm p-4 p-md-5 mx-auto legal-card">
      <h1 class="fw-bold mb-3">Impressum</h1>

      <p>
        Cooked (Studienprojekt)<br />
        Hochschule Konstanz<br />
        Fakultät Informatik<br />
      </p>

      <h2 class="h5 fw-bold mt-4">Kontakt</h2>
      <p v-if="contactEmail">
        E-Mail: {{ contactEmail }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.legal-card {
  max-width: 900px;
  border-radius: 30px;
}
</style>
