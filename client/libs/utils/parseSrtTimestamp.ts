export const parseSrtTimestamp = (timestamp: string) => {
  const [time, ms] = timestamp.split(',')
  const [hh, mm, ss] = time.split(':').map(Number)
  const milliseconds = Number(ms || 0)
  return hh * 3600 + mm * 60 + ss + milliseconds / 1000
}