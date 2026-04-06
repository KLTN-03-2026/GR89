'use client'

import { useDropzone } from 'react-dropzone'
import { toast } from 'react-toastify'
import { Upload, FileSpreadsheet, FileJson, Info } from 'lucide-react'

import type { Sheet, SheetImportParsedBundle } from './types'
import * as XLSX from 'xlsx'
import type { ParseResult } from './types'

type SheetImportUploadStepProps = {
  onDownloadExcel: () => void
  onDownloadJson?: () => void
  excelTemplateHint?: string
  jsonTemplateHint?: string
  validateAfterReadJson?: (input: unknown) => ParseResult | Promise<ParseResult>
  validateAfterReadExcel?: (input: Sheet[]) => ParseResult | Promise<ParseResult>
  tips: string[]
  onParsed: (bundle: SheetImportParsedBundle) => void | Promise<void>
  setErrorPreview: (errors: string[] | null) => void
}

export function SheetImportUploadStep({
  onDownloadExcel,
  onDownloadJson,
  excelTemplateHint,
  jsonTemplateHint,
  tips,
  onParsed,
  validateAfterReadJson,
  validateAfterReadExcel,
  setErrorPreview
}: SheetImportUploadStepProps) {
  // Hàm đọc file excel
  const parseExcelToSheets = async (f: File): Promise<Sheet[]> => {
    const buffer = await f.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array' })
    return wb.SheetNames.map((name) => {
      const ws = wb.Sheets[name]
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })
      return { name, rows }
    })
  }

  // Xử lý khi file được drop
  const onDrop = async (acceptedFiles: File[]) => {
    setErrorPreview(null)
    const file = acceptedFiles?.[0]
    if (!file) return

    const isJsonFileName = file.name.split('.').pop()?.toLowerCase() === 'json' || file.name.split('.').pop()?.toLowerCase() === 'txt'
    const isExcelFileName = file.name.split('.').pop()?.toLowerCase() === 'xlsx' || file.name.split('.').pop()?.toLowerCase() === 'xls'
    if (isJsonFileName) {
      try {
        const text = await file.text()
        const jsonRoot = JSON.parse(text || '')

        if (validateAfterReadJson) {
          const res = await validateAfterReadJson(jsonRoot)
          if (!res.ok) {
            setErrorPreview(res.errors || [])
            toast.error(`JSON không hợp lệ (${(res.errors || []).length} lỗi).`)
            return
          }
        }

        await onParsed({
          file,
          jsonRoot,
          fileType: 'json'
        })
      } catch {
        toast.error('File JSON không hợp lệ. Vui lòng kiểm tra lại nội dung.')
      }
    } else if (isExcelFileName) {
      if (validateAfterReadExcel) {
        const sheets = await parseExcelToSheets(file)
        const res = await validateAfterReadExcel(sheets)

        if (!res.ok) {
          setErrorPreview(res.errors || [])
          toast.error(`Excel không hợp lệ (${(res.errors || []).length} lỗi).`)
          return
        } else {
          setErrorPreview(null)
          await onParsed({
            file,
            jsonRoot: res.data,
            fileType: 'excel'
          })
          return
        }
      }

      await onParsed({
        file,
        jsonRoot: [],
        fileType: 'excel'
      })
    }
    else toast.error('Không thể đọc file. Chỉ hỗ trợ JSON/Excel hợp lệ.')
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv', '.txt'],
      'application/json': ['.json']
    },
    multiple: false
  })

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onDownloadExcel}
          className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm text-left hover:bg-emerald-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">Tải mẫu Excel</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {excelTemplateHint || 'Template chuẩn để map cột chính xác.'}
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onDownloadJson?.()}
          disabled={!onDownloadJson}
          className="rounded-2xl border border-orange-200 bg-orange-50/60 p-4 shadow-sm text-left hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center">
              <FileJson className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">Tải mẫu JSON</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {jsonTemplateHint || 'Schema JSON đầy đủ để import trực tiếp.'}
              </p>
            </div>
          </div>
        </button>
      </div>

      <div
        {...getRootProps()}
        className={`rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all shadow-sm ${isDragActive ? 'border-blue-500 bg-blue-50/70 scale-[1.01]' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60'
          }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'} shadow-inner`}
          >
            <Upload className={`w-7 h-7 ${isDragActive ? 'text-blue-600' : 'text-gray-500'}`} />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">
              {isDragActive ? 'Thả file vào đây' : 'Kéo thả file hoặc click để chọn'}
            </p>
            <p className="text-sm text-gray-600 mt-1">Hỗ trợ .xlsx, .xls, .csv, .json</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-blue-600" />
          <p className="text-sm font-semibold text-gray-900">Hướng dẫn nhanh</p>
        </div>
        <div className="space-y-1.5">
          {tips.map((tip, idx) => (
            <p key={idx} className="text-sm text-gray-700">
              - {tip}
            </p>
          ))}
        </div>
      </div>
    </>
  )
}
