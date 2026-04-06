/**
 * Utility functions for formatting scores and numbers
 */

/**
 * Format a number to display cleanly without long decimal precision
 * @param num - The number to format
 * @param decimalPlaces - Number of decimal places to show (default: 1)
 * @returns Formatted number string
 */
export function formatScore(num: number, decimalPlaces: number = 1): string {
  if (Number.isInteger(num)) {
    return num.toString()
  }

  // Round to specified decimal places to avoid floating point precision issues
  const rounded = Math.round(num * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)

  // Remove trailing zeros
  return rounded.toFixed(decimalPlaces).replace(/\.?0+$/, '')
}

/**
 * Format a percentage value
 * @param num - The number to format as percentage
 * @returns Formatted percentage string
 */
export function formatPercentage(num: number): string {
  return `${formatScore(num)}%`
}

/**
 * Format a large number with appropriate suffixes (K, M, etc.)
 * @param num - The number to format
 * @returns Formatted number string with suffix
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return `${formatScore(num / 1000000)}M`
  } else if (num >= 1000) {
    return `${formatScore(num / 1000)}K`
  }
  return formatScore(num)
}
