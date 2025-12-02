<script setup>
defineProps({
  variant: {
    type: String,
    default: 'accent' // Standard ist dein Olivgrün
  }
})
</script>

<template>
  <button class="btn-cooked" :class="variant">
    <slot />
  </button>
</template>

<style scoped>
/* Basis-Design für ALLE Buttons */
.btn-cooked {
  border: none;
  border-radius: 50px;
  padding: 10px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.btn-cooked:active {
  transform: scale(0.98);
}

/* VARIANTE 1: Accent (Dein Olivgrün) */
.accent {
  background-color: #81801f;
  color: white;
  box-shadow: 0 4px 6px rgba(129, 128, 31, 0.25);
}

.accent:hover {
  background-color: #bab86c; /* DEIN HOVER-TON */
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(129, 128, 31, 0.35);
}
</style>