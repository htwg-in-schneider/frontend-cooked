export function resolveImageUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('/')) {
    const base = import.meta.env.BASE_URL || '/'
    if (base === '/') return url
    return base.replace(/\/$/, '') + url
  }
  return url
}
