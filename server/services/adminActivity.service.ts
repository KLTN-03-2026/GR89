import mongoose from 'mongoose'
import { AdminActivity } from '../models/adminActivity.model'

export class AdminActivityService {
  static async logActivity(payload: {
    adminId: string
    adminRole: 'admin' | 'content'
    action: string
    resourceType: string
    resourceId?: string
    description: string
    metadata?: Record<string, any>
    ip?: string
    userAgent?: string
  }) {
    const { adminId, adminRole, action, resourceType, resourceId, description, metadata, ip, userAgent } = payload

    const doc: any = {
      adminId: new mongoose.Types.ObjectId(adminId),
      adminRole,
      action,
      resourceType,
      description,
      metadata,
      ip,
      userAgent
    }
    if (resourceId && mongoose.Types.ObjectId.isValid(resourceId)) {
      doc.resourceId = new mongoose.Types.ObjectId(resourceId)
    }

    return AdminActivity.create(doc)
  }

  static async getActivities(options: {
    page?: number
    limit?: number
    action?: string
    resourceType?: string
    adminId?: string
    search?: string
  }) {
    const { page = 1, limit = 20, action, resourceType, adminId, search = '' } = options
    const query: any = {}

    if (action) query.action = action
    if (resourceType) query.resourceType = resourceType
    if (adminId && mongoose.Types.ObjectId.isValid(adminId)) query.adminId = new mongoose.Types.ObjectId(adminId)
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { resourceType: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (page - 1) * limit
    const [items, total] = await Promise.all([
      AdminActivity.find(query)
        .populate('adminId', 'fullName email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdminActivity.countDocuments(query)
    ])

    const pages = Math.ceil(total / limit) || 1
    return {
      activities: items,
      total,
      page,
      limit,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1
    }
  }
}

