'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { toast } from 'react-toastify'
import { IIpaScoringResult } from '@/features/ipa/types'
import { assessIpaPronunciation } from '@/features/ipa/services/ipaApi'

interface IpaScoringProps {
  referenceText: string
  setResult: (result: IIpaScoringResult) => void
  ipaId: string
  onRecorded?: (audioBlob: Blob) => void
}

export default function IpaScoring({
  referenceText,
  setResult,
  ipaId,
  onRecorded
}: IpaScoringProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isAssessing, setIsAssessing] = useState(false)

  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startRecording = async () => {
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
        setIsAssessing(true)
        if (audioChunksRef.current.length === 0) {
          toast.error('Không có dữ liệu audio được ghi lại. Vui lòng thử lại.')
          setIsAssessing(false)
          return
        }

        const mimeType = recorder.mimeType || 'audio/webm'
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        onRecorded?.(audioBlob)

        if (audioBlob.size === 0) {
          toast.error('Không phát hiện thấy giọng nói vui lòng thử lại')
          setIsAssessing(false)
          return
        }

        /*GỌI API CHẤM ĐIỂM PHÁT ÂM TẠI ĐÂY */
        await assessIpaPronunciation(referenceText, new File([audioBlob], `ipa-recording-${Date.now()}.webm`, { type: mimeType }), ipaId)
          .then(res => {
            setResult(res.data as IIpaScoringResult)
          })
          .finally(() => {
            setIsAssessing(false)
          })
      }

      recorder.start(100)
      setIsRecording(true)
    } catch {
      toast.error('Không thể truy cập microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      setIsAssessing(true)
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <button
        onClick={() => (isRecording ? stopRecording() : startRecording())}
        disabled={isAssessing}
        className={`relative inline-flex items-center justify-center rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 shadow-lg ${isRecording
          ? 'bg-gradient-to-br from-red-500 to-red-600 border-red-600 text-white focus:ring-red-300 shadow-red-500/50 scale-105'
          : isAssessing
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-600 text-white focus:ring-blue-300 shadow-blue-500/50'
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-300 text-gray-700 hover:from-gray-50 hover:to-white hover:border-gray-400 focus:ring-blue-300 shadow-gray-900/10 hover:shadow-lg hover:scale-105'
          }`}
        style={{ width: 120, height: 120 }}
        aria-label={isRecording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
      >
        {isRecording && (
          <>
            <span className="absolute inset-0 rounded-full animate-ping bg-red-400/40" style={{ animationDuration: '1s' }} />
            <span className="absolute inset-0 rounded-full animate-pulse bg-red-400/20" style={{ animationDuration: '2s' }} />
          </>
        )}
        <span className="absolute inset-1 rounded-full bg-black/5" />
        <span className="relative z-10">
          {isAssessing ? (
            <span className="animate-spin rounded-full h-8 w-8 border-[3px] border-white border-t-transparent" />
          ) : isRecording ? (
            <MicOff className="w-10 h-10" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
        </span>
      </button>

      {isRecording && (
        <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>Đang ghi âm... nhấn để dừng</span>
        </div>
      )}

      {isAssessing && (
        <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
          <span className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
          <span>Đang phân tích và chấm điểm...</span>
        </div>
      )}
    </div>
  )
}