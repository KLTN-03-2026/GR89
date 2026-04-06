'use client'

import * as XLSX from 'xlsx'
import { toast } from 'react-toastify'

import { SheetImport } from '@/components/common/sheetImport'
import type { SheetImportOnImportPayload, SheetImportResult } from '@/components/common/sheetImport/types'
import { importSpeakingJson } from '../../services/api'
import { buildExcelTemplateWorkbook, buildJsonTemplateData } from './templates'
import { parseExcelToSpeakingJson, validateSpeakingImportJson } from './validateSpeakingImport'

export function SpeakingSheetImport({ callback }: { callback?: () => void }) {
  return (
    <SheetImport
      title="Import Speaking"
      description="Tải lên Excel/JSON để import Speakings và Subtitles."
      triggerLabel="Import"
      excelTemplateHint="2 sheet: Speakings / Subtitles"
      jsonTemplateHint="Mảng speakings có subtitles[]"
      quickGuideTips={[
        'JSON: mảng [{ title, videoUrl, subtitles: [...] }].',
        'Mỗi subtitle cần start, end, english/sentence.',
        'Sử dụng Media ID (ObjectID) cho trường videoUrl.',
        'Hệ thống sẽ cập nhật nếu trùng Title, ngược lại sẽ tạo mới.'
      ]}
      onDownloadTemplate={() => {
        const wb = buildExcelTemplateWorkbook()
        XLSX.writeFile(wb, 'speaking-template.xlsx')
        toast.success('Đã tải file mẫu!')
      }}
      onDownloadJsonTemplate={() => {
        const template = buildJsonTemplateData()
        const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'speaking-template.json'
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Đã tải file mẫu JSON!')
      }}
      validateAfterReadJson={validateSpeakingImportJson}
      validateAfterReadExcel={parseExcelToSpeakingJson}
      defaultSkipErrors={true}
      onImport={async (payload: SheetImportOnImportPayload): Promise<SheetImportResult> => {
        const res = await importSpeakingJson(payload.jsonRoot, payload.skipErrors)

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
        toast.success('Đã làm mới danh sách bài nói')
        if (callback) callback()
      }}
    />
  )
}


