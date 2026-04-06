/**
 * Kiểu dữ liệu dùng chung cho module Sheet Import.
 *
 * Luồng: upload → preview → (tuỳ chọn chỉnh JSON) → importing → result.
 * Component gốc: SheetImport.tsx — state wizard ở đây; logic parse/editor trong từng bước (Upload/Preview).
 */

/** Các bước hiển thị trong panel bên phải */
export type SheetImportStep = 'upload' | 'preview' | 'importing' | 'result'

/** Kết quả sau khi gọi onImport (thường là body response API) */
export type SheetImportResult = {
  success: boolean
  created?: number
  updated?: number
  total?: number
  inserted?: number
  skipped?: number
  errors?: Array<{ row?: number; index?: number; reason?: string } | string>
  message?: string
  raw?: unknown
}

/** Một sheet Excel hoặc một khối JSON ảo (name = 'JSON') — mỗi dòng là một object cột→giá trị */
export type PreviewSheet = {
  name: string
  rows: Record<string, unknown>[]
}



/** Kết quả sau khi user chọn file ở bước upload (SheetImportUploadStep → SheetImport). */
export type SheetImportParsedBundle = {
  file: File
  fileType: 'excel' | 'json'
  jsonRoot: unknown[]
}


export type ParseResult =
  | { ok: true; data: unknown[] }
  | { ok: false; errors: string[] }

export type Sheet = {
  name: string
  rows: Array<Record<string, unknown>>
}

export type FileSubmit = {
  fileType: 'excel' | 'json'
  jsonRoot: unknown[]
  skipErrors: boolean
}

export type SheetImportOnImportPayload = FileSubmit & {
  file: File | null
}

/** (Legacy) Patch dữ liệu preview trước khi gọi import. */
export type SheetImportPreviewPatch = {
  importFile: File
  previewSheets: PreviewSheet[]
  jsonRoot: unknown[]
  fileKind?: 'excel' | 'json'
}

/** Kết quả validate trả về cho validateAfterReadJson/validateAfterReadExcel. */
export type SheetImportValidateResult = ParseResult

/**
 * Props của <SheetImport />. Mỗi feature (Listening, Vocabulary, …) chỉ cần
 * truyền title, gợi ý template, và hàm onImport trỏ tới API import tương ứng.
 */
export type SheetImportProps = {
  title: string
  description?: string
  triggerLabel?: string
  /** Tải file Excel mẫu (thường gọi export*Excel từ services) */
  onDownloadTemplate: () => Promise<void> | void
  /** Tải file JSON mẫu (blob tạo trong code) — optional */
  onDownloadJsonTemplate?: () => Promise<void> | void
  excelTemplateHint?: string
  jsonTemplateHint?: string
  /** Thay cho gợi ý mặc định trong khối "Hướng dẫn nhanh" */
  quickGuideTips?: string[]
  defaultSkipErrors?: boolean
  validateAfterReadJson?: (input: unknown) => ParseResult | Promise<ParseResult>
  validateAfterReadExcel?: (input: Sheet[]) => ParseResult | Promise<ParseResult>
  /**
   * Có 2 signature đang được dùng trong codebase:
   * 1) Legacy: (file, skipErrors)
   * 2) JSON-driven: ({ file, fileType, jsonRoot, skipErrors })
   */
  onImport?:
  | ((payload: SheetImportOnImportPayload) => Promise<SheetImportResult>)
  | ((file: File, skipErrors: boolean) => Promise<SheetImportResult>)
  /** Callback (legacy) - SheetImport hiện chưa dùng, nhưng giữ để tránh TS lỗi khi feature truyền vào. */
  onImported?: (result: SheetImportResult) => void
}