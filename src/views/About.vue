<script setup>
import melinaImg from '@/assets/ÜberUnsBilder/melina.webp'
import lucasImg from '@/assets/ÜberUnsBilder/lucas.webp'
</script>

<template>
  <div class="container py-5">
    <section class="about-card mx-auto">

      <!-- Kopf -->
      <header class="about-head text-center">
        <h1 class="about-title mb-2">Über uns</h1>
        <p class="about-sub mb-0">
          Wir sind Lucas und Melina und haben Cooked im Rahmen unseres Studiums entwickelt.
        </p>
      </header>

      <div class="divider"></div>

      <!-- Warum Cooked -->
      <section class="about-section">
        <h2 class="section-title">Warum Cooked?</h2>
        <p class="about-p">
          Die Idee zu Cooked ist während unseres Studiums der Wirtschaftsinformatik an der HTWG Konstanz entstanden.
          Rezepte waren bei uns oft an vielen verschiedenen Orten gespeichert und dadurch schnell unübersichtlich.
        </p>
        <p class="about-p mb-0">
          Cooked soll dabei helfen, Rezepte einfach zu sammeln, übersichtlich zu organisieren
          und im Alltag schnell wiederzufinden.
        </p>
      </section>

      <div class="divider"></div>

      <!-- Wer wir sind -->
      <section class="about-section">
        <h2 class="section-title text-center mb-5">Wer wir sind</h2>

        <div class="row g-5">
          <!-- Melina -->
          <div class="col-12 col-lg-6">
            <div class="person">
              <div class="img-frame">
                <img :src="melinaImg" alt="Melina Maier" />
              </div>

              <div class="person-text">
                <h3 class="person-name">Melina Maier</h3>
                <p class="person-sub">Wirtschaftsinformatik · HTWG Konstanz</p>
                <p class="person-desc">
                  Ich koche gerne und probiere regelmäßig neue Gerichte aus.
                  Cooked hilft mir dabei, Rezepte übersichtlich zu sammeln und langfristig zu organisieren.
                </p>
              </div>
            </div>
          </div>

          <!-- Lucas -->
          <div class="col-12 col-lg-6">
            <div class="person">
              <div class="img-frame">
                <img :src="lucasImg" alt="Lucas Grießer" />
              </div>

              <div class="person-text">
                <h3 class="person-name">Lucas Grießer</h3>
                <p class="person-sub">Wirtschaftsinformatik · HTWG Konstanz</p>
                <p class="person-desc">
                  Mich interessiert am Kochen vor allem der kreative Teil.
                  Cooked ist für mich ein Werkzeug, um Rezepte strukturiert festzuhalten
                  und jederzeit griffbereit zu haben.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </section>
  </div>
</template>

<style scoped>
/* Schrift */
.about-card,
.about-card * {
  font-family: "Comfortaa", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}

/* Weißer Hauptkasten */
.about-card {
  max-width: 1120px;
  background: #ffffff;
  border-radius: 30px; /* groß → sanfte Rundung */
  padding: 44px 48px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.15);
}

/* Kopf */
.about-title {
  font-weight: 600;
}

.about-sub {
  color: rgba(0, 0, 0, 0.6);
}

/* Divider */
.divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.12);
  margin: 32px 0;
}

/* Text */
.section-title {
  font-weight: 600;
  margin-bottom: 18px;
}

.about-p {
  color: rgba(0, 0, 0, 0.75);
  line-height: 1.7;
}

/* Person */
.person {
  display: flex;
  gap: 26px;
  align-items: flex-start;
}

/* Bild-Frame mit ruhiger Rundung */
.img-frame {
  width: 160px;
  height: 210px;
  border-radius: 17px;   /* OPTISCH passend zum großen Kasten */
  overflow: hidden;
  background: #fff;
  flex-shrink: 0;
}

/* Bild */
.img-frame img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center; Chicke

  border-radius: inherit;
  -webkit-mask-image: -webkit-radial-gradient(white, black);
  transform: translateZ(0);
}

/* Person Text */
.person-name {
  font-weight: 600;
  font-size: 1.55rem;
  margin-bottom: 10px;
}

.person-sub {
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 16px;
  font-weight: 600;
}

.person-desc {
  color: rgba(0, 0, 0, 0.72);
  line-height: 1.75;
}

/* Responsive */
@media (max-width: 768px) {
  .about-card {
    padding: 30px 20px;
    border-radius: 24px;
  }

  .person {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .img-frame {
    width: 140px;
    height: 190px;
    border-radius: 18px;
  }
}
</style>
