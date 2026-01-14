// src/services/meService.js
import { getApiRoot, authFetch } from './apiAuth'

/**
 * Lädt "me" vom Backend.
 * Erwartet Backend-Endpoint: GET {apiRoot}/me
 * -> { id, name, email, role }
 */
export async function loadMe(getAccessTokenSilently) {
  const apiRoot = getApiRoot()

  const res = await authFetch(getAccessTokenSilently, `${apiRoot}/me`, {
    method: 'GET'
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || 'Konnte Profil nicht laden')
  }

  return res.json()
}
