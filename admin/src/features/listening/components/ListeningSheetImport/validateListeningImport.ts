import type { ParseResult, Sheet } from '@/components/common/sheetImport/types'

export function validateListeningImportJson(input: unknown): ParseResult {
  if (!Array.isArray(input)) {
    return { ok: false, errors: ['JSON phải là mảng các bài nghe.'] }
  }

  const errors: string[] = []

  input.forEach((item, i) => {
    if (typeof item !== 'object' || item === null) {
      errors.push(`Dòng [${i}]: phải là object`)
      return
    }

    const it = item as any
    if (!it.title) errors.push(`Dòng [${i}]: thiếu "title"`)
    if (!it.description) errors.push(`Dòng [${i}]: thiếu "description"`)
    if (!it.audio) errors.push(`Dòng [${i}]: thiếu "audio" (media ID)`)
    if (!it.subtitle) errors.push(`Dòng [${i}]: thiếu "subtitle"`)
    if (it.level && !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(it.level)) {
      errors.push(`Dòng [${i}]: "level" phải là A1-C2`)
    }
  })

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, data: input as any[] }
}

export function parseExcelToListeningJson(sheets: Sheet[]): ParseResult {
  const errors: string[] = []
  const sheet = sheets.find(s => s.name === 'Listenings')

  if (!sheet) {
    return { ok: false, errors: ['Thiếu sheet Listenings'] }
  }

  const data = sheet.rows.map((row, i) => {
    if (!row.title) errors.push(`Listenings row ${i}: thiếu title`)
    if (!row.description) errors.push(`Listenings row ${i}: thiếu description`)
    if (!row.audioID) errors.push(`Listenings row ${i}: thiếu audioID (media ID)`)
    if (!row.subtitle) errors.push(`Listenings row ${i}: thiếu subtitle`)

    return {
      title: String(row.title || '').trim(),
      description: String(row.description || '').trim(),
      audio: String(row.audioID || '').trim(),
      subtitle: String(row.subtitle || '').trim(),
      level: String(row.level || 'A1').trim().toUpperCase(),
      isVipRequired: String(row.isVipRequired).toUpperCase() === 'TRUE',
      isActive: String(row.isActive).toUpperCase() === 'TRUE',
      orderIndex: Number(row.orderIndex) || undefined,
    }
  })

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, data }
}
