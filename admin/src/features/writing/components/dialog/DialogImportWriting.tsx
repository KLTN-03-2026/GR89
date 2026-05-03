'use client'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Upload, FileSpreadsheet, Download, CheckCircle, AlertCircle, X, FileUp, HelpCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import { importWritingData } from '../../services/api'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface ImportResultData {
  created: number
  updated: number
  errors: { row: number; reason: string }[]
}

export function DialogImportWriting({ callback }: { callback?: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [result, setResult] = useState<ImportResultData | null>(null)
  const [skipErrors, setSkipErrors] = useState(false)

  const resetDialog = () => {
    setResult(null)
    setUploadProgress(0)
    setIsUploading(false)
    setSkipErrors(false)
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return
      setIsUploading(true)
      setUploadProgress(0)
      setResult(null)
      try {
        const res = await importWritingData(file, skipErrors)
        setResult((res.data ?? null) as ImportResultData | null)
        toast.success(res.message || 'Import Writing thành công!')
        if (callback) {
          setTimeout(() => {
            callback()
            // Keep sheet open to show results
          }, 200)
        }
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } } }
        toast.error(err?.response?.data?.message || 'Import Writing thất bại')
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    },
    [skipErrors, callback]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'application/csv': ['.csv'],
    },
    multiple: false,
  })

  const downloadTemplate = () => {
    const a = document.createElement('a')
    a.href = '/templates/writing.xlsx'
    a.download = 'writing-template.xlsx'
    a.click()
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-11 px-6 rounded-xl border-primary text-primary hover:bg-primary/5 transition-all font-bold gap-2 active:scale-95 shadow-sm shadow-primary/5">
          <Upload className="w-4.5 h-4.5" />
          Import Writing
        </Button>
      </SheetTrigger>
      <SheetContent className="h-full sm:max-w-2xl flex flex-col p-0 border-l shadow-2xl overflow-hidden">
        <SheetHeader className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-inner">
              <FileUp className="w-6 h-6" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-black text-gray-900 tracking-tight">Import Dữ Liệu</SheetTitle>
              <SheetDescription className="text-gray-500 font-medium mt-1">
                Tải lên tệp tin Excel/CSV để nhập hàng loạt bài tập viết.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator className="bg-gray-100" />

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-8 space-y-10">
            {/* Hướng dẫn & Template */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-primary font-black uppercase text-[11px] tracking-[0.2em]">
                <Download className="w-4 h-4" />
                Hướng Dẫn & File Mẫu
              </div>

              <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-8 space-y-6">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-primary/80 leading-relaxed">
                    Để đảm bảo dữ liệu được nhập chính xác, vui lòng sử dụng file mẫu chuẩn của hệ thống.
                  </p>
                  <div className="bg-white/50 p-4 rounded-2xl border border-primary/10">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Các cột bắt buộc:</p>
                    <code className="text-[10px] text-primary font-mono break-all leading-relaxed">
                      title, description, minWords, maxWords, duration, suggestedVocabulary, suggestedStructure, isActive
                    </code>
                  </div>
                </div>
                <Button variant="outline" onClick={downloadTemplate} className="w-full h-12 rounded-2xl border-primary/20 bg-white hover:bg-primary/5 text-primary font-black shadow-sm transition-all active:scale-[0.98] gap-3">
                  <FileSpreadsheet className="w-5 h-5" />
                  Tải Xuống Template (.xlsx)
                </Button>
              </div>
            </section>

            {/* Cấu hình Import */}
            {!result && (
              <section className="space-y-6">
                <div className="flex items-center gap-2.5 text-amber-600 font-black uppercase text-[11px] tracking-[0.2em]">
                  <HelpCircle className="w-4 h-4" />
                  Cấu Hình Tải Lên
                </div>
                <div className="bg-amber-50/30 border border-amber-100/50 rounded-[2rem] p-6 flex items-center justify-between gap-6">
                  <div className="space-y-1">
                    <Label htmlFor="skip-errors-writing" className="text-sm font-black text-amber-900 cursor-pointer flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      Chế độ an toàn (Safe Mode)
                    </Label>
                    <p className="text-[11px] font-bold text-amber-700/60 leading-normal max-w-[300px]">
                      Bỏ qua các dòng dữ liệu bị lỗi và tiếp tục nhập các dòng hợp lệ còn lại.
                    </p>
                  </div>
                  <Switch
                    id="skip-errors-writing"
                    checked={skipErrors}
                    onCheckedChange={setSkipErrors}
                    disabled={isUploading}
                    className="data-[state=checked]:bg-amber-600"
                  />
                </div>
              </section>
            )}

            {/* Khu vực Dropzone */}
            {!result && (
              <section className="space-y-6 pb-10">
                <div className="flex items-center gap-2.5 text-blue-600 font-black uppercase text-[11px] tracking-[0.2em]">
                  <Upload className="w-4 h-4" />
                  Khu Vực Tải Tệp
                </div>
                <div
                  {...getRootProps()}
                  className={`relative border-2 border-dashed rounded-[2.5rem] p-16 text-center cursor-pointer transition-all duration-300 ${isDragActive
                    ? 'border-primary bg-primary/5 scale-[0.98] shadow-inner'
                    : 'border-blue-200 bg-blue-50/20 hover:border-primary/50 hover:bg-blue-50/50 shadow-sm'
                    } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
                >
                  <input {...getInputProps()} />
                  {isUploading ? (
                    <div className="space-y-8 flex flex-col items-center">
                      <div className="relative">
                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center animate-pulse">
                          <Upload className="w-10 h-10 text-primary" />
                        </div>
                      </div>
                      <div className="space-y-3 w-full max-w-[280px]">
                        <p className="text-sm font-black text-primary uppercase tracking-widest">Đang xử lý dữ liệu...</p>
                        <Progress value={uploadProgress} className="h-2 rounded-full bg-primary/10" />
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">{uploadProgress}% HOÀN TẤT</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 group">
                      <div className="w-20 h-20 mx-auto bg-white rounded-3xl flex items-center justify-center shadow-lg shadow-blue-100 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <Upload className="w-10 h-10 text-blue-400 group-hover:text-white transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-base font-black text-gray-700">
                          {isDragActive ? 'Thả file ngay bây giờ' : 'Kéo thả file hoặc click để chọn'}
                        </p>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Hỗ trợ định dạng .xlsx, .xls, .csv</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Kết quả Import */}
            {result && (
              <section className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2.5 text-emerald-600 font-black uppercase text-[11px] tracking-[0.2em]">
                  <CheckCircle className="w-4 h-4" />
                  Kết Quả Nhập Dữ Liệu
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-[2rem] p-8 text-center shadow-sm">
                    <p className="text-4xl font-black text-emerald-600 mb-1">{result.created}</p>
                    <p className="text-[11px] font-black text-emerald-700/60 uppercase tracking-[0.2em]">Tạo mới</p>
                  </div>
                  <div className="bg-blue-50/50 border border-blue-100 rounded-[2rem] p-8 text-center shadow-sm">
                    <p className="text-4xl font-black text-blue-600 mb-1">{result.updated}</p>
                    <p className="text-[11px] font-black text-blue-700/60 uppercase tracking-[0.2em]">Cập nhật</p>
                  </div>
                </div>

                {result.errors?.length > 0 && (
                  <div className="bg-rose-50/50 border border-rose-100 rounded-[2rem] p-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-rose-500" />
                      <p className="text-sm font-black text-rose-900">Phát hiện {result.errors.length} lỗi trong quá trình nhập</p>
                    </div>
                    <ScrollArea className="h-40 pr-4">
                      <div className="space-y-2">
                        {result.errors.map((e, i) => (
                          <div key={i} className="bg-white/60 p-3 rounded-xl border border-rose-100/50 text-[11px] font-bold text-rose-700 flex gap-2">
                            <span className="text-rose-300">Dòng {e.row}:</span>
                            <span>{e.reason}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                <Button variant="outline" onClick={resetDialog} className="w-full h-12 rounded-2xl border-gray-200 bg-white hover:bg-gray-50 text-gray-600 font-black shadow-sm transition-all active:scale-[0.98]">
                  Thử lại với file khác
                </Button>
              </section>
            )}
          </div>
        </ScrollArea>

        <Separator className="bg-gray-100" />

        <SheetFooter className="p-8 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100">
          <div className="flex items-center justify-end gap-4 w-full">
            <SheetClose asChild>
              <Button variant="outline" className="h-12 px-8 rounded-2xl border-gray-200 font-bold text-gray-600 active:scale-95 transition-all" onClick={resetDialog}>
                <X className="w-5 h-5 mr-2" />
                {result ? 'Hoàn tất & Đóng' : 'Hủy Bỏ'}
              </Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
