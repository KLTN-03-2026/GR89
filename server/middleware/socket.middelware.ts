import { Socket } from 'socket.io'
import { JWTUtils } from '../utils/jwt.utils'
import { AuthService } from '../services/auth.service'
import { User } from '../models/user.model'

function parseCookie(cookieHeader?: string) {
  if (!cookieHeader) return {}

  const result: Record<string, string> = {}
  cookieHeader.split(';').forEach((c) => {
    const trimmed = c.trim()
    if (!trimmed) return
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) return
    const key = trimmed.slice(0, eqIndex)
    const value = trimmed.slice(eqIndex + 1)
    if (!key) return
    result[key] = decodeURIComponent(value || '')
  })
  return result
}

export const socketMiddleware = async (socket: Socket, next: any) => {
  try {
    const origin = socket.handshake.headers.origin as string
    const cookies = parseCookie(socket.handshake.headers.cookie)

    let accessToken = '' as string
    let refreshToken = '' as string
    let tokenRole = '' as 'admin' | 'user' | 'content'

    if (origin?.includes(process.env.CLIENT_BASE_URL!)) {
      accessToken = cookies.access_token_user
      refreshToken = cookies.refresh_token_user
      tokenRole = 'user'
    } else if (origin?.includes(process.env.ADMIN_BASE_URL!)) {
      accessToken = cookies.access_token_admin
      refreshToken = cookies.refresh_token_admin

      if (accessToken) {
        tokenRole = 'admin'
      } else {
        accessToken = cookies.access_token_content
        refreshToken = cookies.refresh_token_content
        tokenRole = 'content'
      }
    }

    // Fallback: nếu không xác định được theo origin, vẫn cho phép auth bằng cookie token
    if (!accessToken) {
      if (cookies.access_token_admin) {
        accessToken = cookies.access_token_admin
        refreshToken = cookies.refresh_token_admin
        tokenRole = 'admin'
      } else if (cookies.access_token_content) {
        accessToken = cookies.access_token_content
        refreshToken = cookies.refresh_token_content
        tokenRole = 'content'
      } else if (cookies.access_token_user) {
        accessToken = cookies.access_token_user
        refreshToken = cookies.refresh_token_user
        tokenRole = 'user'
      }
    }

    if (!refreshToken) {
      if (tokenRole === 'admin') refreshToken = cookies.refresh_token_admin
      else if (tokenRole === 'content') refreshToken = cookies.refresh_token_content
      else if (tokenRole === 'user') refreshToken = cookies.refresh_token_user
    }

    if (!accessToken) {
      if (!refreshToken) return next(new Error('Vui lòng đăng nhập'))
      const { accessToken: newAccessToken } = await AuthService.refreshToken(refreshToken)

      const decoded = JWTUtils.verifyAccessToken(newAccessToken)
      const userId = decoded?.userId
      if (!userId) return next(new Error('Unauthorized'))

      const user = await User.findById(userId).select('_id role fullName email avatar isActive')

      if (!user || !user.isActive) return next(new Error('Unauthorized'))

      socket.data.user = {
        _id: String(user._id),
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
      }
      socket.user = socket.data.user

      return next()
    }

    const decoded = JWTUtils.verifyAccessToken(accessToken)
    if (!decoded?.userId) return next(new Error('Vui lòng đăng nhập'))

    const userResult = await AuthService.getUserById(decoded.userId)

    if (!userResult.user) {
      return next(new Error('Vui lòng đăng nhập'))
    }

    const socketUser = {
      _id: String(userResult.user._id),
      role: userResult.user.role,
      fullName: userResult.user.fullName,
      email: userResult.user.email,
      avatar: userResult.user.avatar,
    }
    socket.data.user = socketUser
    socket.user = socketUser

    next()
  } catch (err) {
    next(new Error('Vui lòng đăng nhập'))
  }
}
