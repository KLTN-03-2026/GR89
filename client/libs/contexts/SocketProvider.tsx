'use client'

import { useEffect, useRef } from 'react'
import { useSocketStore } from '@/libs/hooks/useSocketStore'
import { useAuth } from '@/libs/contexts/AuthContext'

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const connectSocket = useSocketStore((s) => s.connectSocket)
  const disconnectSocket = useSocketStore((s) => s.disconnectSocket)
  const {user} = useAuth()

  // tránh gọi 2 lần trong React Strict Mode (dev)
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