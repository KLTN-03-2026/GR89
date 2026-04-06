import type { ParseResult, Sheet } from '@/components/common/sheetImport/types'

export function validateReadingImportJson(input: unknown): ParseResult {
  if (!Array.isArray(input)) {
    return { ok: false, errors: ['JSON phải là mảng các bài đọc.'] }
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
    if (!it.paragraphEn) errors.push(`Dòng [${i}]: thiếu "paragraphEn"`)
    if (!it.paragraphVi) errors.push(`Dòng [${i}]: thiếu "paragraphVi"`)
    if (it.level && !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(it.level)) {
      errors.push(`Dòng [${i}]: "level" phải là A1-C2`)
    }

    if (it.vocabulary && !Array.isArray(it.vocabulary)) {
      errors.push(`Dòng [${i}]: "vocabulary" phải là mảng`)
    }

    if (it.quizzes && !Array.isArray(it.quizzes)) {
      errors.push(`Dòng [${i}]: "quizzes" phải là mảng`)
    }
  })

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, data: input as any[] }
}

export function parseExcelToReadingJson(sheets: Sheet[]): ParseResult {
  const errors: string[] = []
  const readingSheet = sheets.find(s => s.name === 'Readings')
  const vocabSheet = sheets.find(s => s.name === 'Vocabulary')
  const quizzesSheet = sheets.find(s => s.name === 'Quizzes')

  if (!readingSheet) {
    return { ok: false, errors: ['Thiếu sheet Readings'] }
  }

  const vocabByReading: Record<string, any[]> = {}
  if (vocabSheet) {
    vocabSheet.rows.forEach((row, i) => {
      const rid = String(row.ReadingID || '').trim()
      if (!rid) return
      if (!vocabByReading[rid]) vocabByReading[rid] = []
      vocabByReading[rid].push({
        word: String(row.word || '').trim(),
        phonetic: String(row.phonetic || '').trim(),
        definition: String(row.definition || '').trim(),
        vietnamese: String(row.vietnamese || '').trim(),
        example: String(row.example || '').trim(),
      })
    })
  }

  const quizzesByReading: Record<string, any[]> = {}
  if (quizzesSheet) {
    quizzesSheet.rows.forEach((row, i) => {
      const rid = String(row.ReadingID || '').trim()
      if (!rid) return
      if (!quizzesByReading[rid]) quizzesByReading[rid] = []

      const optionsStr = String(row['options (separated by |)'] || '').trim()
      const options = optionsStr ? optionsStr.split('|').map(s => s.trim()).filter(Boolean) : []

      quizzesByReading[rid].push({
        question: String(row.question || '').trim(),
        type: String(row.type || 'Multiple Choice').trim(),
        options,
        answer: String(row.answer || '').trim(),
        explanation: String(row.explanation || '').trim(),
      })
    })
  }

  const data = readingSheet.rows.map((row, i) => {
    const rid = String(row.ID || row.title || '').trim()
    if (!row.title) errors.push(`Readings row ${i}: thiếu title`)

    return {
      title: String(row.title || '').trim(),
      description: String(row.description || '').trim(),
      level: String(row.level || 'A1').trim().toUpperCase(),
      paragraphEn: String(row.paragraphEn || '').trim(),
      paragraphVi: String(row.paragraphVi || '').trim(),
      image: String(row.imageID || '').trim(),
      isActive: String(row.isActive).toUpperCase() === 'TRUE',
      isVipRequired: String(row.isVipRequired).toUpperCase() === 'TRUE',
      orderIndex: Number(row.orderIndex) || undefined,
      vocabulary: vocabByReading[rid] || [],
      quizzes: quizzesByReading[rid] || []
    }
  })

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, data }
}
