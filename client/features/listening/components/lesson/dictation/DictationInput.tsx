import React from 'react'
import DictationShortcut from './DictationShortcut'

interface Props {
  inputText: string
  setInputText: (inputText: string) => void
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  isCompleted: boolean
}

export default function DictationInput({ inputText, setInputText, handleKeyDown, isCompleted }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-700">
          Gõ toàn bộ bài nghe <span className="text-gray-400">(Sau đó bấm Chấm điểm)</span>
        </p>

        <DictationShortcut />
      </div>
      <textarea
        placeholder="Gõ toàn bộ những gì bạn nghe được vào đây..."
        value={inputText}
        onChange={e => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={e => e.preventDefault()}
        autoComplete="off"
        spellCheck={false}
        disabled={isCompleted}
        rows={6}
        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-indigo-500 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-base font-medium resize-none leading-relaxed bg-gray-50/50 focus:bg-white"
      />
    </div>
  )
}
