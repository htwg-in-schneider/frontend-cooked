import { getApiRoot } from './apiAuth'

let categoryMapCache = null
let inFlight = null

export async function loadCategoryMap() {
  if (categoryMapCache) return categoryMapCache
  if (inFlight) return inFlight

  inFlight = (async () => {
    try {
      const apiRoot = getApiRoot()
      const res = await fetch(`${apiRoot}/category/translation`)
      if (!res.ok) throw new Error('Category fetch failed')
      const data = await res.json()
      categoryMapCache = data && typeof data === 'object' ? data : {}
      return categoryMapCache
    } catch {
      categoryMapCache = {}
      return categoryMapCache
    } finally {
      inFlight = null
    }
  })()

  return inFlight
}

export function mapCategoryLabels(values, categoryMap) {
  const list = Array.isArray(values) ? values : values ? [values] : []
  return list
    .map((v) => (categoryMap && categoryMap[v] ? categoryMap[v] : v))
    .filter(Boolean)
}
