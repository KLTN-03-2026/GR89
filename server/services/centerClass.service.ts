import { CenterClass, ICenterClass } from '../models/centerClass.model'
import { Homework, IHomework } from '../models/homework.model'
import { GlobalDocument } from '../models/globalDocument.model'
import ErrorHandler from '../utils/ErrorHandler'
import mongoose from 'mongoose'

export interface ICreateClassData {
  name: string
  category: 'kids' | 'teenager' | 'adult'
  teacher: string
  startDate: Date
  schedule: string
  status?: 'opening' | 'ongoing' | 'finished'
  password?: string
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

export interface ICreateHomeworkData {
  centerClassId: string
  title: string
  description: string
  deadline: Date
  documentIds?: string[] | null
  documentId?: string | null
}

export class CenterClassService {
  /* ============================ CLASS MANAGEMENT ============================ */

  static async createClass(data: ICreateClassData): Promise<ICenterClass> {
    const newClass = await CenterClass.create(data)
    return newClass
  }

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
          { path: 'document', strictPopulate: false },
          { path: 'submissions.user', select: 'fullName email avatar', strictPopulate: false },
        ],
      })

    if (!centerClass) {
      throw new ErrorHandler('Không tìm thấy lớp học', 404)
    }
    return centerClass
  }

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

  static async deleteClass(id: string): Promise<void> {
    const centerClass = await CenterClass.findByIdAndDelete(id)
    if (!centerClass) {
      throw new ErrorHandler('Không tìm thấy lớp học để xóa', 404)
    }
    // Xóa tất cả bài tập liên quan
    await Homework.deleteMany({ _id: { $in: centerClass.homeworks } })
  }

  /* ============================ STUDENT MANAGEMENT ============================ */

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

  static async removeStudentFromClass(classId: string, userId: string): Promise<ICenterClass> {
    const centerClass = await CenterClass.findById(classId)
    if (!centerClass) throw new ErrorHandler('Lớp học không tồn tại', 404)

    centerClass.students = centerClass.students.filter((s) => s.user.toString() !== userId)
    await centerClass.save()
    return centerClass
  }

  /* ============================ DOCUMENT MANAGEMENT ============================ */

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

  static async removeDocumentFromClass(classId: string, documentId: string): Promise<ICenterClass> {
    const centerClass = await CenterClass.findById(classId)
    if (!centerClass) throw new ErrorHandler('Lớp học không tồn tại', 404)

    centerClass.documents = centerClass.documents.filter((d) => d.toString() !== documentId)
    await centerClass.save()
    return centerClass
  }

  static async getDocumentsByClassId(classId: string) {
    const centerClass = await CenterClass.findById(classId).populate('documents')
    if (!centerClass) throw new ErrorHandler('Lớp học không tồn tại', 404)
    return centerClass.documents
  }

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

  // Tạo bài tập mới cho lớp
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

  static async updateHomework(
    homeworkId: string,
    data: {
      title?: string
      description?: string
      deadline?: Date
      documentIds?: string[] | null
      documentId?: string | null
    },
  ): Promise<IHomework> {
    const update: any = {}
    if (data.title != null) update.title = data.title
    if (data.description != null) update.description = data.description
    if (data.deadline != null) update.deadline = data.deadline
    if (data.documentIds !== undefined || data.documentId !== undefined) {
      const rawIds =
        data.documentIds !== undefined ? data.documentIds : data.documentId ? [data.documentId] : []
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

  static async deleteHomeworkFromClass(classId: string, homeworkId: string): Promise<void> {
    const centerClass = await CenterClass.findById(classId)
    if (!centerClass) throw new ErrorHandler('Lớp học không tồn tại', 404)

    const inClass = centerClass.homeworks.some((h) => h.toString() === homeworkId)
    if (!inClass) throw new ErrorHandler('Bài tập không thuộc lớp này', 400)

    await CenterClassService.deleteHomework(homeworkId)
  }

  // Học sinh nộp bài
  static async submitHomework(
    homeworkId: string,
    userId: string,
    content: string,
  ): Promise<IHomework> {
    const homework = await Homework.findById(homeworkId)
    if (!homework) throw new ErrorHandler('Không tìm thấy bài tập', 404)

    const submissionIndex = homework.submissions.findIndex((s) => s.user.toString() === userId)

    if (submissionIndex !== -1) {
      // Nếu đã nộp rồi thì cập nhật nội dung
      homework.submissions[submissionIndex].content = content
      homework.submissions[submissionIndex].submittedAt = new Date()
      homework.submissions[submissionIndex].status = 'pending'
    } else {
      // Nếu chưa nộp thì thêm mới
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

  // Giáo viên chấm bài
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

  static async deleteHomework(id: string): Promise<void> {
    const homework = await Homework.findByIdAndDelete(id)
    if (!homework) throw new ErrorHandler('Không tìm thấy bài tập', 404)

    // Xóa tham chiếu từ lớp học
    await CenterClass.findOneAndUpdate({ homeworks: id }, { $pull: { homeworks: id } })
  }
}
