import type { ParseResult, Sheet } from '@/components/common/sheetImport/types'

export function validateWritingImportJson(input: unknown): ParseResult {
  if (!Array.isArray(input)) {
    return { ok: false, errors: ['JSON phải là mảng các bài viết.'] }
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
    if (!it.minWords || isNaN(Number(it.minWords))) errors.push(`Dòng [${i}]: "minWords" không hợp lệ`)
    if (!it.maxWords || isNaN(Number(it.maxWords))) errors.push(`Dòng [${i}]: "maxWords" không hợp lệ`)
    if (!it.duration || isNaN(Number(it.duration))) errors.push(`Dòng [${i}]: "duration" không hợp lệ`)
    if (it.level && !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(it.level)) {
      errors.push(`Dòng [${i}]: "level" phải là A1-C2`)
    }

    if (it.suggestedStructure && !Array.isArray(it.suggestedStructure)) {
      errors.push(`Dòng [${i}]: "suggestedStructure" phải là mảng`)
    }

    it.suggestedStructure?.forEach((s: any, j: number) => {
      if (!s.title) errors.push(`Dòng [${i}] Structure [${j}]: thiếu "title"`)
    })
  })

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, data: input as any[] }
}

export function parseExcelToWritingJson(sheets: Sheet[]): ParseResult {
  const errors: string[] = []
  const writingSheet = sheets.find(s => s.name === 'Writings')
  const structureSheet = sheets.find(s => s.name === 'Structures')

  if (!writingSheet) {
    return { ok: false, errors: ['Thiếu sheet Writings'] }
  }

  const writingMap = new Map<string, any>()

  writingSheet.rows.forEach((row, i) => {
    const writingId = String(row.writingId || '')
    if (!writingId) {
      errors.push(`Writings row ${i}: thiếu writingId`)
      return
    }
    if (!row.title) {
      errors.push(`Writings row ${i}: thiếu title`)
    }

    const suggestedVocab = typeof row.suggestedVocabulary === 'string'
      ? row.suggestedVocabulary.split('|').map(v => v.trim()).filter(Boolean)
      : []

    const writing = {
      title: String(row.title || ''),
      description: String(row.description || ''),
      level: String(row.level || 'A1').trim().toUpperCase(),
      minWords: Number(row.minWords || 0),
      maxWords: Number(row.maxWords || 0),
      duration: Number(row.duration || 0),
      suggestedVocabulary: suggestedVocab,
      isVipRequired: row.isVipRequired === 'true' || row.isVipRequired === true,
      isActive: row.isActive === 'true' || row.isActive === true,
      suggestedStructure: [],
    }

    writingMap.set(writingId, writing)
  })

  structureSheet?.rows.forEach((row, i) => {
    const writingKey = String(row.writingKey || '')
    const writing = writingMap.get(writingKey)
    if (!writing) {
      errors.push(`Structures row ${i}: writingKey "${writingKey}" không tồn tại`)
      return
    }

    writing.suggestedStructure.push({
      step: Number(row.step || 0),
      title: String(row.title || ''),
      description: String(row.description || ''),
    })
  })

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, data: Array.from(writingMap.values()) }
}
