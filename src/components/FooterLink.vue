<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  to: {
    type: String,
    required: true
  }
})
</script>

<template>
  <RouterLink :to="to" class="footer-link">
    <slot />
  </RouterLink>
</template>

<style scoped>
.footer-link {
  color: #6c757d;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
  margin: 0 10px;
  display: inline-block;
}
.footer-link:hover {
  color: #81801f;
  text-decoration: underline;
}
</style>
