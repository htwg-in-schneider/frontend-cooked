<script setup>
import { useBannerStore } from '@/stores/banner'

const bannerStore = useBannerStore()
</script>

<template>
  <header class="hero position-relative" v-if="bannerStore.isVisible">
    
    <button 
      class="btn-close-banner" 
      @click="bannerStore.hideBanner()"
      title="Banner ausblenden"
    >
      ✕
    </button>

    <div class="container-fluid px-5">
      <div class="hero-grid">
        <div class="hero-copy">
          <h1 class="hero-title">
            Das digitale <br />
            Kochbuch <br />
            für Genießer
          </h1>
          <p class="hero-sub">
            Wir sind Lucas & Melina – zwei Foodfans, <br />
            die Kochen lieben und es gerne einfach halten.
          </p>
          
          <a href="#" class="cta-float">Jetzt loskochen!</a>
        
        </div>

        <div class="hero-media">
          <img class="hero-photo" src="@/assets/Bild_homepage.webp" alt="Bild Homepage" />
        </div>
      </div>
    </div>
  </header>

  <div class="search-wrapper mb-5">
    <div class="search-box d-flex align-items-center gap-2 mx-auto rounded-pill bg-white shadow p-1" style="max-width: 600px;">
      <input
        class="form-control form-control-lg border-0 rounded-pill search-input"
        type="text"
        placeholder="Suche nach Rezepten..."
        style="box-shadow: none !important;"
      />
      <button class="btn btn-cooked-search rounded-pill px-4 py-2 m-1">Finden</button>
    </div>
  </div>
</template>

<style scoped>
.cta-float {
  display: inline-block;
  background-color: #81801f;
  color: white;
  padding: 12px 30px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: bold;
  transition: transform 0.2s;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  margin-top: 10px;
}

.cta-float:hover {
  transform: scale(1.05);
  background-color: #6b6a19;
  color: white;
}

.position-relative {
  position: relative;
}

.btn-close-banner {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
  font-weight: bold;
  z-index: 10;
  transition: background 0.2s;
}

.btn-close-banner:hover {
  background: rgba(255, 255, 255, 0.4);
}

/* --- Suche --- */
.btn-cooked-search {
  background-color: #81801f;
  color: white;
  font-weight: bold;
  transition: background-color 0.2s;
}
.btn-cooked-search:hover {
  background-color: #6b6a19;
  color: white;
}

/* --- Hero Bereich --- */
.hero {
  background-color: transparent;
  padding-top: 2rem;
  padding-bottom: 4rem;
  color: #2c3e50;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
  color: white;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.hero-sub {
  font-size: 1.1rem;
  color: white;
  margin-bottom: 2rem;
  max-width: 500px;
  font-weight: 500;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-photo {
  width: 75%;
  height: auto;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

@media (max-width: 768px) {
  .hero-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .hero-sub { margin: 0 auto 2rem auto; }
}
</style>