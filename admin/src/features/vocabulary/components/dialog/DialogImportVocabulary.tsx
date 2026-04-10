'use client'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle, X, FileUp } from 'lucide-react'
import { toast } from 'react-toastify'
import { importVocabularyData } from '../../services/api'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ImportResult {
  success: boolean;
  data: unknown;
  summary?: {
    created: { topics: number; words: number; quizzes: number };
    updated: { topics: number };
    errors: string[];
  };
}

interface DialogImportVocabularyProps {
  callback?: () => void;
}

export function DialogImportVocabulary({ callback }: DialogImportVocabularyProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [skipErrors, setSkipErrors] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    setIsUploading(true)
    setUploadProgress(0)
    setImportResult(null)

    try {
      const res = await importVocabularyData(file, skipErrors)
      setImportResult({ success: true, data: res.data, summary: res.data as ImportResult['summary'] })
      toast.success(res.message || 'Import từ vựng thành công!')
      if (callback) {
        setTimeout(() => {
          callback();
          // Keep sheet open to show results
        }, 300)
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Import từ vựng thất bại')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [skipErrors, callback])

  const resetDialog = () => {
    setImportResult(null)
    setUploadProgress(0)
    setIsUploading(false)
    setSkipErrors(false)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'application/csv': ['.csv']
    },
    multiple: false
  })

  const downloadTemplate = () => {
    const link = document.createElement('a')
    link.href = '/templates/vocabulary.xlsx'
    link.download = 'vocabulary-template.xlsx'
    link.click()
    toast.success('Đã tải file mẫu!')
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10">
          <Upload className="w-4 h-4" />
          Import Vocabulary
        </Button>
      </SheetTrigger>
      <SheetContent className="h-full sm:max-w-2xl flex flex-col p-0 overflow-hidden">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileUp className="h-5 w-5 text-primary" />
            </div>
            Import Dữ Liệu Từ Vựng
          </SheetTitle>
          <SheetDescription>Tải lên tệp tin Excel/CSV để nhập hàng loạt chủ đề và từ vựng</SheetDescription>
        </SheetHeader>

        <Separator />

        <ScrollArea className="flex-1 min-h-0 px-6 py-4">
          <div className="space-y-6 pb-10">
            {/* Hướng dẫn & Template */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-md">
                  <Download className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-bold text-sm text-primary uppercase tracking-wider">Tải File Mẫu</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                File mẫu bao gồm 3 sheet: <b>Topics</b> (danh mục), <b>Vocabularies</b> (chi tiết từ vựng) và <b>Quizzes</b> (bài tập). 
                Vui lòng không thay đổi tên các cột tiêu đề.
              </p>
              <Button variant="secondary" onClick={downloadTemplate} className="w-full flex items-center justify-center gap-2 h-9 text-xs">
                <FileSpreadsheet className="w-4 h-4" />
                Tải xuống template (.xlsx)
              </Button>
            </div>

            {/* Cấu hình Import */}
            {!importResult && (
              <div className="bg-muted/30 border rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor="skip-errors-vocab" className="text-sm font-semibold cursor-pointer flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 text-amber-500" />
                    Chế độ an toàn
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Bỏ qua các dòng lỗi và tiếp tục nhập các dòng hợp lệ còn lại.
                  </p>
                </div>
                <Switch id="skip-errors-vocab" checked={skipErrors} onCheckedChange={setSkipErrors} disabled={isUploading} />
              </div>
            )}

            {/* Khu vực Dropzone */}
            {!importResult && (
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase text-muted-foreground px-1">Upload File</Label>
                <div
                  {...getRootProps()}
                  className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
                    isDragActive 
                      ? 'border-primary bg-primary/5 scale-[0.99]' 
                      : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50'
                  } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
                >
                  <input {...getInputProps()} />
                  {isUploading ? (
                    <div className="space-y-6 flex flex-col items-center">
                      <div className="relative">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                          <Upload className="w-8 h-8 text-primary" />
                        </div>
                      </div>
                      <div className="space-y-2 w-full max-w-[240px]">
                        <p className="text-sm font-bold text-primary">Đang xử lý dữ liệu...</p>
                        <Progress value={uploadProgress} className="h-1.5" />
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{uploadProgress}% HOÀN TẤT</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold">
                          {isDragActive ? 'Thả file vào đây' : 'Kéo thả file hoặc click để chọn'}
                        </p>
                        <p className="text-xs text-muted-foreground">Hỗ trợ định dạng .xlsx, .xls, .csv</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Kết quả Import */}
            {importResult && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Label className="text-xs font-bold uppercase text-muted-foreground px-1">Kết quả nhập dữ liệu</Label>
                
                {importResult.success && importResult.summary ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-green-600">{importResult.summary.created?.topics || 0}</p>
                      <p className="text-[9px] font-bold text-green-700 uppercase">Chủ đề mới</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-blue-600">{importResult.summary.created?.words || 0}</p>
                      <p className="text-[9px] font-bold text-blue-700 uppercase">Từ vựng mới</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-purple-600">{importResult.summary.created?.quizzes || 0}</p>
                      <p className="text-[9px] font-bold text-purple-700 uppercase">Quiz mới</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-amber-600">{importResult.summary.updated?.topics || 0}</p>
                      <p className="text-[9px] font-bold text-amber-700 uppercase">Cập nhật</p>
                    </div>
                  </div>
                ) : (
                  <Alert variant="destructive" className="rounded-xl bg-destructive/5">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs font-medium">
                      Nhập dữ liệu thất bại. Vui lòng kiểm tra lại cấu trúc file.
                    </AlertDescription>
                  </Alert>
                )}

                {importResult.summary?.errors && importResult.summary.errors.length > 0 && (
                  <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs space-y-2">
                      <p className="font-bold">Phát hiện {importResult.summary.errors.length} lỗi trong quá trình nhập:</p>
                      <ScrollArea className="h-32">
                        <ul className="list-disc list-inside space-y-1 opacity-80">
                          {importResult.summary.errors.slice(0, 20).map((error: any, index: number) => (
                            <li key={index}>
                              {typeof error === 'string' ? error : `${error.sheet} - Dòng ${error.row}: ${error.reason}`}
                            </li>
                          ))}
                          {importResult.summary.errors.length > 20 && (
                            <li className="list-none font-bold mt-2">... và {importResult.summary.errors.length - 20} lỗi khác.</li>
                          )}
                        </ul>
                      </ScrollArea>
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button variant="outline" onClick={resetDialog} className="w-full h-9 text-xs">
                  Thử lại với file khác
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator />

        <div className="p-6 bg-muted/10 flex justify-end">
          <SheetClose asChild>
            <Button variant="outline" className="min-w-[100px]" onClick={resetDialog}>
              <X className="w-4 h-4 mr-2" />
              {importResult ? 'Hoàn tất' : 'Đóng'}
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
