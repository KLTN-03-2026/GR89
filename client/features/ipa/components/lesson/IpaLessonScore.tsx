import { Button } from "@/components/ui/button"
import { Volume2 } from "lucide-react"
import { IIpaScoringResult } from "../../types"


interface IpaLessonScoreProps {
  phoneScoreList?: IIpaScoringResult
  recordedAudioBlob?: Blob | null
}

const getColorClass = (score: number) => {
  if (score >= 80) return 'bg-green-500 text-white border-green-600'
  if (score >= 60) return 'bg-yellow-400 text-gray-900 border-yellow-500'
  return 'bg-red-500 text-white border-red-600'
}

const getRingClass = (score: number) => {
  if (score >= 80) return 'ring-green-200'
  if (score >= 60) return 'ring-yellow-200'
  return 'ring-red-200'
}

// Chuyển mã SpeechAce (ARPABET) sang ký hiệu IPA quen thuộc
const normalizePhone = (phone: string) => {
  const map: Record<string, string> = {
    aa: 'ɑː', ae: 'æ', ah: 'ʌ', ao: 'ɔː', aw: 'aʊ', ay: 'aɪ', b: 'b', ch: 'tʃ', d: 'd',
    dh: 'ð', eh: 'e', er: 'ɜː', ey: 'eɪ', f: 'f', g: 'ɡ', hh: 'h', ih: 'ɪ', iy: 'iː', jh: 'dʒ', k: 'k',
    l: 'l', m: 'm', n: 'n', ng: 'ŋ', ow: 'oʊ', oy: 'ɔɪ', p: 'p', r: 'r', s: 's', sh: 'ʃ',
    t: 't', th: 'θ', uh: 'ʊ', uw: 'uː', v: 'v', w: 'w', y: 'j', z: 'z', zh: 'ʒ', ax: 'ə'
  }
  const key = (phone || '').toLowerCase()
  return map[key] || phone || '?'
}

export default function IpaLessonScore({ phoneScoreList, recordedAudioBlob }: IpaLessonScoreProps) {
  const data = phoneScoreList?.phone_score_list

  const handleReplay = () => {
    if (!recordedAudioBlob) return
    const url = URL.createObjectURL(recordedAudioBlob)
    const audio = new Audio(url)
    audio.onended = () => URL.revokeObjectURL(url)
    audio.onerror = () => URL.revokeObjectURL(url)
    audio.play().catch(() => {
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div className="flex flex-col gap-5 items-center w-full">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {data && data.length > 0 && data?.map((item, idx) => (
          <div
            key={`${item.phone}-${idx}`}
            className={`min-w-[94px] flex flex-col items-center justify-center px-4 py-3 rounded-2xl border-2 shadow-md ring-2 ${getColorClass(item.quality_score)} ${getRingClass(item.quality_score)} transition-transform hover:scale-105`}
            title={`Âm: ${normalizePhone(item.phone)} (${item.phone})\nĐiểm: ${Math.round(item.quality_score)}/100`}
          >
            <span className="text-3xl font-black tracking-tight">{normalizePhone(item.phone)}</span>
            <span className="text-sm font-semibold mt-1">
              {Math.round(item.quality_score)}
              <span className="text-[11px] opacity-80">/100</span>
            </span>
          </div>
        ))}
      </div>
      {phoneScoreList?.aiFeedback && (
        <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-sm px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Gợi ý từ AI</div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 whitespace-pre-line">
            {phoneScoreList.aiFeedback}
          </p>
        </div>
      )}
      {!!recordedAudioBlob && (
        <Button variant="outline" onClick={handleReplay} className="gap-2 rounded-xl border-slate-300 hover:bg-slate-50">
          <Volume2 className="h-4 w-4" />
          Nghe lại giọng của bạn
        </Button>
      )}
    </div>
  )
}
