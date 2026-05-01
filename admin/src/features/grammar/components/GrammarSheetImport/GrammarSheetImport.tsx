'use client'

import { SheetImport } from '@/components/common/sheetImport'
import { importGrammarJson } from '../../services/api'
import { buildExcelTemplateWorkbook, buildJsonTemplateData } from './templates'
import { parseExcelToGrammarJson, validateGrammarImportJson } from './validateGrammarImport'
import * as XLSX from 'xlsx'
import { toast } from 'react-toastify'
import { SheetImportOnImportPayload } from '@/components/common/sheetImport/types'
import { GrammarTopic } from '../../types'

export function GrammarSheetImport({ callback }: { callback?: () => void }) {
  return (
    <SheetImport
      title="Import Ngữ pháp"
      description="Tải lên Excel/JSON để import danh sách chủ đề ngữ pháp."
      triggerLabel="Import"
      excelTemplateHint="4 sheet: Topics, Sections, Practice, Quizzes"
      jsonTemplateHint="Mảng các chủ đề kèm sections[], practice[], quizzes[]"
      quickGuideTips={[
        'JSON: mảng các chủ đề ngữ pháp đúng schema.',
        'Excel: Giữ đúng tên các sheet Topics, Sections, Practice, Quizzes.',
        'Sử dụng TopicID trong các sheet con để liên kết với sheet Topics (theo ID hoặc Title).',
        'Cột list và options ngăn cách bằng dấu chấm phẩy (;).',
        'Cột examples ngăn cách bằng dấu chấm phẩy (;), mỗi example dạng en|vi.'
      ]}
      onDownloadTemplate={async () => {
        const wb = buildExcelTemplateWorkbook()
        XLSX.writeFile(wb, 'grammar-template.xlsx')
        toast.success('Đã tải file mẫu Excel!')
      }}
      onDownloadJsonTemplate={() => {
        const sample = buildJsonTemplateData()
        const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'grammar-template.json'
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Đã tải file mẫu JSON!')
      }}
      validateAfterReadJson={validateGrammarImportJson}
      validateAfterReadExcel={parseExcelToGrammarJson}
      onImport={async (payload: SheetImportOnImportPayload) => {
        const res = await importGrammarJson(payload.jsonRoot as GrammarTopic[], payload.skipErrors)

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
        toast.success('Đã làm mới danh sách ngữ pháp')
        if (callback) callback()
      }}
      defaultSkipErrors={true}
    />
  )
}
