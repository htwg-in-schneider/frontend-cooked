import { getApiRoot } from './apiAuth'

const statsCache = new Map()

export async function fetchReviewStats(productId) {
  if (!productId) return { ratingAvg: 0, ratingCount: 0 }
  if (statsCache.has(productId)) return statsCache.get(productId)

  try {
    const apiRoot = getApiRoot()
    const res = await fetch(`${apiRoot}/review/product/${productId}`)
    if (!res.ok) {
      const empty = { ratingAvg: 0, ratingCount: 0 }
      statsCache.set(productId, empty)
      return empty
    }
    const reviews = await res.json()
    const list = Array.isArray(reviews) ? reviews : []
    if (!list.length) {
      const empty = { ratingAvg: 0, ratingCount: 0 }
      statsCache.set(productId, empty)
      return empty
    }
    const ratingCount = list.length
    const ratingAvg =
      list.reduce((sum, r) => sum + (Number(r.stars) || 0), 0) / ratingCount
    const stats = { ratingAvg, ratingCount }
    statsCache.set(productId, stats)
    return stats
  } catch {
    const empty = { ratingAvg: 0, ratingCount: 0 }
    statsCache.set(productId, empty)
    return empty
  }
}
