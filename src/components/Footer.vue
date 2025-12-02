<script setup>
import FooterLink from './FooterLink.vue'
</script>

<template>
  <footer class="text-center py-5 footer-bg">
    
    <div class="mb-3">
      <FooterLink href="#">Impressum</FooterLink>
      <FooterLink href="#">Datenschutz</FooterLink>
      <FooterLink href="#">Kontakt</FooterLink>
    </div>

    <p class="small text-muted">
      © 2025 Cooked – Dein digitales Kochbuch
    </p>
  </footer>
</template>

<style scoped>
.footer-bg {
  border-top: 1px solid #eee;
  background-color: #f9f9f9;
  margin-top: 50px;
}
</style>