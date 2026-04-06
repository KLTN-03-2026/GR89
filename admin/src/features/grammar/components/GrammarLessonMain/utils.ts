'use client'

import { BookOpen, Lightbulb, List, Sigma, Table2, Text } from 'lucide-react'

import type { LessonSection, PracticeQuestion, QuizQuestion, SectionBlockOption } from '../../types'

export const SECTION_BLOCK_OPTIONS: SectionBlockOption[] = [
  { key: 'description', label: 'Mô tả', description: 'Đoạn giải thích chính của section.', icon: Text },
  { key: 'note', label: 'Lưu ý', description: 'Điểm quan trọng cần ghi nhớ.', icon: Lightbulb },
  { key: 'formula', label: 'Công thức', description: 'Cấu trúc hoặc mẫu câu.', icon: Sigma },
  { key: 'list', label: 'Danh sách', description: 'Các ý ngắn theo từng dòng.', icon: List },
  { key: 'examples', label: 'Ví dụ', description: 'Ví dụ Anh - Việt cho section.', icon: BookOpen },
  { key: 'table', label: 'Bảng', description: 'Nội dung dạng bảng so sánh.', icon: Table2 }
]

export function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
}

export function getPracticeTypeLabel(type: PracticeQuestion['type']) {
  if (type === 'fill_blank') return 'Điền vào chỗ trống'
  if (type === 'multiple_choice') return 'Trắc nghiệm'
  return 'Sửa câu'
}

export function getQuizTypeLabel(type: QuizQuestion['type']) {
  if (type === 'Multiple Choice') return 'Trắc nghiệm'
  return 'Điền vào chỗ trống'
}

export function parsePipeListInput(value: string) {
  return value
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)
}

export function getNonEmptyLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export function getSingleTextareaError(value: string, label: string) {
  if (!value.trim()) return `${label} không được để trống`
  return ''
}

export function getFormulaTextareaError(value: string) {
  if (!value.trim()) return 'Công thức không được để trống'
  if (value.includes('\n')) return 'Công thức chỉ được nhập 1 dòng'
  return ''
}

export function getListTextareaError(value: string) {
  if (!value.trim()) return 'Danh sách không được để trống'
  if (getNonEmptyLines(value).length < 2) return 'Danh sách phải có ít nhất 2 item'
  return ''
}

export function getExamplesTextareaError(value: string) {
  const lines = getNonEmptyLines(value)
  if (lines.length === 0) return 'Ví dụ không được để trống'

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const pipeCount = (line.match(/\|/g) || []).length

    if (pipeCount !== 1) return `Ví dụ dòng ${index + 1} phải có đúng 1 dấu |`

    const [en, vi] = line.split('|').map((part) => part.trim())
    if (!en || !vi) return `Ví dụ dòng ${index + 1} phải có đủ nội dung ở 2 bên dấu |`
  }

  return ''
}

export function getTableHeaderError(value: string) {
  if (!value.trim()) return 'Table header không được để trống'

  const cells = value.split('|').map((cell) => cell.trim())
  if (cells.some((cell) => !cell)) return 'Table header không được có cột trống'

  return ''
}

export function getTableRowsError(value: string, headerCount: number) {
  const lines = getNonEmptyLines(value)
  if (lines.length === 0) return 'Table rows không được để trống'
  if (headerCount === 0) return 'Table rows cần table header hợp lệ trước'

  for (let index = 0; index < lines.length; index += 1) {
    const cells = lines[index].split('|').map((cell) => cell.trim())

    if (cells.length !== headerCount) {
      return `Table row dòng ${index + 1} phải khớp ${headerCount} cột của header`
    }

    if (cells.some((cell) => !cell)) {
      return `Table row dòng ${index + 1} không được có ô trống`
    }
  }

  return ''
}

export function getOptionsTextareaError(options: string[], label: string) {
  if (options.length === 0) return `${label} không được để trống`
  if (options.some((option) => !option.trim())) return `${label} không được có dòng trống`
  return ''
}

export function getSelectedAnswerError(answer: string, options: string[], label: string) {
  if (!answer.trim()) return `${label} không được để trống`
  if (!options.includes(answer)) return `${label} phải thuộc danh sách lựa chọn`
  return ''
}

function normalizeTableRow(row: string[], headerCount: number) {
  if (headerCount <= 0) return []

  const trimmed = row.map((cell) => cell.trim())
  if (trimmed.length === headerCount) return trimmed
  if (trimmed.length > headerCount) return trimmed.slice(0, headerCount)

  return [...trimmed, ...Array.from({ length: headerCount - trimmed.length }, () => '')]
}

export function serializeTableRows(rows: string[][]) {
  return rows.map((row) => row.join(' | ')).join('\n')
}

export function parseExamplesInput(value: string) {
  const lines = value.split('\n')
  const examples: NonNullable<LessonSection['examples']> = []
  const invalidLines: number[] = []

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim()
    if (!line) return

    const parts = line.split('|')
    const [enPart, viPart] = parts
    const en = enPart?.trim() || ''
    const vi = viPart?.trim() || ''

    if (parts.length !== 2 || !en || !vi) {
      invalidLines.push(index + 1)
      return
    }

    examples.push({ en, vi })
  })

  return { examples, invalidLines }
}

export function parseTableRowsInput(value: string, headerCount: number) {
  const lines = value.split('\n')
  const rows: string[][] = []
  const invalidLines: number[] = []

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim()
    if (!line) return

    const rawCells = rawLine.split('|').map((cell) => cell.trim())
    if (headerCount > 0 && rawCells.length !== headerCount) {
      invalidLines.push(index + 1)
    }

    rows.push(headerCount > 0 ? normalizeTableRow(rawCells, headerCount) : rawCells.filter(Boolean))
  })

  return { rows, invalidLines }
}

