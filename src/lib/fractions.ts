const US_VOLUME_UNITS = new Set(['cup', 'tsp', 'tbsp', 'fl oz'])

// Common cooking fractions [numerator, denominator]
const COOKING_FRACTIONS: [number, number][] = [
  [1, 8], [1, 4], [1, 3], [3, 8], [1, 2],
  [5, 8], [2, 3], [3, 4], [7, 8],
]
const SNAP_TOLERANCE = 0.02

export function isVolumeFractionUnit(unit: string): boolean {
  return US_VOLUME_UNITS.has(unit)
}

/**
 * Parse a fraction string to a float.
 * Accepts: "1 3/4", "1-3/4", "3/4", "1.75", "2"
 */
export function parseFraction(input: string): number | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  // Plain decimal or integer (no slash)
  if (!trimmed.includes('/')) {
    const n = parseFloat(trimmed)
    return isNaN(n) ? null : n
  }

  // Mixed number: "1 3/4" or "1-3/4"
  const mixedMatch =
    trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/) ||
    trimmed.match(/^(\d+)-(\d+)\/(\d+)$/)
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1])
    const num = parseInt(mixedMatch[2])
    const den = parseInt(mixedMatch[3])
    if (den === 0) return null
    return whole + num / den
  }

  // Simple fraction: "3/4"
  const fracMatch = trimmed.match(/^(\d+)\/(\d+)$/)
  if (fracMatch) {
    const num = parseInt(fracMatch[1])
    const den = parseInt(fracMatch[2])
    if (den === 0) return null
    return num / den
  }

  return null
}

function snapFractionPart(decimal: number): string | null {
  for (const [num, den] of COOKING_FRACTIONS) {
    if (Math.abs(decimal - num / den) < SNAP_TOLERANCE) {
      return `${num}/${den}`
    }
  }
  return null
}

/**
 * Convert a decimal to a cooking fraction string.
 * Returns null if the decimal portion doesn't snap to a common cooking fraction.
 * Examples: 1.75 → "1 3/4", 0.5 → "1/2", 0.123 → null
 */
export function toFractionString(value: number): string | null {
  if (!isFinite(value) || value < 0) return null

  const whole = Math.floor(value)
  const decimal = value - whole

  // Nearly whole (includes floating point edge cases like 0.9999)
  if (decimal < SNAP_TOLERANCE || decimal > 1 - SNAP_TOLERANCE) {
    const rounded = decimal > 1 - SNAP_TOLERANCE ? whole + 1 : whole
    return `${rounded}`
  }

  const fracPart = snapFractionPart(decimal)
  if (!fracPart) return null

  return whole > 0 ? `${whole} ${fracPart}` : fracPart
}

/**
 * Format a quantity number for display.
 * For US volume units: returns fraction string if it snaps, otherwise decimal.
 * For all other units: returns decimal with trailing zeros stripped.
 */
export function formatQuantity(value: number, unit: string): string {
  if (!isFinite(value)) return '—'

  if (isVolumeFractionUnit(unit)) {
    const frac = toFractionString(value)
    if (frac !== null) return frac
  }

  // Decimal fallback: max 2 places, strip trailing zeros
  const rounded = Math.round(value * 100) / 100
  return rounded % 1 === 0 ? `${rounded}` : `${parseFloat(rounded.toFixed(2))}`
}
