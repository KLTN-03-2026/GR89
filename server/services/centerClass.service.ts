import { CenterClass, ICenterClass } from '../models/centerClass.model'
import { Homework, IHomework, ISubmission } from '../models/homework.model'
import { GlobalDocument } from '../models/globalDocument.model'
import ErrorHandler from '../utils/ErrorHandler'
import mongoose, { Mongoose } from 'mongoose'
import { User } from '../models/user.model'

export interface ICreateClassData {
  name: string
  category: 'kids' | 'teenager' | 'adult'
  teacher: string
  startDate: Date
  schedule: string
  status?: 'opening' | 'ongoing' | 'finished'
  password?: string
  maxStudents?: number | null
  isActive?: boolean
  documents?: string[]
}

export interface IUpdateClassData {
  name?: string
  category?: 'kids' | 'teenager' | 'adult'
  teacher?: string
  startDate?: Date
  schedule?: string
  status?: 'opening' | 'ongoing' | 'finished'
  password?: string
  maxStudents?: number | null
  isActive?: boolean
  documents?: string[]
}

export interface IClassOptions {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  category?: string
  status?: string
}

export interface ICenterClassStatsOptions {
  search?: string
  category?: string
  status?: string
  isActive?: boolean
}

export interface ICenterClassStats {
  totalClasses: number
  totalStudentsUnique: number
  totalStudentsEnrollments: number
  totalTeachers: number
  byCategory: Record<
    'kids' | 'teenager' | 'adult',
    {
      classes: number
      studentsUnique: number
      studentsEnrollments: number
      teachers: number
    }
  >
}

export interface ICreateHomeworkData {
  centerClassId: string
  title: string
  description: string
  startTime: Date
  deadline: Date
  documentIds?: string[] | null
  documentId?: string | null
}

export class CenterClassService {
  // (ADMIN/CONTENT) Tạo lớp học
  static async createClass(data: ICreateClassData): Promise<ICenterClass> {
    const classesExist = await CenterClass.find({ name: data.name })
    if (classesExist.length > 0) {
      throw new ErrorHandler('Tên lớp đã tồn tại', 400)
    }

    return await CenterClass.create(data)
  }

  // (USER) Thống kê lớp học + học viên + giảng viên (có thể lọc theo search/category/status/isActive)
  static async getCenterClassStats(
    options: ICenterClassStatsOptions = {},
  ): Promise<ICenterClassStats> {
    const { search, category, status, isActive } = options
    const match: any = {}
    if (typeof isActive === 'boolean') match.isActive = isActive
    if (category) match.category = category
    if (status) match.status = status
    if (search) match.name = { $regex: search, $options: 'i' }

    const [
      totalClasses,
      totalTeachersArr,
      totalEnrollmentsAgg,
      totalUniqueAgg,
      byCategoryAgg,
      byCategoryUniqueAgg,
    ] = await Promise.all([
      CenterClass.countDocuments(match),
      CenterClass.distinct('teacher', { ...match, teacher: { $ne: null } }),
      CenterClass.aggregate([
        { $match: match },
        { $project: { cnt: { $size: { $ifNull: ['$students', []] } } } },
        { $group: { _id: null, value: { $sum: '$cnt' } } },
      ]),
      CenterClass.aggregate([
        { $match: match },
        { $unwind: { path: '$students', preserveNullAndEmptyArrays: false } },
        { $group: { _id: '$students.user' } },
        { $count: 'value' },
      ]),
      CenterClass.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$category',
            classes: { $sum: 1 },
            studentsEnrollments: { $sum: { $size: { $ifNull: ['$students', []] } } },
            teacherSet: { $addToSet: '$teacher' },
          },
        },
        {
          $project: {
            classes: 1,
            studentsEnrollments: 1,
            teachers: { $size: { $setDifference: ['$teacherSet', [null]] } },
          },
        },
      ]),
      CenterClass.aggregate([
        { $match: match },
        { $unwind: { path: '$students', preserveNullAndEmptyArrays: false } },
        { $group: { _id: { category: '$category', user: '$students.user' } } },
        { $group: { _id: '$_id.category', studentsUnique: { $sum: 1 } } },
      ]),
    ])

    const totalStudentsEnrollments = Number((totalEnrollmentsAgg as any[])?.[0]?.value || 0)
    const totalStudentsUnique = Number((totalUniqueAgg as any[])?.[0]?.value || 0)
    const totalTeachers = Array.isArray(totalTeachersArr) ? totalTeachersArr.length : 0

    const byCategory: ICenterClassStats['byCategory'] = {
      kids: { classes: 0, studentsUnique: 0, studentsEnrollments: 0, teachers: 0 },
      teenager: { classes: 0, studentsUnique: 0, studentsEnrollments: 0, teachers: 0 },
      adult: { classes: 0, studentsUnique: 0, studentsEnrollments: 0, teachers: 0 },
    }

    for (const row of (byCategoryAgg || []) as any[]) {
      const key = row?._id as 'kids' | 'teenager' | 'adult'
      if (!key || !(key in byCategory)) continue
      byCategory[key].classes = Number(row?.classes || 0)
      byCategory[key].studentsEnrollments = Number(row?.studentsEnrollments || 0)
      byCategory[key].teachers = Number(row?.teachers || 0)
    }
    for (const row of (byCategoryUniqueAgg || []) as any[]) {
      const key = row?._id as 'kids' | 'teenager' | 'adult'
      if (!key || !(key in byCategory)) continue
      byCategory[key].studentsUnique = Number(row.studentsUnique || 0)
    }

    return {
      totalClasses: Number(totalClasses || 0),
      totalStudentsUnique,
      totalStudentsEnrollments,
      totalTeachers,
      byCategory,
    }
  }

  // (USER) Kiểm tra password class
  static async checkPasswordClass(
    userId: string,
    classId: string,
    password: string,
  ): Promise<boolean> {
    const user = await User.findById(userId)
    if (!user) {
      throw new ErrorHandler('Không tìm thấy người dùng', 404)
    }

    const centerClass = await CenterClass.findById(classId)
    if (!centerClass) {
      throw new ErrorHandler('Không tìm thấy lớp học', 404)
    }

    if (centerClass.password !== password) {
      throw new ErrorHandler('Password không đúng vui lòng thử lại', 400)
    }

    centerClass.students.push({ user: new mongoose.Types.ObjectId(userId), joinDate: new Date() })
    await centerClass.save()

    return true
  }

  // (USER) Kiểm tra người dùng đã tham gia lớp học chưa
  static async isUserEnrolledInClass(userId: string, classId: string): Promise<boolean> {
    const centerClass = await CenterClass.findById(classId)
    if (!centerClass) {
      throw new ErrorHandler('Không tìm thấy lớp học', 404)
    }

    return centerClass.students.some((student) => student.user.equals(userId))
  }

  // (ADMIN/CONTENT) Lấy danh sách lớp (phân trang + filter)
  static async getAllClassesPaginated(options: IClassOptions) {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      category,
      status,
    } = options

    const query: any = {}

    if (search) {
      query.name = { $regex: search, $options: 'i' }
    }

    if (category) query.category = category
    if (status) query.status = status

    const paginateOptions = {
      page,
      limit,
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      populate: [
        { path: 'teacher', select: 'fullName email avatar' },
        { path: 'students.user', select: 'fullName email avatar' },
        { path: 'documents', select: 'name category' },
        { path: 'homeworks', select: 'title deadline' },
      ],
      customLabels: {
        docs: 'docs',
        totalDocs: 'total',
      },
    }

    return await CenterClass.paginate(query, paginateOptions)
  }

  // (USER) Lấy danh sách lớp theo danh mục (không trả password)
  static async getClassesForUser(category?: string): Promise<ICenterClass[]> {
    const query: any = { isActive: true }
    if (category) query.category = category

    const classes = await CenterClass.find(query)
      .select('-password')
      .populate('teacher', 'fullName email avatar')
      .sort({ createdAt: -1 })
    return classes
  }

  // (USER) Lấy chi tiết lớp học theo id (không trả password)
  static async getClassByIdForUser(classId: string, userId: string): Promise<ICenterClass> {
    const user = await User.findById(userId)
    if (!user) {
      throw new ErrorHandler('Không tìm thấy người dùng', 404)
    }

    const centerClass = await CenterClass.findById(classId)
      .select('-password')
      .populate('teacher', 'fullName email avatar')
      .populate('students.user', 'fullName email avatar')
      .populate('documents')
      .populate({
        path: 'homeworks',
        strictPopulate: false,
        populate: [
          { path: 'documents', strictPopulate: false },
          {
            path: 'submissions.user',
            select: 'fullName email avatar',
            match: { _id: userId },
            strictPopulate: false,
          },
        ],
      })

    if (!centerClass || !centerClass.isActive) {
      throw new ErrorHandler('Không tìm thấy lớp học', 404)
    }

    // Kiểm tra người dùng có tham gia lớp học không
    if (!centerClass.students.some((student) => student.user.equals(userId))) {
      throw new ErrorHandler('Người dùng không tham gia lớp học', 403)
    }

    const centerClassAny = centerClass as any
    if (Array.isArray(centerClassAny.homeworks)) {
      centerClassAny.homeworks.forEach((hw: any) => {
        if (!Array.isArray(hw?.submissions)) return
        hw.submissions = hw.submissions.filter((s: any) => {
          const populatedUser = s?.user
          if (!populatedUser) return false
          const id = populatedUser?._id ?? populatedUser
          return id?.toString?.() === userId
        })
      })
    }

    return centerClass
  }

  // (ADMIN/CONTENT) Lấy chi tiết lớp học theo id
  static async getClassById(id: string): Promise<ICenterClass> {
    const centerClass = await CenterClass.findById(id)
      .populate('teacher', 'fullName email avatar')
      .populate('students.user', 'fullName email avatar')
      .populate('documents')
      .populate({
        path: 'homeworks',
        strictPopulate: false,
        populate: [
          { path: 'documents', strictPopulate: false },
          { path: 'submissions.user', select: 'fullName email avatar', strictPopulate: false },
        ],
      })

    if (!centerClass) {
      throw new ErrorHandler('Không tìm thấy lớp học', 404)
    }
    return centerClass
  }

  // (ADMIN/CONTENT) Cập nhật lớp học
  static async updateClass(id: string, data: IUpdateClassData): Promise<ICenterClass> {
    const centerClass = await CenterClass.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate('teacher students.user documents')

    if (!centerClass) {
      throw new ErrorHandler('Không tìm thấy lớp học để cập nhật', 404)
    }

    return centerClass
  }

  // (ADMIN/CONTENT) Xóa lớp học
  static async deleteClass(id: string): Promise<void> {
    const centerClass = await CenterClass.findByIdAndDelete(id)
    if (!centerClass) {
      throw new ErrorHandler('Không tìm thấy lớp học để xóa', 404)
    }
    await Homework.deleteMany({ _id: { $in: centerClass.homeworks } })
  }

  // (ADMIN/CONTENT) Thêm học viên vào lớp
  static async addStudentToClass(
    classId: string,
    userId: string,
    joinDate: Date = new Date(),
  ): Promise<ICenterClass> {
    const centerClass = await CenterClass.findById(classId)
    if (!centerClass) throw new ErrorHandler('Lớp học không tồn tại', 404)

    const isAlreadyMember = centerClass.students.some((s) => s.user.toString() === userId)
    if (isAlreadyMember) throw new ErrorHandler('Học sinh đã có trong lớp này', 400)

    centerClass.students.push({ user: new mongoose.Types.ObjectId(userId), joinDate })
    await centerClass.save()
    return centerClass
  }

  // (ADMIN/CONTENT) Xóa học viên khỏi lớp
  static async removeStudentFromClass(classId: string, userId: string): Promise<ICenterClass> {
    const centerClass = await CenterClass.findById(classId)
    if (!centerClass) throw new ErrorHandler('Lớp học không tồn tại', 404)

    centerClass.students = centerClass.students.filter((s) => s.user.toString() !== userId)
    await centerClass.save()
    return centerClass
  }

  /* ============================ DOCUMENT MANAGEMENT ============================ */

  // (ADMIN/CONTENT) Thêm tài liệu vào lớp
  static async addDocumentToClass(classId: string, documentId: string): Promise<ICenterClass> {
    const centerClass = await CenterClass.findById(classId)
    if (!centerClass) throw new ErrorHandler('Lớp học không tồn tại', 404)

    const document = await GlobalDocument.findById(documentId)
    if (!document) throw new ErrorHandler('Tài liệu không tồn tại', 404)

    const alreadyExists = centerClass.documents.some((d) => d.toString() === documentId)
    if (alreadyExists) throw new ErrorHandler('Tài liệu đã có trong lớp này', 400)

    centerClass.documents.push(new mongoose.Types.ObjectId(documentId))
    await centerClass.save()
    return centerClass
  }

  // (ADMIN/CONTENT) Xóa tài liệu khỏi lớp
  static async removeDocumentFromClass(classId: string, documentId: string): Promise<ICenterClass> {
    const centerClass = await CenterClass.findById(classId)
    if (!centerClass) throw new ErrorHandler('Lớp học không tồn tại', 404)

    centerClass.documents = centerClass.documents.filter((d) => d.toString() !== documentId)
    await centerClass.save()
    return centerClass
  }

  // (ADMIN/CONTENT) Lấy danh sách tài liệu của lớp
  static async getDocumentsByClassId(classId: string) {
    const centerClass = await CenterClass.findById(classId).populate('documents')
    if (!centerClass) throw new ErrorHandler('Lớp học không tồn tại', 404)
    return centerClass.documents
  }

  // (ADMIN/CONTENT) Set lại toàn bộ tài liệu của lớp
  static async setDocumentsForClass(classId: string, documentIds: string[]): Promise<ICenterClass> {
    const centerClass = await CenterClass.findById(classId)
    if (!centerClass) throw new ErrorHandler('Lớp học không tồn tại', 404)

    const uniqueIds = Array.from(new Set(documentIds.filter(Boolean)))
    if (uniqueIds.length > 0) {
      const count = await GlobalDocument.countDocuments({ _id: { $in: uniqueIds } })
      if (count !== uniqueIds.length) throw new ErrorHandler('Danh sách tài liệu không hợp lệ', 400)
    }

    centerClass.documents = uniqueIds.map((id) => new mongoose.Types.ObjectId(id))
    await centerClass.save()
    return centerClass
  }

  /* ============================ HOMEWORK MANAGEMENT ============================ */

  // (ADMIN/CONTENT) Tạo bài tập mới cho lớp
  static async createHomework(data: ICreateHomeworkData): Promise<IHomework> {
    const rawIds =
      data.documentIds !== undefined ? data.documentIds : data.documentId ? [data.documentId] : []
    const uniqueIds = Array.from(new Set((rawIds || []).filter(Boolean)))

    if (uniqueIds.length > 0) {
      const count = await GlobalDocument.countDocuments({ _id: { $in: uniqueIds } })
      if (count !== uniqueIds.length) throw new ErrorHandler('Danh sách tài liệu không hợp lệ', 400)
    }
    const documents = uniqueIds.map((id) => new mongoose.Types.ObjectId(id))
    const document = documents[0] || null

    const homework = await Homework.create({
      title: data.title,
      description: data.description,
      deadline: data.deadline,
      documents,
      document,
      submissions: [],
    })

    // Thêm tham chiếu bài tập vào lớp học
    await CenterClass.findByIdAndUpdate(data.centerClassId, {
      $push: { homeworks: homework._id },
    })

    return homework
  }

  // (ADMIN/CONTENT) Lấy danh sách bài tập của lớp
  static async getHomeworksByClassId(classId: string) {
    const centerClass = await CenterClass.findById(classId).populate({
      path: 'homeworks',
      strictPopulate: false,
      populate: [
        { path: 'documents', strictPopulate: false },
        { path: 'document', strictPopulate: false },
        { path: 'submissions.user', select: 'fullName email avatar', strictPopulate: false },
      ],
    })
    if (!centerClass) throw new ErrorHandler('Lớp học không tồn tại', 404)
    return centerClass.homeworks
  }

  // (USER) Lấy bài nộp theo học sinh và bài tập
  static async getHomeworkSubmissions(
    homeworkId: string,
    userId: string,
  ): Promise<ISubmission | null> {
    const homework = await Homework.findById(homeworkId)
    if (!homework) throw new ErrorHandler('Không tìm thấy bài tập', 404)

    const submission = homework.submissions.find((s) => s.user.toString() === userId)
    if (!submission) return null
    return submission
  }

  // (ADMIN/CONTENT) Cập nhật bài tập
  static async updateHomework(
    homeworkId: string,
    data: {
      title: string
      description: string
      startTime: Date
      deadline: Date
      documentIds?: string[] | null
    },
  ): Promise<IHomework> {
    console.log(data)
    const update: any = {}
    if (data.title != null) update.title = data.title
    if (data.description != null) update.description = data.description
    if (data.deadline != null) update.deadline = data.deadline
    if (data.documentIds !== undefined) {
      const rawIds = data.documentIds !== undefined ? data.documentIds : []
      const uniqueIds = Array.from(new Set((rawIds || []).filter(Boolean)))
      if (uniqueIds.length > 0) {
        const count = await GlobalDocument.countDocuments({ _id: { $in: uniqueIds } })
        if (count !== uniqueIds.length)
          throw new ErrorHandler('Danh sách tài liệu không hợp lệ', 400)
      }
      update.documents = uniqueIds.map((id) => new mongoose.Types.ObjectId(id))
      update.document = update.documents[0] || null
    }

    const homework = await Homework.findByIdAndUpdate(homeworkId, update, {
      new: true,
      runValidators: true,
    }).populate([
      { path: 'documents', strictPopulate: false },
      { path: 'document', strictPopulate: false },
    ])

    if (!homework) throw new ErrorHandler('Không tìm thấy bài tập', 404)
    return homework
  }

  // (ADMIN/CONTENT) Xóa bài tập (kiểm tra thuộc lớp)
  static async deleteHomeworkFromClass(classId: string, homeworkId: string): Promise<void> {
    const centerClass = await CenterClass.findById(classId)
    if (!centerClass) throw new ErrorHandler('Lớp học không tồn tại', 404)

    const inClass = centerClass.homeworks.some((h) => h.toString() === homeworkId)
    if (!inClass) throw new ErrorHandler('Bài tập không thuộc lớp này', 400)

    await CenterClassService.deleteHomework(homeworkId)
  }

  // (USER) Học viên nộp bài
  static async submitHomework(
    homeworkId: string,
    userId: string,
    content: string,
  ): Promise<IHomework> {
    const homework = await Homework.findById(homeworkId)
    if (!homework) throw new ErrorHandler('Không tìm thấy bài tập', 404)

    const submissionIndex = homework.submissions.findIndex((s) => s.user.toString() === userId)

    if (submissionIndex !== -1) {
      homework.submissions[submissionIndex].content = content
      homework.submissions[submissionIndex].submittedAt = new Date()
      homework.submissions[submissionIndex].status = 'pending'
    } else {
      homework.submissions.push({
        user: new mongoose.Types.ObjectId(userId),
        content,
        feedback: '',
        submittedAt: new Date(),
        status: 'pending',
      })
    }

    await homework.save()
    return homework
  }

  // (ADMIN/CONTENT) Chấm bài
  static async gradeHomework(
    homeworkId: string,
    userId: string,
    feedback: string,
  ): Promise<IHomework> {
    const homework = await Homework.findById(homeworkId)
    if (!homework) throw new ErrorHandler('Không tìm thấy bài tập', 404)

    const submissionIndex = homework.submissions.findIndex((s) => s.user.toString() === userId)
    if (submissionIndex === -1) {
      throw new ErrorHandler('Học sinh này chưa nộp bài', 400)
    }

    homework.submissions[submissionIndex].feedback = feedback
    homework.submissions[submissionIndex].gradedAt = new Date()
    homework.submissions[submissionIndex].status = 'graded'

    await homework.save()
    return homework
  }

  // (ADMIN/CONTENT) Lấy chi tiết bài tập
  static async getHomeworkById(id: string): Promise<IHomework> {
    const homework = await Homework.findById(id)
      .populate({ path: 'documents', strictPopulate: false })
      .populate({ path: 'document', strictPopulate: false })
      .populate({
        path: 'submissions.user',
        select: 'fullName email avatar',
        strictPopulate: false,
      })
    if (!homework) throw new ErrorHandler('Không tìm thấy bài tập', 404)
    return homework
  }

  // (ADMIN/CONTENT) Xóa bài tập
  static async deleteHomework(id: string): Promise<void> {
    const homework = await Homework.findByIdAndDelete(id)
    if (!homework) throw new ErrorHandler('Không tìm thấy bài tập', 404)

    await CenterClass.findOneAndUpdate({ homeworks: id }, { $pull: { homeworks: id } })
  }
}
