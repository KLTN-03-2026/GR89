'use client'

import { useState } from 'react'
import { toast } from 'react-toastify'
import { Eye } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { applyJsonDraftFromString, buildJsonEditorDraft } from './sheetImportLogic'

type SheetImportPreviewStepProps = {
  fileKind: 'excel' | 'json'
  jsonRoot: unknown[]
  onDataChange: (jsonRoot: unknown[]) => void
  skipErrors: boolean
  onSkipErrorsChange: (v: boolean) => void
  onBackToUpload: () => void
  errorPreview: string[] | null
}

export function SheetImportPreviewStep({
  fileKind,
  jsonRoot,
  onDataChange,
  skipErrors,
  onSkipErrorsChange,
  onBackToUpload,
  errorPreview
}: SheetImportPreviewStepProps) {
  const [isEditingJson, setIsEditingJson] = useState(false)
  const [jsonDraft, setJsonDraft] = useState('')
  const [jsonDraftError, setJsonDraftError] = useState<string | null>(null)

  const openJsonEditor = () => {
    setJsonDraft(buildJsonEditorDraft(jsonRoot))
    setJsonDraftError(null)
    setIsEditingJson(true)
  }

  const applyJsonDraft = () => {
    const res = applyJsonDraftFromString({ jsonDraft })

    if (!res.ok) {
      setJsonDraftError(res.message)
      return
    }

    onDataChange(res.data as unknown[])
    setIsEditingJson(false)
    setJsonDraftError(null)
    toast.success('Đã áp dụng chỉnh sửa')
  }

  const previewPayload =
    jsonRoot.length < 20 ? jsonRoot : jsonRoot.slice(0, 20)

  return (
    <>
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-gray-700">
          <span className="text-gray-500">
            • {jsonRoot.length} rows • {fileKind.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openJsonEditor}>
            Chỉnh sửa dữ liệu
          </Button>
          <Button variant="outline" onClick={onBackToUpload}>
            Chọn lại file
          </Button>
        </div>
      </div>

      {/* 🔴 ERROR CARD */}
      {errorPreview && errorPreview.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-semibold text-red-700">
              ⚠️ Danh sách lỗi ({errorPreview.length})
            </p>
          </div>

          <div className="p-3 max-h-[200px] overflow-auto space-y-2">
            {errorPreview.map((err, index) => (
              <div
                key={index}
                className="text-sm p-2 rounded-lg border border-red-200 bg-white"
              >
                <span className="text-red-600">{err}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* JSON EDITOR */}
      {isEditingJson && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b flex justify-between items-center">
            <p className="text-sm font-semibold">Editor JSON</p>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditingJson(false)}>
                Hủy
              </Button>
              <Button size="sm" onClick={applyJsonDraft}>
                Áp dụng
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-2">
            {jsonDraftError && (
              <div className="bg-red-50 border border-red-200 p-2 text-sm text-red-600 rounded">
                {jsonDraftError}
              </div>
            )}

            <textarea
              value={jsonDraft}
              onChange={(e) => {
                setJsonDraft(e.target.value)
                setJsonDraftError(null)
              }}
              className="w-full min-h-[250px] font-mono text-sm border rounded p-2"
            />
          </div>
        </div>
      )}

      {/* SKIP ERROR */}
      <div className="flex items-center justify-between bg-yellow-50 border p-3 rounded">
        <div>
          <Label>Bỏ qua lỗi</Label>
          <p className="text-xs text-yellow-700">
            Backend sẽ bỏ qua dòng lỗi
          </p>
        </div>
        <Switch checked={skipErrors} onCheckedChange={onSkipErrorsChange} />
      </div>

      {/* PREVIEW */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center gap-2">
          <Eye className="w-4 h-4" />
          <p className="text-sm font-semibold">Preview</p>
        </div>

        <div className="p-4">
          <pre className="max-h-[380px] overflow-auto rounded-xl bg-gray-50 border border-gray-200 p-3 text-[12px] leading-5">
            {JSON.stringify(previewPayload, null, 2)}
          </pre>

          <p className="mt-2 text-xs text-gray-500">
            Hiển thị tối đa 20 dòng
          </p>
        </div>
      </div>
    </>
  )
}