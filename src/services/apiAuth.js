export function getApiRoot() {
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  return base.replace(/\/(product|products|recipe|recipes)$/i, '')
}

// helper: fetch mit Bearer Token
export async function authFetch(getAccessTokenSilently, url, options = {}) {
  const token = await getAccessTokenSilently()
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`
  }
  return fetch(url, { ...options, headers })
}
