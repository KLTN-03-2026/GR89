import type { ParseResult, Sheet } from '@/components/common/sheetImport/types'

const parseOptions = (raw: unknown) => {
  if (Array.isArray(raw)) {
    return raw.map(v => String(v).trim()).filter(Boolean)
  }
  const s = String(raw || '').trim()
  if (!s) return []
  const parts = s.includes('|') ? s.split('|') : s.split(';')
  return parts.map(v => v.trim()).filter(Boolean)
}

const isMultipleChoice = (type: unknown) => {
  const t = String(type || '').trim().toLowerCase()
  return t === 'multiple choice' || t === 'multiple-choice' || t === 'mcq' || t.includes('multiple')
}

export function validateVocabularyImportJson(input: unknown): ParseResult {
  if (!Array.isArray(input)) {
    return { ok: false, errors: ['JSON phải là mảng các topic.'] }
  }

  const errors: string[] = []

  input.forEach((topic, i) => {
    if (typeof topic !== 'object' || topic === null) {
      errors.push(`Topic [${i}]: phải là object`)
      return
    }

    const t = topic as any
    if (!t.name) errors.push(`Topic [${i}]: thiếu "name"`)
    if (!t.image) errors.push(`Topic [${i}]: thiếu "image" (media ID)`)
    if (t.level && !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(t.level)) {
      errors.push(`Topic [${i}]: "level" phải là A1-C2`)
    }

    if (t.words && !Array.isArray(t.words)) {
      errors.push(`Topic [${i}]: "words" phải là mảng`)
    }

    t.words?.forEach((w: any, j: number) => {
      if (!w.word) errors.push(`Topic [${i}] Word [${j}]: thiếu "word"`)
      if (!w.transcription) errors.push(`Topic [${i}] Word [${j}]: thiếu "transcription"`)
      if (!w.partOfSpeech) errors.push(`Topic [${i}] Word [${j}]: thiếu "partOfSpeech"`)
      if (!w.definition) errors.push(`Topic [${i}] Word [${j}]: thiếu "definition"`)
      if (!w.vietnameseMeaning) errors.push(`Topic [${i}] Word [${j}]: thiếu "vietnameseMeaning"`)
      if (!w.example) errors.push(`Topic [${i}] Word [${j}]: thiếu "example"`)
      if (!w.image) errors.push(`Topic [${i}] Word [${j}]: thiếu "image" (media ID)`)
    })

    if (t.quizzes && !Array.isArray(t.quizzes)) {
      errors.push(`Topic [${i}]: "quizzes" phải là mảng`)
    }

    t.quizzes?.forEach((q: any, j: number) => {
      if (!q.question) errors.push(`Topic [${i}] Quiz [${j}]: thiếu "question"`)
      if (!q.type) errors.push(`Topic [${i}] Quiz [${j}]: thiếu "type"`)
      if (q.options !== undefined && typeof q.options === 'string') {
        q.options = parseOptions(q.options)
      }
      if (isMultipleChoice(q.type)) {
        const opts = Array.isArray(q.options) ? q.options : []
        if (opts.length < 2) errors.push(`Topic [${i}] Quiz [${j}]: type "Multiple Choice" phải có "options" (ít nhất 2 lựa chọn)`)
      }
      if (!q.answer) errors.push(`Topic [${i}] Quiz [${j}]: thiếu "answer"`)
      if (!q.explanation) errors.push(`Topic [${i}] Quiz [${j}]: thiếu "explanation"`)
    })
  })

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, data: input as any[] }
}

export function parseExcelToVocabularyJson(sheets: Sheet[]): ParseResult {
  const errors: string[] = []

  const topicSheet = sheets.find(s => s.name === 'Topics')
  const wordSheet = sheets.find(s => s.name === 'Vocabularies')
  const quizSheet = sheets.find(s => s.name === 'Quizzes')

  if (!topicSheet) {
    return { ok: false, errors: ['Thiếu sheet Topics'] }
  }

  const topicMap = new Map<string, any>()

  topicSheet.rows.forEach((row, i) => {
    const topicId = String(row.topicId || '')
    if (!topicId) {
      errors.push(`Topics row ${i}: thiếu topicId`)
      return
    }
    if (!row.name) {
      errors.push(`Topics row ${i}: thiếu name`)
    }

    const topic = {
      name: String(row.name || ''),
      image: String(row.image || ''),
      level: String(row.level || 'A1').trim().toUpperCase(),
      isVipRequired: String(row.isVipRequired).toUpperCase() === 'TRUE',
      isActive: String(row.isActive).toUpperCase() === 'TRUE',
      orderIndex: Number(row.orderIndex) || undefined,
      words: [],
      quizzes: [],
    }

    topicMap.set(topicId, topic)
  })

  wordSheet?.rows.forEach((row, i) => {
    const topicKey = String(row.topicKey || '')
    const topic = topicMap.get(topicKey)
    if (!topic) {
      errors.push(`Vocabularies row ${i}: topicKey "${topicKey}" không tồn tại`)
      return
    }

    topic.words.push({
      word: String(row.word || ''),
      transcription: String(row.transcription || ''),
      partOfSpeech: String(row.partOfSpeech || ''),
      definition: String(row.definition || ''),
      vietnameseMeaning: String(row.vietnameseMeaning || ''),
      example: String(row.example || ''),
      image: String(row.image || ''),
      isVipRequired: row.isVipRequired === 'true' || row.isVipRequired === true,
    })
  })

  quizSheet?.rows.forEach((row, i) => {
    const topicKey = String(row.topicKey || '')
    const topic = topicMap.get(topicKey)
    if (!topic) {
      errors.push(`Quizzes row ${i}: topicKey "${topicKey}" không tồn tại`)
      return
    }

    const type = String(row.type || 'Multiple Choice').trim()
    const optionsRaw =
      (row as any).options ??
      (row as any)['options (separated by |)'] ??
      (row as any)['options ?'] ??
      (row as any)['options (separated by ;)']
    const options = parseOptions(optionsRaw)
    if (isMultipleChoice(type) && options.length < 2) {
      errors.push(`Quizzes row ${i}: type "Multiple Choice" phải có options (ít nhất 2 lựa chọn)`)
    }

    topic.quizzes.push({
      type,
      question: String(row.question || ''),
      options: options,
      answer: String(row.answer || ''),
      explanation: String(row.explanation || ''),
    })
  })

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, data: Array.from(topicMap.values()) }
}
