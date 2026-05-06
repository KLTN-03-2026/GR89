import {create} from 'zustand'
import { io, type Socket } from 'socket.io-client'

const baseURL =
  process.env.NEXT_PUBLIC_SERVER_BASE_URL ||
  (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '') : '') ||
  'http://localhost:8000'

export interface SocketState {
  socket: Socket | null
  connectSocket: () => void
  disconnectSocket: () => void
  onlineUsers: string[]
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null as Socket | null,
  onlineUsers: [] as string[],

  connectSocket: () => {
    const existingSocket = get().socket
    if (existingSocket) {
      return
    }
    const newSocket = io(baseURL, {
      transports: ['websocket'],
      withCredentials: true,
    })
    set({ socket: newSocket })
    newSocket.on("connect", () => {
      console.log("Connected to server")
    })

    newSocket.on('online-users', (users: string[]) => {
      set({ onlineUsers: users })
    })
  },

  disconnectSocket: () => {
    console.log('Disconnecting from server')
    const socket = get().socket
    if (!socket) return

    socket.disconnect()
    console.log('Client disconnect called')

    set({ socket: null })
  }
}))
