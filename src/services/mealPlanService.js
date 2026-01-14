import { authFetch, getApiRoot } from './apiAuth'

export async function fetchMealPlan(getAccessTokenSilently) {
  const apiRoot = getApiRoot()
  const res = await authFetch(getAccessTokenSilently, `${apiRoot}/mealplan`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function addMealPlanEntry(getAccessTokenSilently, payload) {
  const apiRoot = getApiRoot()
  const res = await authFetch(getAccessTokenSilently, `${apiRoot}/mealplan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateMealPlanEntry(getAccessTokenSilently, id, payload) {
  const apiRoot = getApiRoot()
  const res = await authFetch(getAccessTokenSilently, `${apiRoot}/mealplan/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function deleteMealPlanEntry(getAccessTokenSilently, id) {
  const apiRoot = getApiRoot()
  const res = await authFetch(getAccessTokenSilently, `${apiRoot}/mealplan/${id}`, {
    method: 'DELETE'
  })
  if (!res.ok) throw new Error(await res.text())
}

export async function clearMealPlan(getAccessTokenSilently) {
  const apiRoot = getApiRoot()
  const res = await authFetch(getAccessTokenSilently, `${apiRoot}/mealplan`, {
    method: 'DELETE'
  })
  if (!res.ok) throw new Error(await res.text())
}
