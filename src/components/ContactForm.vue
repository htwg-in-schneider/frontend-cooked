<script setup>
import { ref } from 'vue'

const name = ref('')
const email = ref('')
const message = ref('')

function sendMail() {
  const to = 'maiermelina04@gmail.com'
  const subject = encodeURIComponent(`Kontakt Cooked – von ${name.value}`)
  const body = encodeURIComponent(
    `Name: ${name.value}\nE-Mail: ${email.value}\n\nNachricht:\n${message.value}`
  )

  window.location.href = `mailto:${to}?subject=${subject}&body=${body}`
}
</script>

<template>
  <div class="bg-white shadow-sm p-4 p-md-5 mx-auto contact-card">
    <div class="row g-4">
      <div class="col-12 col-lg-6">
        <h2 class="h5 fw-bold mb-3">Kontakt</h2>

        <form class="d-grid gap-3" @submit.prevent="sendMail">
          <input
            v-model="name"
            class="form-control"
            type="text"
            placeholder="Dein Name"
            required
          />
          <input
            v-model="email"
            class="form-control"
            type="email"
            placeholder="Deine E-Mail"
            required
          />
          <textarea
            v-model="message"
            class="form-control"
            rows="5"
            placeholder="Deine Nachricht"
            required
          />

          <button type="submit" class="btn btn-success btn-lg">
            Nachricht per E-Mail senden
          </button>

          <small class="text-muted">
            Hinweis: Beim Absenden öffnet sich dein Mailprogramm (mailto-Link).
          </small>
        </form>
      </div>

      <div class="col-12 col-lg-6">
        <h2 class="h5 fw-bold mb-3">Links</h2>
        <div class="d-flex flex-column gap-2">
          <router-link class="btn btn-outline-secondary" to="/impressum">
            Impressum
          </router-link>
          <router-link class="btn btn-outline-secondary" to="/datenschutz">
            Datenschutzerklärung
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-card {
  max-width: 1000px;
  border-radius: 30px;
  background: rgba(245, 245, 188, 0.75);
  border: 1px solid rgba(107, 106, 25, 0.25);
  backdrop-filter: blur(6px);
}

.btn-success {
  background-color: #81801f;
  border-color: #a8ad63;
  color: #ffffff;
  font-weight: 500;
  border-radius: 999px;
}

.btn-success:hover {
  background-color: #b7bc75;
  border-color: #b7bc75;
  color: #3f3f1f;
}

.btn-success:focus,
.btn-success:active,
.btn-success:focus-visible {
  background-color: #a8ad63 !important;
  border-color: #a8ad63 !important;
  color: #3f3f1f !important;
  box-shadow: none !important;
}

.btn-outline-secondary {
  border-color: rgba(107, 106, 25, 0.5);
  color: #583722;
  border-radius: 999px;
}

.btn-outline-secondary:hover {
  background-color: rgba(107, 106, 25, 0.15);
  color: #583722;
}
</style>
