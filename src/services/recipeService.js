import { authFetch, getApiCollection } from './apiAuth'

export async function fetchRecipes(filters = {}) {
  const baseUrl = getApiCollection()
  const url = new URL(baseUrl, window.location.origin)
  if (filters.name) {
    url.searchParams.append('name', filters.name)
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Fehler beim Laden')
  return res.json()
}

export async function fetchRecipeById(id) {
  const baseUrl = getApiCollection()
  const res = await fetch(`${baseUrl}/${id}`)
  if (!res.ok) throw new Error('Rezept nicht gefunden')
  return res.json()
}

export async function fetchMyRecipes(getAccessTokenSilently) {
  const baseUrl = getApiCollection()
  const res = await authFetch(getAccessTokenSilently, `${baseUrl}/mine`)
  if (!res.ok) throw new Error('Fehler beim Laden')
  return res.json()
}

export async function createRecipe(getAccessTokenSilently, payload) {
  const baseUrl = getApiCollection()
  const res = await authFetch(getAccessTokenSilently, `${baseUrl}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || 'Fehler beim Erstellen')
  }
  return res.json()
}

export async function updateRecipe(getAccessTokenSilently, id, payload) {
  const baseUrl = getApiCollection()
  const res = await authFetch(getAccessTokenSilently, `${baseUrl}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || 'Fehler beim Speichern')
  }
  return res.json()
}

export async function deleteRecipe(getAccessTokenSilently, id) {
  const baseUrl = getApiCollection()
  const res = await authFetch(getAccessTokenSilently, `${baseUrl}/${id}`, {
    method: 'DELETE'
  })
  if (!res.ok && res.status !== 204) {
    const msg = await res.text()
    throw new Error(msg || 'Fehler beim Löschen')
  }
}
