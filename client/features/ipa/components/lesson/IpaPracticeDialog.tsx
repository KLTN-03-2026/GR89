'use client'
import { Button } from "@/components/ui/button"
import { PlayCircle, Info, Mic, Loader2, Square, Volume2, BookOpen } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { getColorClass, normalizePhone } from "./IpaLessonScore"
import { IIpa, IPhonemeScore, IIpaScoringResult } from "../../types"
import { useEffect, useState, useRef } from "react"
import { getIpaSound, assessIpaPronunciation } from "../../services/ipaApi"
import { toast } from "react-toastify"
import { PlayAudioButton } from "@/components/ui/play-audio-button"

interface IpaPracticeDialogProps {
  selectedPhoneItem: IPhonemeScore | null
  onClose: () => void
}

export default function IpaPracticeDialog({ selectedPhoneItem, onClose }: IpaPracticeDialogProps) {
  const [ipaSound, setIpaSound] = useState<IIpa | null>(null)

  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const [recordingWord, setRecordingWord] = useState<string | null>(null)
  const [assessingWord, setAssessingWord] = useState<string | null>(null)
  const [wordScores, setWordScores] = useState<Record<string, number>>({})

  useEffect(() => {
    if (selectedPhoneItem?.phone) {
      const fetchIpaSound = async () => {
        await getIpaSound(normalizePhone(selectedPhoneItem.phone))
          .then(res => {
            setIpaSound(res.data)
          })
      }
      fetchIpaSound()
    }
  }, [selectedPhoneItem?.phone])

  useEffect(() => {
    if (!selectedPhoneItem) {
      stopRecording()
      setWordScores({})
    }
  }, [selectedPhoneItem])

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    setRecordingWord(null)
  }

  const startRecording = async (word: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      })
      streamRef.current = stream

      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = async () => {
        setAssessingWord(word)
        if (audioChunksRef.current.length === 0) {
          toast.error('Không có dữ liệu audio được ghi lại. Vui lòng thử lại.')
          setAssessingWord(null)
          return
        }

        const mimeType = recorder.mimeType || 'audio/webm'
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })

        if (audioBlob.size === 0) {
          toast.error('Không phát hiện thấy giọng nói vui lòng thử lại')
          setAssessingWord(null)
          return
        }

        if (!ipaSound?._id) {
          toast.error('Đang tải thông tin âm, vui lòng đợi.')
          setAssessingWord(null)
          return
        }

        try {
          const res = await assessIpaPronunciation(word, new File([audioBlob], `ipa-recording-${Date.now()}.webm`, { type: mimeType }), ipaSound._id)
          const data = res.data as IIpaScoringResult

          const phoneToFind = normalizePhone(selectedPhoneItem?.phone || '')
          const targetPhoneScore = data.phone_score_list?.find(p => normalizePhone(p.phone) === phoneToFind)
          const score = targetPhoneScore ? targetPhoneScore.quality_score : (data.phone_score_list.find((p) => p.phone === selectedPhoneItem?.phone)?.quality_score || 0)

          setWordScores(prev => ({ ...prev, [word]: Math.round(score) }))
        } catch (error) {
          console.error(error)
          toast.error('Có lỗi xảy ra khi chấm điểm.')
        } finally {
          setAssessingWord(null)
        }
      }

      recorder.start(100)
      setRecordingWord(word)
    } catch {
      toast.error('Không thể truy cập microphone')
    }
  }

  return (
    <Dialog open={!!selectedPhoneItem} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <span className={`px-4 py-1 rounded-xl text-white ${selectedPhoneItem ? getColorClass(selectedPhoneItem.quality_score).split(' ')[0] : 'bg-gray-500'}`}>
              /{selectedPhoneItem ? normalizePhone(selectedPhoneItem.phone) : ''}/
            </span>
            Luyện tập âm này
          </DialogTitle>
          <div className="flex items-center justify-between mt-2">
            <DialogDescription className="text-slate-600">
              Điểm số hiện tại của bạn: <strong className={selectedPhoneItem && selectedPhoneItem.quality_score < 60 ? 'text-red-500' : 'text-green-600'}>{selectedPhoneItem ? Math.round(selectedPhoneItem.quality_score) : 0}/100</strong>
            </DialogDescription>
            {ipaSound?._id && (
              <Link 
                href={`/study/ipa/learn/${ipaSound._id}`} 
                className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-100/50"
              >
                <BookOpen className="w-4 h-4" />
                Học lại lý thuyết
              </Link>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {ipaSound?.image && (
            <div className="w-[60%] mx-auto rounded-2xl overflow-hidden bg-slate-950 shadow-md border border-slate-200">
              <video
                src={ipaSound.image as string}
                controls
                controlsList="nodownload"
                className="w-full object-contain"
              />
            </div>
          )}

          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-700 leading-relaxed">
              <strong className="mr-1 text-blue-900">Hướng dẫn:</strong>
              {ipaSound?.description || 'Không có mô tả'}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 mb-3">Từ vựng luyện tập mẫu:</h4>
            <div className="space-y-3">
              {/* 3 từ mẫu Mockup */}
              {ipaSound?.examples?.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex flex-col gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-blue-200 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <PlayAudioButton
                        text={item.word}
                        className="h-12 w-12 bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 border border-indigo-100/50"
                      />
                      <div>
                        <p className="font-bold text-slate-800 text-lg leading-tight">{item.word}</p>
                        <p className="text-sm text-slate-500 font-mono mt-0.5">{item.phonetic}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {wordScores[item.word] !== undefined ? (
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 block mb-0.5 tracking-wider">
                            Điểm âm /{selectedPhoneItem ? normalizePhone(selectedPhoneItem.phone) : ''}/
                          </span>
                          <span className={`font-black text-xl ${wordScores[item.word] >= 80 ? 'text-green-500' : wordScores[item.word] >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {wordScores[item.word]}
                          </span>
                        </div>
                      ) : (
                        <div className="text-right text-slate-400">
                          <span className="text-[10px] font-bold block mb-0.5 tracking-wider">
                            Điểm âm /{selectedPhoneItem ? normalizePhone(selectedPhoneItem.phone) : ''}/
                          </span>
                          <span className="font-black text-xl">--</span>
                        </div>
                      )}
                      <div className="h-8 w-[1px] bg-slate-200"></div>

                      {assessingWord === item.word ? (
                        <Button
                          variant="default"
                          disabled
                          className="rounded-full bg-slate-400 shadow-md w-12 h-12 p-0 flex items-center justify-center shrink-0 cursor-not-allowed"
                        >
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                        </Button>
                      ) : recordingWord === item.word ? (
                        <Button
                          variant="default"
                          onClick={() => stopRecording()}
                          className="rounded-full bg-red-600 hover:bg-red-700 shadow-md w-12 h-12 p-0 flex items-center justify-center shrink-0 animate-pulse"
                          title="Nhấn để dừng thu âm"
                        >
                          <Square className="w-4 h-4 text-white fill-white" />
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          disabled={!!recordingWord || !!assessingWord || !ipaSound}
                          onClick={() => startRecording(item.word)}
                          className="rounded-full bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-200 w-12 h-12 p-0 flex items-center justify-center shrink-0 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Nhấn để thu âm"
                        >
                          <Mic className="w-5 h-5 text-white" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
