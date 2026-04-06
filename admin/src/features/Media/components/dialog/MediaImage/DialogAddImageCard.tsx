'use client'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Image as ImageIcon } from "lucide-react"
import { useState, useRef } from "react"
import useMedia from "@/hooks/useMedia"

interface props {
  onLoad: () => void
}

export function DialogAddImageCard({ onLoad }: props) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadImage, loading } = useMedia()

  // Hàm xử lý khi chọn ảnh
  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      handleUpload(file)
    }
  }

  // Hàm xử lý khi tải lên ảnh
  const handleUpload = async (file: File) => {
    await uploadImage(file)
    await onLoad()
  }

  // Hàm xử lý khi kéo thả ảnh
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  // Hàm xử lý khi rời khỏi ảnh
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  // Hàm xử lý khi thả ảnh
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

  // Hàm xử lý khi click vào ảnh
  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card
      className={`flex flex-col items-center justify-center relative cursor-pointer transition-all duration-200 hover:shadow-lg ${isDragging ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:scale-105'}`}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardContent>
        {loading ? (
          // Show preview after file selected
          <div className="text-center">
            <div className="relative aspect-square overflow-hidden rounded-lg mb-3">
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-sm">Đang tải lên...</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">Ảnh đã chọn</p>
          </div>
        ) : (
          // Show upload interface
          <div className="text-center flex flex-col items-center justify-center">
            <div className={`mx-auto mb-4 ${isDragging ? 'bg-blue-100 text-blue-600' : ''}`}>
              <Upload className="w-8 h-8" />
            </div>

            <h3 className="font-medium text-gray-900 mb-2">
              {isDragging ? 'Thả ảnh vào đây' : 'Thêm ảnh mới'}
            </h3>

            <p className="text-sm text-gray-500 mb-4">
              {isDragging
                ? 'Thả để tải lên ảnh'
                : 'Kéo thả ảnh hoặc click để chọn'
              }
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Chọn ảnh
            </Button>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  )
}