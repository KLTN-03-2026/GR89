'use client'
import { Card, CardContent } from "@/components/ui/card"
import { uploadAudioMultiple } from "@/features/Media/services/api"
import { Upload, Music2, Loader2 } from "lucide-react"
import { useState, useRef } from "react"
import { toast } from "react-toastify"

interface props {
  callback: () => void
}

export function DialogAddAudio({ callback }: props) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Hàm xử lý khi chọn nhiều file audio
  const handleFileSelect = (files: File[]) => {
    if (!files.length) return
    const validFiles = files.filter((file) => file.type.startsWith('audio/'))
    const invalidCount = files.length - validFiles.length

    if (!validFiles.length) {
      toast.error('Vui lòng chọn file audio hợp lệ')
      return
    }

    if (invalidCount > 0) {
      toast.warning(`Đã bỏ qua ${invalidCount} file không phải audio`)
    }

    handleUpload(validFiles)
  }

  // Hàm xử lý khi tải lên nhiều audio
  const handleUpload = async (files: File[]) => {
    setIsLoading(true)
    await uploadAudioMultiple(files)
      .then((res) => {
        const uploadedCount = res.data?.length || files.length
        toast.success(`Tải lên ${uploadedCount} audio thành công`)
        callback()
      })
      .finally(() => {
        setIsLoading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      })
  }

  // Hàm xử lý khi kéo thả file
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  // Hàm xử lý khi rời khỏi vùng kéo thả
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  // Hàm xử lý khi thả file
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }

  // Hàm xử lý khi thay đổi file input
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }

  // Hàm xử lý khi click vào card
  const handleClick = () => {
    if (!isLoading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <Card
      className={`
        relative cursor-pointer transition-all duration-200 hover:shadow-md flex flex-col
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-dashed border-2 border-gray-300 hover:border-gray-400'}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <CardContent className="p-4 flex flex-col justify-between">
        <div className="flex flex-col items-center justify-center space-y-3">
          {isLoading ? (
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          ) : (
            <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center">
              <Music2 className="w-4 h-4 text-white" />
            </div>
          )}

          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              {isLoading ? 'Đang tải lên...' : 'Tải lên audio'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Kéo thả nhiều file audio vào đây
            </p>
            <p className="text-xs text-gray-400 mt-1">
              MP3, WAV, M4A, OGG
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-4">
          <Upload className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">Chọn file</span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isLoading}
        />
      </CardContent>
    </Card>
  )
}
