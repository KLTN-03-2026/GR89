'use client'

import { useEffect, useRef } from 'react'
import { useSocketStore } from '@/hooks/useSocketStore'
import { useAuth } from './AuthContext'

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const connectSocket = useSocketStore((s) => s.connectSocket)
  const disconnectSocket = useSocketStore((s) => s.disconnectSocket)

  const hasConnectedRef = useRef(false)

  useEffect(() => {
    if (user?._id) {
      if (!hasConnectedRef.current) {
        connectSocket()
        hasConnectedRef.current = true
      }
    } else {
      disconnectSocket()
      hasConnectedRef.current = false
    }
    return () => {
      disconnectSocket()
    }
  }, [user?._id, connectSocket, disconnectSocket])
  return <>{children}</>
}
