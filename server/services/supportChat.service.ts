import mongoose from 'mongoose'
import ErrorHandler from '../utils/ErrorHandler'
import { ChatConversation, ISupportAttachment } from '../models/chatConversation.model'
import { io, onlineUsersByUser } from '../socket'
import { IChatMessage } from '../models/chatMessage.model'

export class SupportChatService {
  /* ============================ TIỆN ÍCH ============================ */

  private static buildPreview(content: string) {
    const text = String(content || '')
      .replace(/\s+/g, ' ')
      .trim()
    return text.length > 120 ? `${text.slice(0, 120)}...` : text
  }

  private static ensureObjectId(id: string, message: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ErrorHandler(message, 400)
    }
    return new mongoose.Types.ObjectId(id)
  }

  /* ============================ USER ============================ */

  // (USER) Lấy chi tiết ticket (kèm messages)
  static async getTicketByIdForUser(userId: string) {
    const requester = this.ensureObjectId(userId, 'userId không hợp lệ')

    const ticket = await ChatConversation.findOne({ requester })
      .populate('requester', 'fullName email avatar role')
      .populate('messages.sender', 'fullName email avatar role')

    ticket.requesterLastReadAt = new Date()
    await ticket.save()
    return ticket.toObject()
  }

  // (USER) Gửi tin nhắn vào ticket
  static async sendMessageAsRequester(
    requesterId: string,
    content: string,
    attachments?: ISupportAttachment[],
  ) {
    const requester = this.ensureObjectId(requesterId, 'Người dùng không hợp lệ')

    if ((!content || content.trim().length === 0) && (!attachments || attachments.length === 0)) {
      throw new ErrorHandler('Nội dung hoặc file đính kèm không được để trống', 400)
    }

    let ticket = await ChatConversation.findOne({ requester }).populate(
      'messages.sender',
      'fullName email avatar role',
    )
    if (!ticket) {
      const newTicket = await ChatConversation.create({ requester })
      ticket = await newTicket.populate('messages.sender', 'fullName email avatar role')
    }

    if (ticket.assignedTo) {
      const assignee = await onlineUsersByUser.get(ticket.assignedTo.toString())
      if (!assignee) {
        ticket.assignedTo = null
      }
    }

    const now = new Date()

    ticket.messages.push({
      sender: requester,
      type: 'text',
      content: content || '',
      attachments: Array.isArray(attachments) ? attachments : [],
      readBy: [],
      createdAt: now,
    } as any)

    ticket.waitingFor = 'assignee'
    ticket.lastRequesterMessageAt = now
    ticket.lastMessageAt = now
    ticket.lastMessagePreview = this.buildPreview(content || '[Đính kèm]')

    await ticket.save()

    return ticket
  }

  // (USER) Lấy số lượng tin nhắn được phản hồi chưa đọc
  static async getUnreadCountForUser(userId: string) {
    const requester = this.ensureObjectId(userId, 'userId không hợp lệ')

    const ticket = await ChatConversation.findOne({ requester })
      .populate('messages.sender', 'fullName email avatar role')
      .populate('assignedTo', 'fullName email avatar role')
      .populate('requester', 'fullName email avatar role')

    if (!ticket) throw new ErrorHandler('Không tìm thấy ticket', 404)

    const lastMessage = ticket.messages[ticket.messages.length - 1]
    if (lastMessage.sender.role !== 'user') {
      console.log(lastMessage)

      const lastRequesterReadAt = ticket.requesterLastReadAt
      const countUnRead = ticket.messages.reduce((acc: number, message: IChatMessage) => {
        if (!lastRequesterReadAt || message.createdAt > lastRequesterReadAt) return acc + 1
        else return acc
      }, 0)

      return {
        ...ticket.toObject(),
        countUnRead,
      }
    }
    return {
      ...ticket.toObject(),
      countUnRead: 0,
    }
  }

  /* ============================ ADMIN/CONTENT ============================ */

  // (ADMIN/CONTENT) Danh sách ticket để xử lý
  static async getTicketsForStaff(filters?: {
    status?: 'open' | 'closed'
    waitingFor?: 'assignee' | 'requester'
    assigned?: 'assigned' | 'unassigned'
  }) {
    const query: any = {}

    if (filters?.status) query.status = filters.status
    if (filters?.waitingFor) query.waitingFor = filters.waitingFor
    if (filters?.assigned === 'assigned') query.assignedTo = { $ne: null }
    if (filters?.assigned === 'unassigned') query.assignedTo = null

    const tickets = await ChatConversation.find(query)
      .populate('requester', 'fullName email avatar role')
      .populate('assignedTo', 'fullName email avatar role')
      .populate('messages.sender', 'fullName email avatar role')
      .sort({ lastRequesterMessageAt: -1, lastMessageAt: -1, createdAt: -1 })

    if (!tickets.length) return []
    const ticketsWithUnreadCount = tickets.map((ticket) => ({
      ...ticket.toObject(),
      unreadCount: ticket?.messages?.reduce(
        (count: number, msg: IChatMessage & { sender: { role: string } }) => {
          if (msg.sender.role === 'user') return count + 1
          else count = 0
          return count
        },
        0,
      ),
    }))

    return ticketsWithUnreadCount
  }

  // (ADMIN/CONTENT) Lấy chi tiết ticket (kèm messages, số lượng tin nhắn chưa phản hồi)
  static async getTicketByIdForStaff(ticketId: string) {
    const ticketObjectId = this.ensureObjectId(ticketId, 'Ticket không hợp lệ')

    const ticket = await ChatConversation.findById(ticketObjectId)
      .populate('requester', 'fullName email avatar role')
      .populate('assignedTo', 'fullName email avatar role')
      .populate('messages.sender', 'fullName email avatar role')

    if (!ticket) throw new ErrorHandler('Không tìm thấy ticket', 404)

    ticket.assigneeLastReadAt = new Date()
    await ticket.save()

    return ticket
  }

  // (ADMIN/CONTENT) Nhận ticket / cướp quyền theo rule 5 phút tính từ lần cuối học viên nhắn
  static async claimTicket(ticketId: string, staffId: string, takeoverMinutes: number = 5) {
    const ticketObjectId = this.ensureObjectId(ticketId, 'Ticket không hợp lệ')
    const staff = this.ensureObjectId(staffId, 'Người dùng không hợp lệ')

    const now = new Date()
    const threshold = new Date(now.getTime() - takeoverMinutes * 60 * 1000)

    const ticket = await ChatConversation.findOneAndUpdate(
      {
        _id: ticketObjectId,
        status: 'open',
        $or: [
          { assignedTo: null },
          {
            assignedTo: { $ne: null },
            waitingFor: 'assignee',
            lastRequesterMessageAt: { $ne: null, $lte: threshold },
            $or: [
              { lastAssigneeMessageAt: null },
              { $expr: { $lt: ['$lastAssigneeMessageAt', '$lastRequesterMessageAt'] } },
            ],
          },
        ],
      },
      { assignedTo: staff, assignedAt: now },
      { new: true },
    )

    if (!ticket) {
      throw new ErrorHandler('Ticket đang được xử lý hoặc chưa đủ điều kiện cướp quyền', 400)
    }

    return ticket
  }

  // (ADMIN/CONTENT) Gửi tin nhắn vào ticket (chỉ assignedTo mới được trả lời)
  static async sendMessageAsStaff(
    ticketId: string,
    staffId: string,
    content: string,
    attachments?: ISupportAttachment[],
  ) {
    const ticketObjectId = this.ensureObjectId(ticketId, 'Ticket không hợp lệ')
    const staff = this.ensureObjectId(staffId, 'Người dùng không hợp lệ')

    if ((!content || content.trim().length === 0) && (!attachments || attachments.length === 0)) {
      throw new ErrorHandler('Nội dung hoặc file đính kèm không được để trống', 400)
    }

    const ticket = await ChatConversation.findById(ticketObjectId)
    if (!ticket) throw new ErrorHandler('Không tìm thấy ticket', 404)
    if (ticket.status === 'closed') throw new ErrorHandler('Ticket đã đóng', 400)

    if (ticket.assignedTo && String(ticket.assignedTo) !== String(staff)) {
      throw new ErrorHandler('Ticket đang được người khác xử lý', 403)
    }

    const now = new Date()
    ticket.messages.push({
      sender: staff,
      type: 'text',
      content: content || '',
      attachments: Array.isArray(attachments) ? attachments : [],
      readBy: [],
      createdAt: now,
    } as any)

    ticket.waitingFor = 'requester'
    ticket.lastAssigneeMessageAt = now
    ticket.lastMessageAt = now
    ticket.lastMessagePreview = this.buildPreview(content || '[Đính kèm]')

    await ticket.save()
    return ticket
  }

  // (ADMIN/CONTENT) Mở nhận quyên ticket
  static async openClaimTicket(userId: string) {
    const user = this.ensureObjectId(userId, 'User không hợp lệ')
    const tickets = await ChatConversation.find({
      assignedTo: user,
    })
    if (tickets.length > 0) {
      tickets.map((ticket) => {
        ticket.assignedTo = null
        ticket.assignedAt = null
        ticket.waitingFor = 'assignee'
        ticket.save()
        io.to(`ticket:${String(ticket._id)}`).emit('ticket:updated', {
          ticketId: String(ticket._id),
        })
        io.to('staff').emit('ticket:updated', { ticketId: String(ticket._id) })
      })
    }

    return tickets
  }
}
