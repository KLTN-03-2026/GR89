'use client'

import * as XLSX from 'xlsx'
import { toast } from 'react-toastify'

import { SheetImport } from '@/components/common/sheetImport'
import type { SheetImportOnImportPayload, SheetImportResult } from '@/components/common/sheetImport/types'
import { importWritingJson } from '../../services/api'
import { buildExcelTemplateWorkbook, buildJsonTemplateData } from './templates'
import { parseExcelToWritingJson, validateWritingImportJson } from './validateWritingImport'

export function WritingSheetImport({ callback }: { callback?: () => void }) {
  return (
    <SheetImport
      title="Import Writing"
      description="Tải lên Excel/JSON để import danh sách bài viết."
      triggerLabel="Import"
      excelTemplateHint="2 sheet: Writings / Structures"
      jsonTemplateHint="Mảng writings có suggestedStructure[]"
      quickGuideTips={[
        'JSON: mảng [{ title, description, minWords, maxWords, duration, suggestedStructure: [...] }].',
        'suggestedVocabulary: mảng string (JSON) hoặc chuỗi cách nhau bởi | (Excel).',
        'Hệ thống sẽ cập nhật nếu trùng Title, ngược lại sẽ tạo mới.'
      ]}
      onDownloadTemplate={() => {
        const wb = buildExcelTemplateWorkbook()
        XLSX.writeFile(wb, 'writing-template.xlsx')
        toast.success('Đã tải file mẫu!')
      }}
      onDownloadJsonTemplate={() => {
        const template = buildJsonTemplateData()
        const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'writing-template.json'
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Đã tải file mẫu JSON!')
      }}
      validateAfterReadJson={validateWritingImportJson}
      validateAfterReadExcel={parseExcelToWritingJson}
      defaultSkipErrors={true}
      onImport={async (payload: SheetImportOnImportPayload): Promise<SheetImportResult> => {
        const res = await importWritingJson(payload.jsonRoot, payload.skipErrors)

        type ImportWritingJsonResponse = {
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

        const response = res as unknown as ImportWritingJsonResponse
        const summary = response.data
        const errors = Array.isArray(summary?.errors)
          ? summary!.errors.map((e) => ({ index: e.index, reason: e.reason }))
          : undefined

        return {
          success: response.success,
          message: response.message || (response.success ? 'Import thành công' : 'Import thất bại'),
          raw: res,
          created: summary?.created,
          updated: summary?.updated,
          total: summary?.total,
          skipped: summary?.skipped,
          errors
        }
      }}
      onImported={() => {
        toast.success('Đã làm mới danh sách bài viết')
        if (callback) callback()
      }}
    />
  )
}


