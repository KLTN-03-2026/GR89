import mongoose from "mongoose"
import { GrammarTopic, IGrammarPracticeQuestion, IGrammarSection, IGrammarTopic, IGrammarTopicPaginateResult } from "../models/grammarTopic.model"
import { Quiz } from "../models/quiz.model"
import { UserProgress } from "../models/userProgress.model"
import { StudyHistory } from "../models/studyHistory.model"
import { StudyService } from "./study.service"
import ErrorHandler from "../utils/ErrorHandler"
import XLSX from 'xlsx'
import { User } from "../models/user.model"
import { StreakService } from "./streak.service"
import { IQuizResult, QuizResult } from "../models/quizzResult.model"

export interface ICreateGrammarTopicData {
  title: string;
  description?: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  createdBy: string;
}

export interface IUpdateGrammarTopicData {
  title?: string;
  description?: string;
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  updatedBy: string;
}

export interface IUpdateGrammarSectionsData {
  sections: IGrammarSection[];
  updatedBy: string;
}

export interface IUpdateGrammarPracticeData {
  practice: IGrammarPracticeQuestion[];
  updatedBy: string;
}

export interface IUpdateGrammarQuizItemData {
  _id?: string;
  question: string;
  type: "Multiple Choice" | "Fill in the blank";
  options?: string[];
  answer: string;
  explanation: string;
}

export interface IUpdateGrammarQuizzesData {
  quizzes: IUpdateGrammarQuizItemData[];
  updatedBy: string;
}

export interface IGrammarTopicOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isActive?: boolean;
  isVipRequired?: boolean;
  createdBy?: string;
}

export interface IGrammarTopicUser {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  progress: number;
  point: number;
  isCompleted: boolean;
  isActive: boolean;
  isResult: boolean;
  isVipRequired: boolean;
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
}

export interface IImportGrammarTopicsJsonError {
  index: number
  reason: string
}

export interface IImportGrammarTopicsJsonResult {
  created: number
  updated: number
  total: number
  skipped: number
  errors: IImportGrammarTopicsJsonError[]
}

export class GrammarService {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Lấy thống kê tổng quan về ngữ pháp
  static async getOverviewStats(): Promise<any> {
    const totalLessons = await GrammarTopic.countDocuments();
    const activeLessons = await GrammarTopic.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProgressRecords = await UserProgress.countDocuments({ category: 'grammar' });
    const completedProgressRecords = await UserProgress.countDocuments({ category: 'grammar', isCompleted: true });

    // Tính tỷ lệ hoàn thành
    const completionRate = totalProgressRecords > 0
      ? Math.round((completedProgressRecords / totalProgressRecords) * 100)
      : 0

    // Tính lượt học tháng này
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const monthlyLearns = await UserProgress.countDocuments({
      category: 'grammar',
      updatedAt: { $gte: currentMonth }
    })

    // Tính lượt học tháng trước để so sánh
    const lastMonth = new Date(currentMonth)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const lastMonthLearns = await UserProgress.countDocuments({
      category: 'grammar',
      updatedAt: {
        $gte: lastMonth,
        $lt: currentMonth
      }
    })

    // Tính phần trăm thay đổi
    const monthlyChange = lastMonthLearns > 0
      ? Math.round(((monthlyLearns - lastMonthLearns) / lastMonthLearns) * 100)
      : monthlyLearns > 0 ? 100 : 0

    return {
      totalLessons,
      activeLessons,
      totalUsers,
      completionRate,
      monthlyLearns,
      monthlyChange,
      completedProgressRecords,
      totalProgressRecords
    };
  }

  // (ADMIN) Import dữ liệu chủ đề ngữ pháp từ JSON
  static async importGrammarTopicsFromJson(options: {
    topics: any[]
    userId: string
    skipErrors: boolean
  }): Promise<IImportGrammarTopicsJsonResult> {
    const { topics, userId, skipErrors } = options

    const errors: IImportGrammarTopicsJsonError[] = []
    let created = 0
    let updated = 0
    let skipped = 0

    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    const failOrCollect = (index: number, reason: string) => {
      if (!skipErrors) {
        throw new ErrorHandler(`Import thất bại tại topic [${index}]: ${reason}`, 400)
      }
      errors.push({ index, reason })
      skipped += 1
    }

    const normalizeSectionId = (topicIndex: number, sectionIndex: number, raw?: unknown) => {
      const v = typeof raw === 'string' ? raw.trim() : ''
      return v || `sec-${topicIndex}-${sectionIndex}`
    }

    const normalizePracticeId = (topicIndex: number, practiceIndex: number, raw?: unknown) => {
      const v = typeof raw === 'string' ? raw.trim() : ''
      return v || `prac-${topicIndex}-${practiceIndex}`
    }

    const normalizeString = (raw: unknown) => String(raw ?? '').trim()

    const normalizeHint = (raw: unknown) => {
      const v = normalizeString(raw)
      return v || 'N/A'
    }

    const normalizeExamples = (examples: any) => {
      if (!Array.isArray(examples)) return []
      return examples
        .map((ex) => ({
          en: normalizeString(ex?.en),
          vi: ex?.vi !== undefined ? normalizeString(ex?.vi) : undefined
        }))
        .filter((x) => x.en)
    }

    const normalizeTable = (table: any) => {
      if (!table) return undefined
      const headers = Array.isArray(table.headers) ? table.headers.map((h: any) => normalizeString(h)).filter(Boolean) : []
      const rows = Array.isArray(table.rows)
        ? table.rows.map((row: any) => (Array.isArray(row) ? row.map((cell: any) => normalizeString(cell)) : []) as string[])
        : []
      if (!headers.length && !rows.length) return undefined
      return { headers, rows }
    }

    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i]
      if (!topic || typeof topic !== 'object') {
        failOrCollect(i, 'Topic phải là object')
        continue
      }

      try {
        const title = normalizeString((topic as any).title)
        if (!title) throw new Error('Thiếu hoặc rỗng "title"')

        const descriptionRaw = (topic as any).description
        const description = descriptionRaw !== undefined ? normalizeString(descriptionRaw) : undefined
        const finalDescription = description ? description : undefined

        const isVipRequiredRaw = (topic as any).isVipRequired
        const isVipRequired = typeof isVipRequiredRaw === 'boolean' ? isVipRequiredRaw : true

        const levelRaw = (topic as any).level
        const level = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(levelRaw) ? levelRaw : 'A1'

        const sectionsInput = Array.isArray((topic as any).sections) ? (topic as any).sections : []
        const practiceInput = Array.isArray((topic as any).practice) ? (topic as any).practice : []
        const quizzesInput = Array.isArray((topic as any).quizzes) ? (topic as any).quizzes : []

        const normalizedSections: IGrammarSection[] = sectionsInput.map((sec: any, j: number) => {
          const sectionTitle = normalizeString(sec?.title)
          if (!sectionTitle) {
            throw new Error(`Section [${j}] thiếu "title"`)
          }

          return {
            id: normalizeSectionId(i, j, sec?.id),
            title: sectionTitle,
            description: sec?.description !== undefined ? normalizeString(sec?.description) || undefined : undefined,
            note: sec?.note !== undefined ? normalizeString(sec?.note) || undefined : undefined,
            formula: sec?.formula !== undefined ? normalizeString(sec?.formula) || undefined : undefined,
            examples: sec?.examples ? normalizeExamples(sec.examples) : [],
            list: Array.isArray(sec?.list) ? sec.list.map((x: any) => normalizeString(x)).filter(Boolean) : [],
            table: normalizeTable(sec?.table)
          }
        })

        const normalizedPractice: IGrammarPracticeQuestion[] = practiceInput.map((p: any, j: number) => {
          const type = p?.type as IGrammarPracticeQuestion['type']
          if (!type || !['fill_blank', 'multiple_choice', 'correct_sentence'].includes(type)) {
            throw new Error(`Practice [${j}] type không hợp lệ`)
          }

          const question = normalizeString(p?.question)
          const answer = normalizeString(p?.answer)
          if (!question) throw new Error(`Practice [${j}] thiếu "question"`)
          if (!answer) throw new Error(`Practice [${j}] thiếu "answer"`)

          const options = type === 'multiple_choice'
            ? (Array.isArray(p?.options) ? p.options.map((x: any) => normalizeString(x)).filter(Boolean) : [])
            : []

          const wrongSentence = type === 'correct_sentence' ? normalizeString(p?.wrongSentence) : ''
          if (type === 'correct_sentence' && !wrongSentence) {
            throw new Error(`Practice [${j}] thiếu "wrongSentence" cho correct_sentence`)
          }

          return {
            id: normalizePracticeId(i, j, p?.id),
            type,
            question,
            options,
            wrongSentence: type === 'correct_sentence' ? wrongSentence : undefined,
            answer,
            hint: normalizeHint(p?.hint)
          }
        })

        const existingTopic = await GrammarTopic.findOne({
          title: { $regex: `^${escapeRegExp(title)}$`, $options: 'i' }
        })

        const normalizedQuizItemsForUpdate: IUpdateGrammarQuizItemData[] = quizzesInput.map((q: any) => {
          const type = q?.type as 'Multiple Choice' | 'Fill in the blank'
          if (!type || !['Multiple Choice', 'Fill in the blank'].includes(type)) {
            throw new Error(`Quiz type không hợp lệ`)
          }
          const question = normalizeString(q?.question)
          const answer = normalizeString(q?.answer)
          const explanation = normalizeString(q?.explanation)
          if (!question) throw new Error(`Quiz thiếu "question"`)
          if (!answer) throw new Error(`Quiz thiếu "answer"`)
          if (!explanation) throw new Error(`Quiz thiếu "explanation"`)

          const options = Array.isArray(q?.options) ? q.options.map((x: any) => normalizeString(x)).filter(Boolean) : []

          return {
            _id: typeof q?._id === 'string' ? q._id : undefined,
            question,
            type,
            options: type === 'Multiple Choice' ? options : [],
            answer,
            explanation
          }
        })

        if (existingTopic) {
          existingTopic.level = level
          await existingTopic.save()
          await GrammarService.updateGrammarSections(String(existingTopic._id), {
            sections: normalizedSections,
            updatedBy: userId
          })
          await GrammarService.updateGrammarPractice(String(existingTopic._id), {
            practice: normalizedPractice,
            updatedBy: userId
          })
          await GrammarService.updateGrammarQuizzes(String(existingTopic._id), {
            quizzes: normalizedQuizItemsForUpdate,
            updatedBy: userId
          })

          updated += 1
        } else {
          const quizDocs = await Promise.all(
            normalizedQuizItemsForUpdate.map((q) =>
              Quiz.create({
                question: q.question,
                type: q.type,
                options: q.options,
                answer: q.answer,
                explanation: q.explanation
              })
            )
          )

          await GrammarTopic.create({
            title,
            description: finalDescription,
            sections: normalizedSections,
            practice: normalizedPractice,
            quizzes: quizDocs.map((doc) => doc._id),
            level,
            isVipRequired,
            createdBy: new mongoose.Types.ObjectId(userId)
          })

          created += 1
        }
      } catch (e: any) {
        failOrCollect(i, e?.message || 'Dữ liệu không hợp lệ')
      }
    }

    return {
      created,
      updated,
      total: topics.length,
      skipped,
      errors
    }
  }

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy danh sách chủ đề ngữ pháp (có phân trang & tìm kiếm)
  static async getAllGrammarTopicsPaginated(options: IGrammarTopicOptions): Promise<IGrammarTopicPaginateResult> {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "orderIndex",
      sortOrder = "asc",
      isActive,
      isVipRequired,
      createdBy,
    } = options;

    const query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (isVipRequired !== undefined) {
      query.isVipRequired = isVipRequired;
    }

    if (createdBy) {
      query.createdBy = new mongoose.Types.ObjectId(createdBy);
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const paginateOptions = {
      page,
      limit,
      sort,
      populate: [
        {
          path: "createdBy",
          select: "fullName email",
        },
        {
          path: "updatedBy",
          select: "fullName email",
        },
      ],
      lean: false,
      customLabels: {
        docs: "grammarTopics",
        totalDocs: "total",
        limit: "limit",
        page: "page",
        totalPages: "pages",
        hasNextPage: "hasNext",
        hasPrevPage: "hasPrev",
        nextPage: "next",
        prevPage: "prev",
      },
    };

    return await GrammarTopic.paginate(query, paginateOptions as any);
  }

  // (ADMIN) Cập nhật trạng thái xuất bản cho nhiều chủ đề ngữ pháp
  static async updateManyGrammarTopicsStatus(ids: string[], isActive: boolean): Promise<{ updatedCount: number }> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ErrorHandler('Danh sách ID trống', 400)
    }
    const result = await GrammarTopic.updateMany(
      { _id: { $in: ids } },
      { $set: { isActive } }
    )
    return { updatedCount: result.modifiedCount }
  }

  // (ADMIN) Xóa nhiều chủ đề ngữ pháp
  static async deleteManyGrammarTopics(ids: string[]): Promise<{ deletedCount: number }> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ErrorHandler('Danh sách ID trống', 400)
    }
    const result = await GrammarTopic.deleteMany({ _id: { $in: ids } })
    return { deletedCount: result.deletedCount }
  }

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // (USER) Lấy danh sách chủ đề ngữ pháp cho người dùng
  static async getAllTopicsByUser(userId: string): Promise<IGrammarTopicUser[]> {
    const grammarTopics = await GrammarTopic.find({ isActive: true }).sort({ orderIndex: 1 })
    const progresses = await UserProgress.find({ userId, category: 'grammar' })
    const progressMap = new Map(progresses.map(p => [String(p.lessonId), p]))

    const grammarTopicsUser = await grammarTopics.map((topic) => {
      const p = progressMap.get(String(topic._id))
      return {
        _id: topic._id,
        title: topic.title || '',
        description: topic.description || '',
        progress: p?.progress || 0,
        point: p?.point || 0,
        isCompleted: p?.isCompleted || false,
        isActive: p?.isActive || false,
        isResult: !!(p && ((p as any).resultId?.length > 0 || (p.point || 0) > 0 || (p as any).resultData)),
        isVipRequired: topic?.isVipRequired || false,
        level: (topic as any).level,
      }
    })
    return grammarTopicsUser as IGrammarTopicUser[]
  }

  // (USER) Nộp bài kiểm tra ngữ pháp
  static async doGrammarQuiz(
    grammarTopicId: string,
    userId: string,
    quizResults: IQuizResult[],
    studyTimeSeconds: number = 0
  ): Promise<any> {
    const topic = await GrammarTopic.findById(grammarTopicId)
    if (!topic) throw new ErrorHandler('Chủ đề ngữ pháp không tồn tại', 404)

    // Lưu kết quả Quiz vào DB để lấy ID
    const createdResults = await QuizResult.insertMany(quizResults);
    const resultId = createdResults.map(d => d._id as mongoose.Types.ObjectId);

    const correctCount = quizResults.filter(r => r.isCorrect).length
    const point = correctCount
    const progress = Math.round(((correctCount / (quizResults.length || 1)) * 100) * 100) / 100

    // Lưu qua StudyService (Unified)
    const history = await StudyService.saveStudyResult({
      userId,
      lessonId: grammarTopicId,
      category: 'grammar',
      level: (topic as any).level || 'A1',
      progress,
      point,
      isCompleted: true, // Chỉ cần có làm là tính hoàn thành
      studyTime: studyTimeSeconds,
      resultId, // Lưu ID vào Progress/History
      correctAnswers: correctCount,
      totalQuestions: quizResults.length
    })

    // Luôn cập nhật streak khi có tham gia làm bài
    await StreakService.update(userId)

    return history
  }

  // (USER) Lấy kết quả bài tập ngữ pháp
  static async getGrammarResult(userId: string, grammarTopicId: string): Promise<any> {
    const progress = await UserProgress.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      lessonId: new mongoose.Types.ObjectId(grammarTopicId),
      category: 'grammar'
    })
    if (!progress) throw new ErrorHandler('Kết quả ngữ pháp không tồn tại', 404)

    // Nếu có resultId (Quizz), load từ QuizResult
    if (progress.resultId && progress.resultId.length > 0) {
      const results = await QuizResult.find({ _id: { $in: progress.resultId } })
        .populate({ path: 'quizId', select: 'question answer type' })
        .sort({ questionNumber: 1 })
        .lean();

      return {
        ...progress.toObject(),
        result: results.map(r => ({
          ...r,
          question: (r.quizId as any)?.question ?? null,
          correctAnswer: (r.quizId as any)?.answer ?? null,
          type: (r.quizId as any)?.type ?? null,
        }))
      }
    }

    const history = await StudyHistory.findOne({ userId, lessonId: grammarTopicId, category: 'grammar' }).sort({ createdAt: -1 })
    return {
      ...progress.toObject(),
      result: history?.resultData || []
    }
  }

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Lấy chi tiết chủ đề ngữ pháp theo ID
  static async getGrammarTopicById(id: string): Promise<IGrammarTopic> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ErrorHandler("ID chủ đề ngữ pháp không hợp lệ", 400);
    }

    const grammarTopic = await GrammarTopic.findById(id)
      .populate("quizzes")
      .populate("createdBy", "fullName email")
      .populate("updatedBy", "fullName email");

    if (!grammarTopic) {
      throw new ErrorHandler("Chủ đề ngữ pháp không tồn tại", 404);
    }

    return grammarTopic;
  }

  // (ADMIN) Tạo chủ đề ngữ pháp mới
  static async createGrammarTopic(data: ICreateGrammarTopicData): Promise<IGrammarTopic> {
    const title = data.title.trim();
    const description = data.description?.trim();

    const existingTopic = await GrammarTopic.findOne({
      title: { $regex: `^${title}$`, $options: "i" },
    });

    if (existingTopic) {
      throw new ErrorHandler("Tiêu đề chủ đề ngữ pháp đã tồn tại", 400);
    }

    return await GrammarTopic.create({
      title,
      description,
      level: data.level,
      createdBy: new mongoose.Types.ObjectId(data.createdBy),
    });
  }

  // (ADMIN) Cập nhật thông tin cơ bản chủ đề ngữ pháp
  static async updateGrammarTopic(id: string, data: IUpdateGrammarTopicData): Promise<IGrammarTopic> {
    const grammarTopic = await this.getGrammarTopicById(id);

    if (data.title !== undefined) {
      const title = data.title.trim();
      const existingTopic = await GrammarTopic.findOne({
        _id: { $ne: grammarTopic._id },
        title: { $regex: `^${title}$`, $options: "i" },
      });

      if (existingTopic) {
        throw new ErrorHandler("Tiêu đề chủ đề ngữ pháp đã tồn tại", 400);
      }

      grammarTopic.title = title;
    }

    if (data.description !== undefined) {
      grammarTopic.description = data.description.trim();
    }

    if (data.level !== undefined) {
      grammarTopic.level = data.level;
    }

    grammarTopic.updatedBy = new mongoose.Types.ObjectId(data.updatedBy);
    await grammarTopic.save();

    return grammarTopic;
  }

  // (ADMIN) Xóa một chủ đề ngữ pháp
  static async deleteGrammarTopic(id: string): Promise<IGrammarTopic> {
    const grammarTopic = await this.getGrammarTopicById(id);
    await GrammarTopic.findByIdAndDelete(id);
    return grammarTopic;
  }

  // (ADMIN) Cập nhật danh sách sections cho chủ đề
  static async updateGrammarSections(id: string, data: IUpdateGrammarSectionsData): Promise<IGrammarTopic> {
    const grammarTopic = await this.getGrammarTopicById(id);

    grammarTopic.sections = data.sections.map((section) => ({
      id: String(section.id).trim(),
      title: String(section.title).trim(),
      description: section.description?.trim() || undefined,
      note: section.note?.trim() || undefined,
      formula: section.formula?.trim() || undefined,
      examples: section.examples?.map((example) => ({
        en: example.en.trim(),
        vi: example.vi?.trim() || undefined,
      })) || [],
      list: section.list?.map((item) => item.trim()).filter(Boolean) || [],
      table: section.table
        ? {
          headers: section.table.headers.map((header) => header.trim()).filter(Boolean),
          rows: section.table.rows.map((row) => row.map((cell) => cell.trim())),
        }
        : undefined,
    })) as any;

    grammarTopic.updatedBy = new mongoose.Types.ObjectId(data.updatedBy);
    await grammarTopic.save();

    return await this.getGrammarTopicById(id);
  }

  // (ADMIN) Cập nhật danh sách bài luyện tập cho chủ đề
  static async updateGrammarPractice(id: string, data: IUpdateGrammarPracticeData): Promise<IGrammarTopic> {
    const grammarTopic = await this.getGrammarTopicById(id);

    grammarTopic.practice = data.practice.map((question) => ({
      id: String(question.id).trim(),
      type: question.type,
      question: String(question.question).trim(),
      options: question.type === "multiple_choice" ? (question.options || []).map((option) => option.trim()).filter(Boolean) : [],
      wrongSentence: question.type === "correct_sentence" ? question.wrongSentence?.trim() || "" : undefined,
      answer: String(question.answer).trim(),
      hint: question.hint?.trim() || "",
    })) as any;

    grammarTopic.updatedBy = new mongoose.Types.ObjectId(data.updatedBy);
    await grammarTopic.save();

    return await this.getGrammarTopicById(id);
  }

  // (ADMIN) Cập nhật danh sách quiz cho chủ đề
  static async updateGrammarQuizzes(id: string, data: IUpdateGrammarQuizzesData): Promise<IGrammarTopic> {
    const grammarTopic = await this.getGrammarTopicById(id);
    const existingQuizIds = grammarTopic.quizzes.map((quiz: any) => String(quiz._id || quiz));
    const nextQuizIds: string[] = [];

    for (const quizItem of data.quizzes) {
      const normalizedQuiz = {
        question: String(quizItem.question).trim(),
        type: quizItem.type,
        options: quizItem.type === "Multiple Choice" ? (quizItem.options || []).map((option) => option.trim()).filter(Boolean) : [],
        answer: String(quizItem.answer).trim(),
        explanation: String(quizItem.explanation).trim(),
      };

      if (quizItem._id && mongoose.Types.ObjectId.isValid(quizItem._id) && existingQuizIds.includes(quizItem._id)) {
        const updatedQuiz = await Quiz.findByIdAndUpdate(quizItem._id, normalizedQuiz, { new: true, runValidators: true });

        if (!updatedQuiz) {
          throw new ErrorHandler("Quiz không tồn tại", 404);
        }

        nextQuizIds.push(String(updatedQuiz._id));
        continue;
      }

      const createdQuiz = await Quiz.create(normalizedQuiz);
      nextQuizIds.push(String(createdQuiz._id));
    }

    const removedQuizIds = existingQuizIds.filter((quizId) => !nextQuizIds.includes(quizId));
    if (removedQuizIds.length > 0) {
      await Quiz.deleteMany({ _id: { $in: removedQuizIds } });
    }

    grammarTopic.quizzes = nextQuizIds.map((quizId) => new mongoose.Types.ObjectId(quizId));
    grammarTopic.updatedBy = new mongoose.Types.ObjectId(data.updatedBy);
    await grammarTopic.save();

    return await this.getGrammarTopicById(id);
  }

  // (ADMIN) Toggle trạng thái isActive của một chủ đề
  static async toggleGrammarTopicStatus(id: string): Promise<IGrammarTopic> {
    const topic = await this.getGrammarTopicById(id)
    topic.isActive = !topic.isActive
    await topic.save()
    return topic
  }

  // (ADMIN) Toggle trạng thái isVipRequired của một chủ đề
  static async toggleGrammarTopicVip(id: string): Promise<IGrammarTopic> {
    const topic = await this.getGrammarTopicById(id)
    topic.isVipRequired = !topic.isVipRequired
    await topic.save()
    return topic
  }

  // (ADMIN) Đổi thứ tự sắp xếp của hai chủ đề
  static async swapGrammarTopicOrder(id: string, direction: 'up' | 'down'): Promise<{ currentTopic: IGrammarTopic; swappedTopic: IGrammarTopic }> {
    const currentTopic = await this.getGrammarTopicById(id)
    const currentOrder = currentTopic.orderIndex

    let swappedTopic: IGrammarTopic | null = null
    if (direction === 'up') {
      swappedTopic = await GrammarTopic.findOne({ orderIndex: { $lt: currentOrder } }).sort({ orderIndex: -1 })
    } else {
      swappedTopic = await GrammarTopic.findOne({ orderIndex: { $gt: currentOrder } }).sort({ orderIndex: 1 })
    }

    if (!swappedTopic) {
      throw new ErrorHandler(`Không thể di chuyển ${direction === 'up' ? 'lên' : 'xuống'}. Đã ở vị trí ${direction === 'up' ? 'đầu' : 'cuối'} danh sách.`, 400)
    }

    const swappedOrder = swappedTopic.orderIndex
    const temp = Date.now()

    // B1: đẩy current ra ngoài
    await GrammarTopic.updateOne({ _id: currentTopic._id }, { orderIndex: temp })
    // B2: cập nhật swapped
    await GrammarTopic.updateOne({ _id: swappedTopic._id }, { orderIndex: currentOrder })
    // B3: cập nhật current
    await GrammarTopic.updateOne({ _id: currentTopic._id }, { orderIndex: swappedOrder })

    return { currentTopic, swappedTopic }
  }

  // (ADMIN) Lấy thống kê chi tiết của một chủ đề
  static async getGrammarTopicStats(id: string): Promise<any> {
    const topic = await this.getGrammarTopicById(id)
    const progressCount = await UserProgress.countDocuments({ lessonId: topic._id, category: 'grammar' })
    const completedCount = await UserProgress.countDocuments({ lessonId: topic._id, category: 'grammar', isCompleted: true })

    return {
      _id: topic._id,
      title: topic.title,
      description: topic.description,
      progressCount,
      completedCount,
      completionRate: progressCount > 0 ? Math.round((completedCount / progressCount) * 100) : 0,
      isActive: topic.isActive,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt
    }
  }

  // (ADMIN) Lấy thống kê người dùng cho ngữ pháp
  static async getGrammarUserStats(): Promise<any> {
    const totalUsers = await User.countDocuments({ role: 'user' })
    const activeUsers = await UserProgress.distinct('userId', { category: 'grammar' }).then(ids => ids.length)

    const topUsers = await UserProgress.aggregate([
      { $match: { category: 'grammar', isCompleted: true } },
      { $group: { _id: '$userId', completedCount: { $sum: 1 } } },
      { $sort: { completedCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          fullName: '$user.fullName',
          email: '$user.email',
          completedCount: 1
        }
      }
    ])

    return {
      totalUsers,
      activeUsers,
      topUsers
    }
  }

  // (ADMIN) Lấy thống kê theo thời gian
  static async getGrammarTimeSeriesStats(period: string = '30days'): Promise<any> {
    const days = period === '30days' ? 30 : period === '7days' ? 7 : 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const results = await UserProgress.aggregate([
      { $match: { category: 'grammar', updatedAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
          totalProgress: { $sum: 1 },
          completedProgress: {
            $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ])

    return {
      dailyStats: results,
      period
    }
  }

  // (ADMIN) Xuất dữ liệu ngữ pháp ra Excel
  static async exportGrammarData(): Promise<Buffer> {
    const topics = await GrammarTopic.find()
      .populate('quizzes')
      .sort({ orderIndex: 1 })
      .lean()

    const topicsRows: any[][] = [['ID', 'title', 'description', 'level', 'isActive', 'isVipRequired', 'orderIndex']]
    const sectionsRows: any[][] = [['TopicID', 'SectionID', 'title', 'description', 'note', 'formula', 'list (separated by ;)', 'examples (en|vi; en|vi)']]
    const practiceRows: any[][] = [['TopicID', 'PracticeID', 'type', 'question', 'options (separated by ;)', 'wrongSentence', 'answer', 'hint']]
    const quizzesRows: any[][] = [['TopicID', 'question', 'type', 'options (separated by ;)', 'answer', 'explanation']]

    for (const t of (topics as any[])) {
      topicsRows.push([
        String(t._id || ''),
        t.title || '',
        t.description || '',
        t.level || 'A1',
        t.isActive ? 'TRUE' : 'FALSE',
        t.isVipRequired ? 'TRUE' : 'FALSE',
        t.orderIndex
      ])

      if (t.sections) {
        t.sections.forEach((s: any) => {
          const listStr = Array.isArray(s.list) ? s.list.join(';') : ''
          const examplesStr = Array.isArray(s.examples) ? s.examples.map((ex: any) => `${ex.en}|${ex.vi || ''}`).join(';') : ''
          sectionsRows.push([
            String(t._id || ''), s.id || '', s.title || '', s.description || '', s.note || '', s.formula || '', listStr, examplesStr
          ])
        })
      }

      if (t.practice) {
        t.practice.forEach((p: any) => {
          const optionsStr = Array.isArray(p.options) ? p.options.join(';') : ''
          practiceRows.push([
            String(t._id || ''), p.id || '', p.type || '', p.question || '', optionsStr, p.wrongSentence || '', p.answer || '', p.hint || ''
          ])
        })
      }

      if (t.quizzes) {
        t.quizzes.forEach((q: any) => {
          const optionsStr = Array.isArray(q.options) ? q.options.join(';') : ''
          quizzesRows.push([
            String(t._id || ''), q.question || '', q.type || '', optionsStr, q.answer || '', q.explanation || ''
          ])
        })
      }
    }

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(topicsRows), 'Topics')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sectionsRows), 'Sections')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(practiceRows), 'Practice')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(quizzesRows), 'Quizzes')

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
  }
}
