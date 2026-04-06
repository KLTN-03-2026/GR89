import type { ParseResult, Sheet } from '@/components/common/sheetImport/types'

export function validateIpaImportJson(input: unknown): ParseResult {
  if (!Array.isArray(input)) {
    return { ok: false, errors: ['JSON phải là mảng các âm IPA.'] }
  }

  const errors: string[] = []

  input.forEach((item, i) => {
    if (typeof item !== 'object' || item === null) {
      errors.push(`Dòng [${i}]: phải là object`)
      return
    }

    const it = item as any
    if (!it.sound) errors.push(`Dòng [${i}]: thiếu "sound"`)
    if (!it.soundType) {
      errors.push(`Dòng [${i}]: thiếu "soundType"`)
    } else if (!['vowel', 'consonant', 'diphthong'].includes(it.soundType)) {
      errors.push(`Dòng [${i}]: "soundType" không hợp lệ (vowel/consonant/diphthong)`)
    }
    if (!it.image && !it.imageID) errors.push(`Dòng [${i}]: thiếu "image" hoặc "imageID" (media ID)`)
    if (!it.description) errors.push(`Dòng [${i}]: thiếu "description"`)

    if (it.examples && !Array.isArray(it.examples)) {
      errors.push(`Dòng [${i}]: "examples" phải là mảng`)
    } else if (it.examples) {
      it.examples.forEach((ex: any, j: number) => {
        if (!ex.word) errors.push(`Dòng [${i}] ví dụ [${j}]: thiếu "word"`)
      })
    }
  })

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, data: input as any[] }
}

export function parseExcelToIpaJson(sheets: Sheet[]): ParseResult {
  const errors: string[] = []
  const ipaSheet = sheets.find(s => s.name === 'IPAs')
  const exampleSheet = sheets.find(s => s.name === 'Examples')

  if (!ipaSheet) {
    return { ok: false, errors: ['Thiếu sheet IPAs'] }
  }

  // Group examples by sound
  const examplesByIpa: Record<string, any[]> = {}
  if (exampleSheet) {
    exampleSheet.rows.forEach((row, i) => {
      if (!row.IPA_ID) {
        errors.push(`Examples row ${i}: thiếu cột IPA_ID để liên kết`)
        return
      }
      if (!row.word) {
        errors.push(`Examples row ${i}: thiếu word`)
        return
      }

      const ipaId = String(row.IPA_ID).trim()
      if (!examplesByIpa[ipaId]) examplesByIpa[ipaId] = []

      examplesByIpa[ipaId].push({
        word: String(row.word || '').trim(),
        phonetic: String(row.phonetic || '').trim(),
        vietnamese: String(row.vietnamese || '').trim(),
      })
    })
  }

  const data = ipaSheet.rows.map((row, i) => {
    if (!row.sound) errors.push(`IPAs row ${i}: thiếu sound`)
    if (!row.soundType) errors.push(`IPAs row ${i}: thiếu soundType`)
    if (!row.imageID) errors.push(`IPAs row ${i}: thiếu imageID (media ID)`)
    if (!row.description) errors.push(`IPAs row ${i}: thiếu description`)

    const ipaId = String(row.ID || row.sound || '').trim()

    return {
      sound: String(row.sound || '').trim(),
      soundType: String(row.soundType || '').trim(),
      image: String(row.imageID || '').trim(),
      video: String(row.videoID || '').trim(),
      description: String(row.description || '').trim(),
      isVipRequired: String(row.isVipRequired).toLowerCase() === 'true',
      isActive: String(row.isActive).toLowerCase() === 'true',
      examples: examplesByIpa[ipaId] || []
    }
  })

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, data }
}
