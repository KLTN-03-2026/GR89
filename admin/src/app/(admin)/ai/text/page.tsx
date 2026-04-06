'use client'

import { useState } from 'react'
import { Send, Copy, Download, RefreshCw, Settings, FileText, Clock, Hash } from 'lucide-react'

interface GeneratedText {
  id: string
  prompt: string
  content: string
  createdAt: string
  wordCount: number
  type: 'lesson' | 'exercise' | 'explanation' | 'story'
}

export default function AITextGenerationPage() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedType, setSelectedType] = useState<'lesson' | 'exercise' | 'explanation' | 'story'>('lesson')
  const [generatedTexts, setGeneratedTexts] = useState<GeneratedText[]>([
    {
      id: '1',
      prompt: 'Tạo bài học về thì hiện tại đơn cho học sinh lớp 6',
      content: 'Bài học: Thì hiện tại đơn (Present Simple)\n\nI. Định nghĩa:\nThì hiện tại đơn được sử dụng để diễn tả:\n- Thói quen hàng ngày\n- Sự thật hiển nhiên\n- Lịch trình cố định\n\nII. Cấu trúc:\nKhẳng định: S + V(s/es) + O\nPhủ định: S + do/does + not + V + O\nNghi vấn: Do/Does + S + V + O?\n\nIII. Ví dụ:\n- I go to school every day.\n- She doesn\'t like coffee.\n- Do you play football?',
      createdAt: '2024-01-15 10:30:00',
      wordCount: 45,
      type: 'lesson'
    }
  ])

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)

    // Mock generation
    setTimeout(() => {
      const newText: GeneratedText = {
        id: String(Date.now()),
        prompt,
        content: `Nội dung được tạo từ prompt: "${prompt}"\n\nĐây là nội dung mẫu được AI tạo ra. Trong thực tế, nội dung này sẽ được tạo từ AI model dựa trên prompt của bạn.`,
        createdAt: new Date().toLocaleString('vi-VN'),
        wordCount: prompt.split(' ').length * 3,
        type: selectedType
      }

      setGeneratedTexts(prev => [newText, ...prev])
      setPrompt('')
      setIsGenerating(false)
    }, 2000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadText = (text: GeneratedText) => {
    const blob = new Blob([text.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-text-${text.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Tạo văn bản</h1>
          <p className="text-gray-600">Sử dụng AI để tạo nội dung học tập chất lượng cao</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại nội dung</label>
            <div className="flex gap-2">
              {[
                { value: 'lesson', label: 'Bài học', icon: FileText },
                { value: 'exercise', label: 'Bài tập', icon: Hash },
                { value: 'explanation', label: 'Giải thích', icon: Settings },
                { value: 'story', label: 'Câu chuyện', icon: FileText }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setSelectedType(value as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${selectedType === value
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Nhập mô tả chi tiết về nội dung bạn muốn tạo..."
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
                  <Send className="w-4 h-4" />
                  <span>Tạo nội dung</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Texts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nội dung đã tạo ({generatedTexts.length})</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}</span>
          </div>
        </div>

        {generatedTexts.map((text) => (
          <div key={text.id} className="bg-white rounded-lg border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-900">{text.prompt}</span>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {text.type === 'lesson' ? 'Bài học' :
                      text.type === 'exercise' ? 'Bài tập' :
                        text.type === 'explanation' ? 'Giải thích' : 'Câu chuyện'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  Tạo lúc: {text.createdAt} • {text.wordCount} từ
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(text.content)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title="Sao chép"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => downloadText(text)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title="Tải xuống"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                {text.content}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
