'use client'

import { SheetImport } from '@/components/common/sheetImport'
import { importEntertainmentJson } from '../../services/api'
import { buildExcelTemplateWorkbook, buildJsonTemplateData } from './templates'
import { parseExcelToEntertainmentJson, validateEntertainmentImportJson } from './validateEntertainmentImport'
import * as XLSX from 'xlsx'
import { toast } from 'react-toastify'
import { SheetImportOnImportPayload } from '@/components/common/sheetImport/types'

export function EntertainmentSheetImport({ callback, type }: { callback?: () => void, type?: 'movie' | 'music' | 'podcast' }) {
  return (
    <SheetImport
      title={`Import Giải Trí ${type ? `(${type})` : ''}`}
      description="Tải lên Excel hoặc JSON để import danh sách video giải trí."
      triggerLabel="Import"
      excelTemplateHint="1 sheet: Entertainments"
      jsonTemplateHint="Mảng các đối tượng giải trí"
      quickGuideTips={[
        'JSON: mảng [{ title, type, description, videoUrl, thumbnailUrl, isActive, isVipRequired }].',
        `Type mặc định: ${type || 'tự chọn (movie/music/podcast)'}.`,
        'videoUrl và thumbnailUrl là các ID media hoặc URL.',
        'Hệ thống sẽ cập nhật nếu trùng Title + Type, ngược lại sẽ tạo mới.'
      ]}
      onDownloadTemplate={async () => {
        const wb = buildExcelTemplateWorkbook()
        XLSX.writeFile(wb, `entertainment${type ? `-${type}` : ''}-template.xlsx`)
        toast.success('Đã tải file mẫu Excel!')
      }}
      onDownloadJsonTemplate={() => {
        const sample = buildJsonTemplateData()
        const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `entertainment${type ? `-${type}` : ''}-template.json`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Đã tải file mẫu JSON!')
      }}
      validateAfterReadJson={validateEntertainmentImportJson}
      validateAfterReadExcel={parseExcelToEntertainmentJson}
      onImport={async (payload: SheetImportOnImportPayload) => {
        const res = await importEntertainmentJson(payload.jsonRoot, payload.skipErrors, type)

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
        toast.success('Đã làm mới danh sách video giải trí')
        if (callback) callback()
      }}
      defaultSkipErrors={true}
    />
  )
}

