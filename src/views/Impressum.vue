<script setup>
const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || ''
</script>

<template>
  <div class="container py-5">
    <div class="bg-white shadow-sm p-4 p-md-5 mx-auto legal-card">
      <h1 class="fw-bold mb-3">Impressum</h1>

      <div class="impressum-grid">
        <div class="impressum-text">
          <p class="mb-2">
            Cooked (Studienprojekt)<br />
            Dies ist ein nicht-kommerzielles Projekt im Rahmen<br />
            des Studiums an der Hochschule Konstanz.
          </p>

          <p class="mb-2">
            <strong>Anschrift</strong><br />
            Hochschule Konstanz<br />
            Fakultät Informatik<br />
            Alfred-Wachtel-Straße 8<br />
            D-78462 Konstanz
          </p>

        </div>
        <div class="impressum-image">
          <img src="@/assets/Impressum/HTWG_O.webp" alt="Hochschule Konstanz" />
        </div>
      </div>

      <h2 class="h5 fw-bold mt-2">Kontakt</h2>
      <p v-if="contactEmail">
        E-Mail: {{ contactEmail }}
      </p>

      <p class="mt-4 mb-0">
        Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV: Lucas Grießer &amp; Melina Maier
      </p>
    </div>
  </div>
</template>

<style scoped>
.legal-card {
  max-width: 980px;
  border-radius: 30px;
  margin-bottom: 24px;
}

.impressum-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 24px;
  align-items: start;
}

.impressum-image img {
  width: 100%;
  height: auto;
  border-radius: 16px;
  border: 1px solid #eee;
  display: block;
}

.impressum-image {
  justify-self: end;
  margin-top: -50px;
}

@media (max-width: 768px) {
  .impressum-grid {
    grid-template-columns: 1fr;
  }
}
</style>
