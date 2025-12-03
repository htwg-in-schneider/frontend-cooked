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
</template>

<style scoped>
/* --- Button --- */
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

/* --- Schließen Button --- */
.position-relative { position: relative; }

.btn-close-banner {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 35px; height: 35px;
  border-radius: 50%;
  cursor: pointer;
  font-weight: bold;
  z-index: 10;
  transition: background 0.2s;
}
.btn-close-banner:hover { background: rgba(255, 255, 255, 0.4); }


.hero {
  background-color: transparent;
  padding-top: 2rem;
  padding-bottom: 6rem;
  color: #6b6a19;
  overflow: hidden; 
}

.hero-title {
  font-size: 4.5rem;
  font-weight: 900; 
  line-height: 1.1;
  color: white;
  margin-bottom: 1.5rem;
  text-shadow: 0 4px 20px rgba(0,0,0,0.15); 
  letter-spacing: -1px;
}

.hero-sub {
  font-size: 1.3rem;
  color: #fff; 
  margin-bottom: 2.5rem;
  max-width: 550px;
  font-weight: 500;
  line-height: 1.6;
  text-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: center;
}

.hero-media {
  display: flex;
  justify-content: flex-end; /* Rechtsbündig */
}

.hero-photo {
  /* Bild viel größer machen */
  width: 95%; 
  max-width: auto; 
  height: auto;
  border-radius: 50%;
  object-fit: cover;
  

  margin-right: -20%; 
  transform: rotate(5deg); /* Leichte Drehung wirkt natürlicher */
  
  /* Starker Schatten für 3D-Effekt */
  box-shadow: -15px 15px 40px rgba(0,0,0,0.2);
  border: 8px solid rgba(255, 255, 255, 0.1);
}

/* --- Mobile Anpassung --- */
@media (max-width: 992px) { /* Tablet & Handy */
  .hero-grid {
    grid-template-columns: 1fr; /* Untereinander */
    text-align: center;
  }
  .hero-sub { margin: 0 auto 2rem auto; }
  
  /* Bild auf Handy wieder normalisieren */
  .hero-media { justify-content: center; margin-top: 2rem; }
  .hero-photo {
    width: 80%;
    margin-right: 0;
    transform: rotate(0deg);
    max-width: 400px;
  }
}
</style>