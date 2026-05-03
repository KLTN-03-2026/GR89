import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Gộp className và tự xử lý class Tailwind bị trùng/xung đột.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type PlayAudioOptions = {
  lang?: string
  rate?: number
  pitch?: number
  volume?: number
  interrupt?: boolean
  voiceName?: string
  randomVoice?: boolean
}

// Chuẩn hóa văn bản trước khi đọc để giọng máy tự nhiên và rõ nghĩa hơn.
const normalizeTextForSpeech = (input: string, lang: string) => {
  let text = String(input ?? "").trim()
  text = text.replace(/\s+/g, " ").replace(/[\r\n]+/g, ", ")

  if (lang.toLowerCase().startsWith("en")) {
    text = text
      .replace(/\bMr\.\b/g, "Mister")
      .replace(/\bMrs\.\b/g, "Misses")
      .replace(/\bMs\.\b/g, "Ms")
      .replace(/\bDr\.\b/g, "Doctor")
      .replace(/\bProf\.\b/g, "Professor")
      .replace(/\bSt\.\b/g, "Saint")
      .replace(/\be\.g\.\b/gi, "for example")
      .replace(/\bi\.e\.\b/gi, "that is")
      .replace(/\betc\.\b/gi, "etcetera")
      .replace(/\bvs\.\b/gi, "versus")
  }

  return text
}

// Chọn giọng đọc phù hợp theo ngôn ngữ, có thể ưu tiên giọng chất lượng cao.
const pickVoice = (lang: string, options: { voiceName?: string; random?: boolean } = {}) => {
  const synth = window.speechSynthesis
  const voices = synth.getVoices()
  if (!voices || voices.length === 0) return undefined

  if (options.voiceName) {
    const byName = voices.find(v => v.name === options.voiceName)
    if (byName) return byName
  }

  const targetLang = lang.toLowerCase()
  const candidates = voices.filter(v => String(v.lang || "").toLowerCase().startsWith(targetLang))
  if (candidates.length === 0) return voices[0]

  if (options.random) {
    const highQuality = candidates.filter(v => {
      const name = (v.name || "").toLowerCase()
      return name.includes("google") || name.includes("natural") || name.includes("neural") || name.includes("microsoft")
    })

    const source = highQuality.length > 0 ? highQuality : candidates
    return source[Math.floor(Math.random() * source.length)]
  }

  const sorted = [...candidates].sort((a, b) => {
    const score = (v: SpeechSynthesisVoice) => {
      const name = (v.name || "").toLowerCase()
      return (
        (name.includes("google") ? 50 : 0) +
        (name.includes("natural") ? 30 : 0) +
        (name.includes("neural") ? 30 : 0) +
        (name.includes("microsoft") ? 10 : 0) +
        (v.default ? 5 : 0)
      )
    }
    return score(b) - score(a)
  })

  return sorted[0]
}

// Tìm URL audio phát âm của từ tiếng Anh từ Dictionary API.
const fetchDictionaryAudio = async (word: string): Promise<string | null> => {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase().trim()}`);
    if (!response.ok) return null;
    const data = await response.json();

    if (!Array.isArray(data)) return null;

    for (const entry of data) {
      if (entry.phonetics && Array.isArray(entry.phonetics)) {
        for (const phonetic of entry.phonetics) {
          if (phonetic.audio && phonetic.audio !== "") {
            return phonetic.audio;
          }
        }
      }
    }
    return null;
  } catch {
    return null;
  }
};

// Đọc văn bản bằng Web Speech API với các tùy chọn tốc độ, cao độ và âm lượng.
const speakWithTTS = (text: string, options: PlayAudioOptions = {}): Promise<void> => {
  return new Promise(resolve => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return resolve()

    const synth = window.speechSynthesis
    const lang = options.lang || "en-US"
    const normalized = normalizeTextForSpeech(text, lang)

    if (options.interrupt !== false) synth.cancel()

    const voice = pickVoice(lang, { voiceName: options.voiceName, random: options.randomVoice })
    const utterance = new SpeechSynthesisUtterance(normalized)
    utterance.lang = lang
    utterance.rate = options.rate ?? 0.9
    utterance.pitch = options.pitch ?? 1
    utterance.volume = options.volume ?? 1
    if (voice) utterance.voice = voice

    utterance.onend = () => resolve()
    utterance.onerror = () => resolve()

    synth.speak(utterance)
  })
}

// Dừng ngay mọi âm thanh TTS đang phát trên trình duyệt.
export const stopAudio = () => {
  if (typeof window === "undefined") return
  if (!("speechSynthesis" in window)) return
  window.speechSynthesis.cancel()
}

// Phát âm văn bản: ưu tiên audio từ điển, nếu không có thì fallback sang TTS.
export const playAudio = async (text: string, options: PlayAudioOptions = {}): Promise<void> => {
  if (typeof window === "undefined") return

  const lang = options.lang || "en-US"

  if (lang.toLowerCase().startsWith("en") && !options.randomVoice) {
    const audioUrl = await fetchDictionaryAudio(text);
    if (audioUrl) {
      try {
        return new Promise<void>((resolve) => {
          const audio = new Audio(audioUrl);
          audio.volume = options.volume ?? 1;
          audio.onended = () => resolve();
          audio.onerror = () => {
            speakWithTTS(text, options).then(resolve);
          };
          audio.play().catch(() => {
            speakWithTTS(text, options).then(resolve);
          });
        });
      } catch {
        return speakWithTTS(text, options);
      }
    }
  }

  return speakWithTTS(text, options);
}

// Chuyển số giây sang định dạng thời gian mm:ss hoặc hh:mm:ss.
export const getTime = (time: number) => {
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time % 3600) / 60)
  const seconds = time % 60
  if (hours === 0) return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`
  return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`
}

// Định dạng ngày theo kiểu tương đối dễ đọc như "2 giờ trước", "Hôm qua".
export const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return 'Chưa có dữ liệu'

  const dateObj = date instanceof Date ? date : new Date(date)

  if (isNaN(dateObj.getTime())) return 'Ngày không hợp lệ'

  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffMinutes < 1) return 'Vừa xong'
  if (diffMinutes < 60) return `${diffMinutes} phút trước`
  if (diffHours < 24) return `${diffHours} giờ trước`
  if (diffDays === 1) return 'Hôm qua'
  if (diffDays < 7) return `${diffDays} ngày trước`

  return dateObj.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Định dạng ngày giờ đầy đủ tiếng Việt gồm thứ, ngày tháng năm và thời gian.
export const formatDateDetailed = (date: Date | string | null | undefined) => {
  if (!date) return 'Chưa có dữ liệu'

  const dateObj = date instanceof Date ? date : new Date(date)

  // Kiểm tra nếu date không hợp lệ
  if (isNaN(dateObj.getTime())) return 'Ngày không hợp lệ'

  const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']

  const dayName = dayNames[dateObj.getDay()]
  const monthName = monthNames[dateObj.getMonth()]
  const day = dateObj.getDate().toString().padStart(2, '0')
  const year = dateObj.getFullYear()
  const time = dateObj.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

  return `${dayName}, ${day} ${monthName} ${year} lúc ${time}`
}
