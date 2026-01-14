export function scaleIngredientAmount(amount, factor) {
  if (!amount || !factor || factor === 1) return amount
  const raw = String(amount).trim()
  const match = raw.match(/^(\d+(?:[.,]\d+)?)(.*)$/)
  if (!match) return amount

  const value = Number(match[1].replace(',', '.'))
  if (Number.isNaN(value)) return amount

  const scaled = Math.round(value * factor * 100) / 100
  const formatted = scaled % 1 === 0 ? String(Math.round(scaled)) : String(scaled)
  const rest = match[2] || ''
  return `${formatted}${rest}`
}
