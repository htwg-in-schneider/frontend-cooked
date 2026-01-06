<script setup>
import FooterLink from './FooterLink.vue'
</script>

<template>
  <footer class="text-center py-5 footer-bg">
    <div class="mb-3">
      <FooterLink to="/impressum">Impressum</FooterLink>
<FooterLink to="/datenschutz">Datenschutz</FooterLink>
<FooterLink to="/kontakt">Kontakt</FooterLink>

    </div>

    <p class="small text-muted">
      © 2025 Cooked – Dein digitales Kochbuch
    </p>
  </footer>
</template>

<style scoped>
.footer-bg {
  margin-top: 50px;
}
</style>