'use client'

import { useMemo } from 'react'

type SoundType = 'vowel' | 'consonant' | 'diphthong'

const MONOPHTHONG_ROWS = [
  ['i:', 'ɪ', 'ʊ', 'u:'],
  ['e', 'ə', 'ɜ:', 'ɔ:'],
  ['æ', 'ʌ', 'ɑ:', 'ɒ'],
]

const DIPHTHONG_ROWS = [
  ['ɪə', 'eɪ'],
  ['ʊə', 'ɔɪ', 'əʊ'],
  ['eə', 'aɪ', 'aʊ'],
]

const CONSONANT_ROWS = [
  ['p', 'b', 't', 'd', 'tʃ', 'dʒ', 'k', 'g'],
  ['f', 'v', 'θ', 'ð', 's', 'z', 'ʃ', 'ʒ'],
  ['m', 'n', 'ŋ', 'h', 'l', 'r', 'w', 'j'],
]

// flatten
const MONOPHTHONG = MONOPHTHONG_ROWS.flat()
const DIPHTHONG = DIPHTHONG_ROWS.flat()
const CONSONANT = CONSONANT_ROWS.flat()

interface Props {
  value: string
  onChange: (value: string) => void
  type?: SoundType
}

export function IpaSoundInput({ value, onChange, type }: Props) {

  // 👉 giữ picker luôn hiển thị + lọc theo type
  const sections = useMemo(() => {
    if (!type) {
      return [
        { label: 'Nguyên âm', data: MONOPHTHONG },
        { label: 'Nguyên âm đôi', data: DIPHTHONG },
        { label: 'Phụ âm', data: CONSONANT },
      ]
    }

    if (type === 'vowel') {
      return [{ label: 'Nguyên âm', data: MONOPHTHONG }]
    }

    if (type === 'diphthong') {
      return [{ label: 'Nguyên âm đôi', data: DIPHTHONG }]
    }

    return [{ label: 'Phụ âm', data: CONSONANT }]
  }, [type])

  return (
    <div className="space-y-4">

      {/* LABEL */}
      <label className="text-xs font-black text-gray-500 uppercase">
        Âm IPA <span className="text-rose-500">*</span>
      </label>

      {/* DISPLAY SELECTED */}
      <div className="h-12 flex items-center px-4 rounded-2xl border border-gray-200 bg-white font-serif text-lg shadow-sm">
        {value || (
          <span className="text-gray-400 text-sm">
            Chọn âm IPA bên dưới
          </span>
        )}
      </div>

      {/* IPA PICKER (LUÔN HIỂN THỊ) */}
      <div className="border rounded-2xl p-4 bg-gray-50 space-y-5">

        {sections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] text-gray-400 mb-2 uppercase font-bold">
              {section.label}
            </p>

            <div className="grid grid-cols-6 gap-2">
              {section.data.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onChange(s)}
                  className={`p-2 rounded-xl border font-serif transition-all
                    hover:bg-indigo-100
                    ${value === s
                      ? 'bg-indigo-200 border-indigo-400 scale-105'
                      : 'bg-white'
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}