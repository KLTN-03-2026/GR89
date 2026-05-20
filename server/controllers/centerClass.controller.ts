import { NextFunction, Request, Response } from 'express'
import { CatchAsyncError } from '../middleware/CatchAsyncError'
import { CenterClassService } from '../services/centerClass.service'
import ErrorHandler from '../utils/ErrorHandler'
import { NotificationService } from '../services/notification.service'
import { CenterClass } from '../models/centerClass.model'

export class CenterClassController {
  /* ============================ QUẢN LÝ LỚP HỌC ============================ */

  // Tạo lớp học mới
  static createClass = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body

    //check tất cả dữ liệu
    if (!data.name || !data.password) {
      return next(new ErrorHandler('Vui lòng nhập tên lớp học và mật khẩu', 400))
    }
    if (data.password.length !== 6) {
      return next(new ErrorHandler('Mật khẩu phải là 6 ký tự số', 400))
    }
    if (data.maxStudents !== undefined && data.maxStudents !== null && data.maxStudents !== '') {
      const maxStudents = Number(data.maxStudents)
      if (!Number.isInteger(maxStudents) || maxStudents <= 0) {
        return next(new ErrorHandler('Số học viên tối đa phải là số nguyên dương', 400))
      }
      data.maxStudents = maxStudents
    }

    const newClass = await CenterClassService.createClass(data)
    res.status(201).json({
      success: true,
      message: 'Tạo lớp học thành công',
      data: newClass,
    })
  })

  // Lấy danh sách lớp học (phân trang & tìm kiếm)
  static getAllClasses = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { page, limit, search, sortBy, sortOrder, category, status } = req.query
      const result = await CenterClassService.getAllClassesPaginated({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        search: search as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        category: category as string,
        status: status as string,
      })

      res.status(200).json({
        success: true,
        message: 'Lấy danh sách lớp học thành công',
        data: result.docs,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
      })
    },
  )

  // (ADMIN/CONTENT) Thống kê lớp học trung tâm
  static getStats = CatchAsyncError(async (req: Request, res: Response) => {
    const { search, category, status, isActive } = req.query
    const stats = await CenterClassService.getCenterClassStats({
      search: search as string | undefined,
      category: category as string | undefined,
      status: status as string | undefined,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    })
    res.status(200).json({
      success: true,
      message: 'Lấy thống kê lớp học thành công',
      data: stats,
    })
  })

  // (USER) Lấy danh sách lớp học theo danh mục
  static getUserClasses = CatchAsyncError(async (req: Request, res: Response) => {
    const { category } = req.query
    const classes = await CenterClassService.getClassesForUser(category as string | undefined)
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách lớp học thành công',
      data: classes,
    })
  })

  // (USER) Kiểm tra password class
  static checkPasswordClass = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { classId, password } = req.body
      const userId = req.user?._id

      if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập trước', 401))
      const result = await CenterClassService.checkPasswordClass(userId, classId, password)
      res.status(200).json({
        success: true,
        message: 'Kiểm tra password lớp thành công',
        data: result,
      })
    },
  )

  // (USER) Kiểm tra người dùng đã tham gia lớp học chưa
  static isUserEnrolledInClass = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { classId } = req.body
      const userId = req.user?._id

      if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập trước', 401))
      const result = await CenterClassService.isUserEnrolledInClass(userId, classId)
      res.status(200).json({
        success: true,
        message: 'Kiểm tra người dùng đã tham gia lớp học thành công',
        data: result,
      })
    },
  )

  // (USER) Thống kê lớp học trung tâm (theo danh mục nếu có)
  static getUserStats = CatchAsyncError(async (req: Request, res: Response) => {
    const { category } = req.query
    const stats = await CenterClassService.getCenterClassStats({
      category: category as string | undefined,
      isActive: true,
    })
    res.status(200).json({
      success: true,
      message: 'Lấy thống kê lớp học thành công',
      data: stats,
    })
  })

  // (USER) Lấy chi tiết lớp học
  static getUserClassById = CatchAsyncError(async (req: Request, res: Response) => {
    const { id } = req.params
    const userId = req.user?._id

    if (!userId) {
      throw new ErrorHandler('Vui lòng đăng nhập trước', 401)
    }

    const centerClass = await CenterClassService.getClassByIdForUser(id, userId)
    if (!centerClass) {
      throw new ErrorHandler('Không tìm thấy lớp học', 404)
    }
    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết lớp học thành công',
      data: centerClass,
    })
  })

  // Lấy chi tiết lớp học
  static getClassById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const centerClass = await CenterClassService.getClassById(id)
    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết lớp học thành công',
      data: centerClass,
    })
  })

  // Cập nhật lớp học
  static updateClass = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const data = req.body
    //check tất cả dữ liệu
    if (!data.name || !data.password) {
      return next(new ErrorHandler('Vui lòng nhập tên lớp học và mật khẩu', 400))
    }
    if (data.password.length !== 6) {
      return next(new ErrorHandler('Mật khẩu phải là 6 ký tự số', 400))
    }
    if (data.maxStudents !== undefined && data.maxStudents !== null && data.maxStudents !== '') {
      const maxStudents = Number(data.maxStudents)
      if (!Number.isInteger(maxStudents) || maxStudents <= 0) {
        return next(new ErrorHandler('Số học viên tối đa phải là số nguyên dương', 400))
      }
      data.maxStudents = maxStudents
    }
    const updatedClass = await CenterClassService.updateClass(id, data)
    res.status(200).json({
      success: true,
      message: 'Cập nhật lớp học thành công',
      data: updatedClass,
    })
  })

  // Xóa lớp học
  static deleteClass = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    await CenterClassService.deleteClass(id)
    res.status(200).json({
      success: true,
      message: 'Xóa lớp học thành công',
    })
  })

  /* ============================ QUẢN LÝ HỌC SINH ============================ */

  // Thêm học sinh vào lớp
  static addStudent = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { email, userId, joinDate } = req.body

    const rawEmail =
      typeof email === 'string'
        ? email
        : typeof userId === 'string' && userId.includes('@')
          ? userId
          : ''
    if (rawEmail) {
      const requestedById = String(req.user?._id || '')
      if (!requestedById) return next(new ErrorHandler('Vui lòng đăng nhập trước', 401))

      const invite = await CenterClassService.inviteStudentToClassByEmail({
        classId: id,
        email: rawEmail,
        requestedById,
      })

      res.status(200).json({
        success: true,
        message: 'Đã gửi lời mời cho học viên. Đang chờ xác nhận.',
        data: invite,
      })
      return
    }

    if (!userId) return next(new ErrorHandler('Email hoặc ID người dùng là bắt buộc', 400))

    const updatedClass = await CenterClassService.addStudentToClass(id, userId, joinDate)
    res.status(200).json({
      success: true,
      message: 'Thêm học sinh vào lớp thành công',
      data: updatedClass,
    })
  })

  static respondStudentInvite = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { inviteId } = req.params as { inviteId: string }
      const userId = String(req.user?._id || '')
      if (!userId) return next(new ErrorHandler('Vui lòng đăng nhập trước', 401))

      const accepted = !!req.body?.accepted
      const result = await CenterClassService.respondStudentInvite({ inviteId, userId, accepted })

      res.status(200).json({
        success: true,
        message: accepted ? 'Bạn đã chấp nhận lời mời' : 'Bạn đã từ chối lời mời',
        data: result,
      })
    },
  )

  // Xóa học sinh khỏi lớp
  static removeStudent = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id, userId } = req.params
      const centerClass = await CenterClass.findById(id).select('name category students')
      if (!centerClass) return next(new ErrorHandler('Không tìm thấy lớp học', 404))

      const isMember = (centerClass.students || []).some(
        (s: any) => String(s?.user) === String(userId),
      )
      if (!isMember) return next(new ErrorHandler('Học viên không có trong lớp này', 400))

      const updatedClass = await CenterClassService.removeStudentFromClass(id, userId)

      const className = String(centerClass.name || '')
      const classCategory = String(centerClass.category || 'adult')
      const link = `/catelogy/${classCategory}`
      await NotificationService.createOne({
        recipientId: String(userId),
        recipientRole: 'user',
        type: 'system',
        title: 'Bạn đã bị xóa khỏi lớp học',
        body: className
          ? `Bạn đã bị xóa khỏi lớp "${className}".`
          : 'Bạn đã bị xóa khỏi một lớp học.',
        link,
        data: {
          action: 'center_class_removed',
          classId: String(id),
          className,
          classCategory,
        },
      })

      res.status(200).json({
        success: true,
        message: 'Xóa học sinh khỏi lớp thành công',
        data: updatedClass,
      })
    },
  )

  /* ============================ QUẢN LÝ TÀI LIỆU ============================ */

  static addDocument = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { documentId } = req.body
    if (!documentId) return next(new ErrorHandler('ID tài liệu là bắt buộc', 400))

    const updatedClass = await CenterClassService.addDocumentToClass(id, documentId)
    res.status(200).json({
      success: true,
      message: 'Thêm tài liệu vào lớp thành công',
      data: updatedClass,
    })
  })

  static removeDocument = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id, documentId } = req.params
      const updatedClass = await CenterClassService.removeDocumentFromClass(id, documentId)
      res.status(200).json({
        success: true,
        message: 'Xóa tài liệu khỏi lớp thành công',
        data: updatedClass,
      })
    },
  )

  static getDocuments = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const documents = await CenterClassService.getDocumentsByClassId(id)
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách tài liệu của lớp thành công',
      data: documents,
    })
  })

  static setDocuments = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { documentIds } = req.body
    if (!Array.isArray(documentIds)) return next(new ErrorHandler('documentIds phải là mảng', 400))
    const updatedClass = await CenterClassService.setDocumentsForClass(id, documentIds)
    res.status(200).json({
      success: true,
      message: 'Cập nhật danh sách tài liệu của lớp thành công',
      data: updatedClass,
    })
  })

  /* ============================ QUẢN LÝ BÀI TẬP ============================ */

  // Giao bài tập mới (Admin/Teacher)
  static createHomework = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { centerClassId, title, description, startTime, deadline, documentIds, documentId } =
        req.body
      if (!centerClassId || !title || !deadline) {
        return next(new ErrorHandler('Vui lòng cung cấp đầy đủ thông tin bài tập', 400))
      }

      const homework = await CenterClassService.createHomework({
        centerClassId,
        title,
        description,
        startTime,
        deadline,
        documentIds,
        documentId,
      })

      const centerClass = await CenterClass.findById(centerClassId).select('name category students')
      const studentIds = (centerClass?.students || [])
        .map((s: any) => String(s?.user || ''))
        .filter(Boolean)
      const classCategory = String(centerClass?.category || 'adult')
      const link = `/catelogy/${classCategory}/${String(centerClassId)}?tab=homeworks&homeworkId=${String(homework._id)}`

      await NotificationService.createForUsers({
        userIds: studentIds,
        type: 'homework',
        title: 'Bài tập mới',
        body: centerClass?.name,
        link: link,
      })
      res.status(201).json({
        success: true,
        message: 'Giao bài tập thành công',
        data: homework,
      })
    },
  )

  static createHomeworkForClass = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id: centerClassId } = req.params
      const { title, description, startTime, deadline, documentIds, documentId } = req.body
      if (!title || !deadline) {
        return next(new ErrorHandler('Vui lòng cung cấp đầy đủ thông tin bài tập', 400))
      }

      const homework = await CenterClassService.createHomework({
        centerClassId,
        title,
        description,
        startTime,
        deadline,
        documentIds,
        documentId,
      })

      const centerClass = await CenterClass.findById(centerClassId).select('name category students')
      const studentIds = (centerClass?.students || [])
        .map((s: any) => String(s?.user || ''))
        .filter(Boolean)
      const classCategory = String(centerClass?.category || 'adult')
      const link = `/catelogy/${classCategory}/${String(centerClassId)}?tab=homeworks&homeworkId=${String(homework._id)}`

      await NotificationService.createForUsers({
        userIds: studentIds,
        type: 'homework',
        title: 'Bài tập mới',
        body: centerClass?.name,
        link: link,
      })

      res.status(201).json({
        success: true,
        message: 'Giao bài tập thành công',
        data: homework,
      })
    },
  )

  static getHomeworks = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const homeworks = await CenterClassService.getHomeworksByClassId(id)
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách bài tập của lớp thành công',
      data: homeworks,
    })
  })

  static updateHomework = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params
      const { title, description, startTime, deadline, documentIds } = req.body
      if (!startTime && !title && !description && !deadline && documentIds === undefined) {
        return next(new ErrorHandler('Không có dữ liệu để cập nhật', 400))
      }

      const updated = await CenterClassService.updateHomework(id, {
        title,
        description,
        startTime,
        deadline,
        documentIds,
      })

      res.status(200).json({
        success: true,
        message: 'Cập nhật bài tập thành công',
        data: updated,
      })
    },
  )

  static deleteHomeworkForClass = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id: classId, homeworkId } = req.params
      await CenterClassService.deleteHomeworkFromClass(classId, homeworkId)
      res.status(200).json({
        success: true,
        message: 'Xóa bài tập thành công',
      })
    },
  )

  // Học sinh nộp bài
  static submitHomework = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id: homeworkId } = req.params
      const userId = req.user?._id as string
      const { content } = req.body

      if (!content) return next(new ErrorHandler('Nội dung bài làm không được để trống', 400))

      const homework = await CenterClassService.submitHomework(homeworkId, userId, content)

      const centerClass = await CenterClass.findOne({ homeworks: homeworkId })
        .select('_id teacher name')
        .populate({ path: 'teacher', select: '_id role fullName' })

      const teacher: any = centerClass?.teacher
      const teacherId = teacher?._id ? String(teacher._id) : ''
      const teacherRole = teacher?.role ? String(teacher.role) : ''

      if (teacherId && (teacherRole === 'admin' || teacherRole === 'content')) {
        const teacherLink = centerClass?._id
          ? `/center-management/classes/homework/${String(centerClass._id)}?homeworkId=${String(homeworkId)}&studentId=${String(userId)}`
          : '/center-management/classes'

        await NotificationService.createOne({
          recipientId: teacherId,
          recipientRole: teacherRole as any,
          type: 'homework',
          title: 'Có bài nộp mới',
          body: `${req.user?.fullName || 'Học viên'} đã nộp bài "${homework.title || 'bài tập'}".`,
          link: teacherLink,
          data: {
            centerClassId: String(centerClass?._id || ''),
            homeworkId: String(homeworkId),
            studentId: String(userId),
          },
        })
      }

      res.status(200).json({
        success: true,
        message: 'Nộp bài tập thành công',
        data: homework,
      })
    },
  )

  // Giáo viên chấm bài
  static gradeHomework = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id: homeworkId } = req.params
      const reviewerId = req.user?._id as string
      const { userId, feedback, correctedContent } = req.body

      if (!userId) {
        return next(new ErrorHandler('Vui lòng cung cấp ID học sinh', 400))
      }

      const feedbackValue = typeof feedback === 'string' ? feedback : ''
      const correctedValue = typeof correctedContent === 'string' ? correctedContent : undefined

      if (!feedbackValue && !correctedValue) {
        return next(new ErrorHandler('Vui lòng cung cấp nội dung nhận xét hoặc bài sửa', 400))
      }

      const homework = await CenterClassService.gradeHomework(
        homeworkId,
        userId,
        feedbackValue,
        correctedValue,
        reviewerId,
      )

      const classForHomework = await CenterClass.findOne({ homeworks: homeworkId }).select(
        '_id category',
      )
      const classCategory = String(classForHomework?.category || 'adult')
      const link = classForHomework?._id
        ? `/catelogy/${classCategory}/${String(classForHomework._id)}?tab=homeworks&homeworkId=${String(homeworkId)}`
        : '/notifications'

      await NotificationService.createOne({
        recipientId: userId,
        recipientRole: 'user',
        type: 'homework',
        title: 'Bài tập đã được chấm',
        body: homework?.title,
        link,
      })

      res.status(200).json({
        success: true,
        message: 'Chấm bài thành công',
        data: homework,
      })
    },
  )

  // Lấy chi tiết bài tập (bao gồm danh sách nộp bài)
  static getHomeworkById = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params
      const homework = await CenterClassService.getHomeworkById(id)
      res.status(200).json({
        success: true,
        message: 'Lấy chi tiết bài tập thành công',
        data: homework,
      })
    },
  )

  static getHomeworkSubmissions = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id: homeworkId } = req.params
      const userId = req.user?._id as string

      const submissions = await CenterClassService.getHomeworkSubmissions(homeworkId, userId)
      res.status(200).json({
        success: true,
        message: 'Lấy danh sách nộp bài thành công',
        data: submissions,
      })
    },
  )

  // Xóa bài tập
  static deleteHomework = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params
      await CenterClassService.deleteHomework(id)
      res.status(200).json({
        success: true,
        message: 'Xóa bài tập thành công',
      })
    },
  )
}
