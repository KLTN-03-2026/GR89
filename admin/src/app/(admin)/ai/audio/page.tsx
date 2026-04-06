'use client'

import { useEffect, useRef, useState } from 'react'
import { Mic, Music, RefreshCw, Settings, Download, Copy, Play, Pause, Volume2, VolumeX } from 'lucide-react'

interface GeneratedAudio {
  id: string
  prompt: string
  audioUrl: string
  createdAt: string
  voice: 'female' | 'male' | 'child' | 'narrator'
  speed: 'slow' | 'normal' | 'fast'
  duration: number
}

export default function AIAudioGenerationPage() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [voice, setVoice] = useState<'female' | 'male' | 'child' | 'narrator'>('female')
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal')
  const [volume, setVolume] = useState(0.9)
  const [muted, setMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [audios, setAudios] = useState<GeneratedAudio[]>([
    {
      id: 'a1',
      prompt: 'Đọc đoạn văn tiếng Anh về chủ đề du lịch',
      audioUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav',
      createdAt: '2024-01-15 10:30:00',
      voice: 'female',
      speed: 'normal',
      duration: 60,
    }
  ])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume
      audioRef.current.muted = muted
    }
  }, [volume, muted])

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setIsGenerating(true)
    setTimeout(() => {
      const newAudio: GeneratedAudio = {
        id: String(Date.now()),
        prompt,
        audioUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav',
        createdAt: new Date().toLocaleString('vi-VN'),
        voice,
        speed,
        duration: 60,
      }
      setAudios(prev => [newAudio, ...prev])
      setPrompt('')
      setIsGenerating(false)
    }, 2000)
  }

  const copyUrl = (url: string) => navigator.clipboard.writeText(url)

  const downloadAudio = (audio: GeneratedAudio) => {
    const a = document.createElement('a')
    a.href = audio.audioUrl
    a.download = `ai-audio-${audio.id}.mp3`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Tạo âm thanh</h1>
          <p className="text-gray-600">Chuyển văn bản thành giọng nói cho bài học</p>
        </div>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-500">Cài đặt AI</span>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giọng đọc</label>
            <div className="flex gap-2">
              {(['female', 'male', 'child', 'narrator'] as const).map(v => (
                <button key={v} onClick={() => setVoice(v)} className={`px-3 py-2 rounded-lg border text-sm ${voice === v ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  {v === 'female' ? 'Nữ' : v === 'male' ? 'Nam' : v === 'child' ? 'Thiếu nhi' : 'Thuyết minh'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tốc độ</label>
            <div className="flex gap-2">
              {(['slow', 'normal', 'fast'] as const).map(s => (
                <button key={s} onClick={() => setSpeed(s)} className={`px-3 py-2 rounded-lg border text-sm ${speed === s ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  {s === 'slow' ? 'Chậm' : s === 'normal' ? 'Bình thường' : 'Nhanh'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Âm lượng</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setMuted(m => !m)} className="p-2 rounded border bg-white hover:bg-gray-50">
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-full" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Văn bản cần đọc</label>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Nhập nội dung cần chuyển thành giọng nói..." className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">{prompt.length} ký tự</div>
          <button onClick={handleGenerate} disabled={!prompt.trim() || isGenerating} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {isGenerating ? (<><RefreshCw className="w-4 h-4 animate-spin" /><span>Đang tạo...</span></>) : (<><Mic className="w-4 h-4" /><span>Tạo âm thanh</span></>)}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Âm thanh đã tạo ({audios.length})</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {audios.map(a => (
            <div key={a.id} className="bg-white rounded-lg border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate">{a.prompt}</span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">{a.voice === 'female' ? 'Nữ' : a.voice === 'male' ? 'Nam' : a.voice === 'child' ? 'Thiếu nhi' : 'Thuyết minh'}</span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">{a.speed === 'slow' ? 'Chậm' : a.speed === 'normal' ? 'BT' : 'Nhanh'}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">Tạo lúc: {a.createdAt} • {a.duration}s</div>
                  <audio ref={audioRef} src={a.audioUrl} controls className="w-full" />
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => copyUrl(a.audioUrl)} className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm">Sao chép URL</button>
                  <button onClick={() => downloadAudio(a)} className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm">Tải xuống</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


