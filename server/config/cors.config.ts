// config/cors.config.ts
import { CorsOptions } from 'cors'

// 🎯 Allowed Origins
const getAllowedOrigins = (): string[] => {
  const origins = [
    'http://localhost:3000', 'http://localhost:3001',
    'http://127.0.0.1:3000',
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
  ]

  // Filter out undefined values
  return origins.filter(Boolean) as string[]
}

// 🎯 CORS Options
export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins()

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true)
    }

    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    callback(new Error('Not allowed by CORS'))
  },

  credentials: true, // Allow cookies

  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cookie',
    'Set-Cookie'
  ],

  exposedHeaders: ['Set-Cookie'],

  optionsSuccessStatus: 200, // Some legacy browsers choke on 204

  maxAge: 86400, // 24 hours - cache preflight response
}

// 🎯 Development CORS (more permissive)
export const devCorsOptions: CorsOptions = {
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['*'],
  exposedHeaders: ['*'],
  optionsSuccessStatus: 200,
}

// 🎯 Get CORS config based on environment
export const getCorsConfig = (): CorsOptions => {
  return process.env.NODE_ENV === 'development' && process.env.CORS_DEV_MODE === 'true'
    ? devCorsOptions
    : corsOptions
}

export default corsOptions