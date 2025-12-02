<script setup>
defineProps({
  href: {
    type: String,
    required: true
  }
})
</script>

<template>
  <a :href="href" class="footer-link">
    <slot />
  </a>
</template>

<style scoped>
.footer-link {
  color: #6c757d;      /* Dezent grau */
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
  margin: 0 10px;      /* Abstand zwischen den Links */
  display: inline-block;
}

.footer-link:hover {
  color: #81801f;      /* Oliv-Farbe beim Hover */
  text-decoration: underline;
}
</style>