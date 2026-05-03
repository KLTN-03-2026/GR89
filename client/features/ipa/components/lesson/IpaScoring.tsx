'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Mic, Square, Loader2 } from 'lucide-react'
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
        className={`relative inline-flex items-center justify-center rounded-full transition-transform duration-300 focus:outline-none shadow-xl shrink-0 active:scale-95 ${
          isAssessing
            ? 'bg-slate-400 shadow-slate-200 cursor-not-allowed'
            : isRecording
              ? 'bg-red-600 hover:bg-red-700 shadow-red-200/50'
              : 'bg-rose-500 hover:bg-rose-600 shadow-rose-200 hover:-translate-y-1'
        }`}
        style={{ width: 120, height: 120 }}
        aria-label={isRecording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
      >
        {isRecording && (
          <>
            <span className="absolute inset-0 rounded-full animate-ping bg-red-400/40" style={{ animationDuration: '1.5s' }} />
            <span className="absolute inset-0 rounded-full animate-pulse bg-red-400/20" style={{ animationDuration: '2s' }} />
          </>
        )}
        <span className="relative z-10 flex items-center justify-center">
          {isAssessing ? (
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          ) : isRecording ? (
            <Square className="w-10 h-10 text-white fill-white animate-pulse" />
          ) : (
            <Mic className="w-14 h-14 text-white" />
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