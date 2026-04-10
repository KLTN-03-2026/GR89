import type { ParseResult, Sheet } from '@/components/common/sheetImport/types'

type QuizItem = {
  question?: string
  options?: string[]
  answer?: string
}

type ListeningImportItem = {
  title?: string
  description?: string
  audio?: string
  subtitle?: string
  subtitleVi?: string
  level?: string
  quiz?: QuizItem[]
}

export function validateListeningImportJson(input: unknown): ParseResult {
  if (!Array.isArray(input)) {
    return { ok: false, errors: ['JSON phải là mảng các bài nghe.'] }
  }

  const errors: string[] = []
  const countSentences = (text: string) => text.trim().split(/(?<=[.!?])\s+/).filter(Boolean).length

  const validateQuiz = (quizValue: unknown, rowLabel: string) => {
    if (quizValue == null) return
    const quiz = quizValue as QuizItem[]
    if (!Array.isArray(quiz)) {
      errors.push(`${rowLabel}: "quiz" phải là mảng`)
      return
    }
    quiz.forEach((q, idx) => {
      if (!q || typeof q !== 'object') {
        errors.push(`${rowLabel}: quiz[${idx}] phải là object`)
        return
      }
      if (!q.question) errors.push(`${rowLabel}: quiz[${idx}] thiếu question`)
      if (!Array.isArray(q.options) || q.options.length < 2) {
        errors.push(`${rowLabel}: quiz[${idx}] options phải có ít nhất 2 phần tử`)
      }
      if (!q.answer) errors.push(`${rowLabel}: quiz[${idx}] thiếu answer`)
      if (Array.isArray(q.options) && q.answer && !q.options.includes(q.answer)) {
        errors.push(`${rowLabel}: quiz[${idx}] answer phải nằm trong options`)
      }
    })
  }

  input.forEach((item, i) => {
    if (typeof item !== 'object' || item === null) {
      errors.push(`Dòng [${i}]: phải là object`)
      return
    }

    const it = item as ListeningImportItem
    if (!it.title) errors.push(`Dòng [${i}]: thiếu "title"`)
    if (!it.description) errors.push(`Dòng [${i}]: thiếu "description"`)
    if (!it.audio) errors.push(`Dòng [${i}]: thiếu "audio" (media ID)`)
    if (!it.subtitle) errors.push(`Dòng [${i}]: thiếu "subtitle"`)
    if (!it.subtitleVi) errors.push(`Dòng [${i}]: thiếu "subtitleVi"`)
    if (it.subtitle && it.subtitleVi && countSentences(String(it.subtitle)) !== countSentences(String(it.subtitleVi))) {
      errors.push(`Dòng [${i}]: số câu subtitle và subtitleVi phải bằng nhau`)
    }
    if (it.level && !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(it.level)) {
      errors.push(`Dòng [${i}]: "level" phải là A1-C2`)
    }
    validateQuiz(it.quiz, `Dòng [${i}]`)
  })

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, data: input as ListeningImportItem[] }
}

export function parseExcelToListeningJson(sheets: Sheet[]): ParseResult {
  const errors: string[] = []
  const countSentences = (text: string) => text.trim().split(/(?<=[.!?])\s+/).filter(Boolean).length
  const sheet = sheets.find(s => s.name === 'Listenings')

  if (!sheet) {
    return { ok: false, errors: ['Thiếu sheet Listenings'] }
  }

  const data = sheet.rows.map((row, i) => {
    if (!row.title) errors.push(`Listenings row ${i}: thiếu title`)
    if (!row.description) errors.push(`Listenings row ${i}: thiếu description`)
    if (!row.audioID) errors.push(`Listenings row ${i}: thiếu audioID (media ID)`)
    if (!row.subtitle) errors.push(`Listenings row ${i}: thiếu subtitle`)
    if (!row.subtitleVi) errors.push(`Listenings row ${i}: thiếu subtitleVi`)
    if (row.subtitle && row.subtitleVi && countSentences(String(row.subtitle)) !== countSentences(String(row.subtitleVi))) {
      errors.push(`Listenings row ${i}: số câu subtitle và subtitleVi phải bằng nhau`)
    }

    let parsedQuiz: QuizItem[] = []
    if (row.quizJson) {
      try {
        const q = JSON.parse(String(row.quizJson))
        if (!Array.isArray(q)) {
          errors.push(`Listenings row ${i}: quizJson phải là mảng JSON`)
        } else {
          parsedQuiz = q
        }
      } catch {
        errors.push(`Listenings row ${i}: quizJson không phải JSON hợp lệ`)
      }
    }

    return {
      title: String(row.title || '').trim(),
      description: String(row.description || '').trim(),
      audio: String(row.audioID || '').trim(),
      subtitle: String(row.subtitle || '').trim(),
      subtitleVi: String(row.subtitleVi || '').trim(),
      quiz: parsedQuiz,
      level: String(row.level || 'A1').trim().toUpperCase(),
      isVipRequired: String(row.isVipRequired).toUpperCase() === 'TRUE',
      isActive: String(row.isActive).toUpperCase() === 'TRUE',
      orderIndex: Number(row.orderIndex) || undefined,
    }
  })

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, data }
}
