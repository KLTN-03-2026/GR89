export function formatScore(num: number, decimalPlaces: number = 1): string {
  if (Number.isInteger(num)) {
    return num.toString()
  }

  const rounded = Math.round(num * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)

  return rounded.toFixed(decimalPlaces).replace(/\.?0+$/, '')
}

export function formatPercentage(num: number): string {
  return `${formatScore(num)}%`
}

export function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return `${formatScore(num / 1000000)}M`
  } else if (num >= 1000) {
    return `${formatScore(num / 1000)}K`
  }
  return formatScore(num)
}
