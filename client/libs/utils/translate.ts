export interface DictionaryDetails {
  word: string
  phonetic?: string
  phonetics?: Array<{ text?: string; audio?: string }>
  translationVi?: string
  meanings?: Array<{
    partOfSpeech?: string
    definitions: string[]
    examples?: string[]
  }>
}

const MY_MEMORY_URL = 'https://api.mymemory.translated.net/get'
const LIBRE_TRANSLATE_URL = 'https://libretranslate.de/translate'
const DICTIONARY_API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en'

// Dịch từ tiếng Anh sang tiếng Việt, ưu tiên MyMemory và fallback sang LibreTranslate.
export async function translateWordToVi(word: string): Promise<string> {
  const query = word.trim()
  if (!query) return ''

  // Nguồn dịch chính: MyMemory.
  try {
    const response = await fetch(
      `${MY_MEMORY_URL}?q=${encodeURIComponent(query)}&langpair=en|vi`
    )

    if (response.ok) {
      const data = await response.json()
      const translated = data?.responseData?.translatedText as string | undefined
      if (translated && translated.toLowerCase() !== query.toLowerCase()) {
        return translated
      }
    }
  } catch {
    // Bỏ qua lỗi để thử nguồn dự phòng.
  }

  // Nguồn dịch dự phòng: LibreTranslate.
  try {
    const response = await fetch(LIBRE_TRANSLATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, source: 'en', target: 'vi', format: 'text' }),
    })

    if (response.ok) {
      const data = await response.json()
      const translated = (data?.translatedText as string | undefined) || ''
      if (translated) return translated
    }
  } catch {
    // Bỏ qua lỗi để trả chuỗi rỗng khi tất cả nguồn đều thất bại.
  }

  return ''
}

// Lấy thông tin từ vựng gồm nghĩa Việt, phiên âm, định nghĩa và ví dụ tiếng Anh.
export async function fetchWordDetails(word: string): Promise<DictionaryDetails | null> {
  const query = word.trim()
  if (!query) return null

  const details: DictionaryDetails = { word: query }

  // Lấy nghĩa tiếng Việt (tái sử dụng hàm dịch ở trên).
  try {
    const translated = await translateWordToVi(query)
    if (translated) details.translationVi = translated
  } catch {
    // Không chặn luồng nếu API dịch lỗi.
  }

  // Lấy chi tiết từ điển tiếng Anh từ dictionaryapi.dev.
  try {
    const response = await fetch(`${DICTIONARY_API_URL}/${encodeURIComponent(query)}`)
    if (response.ok) {
      const data = await response.json()
      const entry = data?.[0]
      details.phonetic = entry?.phonetic
      details.phonetics = entry?.phonetics

      type RawMeaning = {
        partOfSpeech?: string
        definitions?: Array<{ definition?: string; example?: string }>
      }

      const meanings: RawMeaning[] = Array.isArray(entry?.meanings) ? entry.meanings : []
      details.meanings = meanings
        .map((m) => ({
          partOfSpeech: m?.partOfSpeech,
          definitions: (m?.definitions || [])
            .map((d) => d?.definition || '')
            .filter((d): d is string => typeof d === 'string' && d.length > 0)
            .slice(0, 3),
          examples: (m?.definitions || [])
            .map((d) => d?.example || '')
            .filter((e): e is string => typeof e === 'string' && e.length > 0)
            .slice(0, 3),
        }))
        .filter((m) => m.definitions && m.definitions.length > 0)
    }
  } catch {
    // Không chặn luồng nếu API từ điển lỗi.
  }

  return details
}


