'use client'

import { SheetImport } from '@/components/common/sheetImport'
import { exportIpaExcel, IIpaCreateData, importIpaJson } from '../../services/api'
import { buildExcelTemplateWorkbook, buildJsonTemplateData } from './templates'
import { parseExcelToIpaJson, validateIpaImportJson } from './validateIpaImport'
import * as XLSX from 'xlsx'
import { toast } from 'react-toastify'
import { SheetImportOnImportPayload } from '@/components/common/sheetImport/types'

export function IpaSheetImport({ callback }: { callback?: () => void }) {
  return (
    <SheetImport
      title="Import IPA"
      description="Tải lên Excel hoặc JSON để import danh sách phiên âm IPA."
      triggerLabel="Import"
      excelTemplateHint="2 sheet: IPAs và Examples"
      jsonTemplateHint="Mảng các đối tượng IPA kèm examples[]"
      quickGuideTips={[
        'JSON: mảng [{ sound, soundType, description, examples: [...] }].',
        'soundType phải là vowel, consonant hoặc diphthong.',
        'image và video là các ID media đã có sẵn.',
        'Excel: Sheet IPAs chứa thông tin âm, Sheet Examples chứa ví dụ (liên kết qua cột sound).'
      ]}
      onDownloadTemplate={async () => {
        const wb = buildExcelTemplateWorkbook()
        XLSX.writeFile(wb, 'ipa-template.xlsx')
      }}
      onDownloadJsonTemplate={() => {
        const sample = buildJsonTemplateData()
        const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'ipa-template.json'
        a.click()
        URL.revokeObjectURL(url)
      }}
      validateAfterReadJson={validateIpaImportJson}
      validateAfterReadExcel={parseExcelToIpaJson}
      onImport={async (payload: SheetImportOnImportPayload) => {
        const res = await importIpaJson(payload.jsonRoot as IIpaCreateData[], payload.skipErrors)

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
        toast.success('Đã làm mới danh sách IPA')
        if (callback) callback()
      }}
      defaultSkipErrors={true}
    />
  )
}

