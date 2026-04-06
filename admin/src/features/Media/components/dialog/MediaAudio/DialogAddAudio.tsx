'use client'
import { Card, CardContent } from "@/components/ui/card"
import { uploadAudioSingle } from "@/features/Media/services/api"
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

  // Hàm xử lý khi chọn file audio
  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('audio/')) {
      handleUpload(file)
    } else {
      toast.error('Vui lòng chọn file audio hợp lệ')
    }
  }

  // Hàm xử lý khi tải lên audio
  const handleUpload = async (file: File) => {
    setIsLoading(true)
    await uploadAudioSingle(file)
      .then(() => {
        toast.success('Tải lên audio thành công')
        callback()
      })
      .finally(() => {
        setIsLoading(false)
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
      handleFileSelect(files[0])
    }
  }

  // Hàm xử lý khi thay đổi file input
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
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
              Kéo thả file audio vào đây
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
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isLoading}
        />
      </CardContent>
    </Card>
  )
}
