'use client'

import { SheetImport } from '@/components/common/sheetImport'
import { exportReadingExcel, importReadingJson } from '@/features/reading/services/api'
import { buildExcelTemplateWorkbook, buildJsonTemplateData } from './templates'
import { parseExcelToReadingJson, validateReadingImportJson } from './validateReadingImport'
import * as XLSX from 'xlsx'
import { toast } from 'react-toastify'
import { SheetImportOnImportPayload } from '@/components/common/sheetImport/types'

export function ReadingSheetImport({ callback }: { callback?: () => void }) {
  return (
    <SheetImport
      title="Import Reading"
      description="Tải lên Excel/JSON để import danh sách bài đọc."
      triggerLabel="Import"
      excelTemplateHint="3 sheet: Readings, Vocabulary, Quizzes"
      jsonTemplateHint="Mảng reading passages kèm vocabulary[] và quizzes[]"
      quickGuideTips={[
        'JSON: mảng [{ title, description, paragraphEn, paragraphVi, image, vocabulary: [...], quizzes: [...] }].',
        'Excel: Sheet Readings chứa thông tin chính, Vocabulary và Quizzes liên kết qua cột ReadingID (ID hoặc Title).',
        'Hệ thống sẽ cập nhật nếu trùng Title, ngược lại sẽ tạo mới.'
      ]}
      onDownloadTemplate={async () => {
        const wb = buildExcelTemplateWorkbook()
        XLSX.writeFile(wb, 'reading-template.xlsx')
        toast.success('Đã tải file mẫu!')
      }}
      onDownloadJsonTemplate={() => {
        const sample = buildJsonTemplateData()
        const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'reading-template.json'
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Đã tải file mẫu JSON!')
      }}
      validateAfterReadJson={validateReadingImportJson}
      validateAfterReadExcel={parseExcelToReadingJson}
      onImport={async (payload: SheetImportOnImportPayload) => {
        const res = await importReadingJson(payload.jsonRoot, payload.skipErrors)

        type ImportResponse = {
          success: boolean
          message?: string
          data?: {
            created?: number
            updated?: number
            total?: number
            skipped?: number
            errors?: Array<{ index: number; reason: string }>
          }
        }

        const response = res as unknown as ImportResponse
        const summary = response.data

        return {
          success: response.success,
          message: response.message || (response.success ? 'Import thành công' : 'Import thất bại'),
          created: summary?.created,
          updated: summary?.updated,
          total: summary?.total,
          skipped: summary?.skipped,
          errors: summary?.errors?.map(e => ({ index: e.index, reason: e.reason })),
          raw: res
        }
      }}
      onImported={() => {
        toast.success('Đã làm mới danh sách bài đọc')
        if (callback) callback()
      }}
      defaultSkipErrors={true}
    />
  )
}

