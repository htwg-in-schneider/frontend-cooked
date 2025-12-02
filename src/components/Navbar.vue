<script setup>
// Hier ist keine Logik nötig aktuell
</script>

<template>
  <nav class="navbar navbar-expand-lg py-3">
    <div class="container-fluid px-5 d-flex align-items-center justify-content-between">
        <img class="brand-logo" src="@/assets/logo.png" alt="Cooked Logo" style="height: 40px;" />
        
        <div class="d-flex flex-wrap gap-2 ms-auto">
          <a class="button active" href="#">Home</a>
          <a class="button" href="#">Kategorien</a>
          <a class="button" href="#">Über uns</a>
          <a class="button" href="#">Profil</a>
        </div>
    </div>
  </nav>
</template>

<style scoped>

.brand-logo {
  height: 40px;
}

/* Die Links / Buttons */
.button {
  text-decoration: none;
  color: #4a5568; /* Dunkelgrau */
  font-weight: 500;
  padding: 8px 20px;
  border-radius: 20px;
  transition: all 0.2s ease;
}

.button:hover {
  background-color: rgba(255, 255, 255, 0.3);
  color: #2d3748;
}

/* Der aktive Button (Home) dunkel hinterlegt */
.button.active {
  background-color: #2d3748;
  color: white;
}
</style>