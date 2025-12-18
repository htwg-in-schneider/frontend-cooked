<script setup>
</script>

<template>
  <nav class="navbar navbar-expand-lg">
    <div class="container-fluid px-5 d-flex align-items-center justify-content-between">
        <router-link to="/">
          <img class="brand-logo" src="@/assets/logo.png" alt="Cooked Logo" />
        </router-link>
        
        <div class="d-flex flex-wrap gap-2 ms-auto">
          <router-link to="/home" class="button" active-class="active">Home</router-link>
          <a class="button" href="#">Kategorien</a>
          <a class="button" href="#">Über uns</a>
          
          <router-link to="/profile" class="button" active-class="active">
            Profil
          </router-link>
        </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background-color: transparent; 
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.brand-logo {
  height: 70px;
  transition: transform 0.2s;
}

.brand-logo:hover {
  transform: scale(1.05);
}

.button {
  text-decoration: none;
  color: white;
  font-weight: 500;
  padding: 8px 20px;
  border-radius: 20px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.active {
  background-color: #6b6a19;
  color: white;
}
</style>