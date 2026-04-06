"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Play, Square } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "react-toastify"

interface RecordingButtonProps {
  onRecordingComplete?: (audioBlob: Blob) => void
  maxDuration?: number // in seconds
}

export function RecordingSection({
  onRecordingComplete,
  maxDuration = 3
}: RecordingButtonProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [timeLeft, setTimeLeft] = useState(maxDuration)
  const [audioURL, setAudioURL] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (isRecording) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0.1) {
            stopRecording()
            return 0
          }
          return Math.max(0, prev - 0.1)
        })
      }, 100)

      countdownRef.current = timer

      return () => {
        if (countdownRef.current) {
          clearInterval(countdownRef.current)
        }
      }
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Tạo Audio Context và Analyser
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256

      // Kết nối microphone với analyser
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream)
      microphoneRef.current.connect(analyserRef.current)

      // Bắt đầu phân tích âm thanh
      startAudioAnalysis()

      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)

        if (onRecordingComplete) {
          onRecordingComplete(audioBlob)
        }

        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setTimeLeft(maxDuration)
    } catch {
      toast.error('Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.')
    }
  }

  const startAudioAnalysis = () => {
    if (!analyserRef.current) return

    const analyser = analyserRef.current
    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    const updateWaveform = () => {
      analyser.getByteFrequencyData(dataArray)

      if (isRecording) {
        animationFrameRef.current = requestAnimationFrame(updateWaveform)
      }
    }

    updateWaveform()
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }

  const formatTime = (time: number) => {
    return time.toFixed(1)
  }

  const handlePlayback = () => {
    if (audioURL) {
      const audio = new Audio(audioURL)
      audio.play()
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white border-none shadow-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-6">
            {/* Recording Button với sóng từ giữa ra ngoài */}
            {!isRecording ? (
              <div
                onClick={startRecording}
                className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center cursor-pointer"
              >
                <Mic size={30} />
              </div>
            ) : (
              <div
                onClick={stopRecording}
                className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center cursor-pointer"
              >
                <Square size={30} />
              </div>
            )}

            {/* Real-time Waveform */}
            {isRecording && (
              <div className="text-md font-bold text-red-500">
                {formatTime(timeLeft)}s
              </div>
            )}
          </div>

          {/* Playback Section */}
          {audioURL && !isRecording && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center space-x-4">
                <Button
                  onClick={handlePlayback}
                  variant="outline"
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Nghe lại
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div >
  )
}