<script setup>
const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || ''
</script>

<template>
  <div class="container py-5">
    <div class="bg-white shadow-sm p-4 p-md-5 mx-auto legal-card">
      <h1 class="fw-bold mb-4">Datenschutzerklärung</h1>

      <h2 class="h5 fw-bold mt-4">1. Verantwortliche Stelle</h2>
      <p>
        Verantwortlich für diese Webanwendung ist das Studienprojekt
        <strong>Cooked</strong> der Hochschule Konstanz (HTWG), Fakultät Informatik.
      </p>
      <p v-if="contactEmail">
        Kontakt: {{ contactEmail }}
      </p>

      <h2 class="h5 fw-bold mt-4">2. Verarbeitung personenbezogener Daten</h2>
      <p>
        Im Rahmen der Nutzung dieser Anwendung werden personenbezogene Daten wie Name,
        E-Mail-Adresse und Rolle von Nutzern verarbeitet. Diese Daten werden ausschließlich
        zur Bereitstellung der Funktionalitäten der Anwendung verwendet.
      </p>
      <p>
        Eine Weitergabe der Daten an Dritte findet nicht statt.
      </p>

      <h2 class="h5 fw-bold mt-4">3. Kontaktformular</h2>
      <p>
        Das Kontaktformular auf der Startseite verwendet einen <em>mailto-Link</em>. Dabei werden
        keine Daten innerhalb der Anwendung gespeichert oder an einen Server übertragen.
        Stattdessen öffnet sich das lokale E-Mail-Programm des Nutzers.
      </p>

      <h2 class="h5 fw-bold mt-4">4. Cookies und Tracking</h2>
      <p>
        Diese Webanwendung verwendet keine Cookies und keine Tracking- oder Analyse-Tools.
      </p>
    </div>
  </div>
</template>

<style scoped>
.legal-card {
  max-width: 900px;
  border-radius: 30px;
}
</style>
