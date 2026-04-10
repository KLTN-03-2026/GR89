'use client'

import { useState } from 'react'
import { Loader2, Upload } from 'lucide-react'
import { toast } from 'react-toastify'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

import { SheetImportImportingStep } from './SheetImportImportingStep'
import { SheetImportPreviewStep } from './SheetImportPreviewStep'
import { SheetImportResultStep } from './SheetImportResultStep'
import { SheetImportUploadStep } from './SheetImportUploadStep'
import { getSheetImportHeaderDescription, importProgressPercent } from './sheetImportLogic'
import type {
  FileSubmit,
  SheetImportOnImportPayload,
  SheetImportParsedBundle,
  SheetImportProps,
  SheetImportResult,
  SheetImportStep
} from './types'
import { Separator } from '@/components/ui/separator'

const DEFAULT_TIPS = [
  'JSON: import nhanh theo object/array đúng schema.',
  'Excel: giữ đúng tên cột và sheet từ file template.',
  'Nên bật "Bỏ qua lỗi" nếu import data lớn.'
]

const DEFAULT_FILE_SUBMIT = (defaultSkipErrors: boolean) => {
  return {
    fileType: 'excel',
    jsonRoot: [],
    skipErrors: defaultSkipErrors
  }
}

export function SheetImport({
  title,
  description,
  triggerLabel = 'Import',
  onDownloadTemplate,
  onDownloadJsonTemplate,
  excelTemplateHint,
  jsonTemplateHint,
  quickGuideTips,
  defaultSkipErrors = true,
  validateAfterReadJson,
  validateAfterReadExcel,
  onImport,
  onImported
}: SheetImportProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState<SheetImportStep>('upload')
  const [fileSubmit, setFileSubmit] = useState<FileSubmit>(DEFAULT_FILE_SUBMIT(defaultSkipErrors) as FileSubmit)
  const [result, setResult] = useState<SheetImportResult | null>(null)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [loading, setLoading] = useState(false)
  const [errorPreview, setErrorPreview] = useState<string[] | null>(null)

  const reset = () => {
    setStep('upload')
    setLoading(false)
    setErrorPreview(null)
    setFileSubmit(DEFAULT_FILE_SUBMIT(defaultSkipErrors) as FileSubmit)
    setResult(null)
    setProgress({ current: 0, total: 0 })
  }

  /** Parse xong → (tuỳ chọn) validate → mới vào preview */
  async function handleParsed(bundle: SheetImportParsedBundle) {
    setErrorPreview(null)
    setFileSubmit({
      fileType: bundle.fileType,
      jsonRoot: bundle.jsonRoot || [],
      skipErrors: defaultSkipErrors
    })

    setFile(bundle.file)
    setStep('preview')
  }

  // Xử lý khi dữ liệu trong preview thay đổi
  const handlePreviewDataChange = (jsonRoot: unknown[]) => {
    setFileSubmit((prev) => {
      return { ...prev, jsonRoot: jsonRoot }
    })
  }

  // Hàm handleImport
  const handleImport = async () => {
    if (!onImport) {
      toast.error('Chưa cấu hình API import cho màn hình này.')
      setResult({ success: false, message: 'Chưa cấu hình API import.' })
      setStep('result')
      return
    }

    if (!file) {
      toast.error('Chưa chọn file để import.')
      setResult({ success: false, message: 'Chưa chọn file.' })
      setStep('result')
      return
    }

    setStep('importing')
    setLoading(true)
    setProgress({ current: 0, total: 100 })

    const tick = setInterval(() => {
      setProgress((p) => ({ ...p, current: Math.min(p.current + Math.random() * 7, 95) }))
    }, 500)

    try {
      // Support both legacy signature: (file, skipErrors)
      // and JSON-driven signature: ({ file, fileType, jsonRoot, skipErrors })
      const importJsonDriven = onImport as ((payload: SheetImportOnImportPayload) => Promise<SheetImportResult>)
      const importLegacy = onImport as ((file: File, skipErrors: boolean) => Promise<SheetImportResult>)

      const res: SheetImportResult =
        onImport.length <= 1
          ? await importJsonDriven({
            file,
            fileType: fileSubmit.fileType,
            jsonRoot: fileSubmit.jsonRoot,
            skipErrors: fileSubmit.skipErrors
          })
          : await importLegacy(file, fileSubmit.skipErrors)

      setResult(res)
      onImported?.(res)
      setProgress({ current: 100, total: 100 })
      setStep('result')

      if (res?.errors && Array.isArray(res.errors) && res.errors.length > 0) {
        toast.error(res.message || `Import có ${res.errors.length} lỗi.`)
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: unknown } }
      const axiosData = err.response?.data
      const axiosMessage =
        typeof axiosData === 'object' && axiosData !== null && 'message' in axiosData
          ? (axiosData as { message?: string }).message
          : undefined

      const message =
        axiosMessage ||
        (e instanceof Error ? e.message : undefined) ||
        'Đã xảy ra lỗi khi import. Vui lòng thử lại.'

      toast.error(message)
      const raw = axiosData ?? e
      setResult({
        message,
        raw
      } as SheetImportResult)
      onImported?.({
        message,
        raw
      } as SheetImportResult)
      setStep('result')
    } finally {
      clearInterval(tick)
      setLoading(false)
    }
  }

  const totalRows = fileSubmit.jsonRoot.length

  // Dòng phụ đề dưới tiêu đề Sheet
  const headerDescription = getSheetImportHeaderDescription(step, file, totalRows, description)

  const handleClose = () => { setOpen(false) }
  const goToUpload = () => { setStep('upload') }
  const percent = importProgressPercent(progress.current, progress.total)
  const tips = quickGuideTips && quickGuideTips.length > 0 ? quickGuideTips : DEFAULT_TIPS

  const onChangeSkipError = () => {
    setFileSubmit(prev => {
      return { ...prev, skipErrors: !prev.skipErrors }
    })
  }
  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) setTimeout(reset, 250)
      }}
    >
      <SheetTrigger asChild>
        <Button className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          {triggerLabel}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="h-full sm:max-w-3xl flex flex-col p-0 border-l overflow-hidden">
        <SheetHeader className="p-6">
          <div className="space-y-1">
            <SheetTitle className="text-xl font-bold text-zinc-900">{title}</SheetTitle>
            <SheetDescription className="text-sm text-zinc-500">{headerDescription}</SheetDescription>
          </div>
        </SheetHeader>

        <Separator />

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {step === 'upload' && (
              <>
                <SheetImportUploadStep
                  onDownloadExcel={() => onDownloadTemplate()}
                  onDownloadJson={onDownloadJsonTemplate}
                  excelTemplateHint={excelTemplateHint}
                  jsonTemplateHint={jsonTemplateHint}
                  tips={tips}
                  validateAfterReadJson={validateAfterReadJson}
                  validateAfterReadExcel={validateAfterReadExcel}
                  onParsed={handleParsed}
                  setErrorPreview={setErrorPreview}
                />

                {errorPreview && errorPreview.length > 0 ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-2">
                    <p className="text-sm font-bold text-red-700">⚠️ Có {errorPreview.length} lỗi khi đọc file</p>
                    <div className="max-h-[180px] overflow-auto space-y-1">
                      {errorPreview.slice(0, 10).map((err, idx) => (
                        <p key={idx} className="text-xs text-red-700 font-medium">
                          {err}
                        </p>
                      ))}
                      {errorPreview.length > 10 ? (
                        <p className="text-xs text-red-700 font-medium">... và {errorPreview.length - 10} lỗi khác</p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </>
            )}

            {step === 'preview' && (fileSubmit.jsonRoot.length || errorPreview?.length || 0) > 0 && (
              <SheetImportPreviewStep
                fileKind={fileSubmit.fileType}
                jsonRoot={fileSubmit.jsonRoot}
                skipErrors={fileSubmit.skipErrors}
                onDataChange={handlePreviewDataChange}
                onSkipErrorsChange={onChangeSkipError}
                onBackToUpload={goToUpload}
                errorPreview={errorPreview}
              />
            )}

            {step === 'importing' && <SheetImportImportingStep percent={percent} />}
            {step === 'result' && result && <SheetImportResultStep result={result} />}
          </div>
        </div>

        <Separator />

        <SheetFooter className="p-6 bg-white border-t mt-0">
          {step === 'preview' && (
            <div className="flex items-center justify-end gap-3 w-full">
              <Button variant="outline" className="h-11 px-6 rounded-lg font-bold" onClick={handleClose} disabled={loading}>
                Hủy
              </Button>
              <Button className="h-11 px-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-bold" onClick={handleImport} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Bắt đầu import
              </Button>
            </div>
          )}

          {step === 'upload' && (
            <div className="flex items-center justify-end w-full">
              <Button variant="outline" className="h-11 px-6 rounded-lg font-bold" onClick={handleClose}>Đóng</Button>
            </div>
          )}

          {step === 'importing' && <p className="text-sm text-zinc-500 text-center w-full font-medium">Vui lòng không đóng cửa sổ...</p>}

          {step === 'result' && (
            <div className="flex items-center justify-end gap-3 w-full">
              <Button variant="outline" className="h-11 px-6 rounded-lg font-bold" onClick={reset}>
                Import thêm
              </Button>
              <Button className="h-11 px-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-bold" onClick={handleClose}>Hoàn tất</Button>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
