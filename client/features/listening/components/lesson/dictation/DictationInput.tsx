import React from 'react'
import DictationShortcut from './DictationShortcut'

interface Props {
  inputText: string
  setInputText: (inputText: string) => void
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  isCompleted: boolean
}

export default function DictationInput({ inputText, setInputText, handleKeyDown, isCompleted }: Props) {
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-700">
          Gõ từng từ <span className="text-gray-400">(Enter/Space xác nhận)</span>
        </p>

        <DictationShortcut />
      </div>
      <input
        type="text"
        placeholder="Gõ những gì bạn nghe được..."
        value={inputText}
        onChange={e => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={e => e.preventDefault()}
        autoComplete="off"
        spellCheck={false}
        disabled={isCompleted}
        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-base font-medium"
      />
    </>
  )
}
