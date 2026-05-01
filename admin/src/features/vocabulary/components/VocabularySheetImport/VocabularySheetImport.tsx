'use client'

import * as XLSX from 'xlsx'
import { toast } from 'react-toastify'

import { SheetImport } from '@/components/common/sheetImport'
import type { SheetImportOnImportPayload, SheetImportResult } from '@/components/common/sheetImport/types'
import { importVocabularyJson } from '../../services/api'
import { buildExcelTemplateWorkbook, buildJsonTemplateData } from './templates'
import { parseExcelToVocabularyJson, validateVocabularyImportJson } from './validateVocabularyImport'
import { VocabularyTopic } from '../../types'

export function VocabularySheetImport({ callback }: { callback?: () => void }) {
  return (
    <SheetImport
      title="Import Từ Vựng"
      description="Tải lên Excel/JSON để import Topics / Vocabularies / Quizzes."
      triggerLabel="Import"
      excelTemplateHint="3 sheet: Topics / Vocabularies / Quizzes"
      jsonTemplateHint="Mảng topics có words[] và quizzes[]"
      quickGuideTips={[
        'JSON: mảng [{ name, image, words: [...], quizzes: [...] }].',
        'Word cần word, transcription, partOfSpeech, definition, vietnameseMeaning, example, image.',
        'Quiz Multiple Choice cần options + answer.',
        'Sử dụng Media ID (ObjectID) cho các trường image.'
      ]}
      onDownloadTemplate={() => {
        const wb = buildExcelTemplateWorkbook()
        XLSX.writeFile(wb, 'vocabulary-template.xlsx')
        toast.success('Đã tải file mẫu!')
      }}
      onDownloadJsonTemplate={() => {
        const template = buildJsonTemplateData()
        const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'vocabulary-template.json'
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Đã tải file mẫu JSON!')
      }}
      validateAfterReadJson={validateVocabularyImportJson}
      validateAfterReadExcel={parseExcelToVocabularyJson}
      defaultSkipErrors={true}
      onImport={async (payload: SheetImportOnImportPayload): Promise<SheetImportResult> => {
        const res = await importVocabularyJson(payload.jsonRoot as VocabularyTopic[], payload.skipErrors)

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
          raw: res,
          created: summary?.created,
          updated: summary?.updated,
          total: summary?.total,
          skipped: summary?.skipped,
          errors: summary?.errors?.map(e => ({ index: e.index, reason: e.reason }))
        }
      }}
      onImported={() => {
        toast.success('Đã làm mới danh sách từ vựng')
        if (callback) callback()
      }}
    />
  )
}


