export const formatStudyTime = (seconds?: number): string => {
  const totalSeconds = Math.max(0, Math.floor(Number(seconds) || 0))
  if (totalSeconds === 0) return "0 phút"

  const totalMinutes = Math.floor(totalSeconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const remainingSeconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours} giờ ${minutes.toString().padStart(2, '0')} phút`
  }

  if (minutes > 0) {
    return `${minutes} phút`
  }

  return `${remainingSeconds} giây`
}

