import { authFetch, getApiRoot } from './apiAuth'

export async function fetchFavoriteIds(getAccessTokenSilently) {
  const apiRoot = getApiRoot()
  const res = await authFetch(getAccessTokenSilently, `${apiRoot}/favorites/ids`)
  if (!res.ok) {
    throw new Error(await res.text())
  }
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export async function fetchFavorites(getAccessTokenSilently) {
  const apiRoot = getApiRoot()
  const res = await authFetch(getAccessTokenSilently, `${apiRoot}/favorites`)
  if (!res.ok) {
    throw new Error(await res.text())
  }
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export async function addFavorite(getAccessTokenSilently, productId) {
  const apiRoot = getApiRoot()
  const res = await authFetch(getAccessTokenSilently, `${apiRoot}/favorites/${productId}`, {
    method: 'PUT'
  })
  if (!res.ok) {
    throw new Error(await res.text())
  }
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export async function removeFavorite(getAccessTokenSilently, productId) {
  const apiRoot = getApiRoot()
  const res = await authFetch(getAccessTokenSilently, `${apiRoot}/favorites/${productId}`, {
    method: 'DELETE'
  })
  if (!res.ok) {
    throw new Error(await res.text())
  }
  const data = await res.json()
  return Array.isArray(data) ? data : []
}
