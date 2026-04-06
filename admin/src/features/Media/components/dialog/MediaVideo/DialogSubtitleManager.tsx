'use client'

import { useEffect, useMemo, useRef, useState, ChangeEvent } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, FileText, Download, Trash2, Loader2, Subtitles, AlertCircle, Info, CheckCircle2, History } from 'lucide-react'
import { Media, MediaSubtitle, MediaSubtitlePreview } from '@/features/Media/types'
import AuthorizedAxios from '@/lib/apis/authorizrAxios'
import { isAxiosError } from 'axios'
import { toast } from 'react-toastify'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

interface UploadSubtitleData {
  fileUrl: string
  format?: string
  originalName?: string
}

const AUTO_SUBTITLE_LABEL = 'EN · IPA · VI'
const AUTO_LANGUAGE_PAIR = 'en-vi'

type ParsedSubtitleEntry = MediaSubtitlePreview & {
  index: number
  rawLines: string[]
}

const uploadSubtitleFileRequest = async (file: File): Promise<UploadSubtitleData> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await AuthorizedAxios.post<ApiResponse<UploadSubtitleData>>('/media/upload/subtitle', formData)
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Upload subtitle thất bại')
  }
  if (!response.data.data?.fileUrl) {
    throw new Error('Phản hồi không có đường dẫn file subtitle')
  }
  return response.data.data
}

const updateMediaSubtitleRequest = async (mediaId: string, payload: MediaSubtitle) => {
  const response = await AuthorizedAxios.put<ApiResponse<Media>>(`/media/${mediaId}/subtitle`, payload)
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Cập nhật subtitle thất bại')
  }
  return response.data.data
}

const removeMediaSubtitleRequest = async (mediaId: string) => {
  const response = await AuthorizedAxios.delete<ApiResponse<Media>>(`/media/${mediaId}/subtitle`)
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Xóa subtitle thất bại')
  }
  return response.data.data
}

const parseSrtFile = (content: string): ParsedSubtitleEntry[] => {
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const blocks = normalized.split(/\n{2,}/).map(block => block.trim()).filter(Boolean)
  const entries: ParsedSubtitleEntry[] = []

  for (const block of blocks) {
    const lines = block.split('\n').map(line => line.trim()).filter(Boolean)
    if (lines.length < 4) {
      throw new Error('Mỗi khối subtitle cần tối thiểu 3 dòng (Anh, IPA, Việt).')
    }

    const index = Number(lines[0])
    const timeLine = lines[1]
    if (!timeLine.includes('-->')) continue
    const [startRaw, endRaw] = timeLine.split('-->')
    const textLines = lines.slice(2)
    if (!startRaw || !endRaw) continue

    const [english = '', phonetic = '', vietnamese = ''] = textLines

    if (!english || !phonetic || !vietnamese) {
      throw new Error('File .srt phải có đủ English, phiên âm IPA và tiếng Việt ở mỗi đoạn.')
    }

    entries.push({
      index: Number.isNaN(index) ? entries.length + 1 : index,
      start: startRaw.trim(),
      end: endRaw.trim(),
      english,
      phonetic,
      vietnamese,
      raw: block,
      rawLines: textLines
    })
  }

  return entries
}

const mapPreviewToEntries = (preview?: MediaSubtitlePreview[]): ParsedSubtitleEntry[] =>
  (preview || []).map((entry, idx) => ({
    index: idx + 1,
    start: entry.start,
    end: entry.end,
    english: entry.english,
    phonetic: entry.phonetic,
    vietnamese: entry.vietnamese,
    raw: entry.raw,
    rawLines: []
  }))

interface DialogSubtitleManagerProps {
  media: Media
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubtitleUpdate?: (subtitle?: MediaSubtitle | null) => void
}

export function DialogSubtitleManager({ media, open, onOpenChange, onSubtitleUpdate }: DialogSubtitleManagerProps) {
  const subtitleFileInputRef = useRef<HTMLInputElement | null>(null)

  const currentSubtitle = media.subtitles?.[0] || null
  const [selectedSubtitleFile, setSelectedSubtitleFile] = useState<File | null>(null)
  const [parsedSubtitlePreview, setParsedSubtitlePreview] = useState<ParsedSubtitleEntry[]>([])
  const [uploadingSubtitle, setUploadingSubtitle] = useState(false)
  const [isDeletingSubtitle, setIsDeletingSubtitle] = useState(false)

  useEffect(() => {
    if (!open) return
    setSelectedSubtitleFile(null)
    setParsedSubtitlePreview(mapPreviewToEntries(currentSubtitle?.preview))
  }, [open, currentSubtitle?.preview])

  const handleSubtitleFileSelected = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.srt')) {
      toast.error('Chỉ hỗ trợ tệp .srt có cấu trúc English, IPA, Vietnamese')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = String(reader.result || '')
        const parsed = parseSrtFile(text)
        if (!parsed.length) {
          toast.error('Không đọc được nội dung subtitle trong file .srt')
          return
        }
        setSelectedSubtitleFile(file)
        setParsedSubtitlePreview(parsed)
        toast.success(`Đã đọc ${parsed.length} đoạn subtitle`)
      } catch (error) {
        console.error(error)
        toast.error(error instanceof Error ? error.message : 'Không thể phân tích file subtitle')
      }
    }
    reader.onerror = () => {
      toast.error('Không thể đọc file subtitle')
    }
    reader.readAsText(file, 'utf-8')
  }

  const handleSubtitleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleSubtitleFileSelected(file)
    }
  }

  const handleSubtitleSave = async () => {
    const entries = parsedSubtitlePreview

    if (!entries.length) {
      toast.error('Không có dữ liệu subtitle để lưu. Vui lòng chọn file .srt hợp lệ.')
      return
    }

    if (!currentSubtitle && !selectedSubtitleFile) {
      toast.error('Vui lòng tải lên file .srt song ngữ để lưu subtitle cho video này.')
      return
    }

    setUploadingSubtitle(true)
    try {
      let fileUrl = currentSubtitle?.fileUrl || ''
      let originalName = currentSubtitle?.originalName
      let format = currentSubtitle?.format || 'srt'

      if (selectedSubtitleFile) {
        const uploadedData = await uploadSubtitleFileRequest(selectedSubtitleFile)
        fileUrl = uploadedData.fileUrl || fileUrl
        originalName = uploadedData.originalName || selectedSubtitleFile.name
        format = uploadedData.format || 'srt'
      }

      if (!fileUrl) {
        throw new Error('Không tìm thấy đường dẫn file subtitle sau khi tải lên')
      }

      const payload: MediaSubtitle = {
        label: currentSubtitle?.label || AUTO_SUBTITLE_LABEL,
        languagePair: currentSubtitle?.languagePair || AUTO_LANGUAGE_PAIR,
        fileUrl,
        format,
        originalName,
        totalEntries: entries.length,
        preview: entries.map(entry => ({
          start: entry.start,
          end: entry.end,
          english: entry.english,
          phonetic: entry.phonetic,
          vietnamese: entry.vietnamese
        }))
      }

      const updatedMedia = await updateMediaSubtitleRequest(media._id, payload)
      const updatedSubtitle = updatedMedia?.subtitles?.[0] || {
        ...payload,
        fileUrl
      }
      onSubtitleUpdate?.(updatedSubtitle)
      toast.success('Đã lưu subtitle song ngữ cho video')
      onOpenChange(false)
    } catch (error: unknown) {
      console.error(error)
      const message = isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message || error.message
        : error instanceof Error
          ? error.message
          : 'Không thể lưu subtitle. Vui lòng thử lại.'
      toast.error(message)
    } finally {
      setUploadingSubtitle(false)
    }
  }

  const handleSubtitleRemove = async () => {
    if (!currentSubtitle) {
      toast.info('Video này chưa có subtitle để xóa')
      return
    }
    setIsDeletingSubtitle(true)
    try {
      await removeMediaSubtitleRequest(media._id)
      onSubtitleUpdate?.(null)
      toast.success('Đã xóa subtitle khỏi video')
      onOpenChange(false)
    } catch (error: unknown) {
      console.error(error)
      const message = isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message || error.message
        : error instanceof Error
          ? error.message
          : 'Không thể xóa subtitle. Vui lòng thử lại.'
      toast.error(message)
    } finally {
      setIsDeletingSubtitle(false)
    }
  }

  const previewEntries = useMemo(() => parsedSubtitlePreview, [parsedSubtitlePreview])
  const subtitleEntrySample = useMemo(() => previewEntries.slice(0, 20), [previewEntries])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-3xl flex flex-col p-0 border-l shadow-2xl">
        <SheetHeader className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 shadow-inner">
              <Subtitles className="w-6 h-6" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-black text-gray-900 tracking-tight">Quản Lý Phụ Đề</SheetTitle>
              <SheetDescription className="text-gray-500 font-medium mt-1">
                Tải lên và xem trước phụ đề song ngữ cho video.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator className="bg-gray-100" />

        <ScrollArea className="flex-1">
          <div className="p-8 space-y-10">
            {/* Section: Current Status */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-purple-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <History className="w-4 h-4" />
                Trạng Thái Hiện Tại
              </div>
              
              {currentSubtitle ? (
                <div className="rounded-[2rem] border border-purple-100 bg-purple-50/30 p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="space-y-1.5">
                      <p className="font-black text-purple-900 flex items-center gap-2">
                        {currentSubtitle.label || AUTO_SUBTITLE_LABEL}
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100 font-bold border-none px-2 py-0 h-5">
                          {currentSubtitle.format?.toUpperCase() || 'SRT'}
                        </Badge>
                      </p>
                      <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {currentSubtitle.totalEntries || currentSubtitle.preview?.length || 0} đoạn</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="flex items-center gap-1"><Info className="w-3 h-3" /> {currentSubtitle.languagePair?.toUpperCase() || AUTO_LANGUAGE_PAIR.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl border-purple-200 bg-white hover:bg-purple-50 text-purple-700 font-bold shadow-sm" asChild>
                        <a href={currentSubtitle.fileUrl} target="_blank" rel="noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          Tải Về
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold" onClick={handleSubtitleRemove} disabled={isDeletingSubtitle}>
                        {isDeletingSubtitle ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        Gỡ Bỏ
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[2rem] border border-dashed border-gray-200 bg-gray-50/50 p-10 text-center">
                  <div className="mx-auto w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                    <Subtitles className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm font-bold text-gray-400">Video này chưa có phụ đề song ngữ</p>
                </div>
              )}
            </section>

            {/* Section: Upload */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-blue-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <Upload className="w-4 h-4" />
                Tải Lên Bản Mới
              </div>

              <div className="space-y-4 bg-blue-50/30 p-6 rounded-[2rem] border border-blue-100/50">
                <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                  Chọn Tệp .SRT (Cấu trúc: Anh · IPA · Việt)
                </Label>
                
                <input
                  ref={subtitleFileInputRef}
                  type="file"
                  accept=".srt"
                  onChange={handleSubtitleFileInputChange}
                  className="hidden"
                />

                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className={`h-14 flex-1 rounded-2xl border-2 border-dashed transition-all font-black flex items-center justify-center gap-3 ${selectedSubtitleFile ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-blue-200 bg-white hover:border-blue-400 text-blue-600'}`}
                    onClick={() => subtitleFileInputRef.current?.click()}
                    disabled={uploadingSubtitle}
                  >
                    {selectedSubtitleFile ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    {selectedSubtitleFile ? 'Đã Chọn Tệp Thành Công' : 'Bấm Để Chọn File .SRT'}
                  </Button>
                </div>

                {selectedSubtitleFile && (
                  <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-emerald-100 animate-in zoom-in-95 duration-200">
                    <span className="text-xs font-bold text-emerald-700 truncate max-w-[250px]">{selectedSubtitleFile.name}</span>
                    <span className="text-[10px] font-black text-emerald-600/50 bg-emerald-50 px-2 py-1 rounded-lg">{(selectedSubtitleFile.size / 1024).toFixed(1)} KB</span>
                  </div>
                )}

                <div className="flex items-start gap-2 text-[11px] text-blue-700/70 font-bold bg-blue-100/40 p-3 rounded-xl leading-relaxed">
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  Lưu ý: File .srt phải có định dạng 3 dòng text liên tiếp (English, IPA, Tiếng Việt) cho mỗi mốc thời gian.
                </div>
              </div>
            </section>

            {/* Section: Preview */}
            <section className="space-y-6 pb-10">
              <div className="flex items-center gap-2.5 text-emerald-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <CheckCircle2 className="w-4 h-4" />
                Xem Trước Nội Dung ({subtitleEntrySample.length}/{previewEntries.length || 0})
              </div>

              <div className="rounded-[2.5rem] border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {subtitleEntrySample.length ? (
                    <div className="divide-y divide-gray-50">
                      {subtitleEntrySample.map(entry => (
                        <div key={entry.index} className="p-5 hover:bg-gray-50 transition-colors group">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">Đoạn #{entry.index.toString().padStart(3, '0')}</span>
                            <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{entry.start} → {entry.end}</span>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-black text-gray-900">{entry.english}</p>
                            <p className="text-[11px] font-bold text-emerald-600 font-mono bg-emerald-50 w-fit px-2 py-0.5 rounded-md italic">{entry.phonetic}</p>
                            {entry.vietnamese && (
                              <p className="text-xs font-bold text-gray-500 leading-relaxed">{entry.vietnamese}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-16 text-center">
                      <div className="mx-auto w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                        <AlertCircle className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-sm font-bold text-gray-400">Tải tệp lên để xem trước cấu trúc nội dung</p>
                    </div>
                  )}
                </div>
              </div>
              {previewEntries.length > subtitleEntrySample.length && (
                <div className="text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-100 w-fit mx-auto px-4 py-1.5 rounded-full">
                    Hiển thị {subtitleEntrySample.length} đoạn tiêu biểu
                  </p>
                </div>
              )}
            </section>
          </div>
        </ScrollArea>

        <Separator className="bg-gray-100" />

        <SheetFooter className="p-8 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100">
          <div className="flex items-center justify-end gap-4 w-full">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={uploadingSubtitle || isDeletingSubtitle}
              className="h-12 px-8 rounded-2xl border-gray-200 font-bold text-gray-600 active:scale-95 transition-all"
            >
              Hủy Bỏ
            </Button>
            <Button 
              onClick={handleSubtitleSave} 
              disabled={uploadingSubtitle || isDeletingSubtitle || !selectedSubtitleFile} 
              className="h-12 px-10 rounded-2xl bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-200 font-black active:scale-95 transition-all"
            >
              {uploadingSubtitle ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Đang Xử Lý...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Lưu & Cập Nhật
                </>
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

