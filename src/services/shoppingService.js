import { authFetch, getApiRoot } from './apiAuth'

export async function fetchShoppingChecks(getAccessTokenSilently) {
  const apiRoot = getApiRoot()
  const res = await authFetch(getAccessTokenSilently, `${apiRoot}/shopping/checks`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function setShoppingCheck(getAccessTokenSilently, payload) {
  const apiRoot = getApiRoot()
  const res = await authFetch(getAccessTokenSilently, `${apiRoot}/shopping/checks`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error(await res.text())
}
