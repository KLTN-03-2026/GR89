import mongoose, { Document, Schema } from 'mongoose'

export interface IAdminActivity extends Document {
  adminId: mongoose.Types.ObjectId
  adminRole: 'admin' | 'content'
  action: string
  resourceType: string
  resourceId?: mongoose.Types.ObjectId
  description: string
  metadata?: Record<string, any>
  ip?: string
  userAgent?: string
  createdAt: Date
  updatedAt: Date
}

const adminActivitySchema = new Schema<IAdminActivity>({
  adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  adminRole: { type: String, enum: ['admin', 'content'], required: true, index: true },
  action: { type: String, required: true, trim: true, index: true },
  resourceType: { type: String, required: true, trim: true, index: true },
  resourceId: { type: Schema.Types.ObjectId, required: false, index: true },
  description: { type: String, required: true, trim: true },
  metadata: { type: Schema.Types.Mixed },
  ip: { type: String, trim: true },
  userAgent: { type: String, trim: true }
}, { timestamps: true })

adminActivitySchema.index({ createdAt: -1 })
adminActivitySchema.index({ resourceType: 1, createdAt: -1 })

export const AdminActivity = mongoose.model<IAdminActivity>('AdminActivity', adminActivitySchema)

