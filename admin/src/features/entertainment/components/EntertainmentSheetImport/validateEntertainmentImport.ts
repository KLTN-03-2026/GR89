import type { ParseResult, Sheet } from '@/components/common/sheetImport/types'

export function validateEntertainmentImportJson(input: unknown): ParseResult {
  if (!Array.isArray(input)) {
    return { ok: false, errors: ['JSON phải là mảng các mục giải trí.'] }
  }

  const errors: string[] = []

  input.forEach((item, i) => {
    if (typeof item !== 'object' || item === null) {
      errors.push(`Dòng [${i}]: phải là object`)
      return
    }

    const it = item as any
    if (!it.title) errors.push(`Dòng [${i}]: thiếu "title"`)
    if (!it.type) {
      errors.push(`Dòng [${i}]: thiếu "type"`)
    } else if (!['movie', 'music', 'podcast'].includes(it.type)) {
      errors.push(`Dòng [${i}]: "type" không hợp lệ (movie/music/podcast)`)
    }
    if (!it.videoUrl && !it.videoID) errors.push(`Dòng [${i}]: thiếu "videoUrl" hoặc "videoID" (media ID)`)
  })

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, data: input as any[] }
}

export function parseExcelToEntertainmentJson(sheets: Sheet[]): ParseResult {
  const errors: string[] = []
  const sheet = sheets.find(s => s.name === 'Entertainments')

  if (!sheet) {
    return { ok: false, errors: ['Thiếu sheet Entertainments'] }
  }

  const data = sheet.rows.map((row, i) => {
    if (!row.title) errors.push(`Entertainments row ${i}: thiếu title`)
    if (!row.type) errors.push(`Entertainments row ${i}: thiếu type`)

    return {
      title: String(row.title || '').trim(),
      description: String(row.description || '').trim(),
      author: String(row.author || '').trim(),
      type: String(row.type || '').trim().toLowerCase(),
      videoUrl: String(row.videoID || row.videoUrl || '').trim(),
      thumbnailUrl: String(row.thumbnailID || row.thumbnailUrl || '').trim(),
      isActive: String(row.isActive || row.status).toUpperCase() === 'TRUE',
      isVipRequired: String(row.isVipRequired).toUpperCase() === 'TRUE',
    }
  })

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, data }
}
