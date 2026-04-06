import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const port = Number(process.env.SMTP_PORT || 587)
// 465 dùng SSL → secure=true, còn lại (587/25) → secure=false
const secure = process.env.SMTP_SECURE === 'true' || port === 465

if (!process.env.SMTP_HOST) throw new Error('SMTP_HOST is required')
if (!process.env.SMTP_USER) throw new Error('SMTP_USER is required')
if (!process.env.SMTP_PASS) throw new Error('SMTP_PASS is required')

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,        // vd: 'smtp.gmail.com' | 'smtp.office365.com'
  port,
  secure,                             // 465 -> true, 587 -> false
  requireTLS: port === 587,           // ép dùng STARTTLS cho 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    minVersion: 'TLSv1.2',
    // rejectUnauthorized: false,     // chỉ bật nếu chắc chắn cần (môi trường có TLS inspection)
  }
})

export async function sendMail(options: { to: string; subject: string; html: string; from?: string }) {
  const from = options.from || process.env.EMAIL_FROM || '"English Master" <no-reply@english-master.com>'
  // await transporter.verify() // có thể bật lúc khởi động để test cấu hình
  await transporter.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html
  })
}

export default transporter