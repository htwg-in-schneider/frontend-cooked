<script setup>
</script>

<template>
  <header class="hero">
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
    <div class="search-box d-flex align-items-center gap-2 mx-auto shadow-sm" style="max-width: 500px;">
      <span class="search-icon">🔍</span>
      <input
        class="form-control search-input"
        type="text"
        placeholder="Suche nach Rezepten..."
      />
    </div>
  </div>
</template>

<style scoped>

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
  color: white;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.1); /* Kleiner Schatten für Lesbarkeit */
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
  width: 80%;
  height: auto;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.cta-float {
  display: inline-block;
  background-color: #81801f; /* Dein Olivgrün als Akzent für den Button */
  color: white;
  padding: 12px 30px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: bold;
  transition: transform 0.2s;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

.cta-float:hover {
  transform: scale(1.05);
  background-color: #6b6a19;
}

@media (max-width: 768px) {
  .hero-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .hero-sub { margin: 0 auto 2rem auto; }
}
</style>