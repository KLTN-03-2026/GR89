import type { ParseResult, Sheet } from '@/components/common/sheetImport/types'

export function validateGrammarImportJson(input: unknown): ParseResult {
  if (!Array.isArray(input)) {
    return { ok: false, errors: ['JSON phải là mảng các chủ đề ngữ pháp.'] }
  }

  const errors: string[] = []

  input.forEach((item, i) => {
    if (typeof item !== 'object' || item === null) {
      errors.push(`Dòng [${i}]: phải là object`)
      return
    }

    const it = item as any
    if (!it.title) errors.push(`Dòng [${i}]: thiếu "title"`)
    if (it.level && !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(it.level)) {
      errors.push(`Dòng [${i}]: "level" phải là A1-C2`)
    }

    if (it.sections && !Array.isArray(it.sections)) {
      errors.push(`Dòng [${i}]: "sections" phải là mảng`)
    }

    if (it.practice && !Array.isArray(it.practice)) {
      errors.push(`Dòng [${i}]: "practice" phải là mảng`)
    }

    if (it.quizzes && !Array.isArray(it.quizzes)) {
      errors.push(`Dòng [${i}]: "quizzes" phải là mảng`)
    }
  })

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, data: input as any[] }
}

export function parseExcelToGrammarJson(sheets: Sheet[]): ParseResult {
  const errors: string[] = []
  const topicSheet = sheets.find(s => s.name === 'Topics')
  const sectionSheet = sheets.find(s => s.name === 'Sections')
  const practiceSheet = sheets.find(s => s.name === 'Practice')
  const quizSheet = sheets.find(s => s.name === 'Quizzes')

  if (!topicSheet) {
    return { ok: false, errors: ['Thiếu sheet Topics'] }
  }

  const sectionsByTopic: Record<string, any[]> = {}
  if (sectionSheet) {
    sectionSheet.rows.forEach((row, i) => {
      const tid = row.TopicID
      if (!tid || tid === '' || typeof tid !== 'string') return
      if (!sectionsByTopic[tid]) sectionsByTopic[tid] = []

      const examplesStr = String(row['examples (en|vi; en|vi)'] || '').trim()
      const examples = examplesStr ? examplesStr.split(';').map(ex => {
        const [en, vi] = ex.split('|')
        return { en: en?.trim(), vi: vi?.trim() }
      }) : []

      sectionsByTopic[tid].push({
        id: String(row.SectionID || '').trim(),
        title: String(row.title || '').trim(),
        description: String(row.description || '').trim(),
        note: String(row.note || '').trim(),
        formula: String(row.formula || '').trim(),
        list: String(row['list (separated by ;)'] || '').split(';').map(s => s.trim()).filter(Boolean),
        examples
      })
    })
  }

  const practiceByTopic: Record<string, any[]> = {}
  if (practiceSheet) {
    practiceSheet.rows.forEach((row, i) => {
      const tid = row.TopicID
      if (!tid) return
      if (!tid || tid === '' || typeof tid !== 'string') return
      if (!practiceByTopic[tid]) practiceByTopic[tid] = []

      practiceByTopic[tid].push({
        id: String(row.PracticeID || '').trim(),
        type: String(row.type || '').trim(),
        question: String(row.question || '').trim(),
        options: String(row['options (separated by ;)'] || '').split(';').map(s => s.trim()).filter(Boolean),
        wrongSentence: String(row.wrongSentence || '').trim(),
        answer: String(row.answer || '').trim(),
        hint: String(row.hint || '').trim(),
      })
    })
  }

  const quizzesByTopic: Record<string, any[]> = {}
  if (quizSheet) {
    quizSheet.rows.forEach((row, i) => {
      const tid = row.TopicID
      if (!tid || tid === '' || typeof tid !== 'string') return
      if (!quizzesByTopic[tid]) quizzesByTopic[tid] = []

      quizzesByTopic[tid].push({
        question: String(row.question || '').trim(),
        type: String(row.type || 'Multiple Choice').trim(),
        options: String(row['options (separated by ;)'] || '').split(';').map(s => s.trim()).filter(Boolean),
        answer: String(row.answer || '').trim(),
        explanation: String(row.explanation || '').trim(),
      })
    })
  }

  const data = topicSheet.rows.map((row, i) => {
    const tid = row.ID || row.title
    if (!row.title) errors.push(`Topics row ${i}: thiếu title`)
    if (!tid || tid === '' || typeof tid !== 'string') return
    return {
      ID: tid,
      title: String(row.title || '').trim(),
      description: String(row.description || '').trim(),
      level: String(row.level || 'A1').trim().toUpperCase(),
      isActive: row.isActive === 'TRUE' || row.isActive === true,
      isVipRequired: row.isVipRequired === 'TRUE' || row.isVipRequired === true,
      orderIndex: Number(row.orderIndex || 0),
      sections: sectionsByTopic[tid] || [],
      practice: practiceByTopic[tid] || [],
      quizzes: quizzesByTopic[tid] || []
    }
  })

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, data }
}
