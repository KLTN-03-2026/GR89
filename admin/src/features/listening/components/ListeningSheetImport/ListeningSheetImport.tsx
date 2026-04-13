'use client'

import * as XLSX from 'xlsx'
import { toast } from 'react-toastify'

import { SheetImport } from '@/components/common/sheetImport'
import type { SheetImportOnImportPayload, SheetImportResult } from '@/components/common/sheetImport/types'
import { importListeningJson } from '../../services/api'
import { buildExcelTemplateWorkbook, buildJsonTemplateData } from './templates'
import { parseExcelToListeningJson, validateListeningImportJson } from './validateListeningImport'

export function ListeningSheetImport({ callback }: { callback?: () => void }) {
  return (
    <SheetImport
      title="Import Listening"
      description="Tải lên Excel/JSON để import danh sách bài nghe."
      triggerLabel="Import"
      excelTemplateHint="1 sheet: Listenings"
      jsonTemplateHint="Mảng lessons với audio/subtitle/subtitleVi/quiz(optional)"
      quickGuideTips={[
        'JSON: mảng [{ title, description, audio, subtitle, subtitleVi, quiz, isActive, isVipRequired }].',
        'quiz là mảng [{ question, options[], answer }], answer phải nằm trong options.',
        'Số lượng dòng của subtitle và subtitleVi phải bằng nhau.',
        'Sử dụng Media ID (ObjectID) cho trường audio.',
        'Hệ thống sẽ cập nhật nếu trùng Title, ngược lại sẽ tạo mới.'
      ]}
      onDownloadTemplate={() => {
        const wb = buildExcelTemplateWorkbook()
        XLSX.writeFile(wb, 'listening-template.xlsx')
        toast.success('Đã tải file mẫu!')
      }}
      onDownloadJsonTemplate={() => {
        const template = buildJsonTemplateData()
        const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'listening-template.json'
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Đã tải file mẫu JSON!')
      }}
      validateAfterReadJson={validateListeningImportJson}
      validateAfterReadExcel={parseExcelToListeningJson}
      defaultSkipErrors={true}
      onImport={async (payload: SheetImportOnImportPayload): Promise<SheetImportResult> => {
        const res = await importListeningJson(payload.jsonRoot, payload.skipErrors)

        type ImportListeningJsonResponse = {
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

        const response = res as unknown as ImportListeningJsonResponse
        const summary = response.data
        const errors = Array.isArray(summary?.errors)
          ? summary!.errors.map((e) => ({ index: e.index, reason: e.reason }))
          : undefined

        return {
          success: response.success,
          raw: res,
          created: summary?.created,
          updated: summary?.updated,
          total: summary?.total,
          skipped: summary?.skipped,
          errors
        }
      }}
      onImported={() => {
        toast.success('Đã làm mới danh sách bài nghe')
        if (callback) callback()
      }}
    />
  )
}


