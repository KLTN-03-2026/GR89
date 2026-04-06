'use client'

import { useState } from 'react'
import { Upload, Download, Copy, RefreshCw, Settings, Image as ImageIcon, Palette, Zap } from 'lucide-react'

interface GeneratedImage {
  id: string
  prompt: string
  imageUrl: string
  createdAt: string
  style: 'realistic' | 'cartoon' | 'anime' | 'artistic'
  size: 'square' | 'landscape' | 'portrait'
}

export default function AIImageGenerationPage() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<'realistic' | 'cartoon' | 'anime' | 'artistic'>('realistic')
  const [selectedSize, setSelectedSize] = useState<'square' | 'landscape' | 'portrait'>('square')
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([
    {
      id: '1',
      prompt: 'A cute cartoon cat learning English with books',
      imageUrl: '/images/placeholder-cat.jpg',
      createdAt: '2024-01-15 10:30:00',
      style: 'cartoon',
      size: 'square'
    }
  ])

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)

    // Mock generation
    setTimeout(() => {
      const newImage: GeneratedImage = {
        id: String(Date.now()),
        prompt,
        imageUrl: `https://picsum.photos/512/512?random=${Date.now()}`,
        createdAt: new Date().toLocaleString('vi-VN'),
        style: selectedStyle,
        size: selectedSize
      }

      setGeneratedImages(prev => [newImage, ...prev])
      setPrompt('')
      setIsGenerating(false)
    }, 3000)
  }

  const downloadImage = (image: GeneratedImage) => {
    const link = document.createElement('a')
    link.href = image.imageUrl
    link.download = `ai-image-${image.id}.jpg`
    link.click()
  }

  const copyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Tạo hình ảnh</h1>
          <p className="text-gray-600">Sử dụng AI để tạo hình ảnh minh họa cho bài học</p>
        </div>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-500">Cài đặt AI</span>
        </div>
      </div>

      {/* Generation Form */}
      <div className="bg-white rounded-lg border p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phong cách</label>
            <div className="flex gap-2">
              {[
                { value: 'realistic', label: 'Thực tế', icon: ImageIcon },
                { value: 'cartoon', label: 'Hoạt hình', icon: Palette },
                { value: 'anime', label: 'Anime', icon: Zap },
                { value: 'artistic', label: 'Nghệ thuật', icon: Palette }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setSelectedStyle(value as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${selectedStyle === value
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kích thước</label>
            <div className="flex gap-2">
              {[
                { value: 'square', label: 'Vuông (1:1)', size: 'w-16 h-16' },
                { value: 'landscape', label: 'Ngang (16:9)', size: 'w-20 h-12' },
                { value: 'portrait', label: 'Dọc (9:16)', size: 'w-12 h-20' }
              ].map(({ value, label, size }) => (
                <button
                  key={value}
                  onClick={() => setSelectedSize(value as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${selectedSize === value
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <div className={`${size} bg-gray-200 rounded border`}></div>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả hình ảnh</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Mô tả chi tiết hình ảnh bạn muốn tạo..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Độ dài: {prompt.length} ký tự
            </div>
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang tạo...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  <span>Tạo hình ảnh</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Images */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Hình ảnh đã tạo ({generatedImages.length})</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {generatedImages.map((image) => (
            <div key={image.id} className="bg-white rounded-lg border overflow-hidden">
              <div className="aspect-square bg-gray-100 relative">
                <img
                  src={image.imageUrl}
                  alt={image.prompt}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNTYgMTkyQzI4OC4zMzIgMTkyIDMxMiAyMTUuNjY4IDMxMiAyNDhDMzEyIDI4MC4zMzIgMjg4LjMzMiAzMDQgMjU2IDMwNEMyMjMuNjY4IDMwNCAyMDAgMjgwLjMzMiAyMDAgMjQ4QzIwMCAyMTUuNjY4IDIyMy42NjggMTkyIDI1NiAxOTJaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yNTYgMjI0QzI2Ni42MTEgMjI0IDI3NiAyMzMuMzg5IDI3NiAyNDRDMjc2IDI1NC42MTEgMjY2LjYxMSAyNjQgMjU2IDI2NEMyNDUuMzg5IDI2NCAyMzYgMjU0LjYxMSAyMzYgMjQ0QzIzNiAyMzMuMzg5IDI0NS4zODkgMjI0IDI1NiAyMjRaIiBmaWxsPSIjNjM3Mzg4Ii8+Cjwvc3ZnPgo='
                  }}
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => copyImageUrl(image.imageUrl)}
                    className="p-1.5 bg-white/80 hover:bg-white rounded text-gray-600 hover:text-gray-800"
                    title="Sao chép URL"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => downloadImage(image)}
                    className="p-1.5 bg-white/80 hover:bg-white rounded text-gray-600 hover:text-gray-800"
                    title="Tải xuống"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {image.style === 'realistic' ? 'Thực tế' :
                      image.style === 'cartoon' ? 'Hoạt hình' :
                        image.style === 'anime' ? 'Anime' : 'Nghệ thuật'}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                    {image.size === 'square' ? 'Vuông' :
                      image.size === 'landscape' ? 'Ngang' : 'Dọc'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2 line-clamp-2">{image.prompt}</p>
                <div className="text-xs text-gray-500">
                  Tạo lúc: {image.createdAt}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
