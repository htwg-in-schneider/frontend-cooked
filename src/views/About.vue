<script setup>
import melinaImg from '@/assets/ÜberUnsBilder/melina.jpg'
const lucasImg = 'https://placehold.co/600x800?text=Lucas'
</script>

<template>
  <div class="about-bg">
    <div class="container py-5">

      <!-- Überschrift wie „Seitenkopf“ -->
      <div class="page-head text-center mb-5">
        <h1 class="page-title mb-2">Über uns</h1>
        <p class="page-sub mb-0">
          Wir sind Lucas & Melina – und Cooked ist unser digitales Kochbuch.
        </p>
      </div>

      <!-- „Projekt-Card“ wie Rezeptkarte (weiß, rund, Schatten) -->
      <section class="info-card mx-auto mb-5">
        <h4 class="fw-bold mb-3">Warum Cooked?</h4>
        <p class="mb-2">
          Cooked ist im Rahmen unseres Studiums der Wirtschaftsinformatik an der HTWG Konstanz entstanden.
          Wir wollten etwas bauen, das man wirklich gerne benutzt: übersichtlich, modern und alltagstauglich.
        </p>
        <p class="mb-0">
          Mit Cooked kannst du Rezepte sammeln, neue Ideen entdecken und deine Lieblingsgerichte schnell wiederfinden –
          ohne Zettelchaos und ohne komplizierte Menüs.
        </p>

        <!-- kleine „Meta“-Zeile wie bei Rezepten (ruhig, optional) -->
        <div class="meta-row mt-4">
          <span class="meta-pill">HTWG Konstanz</span>
          <span class="meta-pill">Web-Tech Projekt</span>
          <span class="meta-pill">Vue + Spring Boot</span>
        </div>
      </section>

      <!-- Team Cards im Rezept-Stil -->
      <div class="row g-4 justify-content-center">
        <!-- Melina -->
        <div class="col-12 col-md-6 col-lg-4">
          <article class="recipe-card-like h-100">
            <div class="img-wrap">
              <img :src="melinaImg" alt="Melina Maier" class="card-img" />
            </div>

            <div class="card-body-like">
              <div class="category-like">TEAM</div>
              <h3 class="card-title-like">Melina Maier</h3>

              <div class="time-like">
                <span class="dot"></span>
                Wirtschaftsinformatik · HTWG Konstanz
              </div>

              <p class="card-text-like">
                Ich koche leidenschaftlich gerne und probiere regelmäßig neue Rezepte aus.
                Cooked ist für mich der Ort, um Rezepte übersichtlich zu sammeln und langfristig zu organisieren.
              </p>

              <!-- Button wie bei Rezepten -->
              <button class="btn-olive w-100" type="button" disabled>
                Profil
              </button>
            </div>
          </article>
        </div>

        <!-- Lucas -->
        <div class="col-12 col-md-6 col-lg-4">
          <article class="recipe-card-like h-100">
            <div class="img-wrap">
              <img :src="lucasImg" alt="Lucas Grießer" class="card-img" />
            </div>

            <div class="card-body-like">
              <div class="category-like">TEAM</div>
              <h3 class="card-title-like">Lucas Grießer</h3>

              <div class="time-like">
                <span class="dot"></span>
                Wirtschaftsinformatik · HTWG Konstanz
              </div>

              <p class="card-text-like">
                Kochen bedeutet für mich Entspannung und Kreativität.
                Cooked ist entstanden, um Rezepte strukturiert zu sammeln und jederzeit darauf zugreifen zu können.
              </p>

              <button class="btn-olive w-100" type="button" disabled>
                Profil
              </button>
            </div>
          </article>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Hintergrund wie bei euren Rezeptseiten (oliv/butter) */
.about-bg {
  background: #b7b57a; /* ähnlicher Ton wie Screenshot */
  min-height: 100%;
}

/* Kopf */
.page-title {
  font-weight: 800;
  letter-spacing: -0.02em;
}

.page-sub {
  color: rgba(0, 0, 0, 0.55);
}

/* Weißer Infokasten im Card-Look */
.info-card {
  max-width: 980px;
  background: #fff;
  border-radius: 26px;
  padding: 2.4rem 2.2rem;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
}

/* kleine Pills (wie Kategorien) */
.meta-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.meta-pill {
  font-size: 0.85rem;
  font-weight: 700;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.05);
}

/* -------------------------
   Team-Cards im Rezeptstil
   ------------------------- */
.recipe-card-like {
  background: #fff;
  border-radius: 26px;
  overflow: hidden;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
}

/* Bildbereich wie Rezeptkarte */
.img-wrap {
  padding: 18px;
  padding-bottom: 0;
}

.card-img {
  width: 100%;
  height: 270px;
  border-radius: 18px;
  object-fit: contain;        /* GANZE Person */
  background: #f3f3f3;
  padding: 10px;
  display: block;
}

/* Body wie bei Rezeptkarten */
.card-body-like {
  padding: 18px 18px 22px 18px;
}

.category-like {
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: rgba(0, 0, 0, 0.55);
  margin-bottom: 6px;
  text-transform: uppercase;
}

.card-title-like {
  font-size: 1.35rem;
  font-weight: 800;
  margin: 0 0 10px 0;
}

.time-like {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(0, 0, 0, 0.55);
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 12px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.35);
}

.card-text-like {
  color: rgba(0, 0, 0, 0.70);
  line-height: 1.55;
  margin-bottom: 16px;
}

/* Button wie euer Olive-Button */
.btn-olive {
  background: #7c7a2d;        /* olive wie Screenshot */
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 12px 16px;
  font-weight: 800;
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.10);
}

.btn-olive:disabled {
  opacity: 1;                 /* bleibt „echt“, obwohl disabled */
  cursor: default;
}

@media (max-width: 768px) {
  .info-card {
    padding: 1.8rem 1.4rem;
    border-radius: 22px;
  }
  .card-img {
    height: 240px;
  }
}
</style>
