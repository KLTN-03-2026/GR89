import { Server } from 'socket.io'
import http from 'http'
import { app } from '../app'
import { socketMiddleware } from '../middleware/socket.middelware'
import { SupportChatService } from '../services/supportChat.service'

export const server = http.createServer(app)

const devOpen = process.env.NODE_ENV === 'development' && process.env.CORS_DEV_MODE === 'true'

export const io = new Server(server, {
  cors: {
    origin: devOpen ? true : [process.env.CLIENT_BASE_URL || '', process.env.ADMIN_BASE_URL || ''],
    credentials: true,
  },
})

type SocketUser = {
  _id: string
  role: string
  fullName?: string
  email?: string
  avatar?: string
}

declare module 'socket.io' {
  interface Socket {
    user?: SocketUser
  }
}

io.use(socketMiddleware)

export const onlineUsersBySocket = new Map<string, SocketUser>()
export const onlineUsersByUser = new Map<string, SocketUser>()

io.on('connection', (socket) => {
  console.log('Socket connected: ', socket?.user?.fullName)
  const user = socket.data.user || socket.user

  if (user) {
    onlineUsersBySocket.set(socket.id, user)
    onlineUsersByUser.set(user._id, user)
    io.emit('online-users', Array.from(onlineUsersByUser.keys()))

    socket.join(`user:${user._id}`)
    if (user.role === 'admin' || user.role === 'content') {
      socket.join('staff')
    }
  }

  socket.on('ticket:join', (payload: { conversationId: string }) => {
    if (!payload?.conversationId) return
    socket.join(`ticket:${payload.conversationId}`)
  })

  socket.on('ticket:leave', (payload: { conversationId: string }) => {
    if (!payload?.conversationId) return
    socket.leave(`ticket:${payload.conversationId}`)
  })

  socket.on('disconnect', () => {
    onlineUsersBySocket.delete(socket.id)
    onlineUsersByUser.delete(user._id)
    console.log('disconnect user: ' + user.fullName)
    io.emit('online-users', Array.from(onlineUsersBySocket.keys()))
    console.log('Socket disconnected: ', socket.id)
    if (user.role !== 'user') SupportChatService.openClaimTicket(user._id)
  })
})
