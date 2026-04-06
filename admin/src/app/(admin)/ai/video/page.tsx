'use client'

import { useState } from 'react'
import { Upload, Download, Copy, RefreshCw, Settings, Video, Play, Pause, Volume2, VolumeX } from 'lucide-react'

interface GeneratedVideo {
  id: string
  prompt: string
  videoUrl: string
  thumbnailUrl: string
  createdAt: string
  duration: number
  style: 'realistic' | 'cartoon' | 'anime' | 'artistic'
  resolution: '720p' | '1080p' | '4k'
}

export default function AIVideoGenerationPage() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<'realistic' | 'cartoon' | 'anime' | 'artistic'>('realistic')
  const [selectedResolution, setSelectedResolution] = useState<'720p' | '1080p' | '4k'>('1080p')
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([
    {
      id: '1',
      prompt: 'A teacher explaining English grammar in a classroom',
      videoUrl: '/videos/placeholder-teacher.mp4',
      thumbnailUrl: '/images/placeholder-teacher.jpg',
      createdAt: '2024-01-15 10:30:00',
      duration: 120,
      style: 'realistic',
      resolution: '1080p'
    }
  ])

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)

    // Mock generation
    setTimeout(() => {
      const newVideo: GeneratedVideo = {
        id: String(Date.now()),
        prompt,
        videoUrl: `https://sample-videos.com/zip/10/mp4/SampleVideo_${Math.floor(Math.random() * 3) + 1}.mp4`,
        thumbnailUrl: `https://picsum.photos/640/360?random=${Date.now()}`,
        createdAt: new Date().toLocaleString('vi-VN'),
        duration: Math.floor(Math.random() * 180) + 60,
        style: selectedStyle,
        resolution: selectedResolution
      }

      setGeneratedVideos(prev => [newVideo, ...prev])
      setPrompt('')
      setIsGenerating(false)
    }, 5000)
  }

  const downloadVideo = (video: GeneratedVideo) => {
    const link = document.createElement('a')
    link.href = video.videoUrl
    link.download = `ai-video-${video.id}.mp4`
    link.click()
  }

  const copyVideoUrl = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Tạo video</h1>
          <p className="text-gray-600">Sử dụng AI để tạo video bài học và minh họa</p>
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
                { value: 'realistic', label: 'Thực tế', icon: Video },
                { value: 'cartoon', label: 'Hoạt hình', icon: Video },
                { value: 'anime', label: 'Anime', icon: Video },
                { value: 'artistic', label: 'Nghệ thuật', icon: Video }
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Độ phân giải</label>
            <div className="flex gap-2">
              {[
                { value: '720p', label: '720p (HD)' },
                { value: '1080p', label: '1080p (Full HD)' },
                { value: '4k', label: '4K (Ultra HD)' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setSelectedResolution(value as any)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${selectedResolution === value
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả video</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Mô tả chi tiết video bạn muốn tạo..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Settings className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Lưu ý:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Thời gian tạo video có thể từ 3-10 phút tùy độ phức tạp</li>
                  <li>Video 4K sẽ mất nhiều thời gian hơn để tạo</li>
                  <li>Độ dài video tối đa: 5 phút</li>
                </ul>
              </div>
            </div>
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
                  <Video className="w-4 h-4" />
                  <span>Tạo video</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Videos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Video đã tạo ({generatedVideos.length})</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {generatedVideos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg border overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                <video
                  src={video.videoUrl}
                  poster={video.thumbnailUrl}
                  className="w-full h-full object-cover"
                  controls
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => copyVideoUrl(video.videoUrl)}
                    className="p-1.5 bg-white/80 hover:bg-white rounded text-gray-600 hover:text-gray-800"
                    title="Sao chép URL"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => downloadVideo(video)}
                    className="p-1.5 bg-white/80 hover:bg-white rounded text-gray-600 hover:text-gray-800"
                    title="Tải xuống"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {video.style === 'realistic' ? 'Thực tế' :
                      video.style === 'cartoon' ? 'Hoạt hình' :
                        video.style === 'anime' ? 'Anime' : 'Nghệ thuật'}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                    {video.resolution}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2 line-clamp-2">{video.prompt}</p>
                <div className="text-xs text-gray-500">
                  Tạo lúc: {video.createdAt}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
