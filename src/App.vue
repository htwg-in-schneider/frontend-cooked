<script setup>

</script>

<template>
    <header class="hero">
      <div class="container-fluid px-5">
        <!-- Logo + Buttons -->
        <div
          class="d-flex align-items-center justify-content-between flex-wrap gap-3"
        >
          <img class="brand-logo" src="@/assets/logo.png" alt="Cooked Logo" />
          <nav class="d-flex flex-wrap gap-2 ms-auto">
            <a class="button active" href="#">Home</a>
            <a class="button" href="#">Kategorien</a>
            <a class="button" href="#">Über uns</a>
            <a class="button" href="#">Profil</a>
          </nav>
        </div>

        <!-- HERO: Text links / Bild rechts -->
        <div class="hero-grid">
          <div class="hero-copy">
            <h1 class="hero-title">
              Das digitale <br />
              Kochbuch <br />
              für Genießer
            </h1>
            <p class="hero-sub">
              Wir sind Lucas & Melina – zwei Foodfans, <br />
              die Kochen lieben und es gerne einfach halten.<br />
              Unsere Seite hilft dir, schnell leckere Rezepte zu <br />
              finden – ganz ohne altmodisches Kochbuch!
            </p>
      <a href="#" class="cta-float">Jetzt loskochen!</a>
          </div>


          <div class="hero-media">
            <img
              class="hero-photo"
              src="@/assets/Bild_homepage.webp"
              alt="Bild Homepage"
            />
          </div>
        </div>
      </div>

    </header>

    <!-- Suche mittig unter Hero -->
    <div class="search-wrapper">
      <div class="search-box d-flex align-items-center gap-2">
        <span class="search-icon" aria-hidden="true">🔍</span>
        <input
          class="form-control search-input"
          type="text"
          placeholder="Suche"
          aria-label="Rezepte suchen"
        />
      </div>
    </div>

    <main class="container">
      <section class="py-4">
        <h2 class="section-title mb-3">Vorschläge</h2>

        <div class="row g-4">
          <!-- Card 1 -->
          <div class="col-12 col-md-6 col-lg-4">
            <article class="card cooked-card h-100">
              <div class="p-3">
                <img
                  class="square rounded-4"
                  src="@/assets/essen1.webp"
                  alt="Asiatisches Gericht"
                />
              </div>
              <div class="card-body pt-2 pb-5">
                <div class="tag">ASIATISCH</div>
                <h3 class="card-title mt-1 mb-2">Marry Me Chicken Ramen</h3>
                <div class="meta d-flex align-items-center gap-2">
                  <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12 8v5l3 3"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                  </svg>
                  <span>1h40</span>
                </div>
              </div>
              <button class="fav" aria-label="Zu Favoriten hinzufügen">
                <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 21s-7-4.35-9-8.5C1.33 8.67 3.5 6 6.5 6c1.87 0 3.04 1.02 3.5 2 .46-.98 1.63-2 3.5-2 3 0 5.17 2.67 3.5 6.5-2 4.15-9 8.5-9 8.5z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </article>
          </div>

          <!-- Card 2 -->
          <div class="col-12 col-md-6 col-lg-4">
            <article class="card cooked-card h-100">
              <div class="p-3">
                <img
                  class="square rounded-4"
                  src="@/assets/essen2.webp"
                  alt="Vegetarisches Gericht"
                />
              </div>
              <div class="card-body pt-2 pb-5">
                <div class="tag">VEGETARISCH</div>
                <h3 class="card-title mt-1 mb-2">
                  Kartoffelwedges mit Gurkensalat
                </h3>
                <div class="meta d-flex align-items-center gap-2">
                  <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12 8v5l3 3"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                  </svg>
                  <span>1h20</span>
                </div>
              </div>
              <button class="fav" aria-label="Zu Favoriten hinzufügen">
                <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 21s-7-4.35-9-8.5C1.33 8.67 3.5 6 6.5 6c1.87 0 3.04 1.02 3.5 2 .46-.98 1.63-2 3.5-2 3 0 5.17 2.67 3.5 6.5-2 4.15-9 8.5-9 8.5z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </article>
          </div>

          <!-- Card 3  -->
          <div class="col-12 col-md-6 col-lg-4">
            <article class="card cooked-card h-100">
              <div class="p-3">
                <img
                  class="square rounded-4"
                  src="@/assets/essen3.webp"
                  alt="Italienisches Gericht"
                />
              </div>
              <div class="card-body pt-2 pb-5">
                <div class="tag">ITALIENISCH</div>
                <h3 class="card-title mt-1 mb-2">Spaghetti Bolognese</h3>
                <div class="meta d-flex align-items-center gap-2">
                  <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12 8v5l3 3"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                  </svg>
                  <span>1h</span>
                </div>
              </div>
              <button class="fav" aria-label="Zu Favoriten hinzufügen">
                <svg class="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 21s-7-4.35-9-8.5C1.33 8.67 3.5 6 6.5 6c1.87 0 3.04 1.02 3.5 2 .46-.98 1.63-2 3.5-2 3 0 5.17 2.67 3.5 6.5-2 4.15-9 8.5-9 8.5z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </article>
          </div>
        </div>
      </section>
    </main>

    <footer class="text-center py-4 small footer">
      © 2025 Cooked – Dein digitales Kochbuch
    </footer>
  </template>

<style scoped>

</style>