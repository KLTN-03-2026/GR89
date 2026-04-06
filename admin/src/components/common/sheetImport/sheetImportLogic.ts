import type { SheetImportStep } from './types'

/**
 * Nội dung ban đầu cho ô chỉnh sửa JSON:
 * - file JSON: pretty-print `jsonRoot`
 * - Excel: object `{ [tênSheet]: rows[] }` từ preview
 */
export function buildJsonEditorDraft(jsonRoot: unknown[] | null): string {
  return JSON.stringify(jsonRoot ?? [], null, 2)
}

export type ApplyJsonDraftResult =
  | { ok: true; data: unknown[] }
  | { ok: false; error: 'parse' | 'excel_schema'; message: string }

/**
 * Parse chuỗi user trong editor → preview + `File` gửi API.
 * Không toast — hook/UI gọi toast sau khi `ok: true`.
 */
export function applyJsonDraftFromString(input: {
  jsonDraft: string
}): ApplyJsonDraftResult {
  try {
    const parsed = JSON.parse(input.jsonDraft)
    if (!Array.isArray(parsed)) {
      return {
        ok: false,
        error: 'excel_schema',
        message: 'JSON phải là một mảng (array). Ví dụ: [{...}, {...}]'
      }
    }

    return {
      ok: true,
      data: parsed
    }
  } catch {
    return {
      ok: false,
      error: 'parse',
      message: 'JSON không hợp lệ. Kiểm tra dấu phẩy, ngoặc và chuỗi.'
    }
  }
}

/** Dòng phụ đề dưới tiêu đề Sheet. */
export function getSheetImportHeaderDescription(
  step: SheetImportStep,
  file: File | null,
  totalRows: number,
  description: string | undefined
): string {
  if (step === 'preview' && file) {
    return `Kiểm tra dữ liệu trước khi import (${totalRows} rows) — "${file.name}"`
  }
  return description || 'Tải lên  Excel/JSON để import dữ liệu.'
}

/** % hiển thị (0–100) từ `progress.current` / `progress.total`. */
export function importProgressPercent(current: number, total: number): number {
  return total > 0 ? Math.round((current / total) * 100) : 0
}
