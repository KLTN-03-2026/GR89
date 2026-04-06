import type { ParseResult, Sheet } from '@/components/common/sheetImport/types'

export function validateSpeakingImportJson(input: unknown): ParseResult {
  if (!Array.isArray(input)) {
    return { ok: false, errors: ['JSON phải là mảng các bài nói.'] }
  }

  const errors: string[] = []

  input.forEach((item, i) => {
    if (typeof item !== 'object' || item === null) {
      errors.push(`Dòng [${i}]: phải là object`)
      return
    }

    const it = item as any
    if (!it.title) errors.push(`Dòng [${i}]: thiếu "title"`)
    if (!it.videoUrl) errors.push(`Dòng [${i}]: thiếu "videoUrl" (media ID)`)
    if (it.level && !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(it.level)) {
      errors.push(`Dòng [${i}]: "level" phải là A1-C2`)
    }

    if (it.subtitles && !Array.isArray(it.subtitles)) {
      errors.push(`Dòng [${i}]: "subtitles" phải là mảng`)
    }

    it.subtitles?.forEach((s: any, j: number) => {
      if (!s.start) errors.push(`Dòng [${i}] Subtitle [${j}]: thiếu "start"`)
      if (!s.end) errors.push(`Dòng [${i}] Subtitle [${j}]: thiếu "end"`)
      if (!s.english && !s.sentence) errors.push(`Dòng [${i}] Subtitle [${j}]: thiếu "english" hoặc "sentence"`)
    })
  })

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, data: input as any[] }
}

export function parseExcelToSpeakingJson(sheets: Sheet[]): ParseResult {
  const errors: string[] = []
  const speakingSheet = sheets.find(s => s.name === 'Speakings')
  const subtitleSheet = sheets.find(s => s.name === 'Subtitles')

  if (!speakingSheet) {
    return { ok: false, errors: ['Thiếu sheet Speakings'] }
  }

  const speakingMap = new Map<string, any>()

  speakingSheet.rows.forEach((row, i) => {
    const speakingId = String(row.ID || row.title || '').trim()
    if (!speakingId) {
      errors.push(`Speakings row ${i}: thiếu ID hoặc Title`)
      return
    }
    if (!row.title) {
      errors.push(`Speakings row ${i}: thiếu title`)
    }

    const speaking = {
      title: String(row.title || '').trim(),
      description: String(row.description || '').trim(),
      level: String(row.level || 'A1').trim().toUpperCase(),
      videoUrl: String(row.videoID || '').trim(),
      isVipRequired: String(row.isVipRequired).toUpperCase() === 'TRUE',
      isActive: String(row.isActive).toUpperCase() === 'TRUE',
      orderIndex: Number(row.orderIndex) || undefined,
      subtitles: [],
    }

    speakingMap.set(speakingId, speaking)
  })

  subtitleSheet?.rows.forEach((row, i) => {
    const speakingKey = String(row.SpeakingID || '').trim()
    const speaking = speakingMap.get(speakingKey)
    if (!speaking) {
      errors.push(`Subtitles row ${i}: SpeakingID "${speakingKey}" không tồn tại`)
      return
    }

    speaking.subtitles.push({
      start: String(row.start || '').trim(),
      end: String(row.end || '').trim(),
      english: String(row.english || row.sentence || '').trim(),
      phonetic: String(row.phonetic || '').trim(),
      vietnamese: String(row.vietnamese || '').trim(),
      raw: String(row.raw || '').trim(),
    })
  })

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, data: Array.from(speakingMap.values()) }
}
