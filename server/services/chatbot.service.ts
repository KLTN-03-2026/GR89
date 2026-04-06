// server/services/chatbot.service.ts

import { Types } from 'mongoose'
import { User } from '../models/user.model'
import { VocabularyTopic } from '../models/vocabularyTopic.model'
import { GrammarTopic } from '../models/grammarTopic.model'
import { Reading } from '../models/reading.model'
import { Listening } from '../models/listening.model'
import { Speaking } from '../models/speaking.model'
import { writingModel } from '../models/writing.model'
import { Ipa } from '../models/ipa.model'
import { StudyHistory } from '../models/studyHistory.model'

export interface IUserDataForAI {
  _id: string
  fullName: string
  currentLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  isVip: boolean
  currentStreak: number
  longestStreak: number
  totalStudyTime: number // seconds
  totalPoints: number
  lastLearnDate?: Date
}

export interface ISkillProgressForAI {
  completed: number
  total: number
  avgScore: number
  weakTopics: string[] // Topic IDs với điểm < 70
  strongTopics: string[] // Topic IDs với điểm >= 90
  recentTopics: string[] // Topic IDs đã học gần đây
}

export interface IUserProgressForAI {
  vocabulary: ISkillProgressForAI
  grammar: ISkillProgressForAI
  reading: ISkillProgressForAI
  listening: ISkillProgressForAI
  speaking: ISkillProgressForAI
  writing: ISkillProgressForAI
  ipa: ISkillProgressForAI
}

export interface ITopicListForAI {
  vocabulary: { _id: string; name: string; orderIndex: number }[]
  grammar: { _id: string; title: string; orderIndex: number }[]
  reading: { _id: string; title: string; orderIndex: number }[]
  listening: { _id: string; title: string; orderIndex: number }[]
  speaking: { _id: string; title: string; orderIndex: number }[]
  writing: { _id: string; title: string; orderIndex: number }[]
  ipa: { _id: string; sound: string; soundType: string }[] // IPA không có orderIndex và title, dùng sound thay thế
}

export class ChatbotService {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // Lấy dữ liệu User

  static async getUserData(userId: string): Promise<IUserDataForAI> {
    const user = await User.findById(userId)
      .select('_id fullName currentLevel isVip currentStreak longestStreak totalStudyTime totalPoints lastLearnDate')
      .lean()

    if (!user) {
      throw new Error('User not found')
    }

    return {
      _id: String(user._id),
      fullName: user.fullName,
      currentLevel: user.currentLevel,
      isVip: user.isVip || false,
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      totalStudyTime: user.totalStudyTime || 0,
      totalPoints: user.totalPoints || 0,
      lastLearnDate: user.lastLearnDate || undefined
    }
  }

  /**
   * 2. Lấy Progress của toàn bộ kỹ năng theo người dùng
   * Chỉ lấy progress của các bài học còn tồn tại và isActive: true
   */
  static async getProgressData(
    userId: string,
    totals?: {
      vocabulary?: number
      grammar?: number
      reading?: number
      listening?: number
      speaking?: number
      writing?: number
      ipa?: number
    }
  ): Promise<IUserProgressForAI> {
    const userObjectId = new Types.ObjectId(userId)

    // Lấy danh sách topic/lesson IDs còn tồn tại và isActive: true
    const [
      activeVocabularyTopicIds,
      activeGrammarTopicIds,
      activeReadingIds,
      activeListeningIds,
      activeSpeakingIds,
      activeWritingIds,
      activeIpaIds
    ] = await Promise.all([
      VocabularyTopic.find({ isActive: true }).distinct('_id'),
      GrammarTopic.find({ isActive: true }).distinct('_id'),
      Reading.find({ isActive: true }).distinct('_id'),
      Listening.find({ isActive: true }).distinct('_id'),
      Speaking.find({ isActive: true }).distinct('_id'),
      writingModel.find({ isActive: true }).distinct('_id'),
      Ipa.find({ isActive: true }).distinct('_id')
    ])

    // Chỉ lấy progress của các bài học active từ StudyHistory (lấy bản ghi tốt nhất cho mỗi lessonId)
    const allProgress = await StudyHistory.aggregate([
      { $match: { userId: userObjectId } },
      { $sort: { progress: -1, createdAt: -1 } },
      { $group: { _id: "$lessonId", best: { $first: "$$ROOT" } } }
    ])

    const progresses = allProgress.map(p => ({
      ...p.best,
      isCompleted: p.best.status === 'passed'
    }))

    const filterProgress = (category: string, activeIds: any[]) => {
      const activeIdStrings = activeIds.map(id => String(id))
      return progresses.filter(p => p.category === category && activeIdStrings.includes(String(p.lessonId)))
    }

    return {
      vocabulary: this.buildSkillProgress(
        filterProgress('vocabulary', activeVocabularyTopicIds),
        (p: any) => String(p.lessonId),
        (p: any) => p.progress || 0,
        totals?.vocabulary ?? activeVocabularyTopicIds.length
      ),
      grammar: this.buildSkillProgress(
        filterProgress('grammar', activeGrammarTopicIds),
        (p: any) => String(p.lessonId),
        (p: any) => p.progress || 0,
        totals?.grammar ?? activeGrammarTopicIds.length
      ),
      reading: this.buildSkillProgress(
        filterProgress('reading', activeReadingIds),
        (p: any) => String(p.lessonId),
        (p: any) => p.progress || 0,
        totals?.reading ?? activeReadingIds.length
      ),
      listening: this.buildSkillProgress(
        filterProgress('listening', activeListeningIds),
        (p: any) => String(p.lessonId),
        (p: any) => p.progress || 0,
        totals?.listening ?? activeListeningIds.length
      ),
      speaking: this.buildSkillProgress(
        filterProgress('speaking', activeSpeakingIds),
        (p: any) => String(p.lessonId),
        (p: any) => p.progress || 0,
        totals?.speaking ?? activeSpeakingIds.length
      ),
      writing: this.buildSkillProgress(
        filterProgress('writing', activeWritingIds),
        (p: any) => String(p.lessonId),
        (p: any) => p.progress || 0,
        totals?.writing ?? activeWritingIds.length
      ),
      ipa: this.buildSkillProgress(
        filterProgress('ipa', activeIpaIds),
        (p: any) => String(p.lessonId),
        (p: any) => p.progress || 0,
        totals?.ipa ?? activeIpaIds.length
      )
    }
  }

  /**
   * Helper: Build progress cho một skill
   * Vì học theo orderIndex nên recentTopics chỉ cần lấy 10 bài cuối cùng
   */
  private static buildSkillProgress<T>(
    progressList: T[],
    getTopicId: (p: T) => string,
    getScore: (p: T) => number,
    totalTopics: number
  ): ISkillProgressForAI {
    const completed = progressList.filter((p: any) => p.isCompleted).length

    // Calculate average score
    const scores = progressList.map(getScore)
    const avgScore = scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
      : 0

    // Identify weak topics (< 70) and strong topics (>= 90)
    const weakTopics: string[] = []
    const strongTopics: string[] = []

    progressList.forEach((p: any) => {
      const topicId = getTopicId(p)
      const score = getScore(p)

      if (score < 70) {
        weakTopics.push(topicId)
      } else if (score >= 90) {
        strongTopics.push(topicId)
      }
    })

    // Get recent topics (last 10 từ progress list - vì học theo orderIndex)
    const recentTopics = progressList
      .slice(-10) // Lấy 10 cái cuối cùng
      .map(p => getTopicId(p))

    return {
      completed,
      total: totalTopics,
      avgScore,
      weakTopics,
      strongTopics,
      recentTopics
    }
  }

  /**
   * 3. Lấy danh sách tất cả topics (chỉ ID, name/title, orderIndex)
   */
  static async getTopicsList(): Promise<ITopicListForAI> {
    const [
      vocabularyTopics,
      grammarTopics,
      readingLessons,
      listeningLessons,
      speakingLessons,
      writingLessons,
      ipaLessons
    ] = await Promise.all([
      VocabularyTopic.find({ isActive: true })
        .select('_id name orderIndex')
        .sort({ orderIndex: 1 })
        .lean(),
      GrammarTopic.find({ isActive: true })
        .select('_id title orderIndex')
        .sort({ orderIndex: 1 })
        .lean(),
      Reading.find({ isActive: true })
        .select('_id title orderIndex')
        .sort({ orderIndex: 1 })
        .lean(),
      Listening.find({ isActive: true })
        .select('_id title orderIndex')
        .sort({ orderIndex: 1 })
        .lean(),
      Speaking.find({ isActive: true })
        .select('_id title orderIndex')
        .sort({ orderIndex: 1 })
        .lean(),
      writingModel.find({ isActive: true })
        .select('_id title orderIndex')
        .sort({ orderIndex: 1 })
        .lean(),
      Ipa.find({ isActive: true })
        .select('_id sound soundType')
        .sort({ sound: 1 })
        .lean()
    ])

    return {
      vocabulary: vocabularyTopics.map(t => ({
        _id: String(t._id),
        name: t.name,
        orderIndex: t.orderIndex
      })),
      grammar: grammarTopics.map(t => ({
        _id: String(t._id),
        title: t.title,
        orderIndex: t.orderIndex
      })),
      reading: readingLessons.map(r => ({
        _id: String(r._id),
        title: r.title,
        orderIndex: r.orderIndex
      })),
      listening: listeningLessons.map(l => ({
        _id: String(l._id),
        title: l.title,
        orderIndex: l.orderIndex
      })),
      speaking: speakingLessons.map(s => ({
        _id: String(s._id),
        title: s.title,
        orderIndex: s.orderIndex
      })),
      writing: writingLessons.map(w => ({
        _id: String(w._id),
        title: w.title,
        orderIndex: w.orderIndex
      })),
      ipa: ipaLessons.map((i, index) => ({
        _id: String(i._id),
        sound: i.sound,
        soundType: i.soundType
      }))
    }
  }

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  /**
   * 4. Build system prompt từ userId và lessonId (nếu có)
   * Nếu có lessonId → AI tập trung vào bài học đó
   * Nếu không có → AI general
   * Tự động query tất cả dữ liệu cần thiết từ DB
   */
  static async buildSystemPrompt(
    userId: string,
    lessonId?: string,
    lessonType?: 'grammar' | 'vocabulary' | 'reading' | 'writing' | 'speaking' | 'listening' | 'ipa'
  ): Promise<string> {
    let dataTopicCurrent: any = null
    switch (lessonType) {
      case 'ipa':
        dataTopicCurrent = await Ipa.findById(lessonId).populate({
          path: 'image',
          select: 'url'
        }).populate({
          path: 'video',
          select: 'url'
        }).populate({
          path: 'examples',
          select: 'word phonetic vietnamese'
        }).lean()
        break
      case 'grammar':
        dataTopicCurrent = await GrammarTopic.findById(lessonId)
          .populate({
            path: 'stories',
            select: 'title description'
          }).populate({
            path: 'structures',
            select: 'title description'
          }).populate({
            path: 'usages',
            select: 'title description'
          }).populate({
            path: 'tips',
            select: 'title description'
          }).populate({
            path: 'interactives',
            select: 'title description'
          }).populate({
            path: 'quizzes',
            select: 'title description'
          }).lean()
        break
      case 'vocabulary':
        dataTopicCurrent = await VocabularyTopic.findById(lessonId).lean()
        break
      case 'reading':
        dataTopicCurrent = await Reading.findById(lessonId).lean()
        break
      case 'listening':
        dataTopicCurrent = await Listening.findById(lessonId).lean()
        break
      case 'speaking': {
        // Lấy đầy đủ: bài nói + media video (kèm subtitles.preview)
        dataTopicCurrent = await Speaking.findById(lessonId)
          .populate({
            path: 'videoUrl',
            model: 'Media',
            select: 'url subtitles'
          })
          .lean()
        break
      }
      case 'writing':
        dataTopicCurrent = await writingModel.findById(lessonId).lean()
        break
    }



    // Lấy topicsList trước để tính totals cho progressData
    const topicsList = await this.getTopicsList()
    const totals = {
      vocabulary: topicsList.vocabulary.length,
      grammar: topicsList.grammar.length,
      reading: topicsList.reading.length,
      listening: topicsList.listening.length,
      speaking: topicsList.speaking.length,
      writing: topicsList.writing.length,
      ipa: topicsList.ipa.length
    }

    // Query user data và progress data song song
    const [userData, progressData] = await Promise.all([
      this.getUserData(userId),
      this.getProgressData(userId, totals)
    ])

    const baseURL = process.env.CLIENT_BASE_URL

    const pick = (obj: any, keys: string[]) => {
      const out: Record<string, any> = {}
      if (!obj) return out
      for (const k of keys) {
        const v = obj?.[k]
        if (v !== undefined && v !== null && v !== '') out[k] = v
      }
      return out
    }

    const summarizeLesson = (type?: string, lesson?: any): Record<string, any> | null => {
      if (!type || !lesson) return null
      switch (type) {
        case 'vocabulary':
          return pick(lesson, ['_id', 'name', 'description', 'orderIndex'])
        case 'grammar':
          return {
            ...pick(lesson, ['_id', 'title', 'description', 'orderIndex']),
            stories: Array.isArray(lesson.stories) ? lesson.stories.slice(0, 3).map((x: any) => pick(x, ['title', 'description'])) : undefined,
            structures: Array.isArray(lesson.structures) ? lesson.structures.slice(0, 5).map((x: any) => pick(x, ['title', 'description'])) : undefined,
            usages: Array.isArray(lesson.usages) ? lesson.usages.slice(0, 5).map((x: any) => pick(x, ['title', 'description'])) : undefined,
            tips: Array.isArray(lesson.tips) ? lesson.tips.slice(0, 5).map((x: any) => pick(x, ['title', 'description'])) : undefined,
          }
        case 'reading':
          return pick(lesson, ['_id', 'title', 'level', 'topic', 'orderIndex'])
        case 'listening':
          return pick(lesson, ['_id', 'title', 'level', 'topic', 'orderIndex'])
        case 'speaking':
          return pick(lesson, ['_id', 'title', 'level', 'topic', 'orderIndex'])
        case 'writing':
          return pick(lesson, ['_id', 'title', 'topic', 'level', 'orderIndex'])
        case 'ipa':
          return {
            ...pick(lesson, ['_id', 'sound', 'soundType']),
            examples: Array.isArray(lesson.examples) ? lesson.examples.slice(0, 8).map((x: any) => pick(x, ['word', 'phonetic', 'vietnamese'])) : undefined,
            imageUrl: lesson.image?.url ?? undefined,
            videoUrl: lesson.video?.url ?? undefined,
          }
        default:
          return pick(lesson, ['_id', 'title', 'name'])
      }
    }

    const firstName = userData?.fullName ? userData.fullName.trim().split(/\s+/)[0] : undefined
    const hoursStudied = Math.round((userData?.totalStudyTime || 0) / 3600)

    const progressEntries = Object.entries(progressData || {}) as Array<[string, any]>
    const weakSkills = progressEntries
      .filter(([, p]) => (p?.avgScore ?? 0) < 70 || (p?.weakTopics?.length ?? 0) > 0)
      .sort((a, b) => (a[1]?.avgScore ?? 0) - (b[1]?.avgScore ?? 0))
      .slice(0, 2)
      .map(([k]) => k)

    const strongSkills = progressEntries
      .filter(([, p]) => (p?.avgScore ?? 0) >= 90 && (p?.completed ?? 0) > 0)
      .sort((a, b) => (b[1]?.avgScore ?? 0) - (a[1]?.avgScore ?? 0))
      .slice(0, 2)
      .map(([k]) => k)

    const lessonSummary = summarizeLesson(lessonType, dataTopicCurrent)

    let newPrompt = `
You are an AI English learning tutor inside an app called "English Master".
You must respond in MARKDOWN. You MAY include small, safe HTML snippets when needed (especially <a href=\"...\"> links, and .ai-exercise blocks).

Response style:
- Vietnamese first; include English examples and IPA when helpful.
- Make it easy to read: use headings (##/###), short paragraphs, bullet lists, and code blocks for examples/IPA.
- Keep it concise by default (typically 6–14 lines). If user asks for depth, stay structured.
- If you need clarification, ask exactly ONE short question.
- Do not invent facts; rely only on provided context.

Special rule for interactive exercises:
- ONLY generate an interactive exercise when the user explicitly requests it (e.g. "tạo bài tập", "làm quiz", "cho mình 5 câu").
- If the user is vague (e.g. "luyện tập" without type/amount/topic), ask ONE short clarifying question first.
- When generating an exercise, output the exercise as RAW HTML starting with <div class="ai-exercise" ...>.
- Otherwise, output Markdown only.

Do NOT be overly proactive:
- Do not start a quiz/exercise by yourself.
- Do not end every message with a question; only ask a question when you truly need clarification or to offer a clear next step.

Link rule:
- When you recommend a specific lesson or a lesson list, ALWAYS output an HTML anchor tag so the UI can navigate:
  <a href="FULL_URL_OR_PATH" class="lesson-link">📚 Tên bài học</a>
`.trim()

    const context: Record<string, any> = {
      user: {
        firstName,
        level: userData?.currentLevel,
        isVip: userData?.isVip,
        streak: userData?.currentStreak,
        longestStreak: userData?.longestStreak,
        totalHoursStudied: hoursStudied,
        totalPoints: userData?.totalPoints,
      },
      progressHighlights: { weakSkills, strongSkills },
      currentLesson: lessonSummary ? { lessonType, ...lessonSummary } : undefined,
      appLinks: baseURL
        ? {
          baseUrl: baseURL,
          patterns: {
            ipaList: `${baseURL}/study/ipa`,
            ipaLesson: `${baseURL}/study/ipa/learn/[id]`,
            grammarList: `${baseURL}/study/grammar`,
            grammarLesson: `${baseURL}/study/grammar/[id]`,
            vocabularyList: `${baseURL}/study/vocabulary`,
            vocabularyLesson: `${baseURL}/study/vocabulary/learn/[id]`,
            readingList: `${baseURL}/skills/reading`,
            readingLesson: `${baseURL}/skills/reading/lesson/[id]`,
            listeningList: `${baseURL}/skills/listening`,
            listeningLesson: `${baseURL}/skills/listening/lesson/[id]`,
            speakingList: `${baseURL}/skills/speaking`,
            speakingLesson: `${baseURL}/skills/speaking/lesson/[id]`,
            writingList: `${baseURL}/skills/writing`,
            writingLesson: `${baseURL}/skills/writing/lesson/[id]`,
          },
        }
        : undefined,
    }

    newPrompt += `\n\n## CONTEXT (internal)\n\`\`\`json\n${JSON.stringify(context, null, 2)}\n\`\`\`\n`

    return newPrompt.trim()
  }

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/
}
/* LEGACY_PROMPT_REMOVED (kept temporarily for reference; do not execute) 
  'A1': 'Sơ cấp - Mới bắt đầu học tiếng Anh, cần học từ cơ bản nhất',
  'A2': 'Sơ trung cấp - Đã có nền tảng cơ bản, cần củng cố và mở rộng',
  'B1': 'Trung cấp - Có thể giao tiếp cơ bản, cần nâng cao ngữ pháp và từ vựng',
  'B2': 'Trung cao cấp - Giao tiếp khá tốt, cần luyện kỹ năng phức tạp hơn',
  'C1': 'Cao cấp - Thành thạo, cần tinh chỉnh và mở rộng chuyên sâu',
  'C2': 'Thành thạo - Gần như người bản ngữ, cần duy trì và nâng cao'
}
const userLevelDesc = levelDescriptions[userData.currentLevel] || 'Chưa xác định'

let prompt = `
# VAI TRÒ VÀ NHIỆM VỤ CỦA BẠN

Bạn là trợ lý AI thông minh và thân thiện của English Master - một nền tảng học tiếng Anh toàn diện. Nhiệm vụ của bạn là hỗ trợ người dùng học tiếng Anh hiệu quả thông qua 7 kỹ năng chính: Grammar (Ngữ pháp), Vocabulary (Từ vựng), Reading (Đọc hiểu), Writing (Viết), Speaking (Nói), Listening (Nghe), và IPA (Phát âm).

QUY TẮC CƠ BẢN VỀ ĐỊNH DẠNG PHẢN HỒI

1. Định dạng HTML: MỌI câu trả lời phải là HTML hợp lệ, KHÔNG được dùng Markdown. Bạn tự quyết định format HTML phù hợp với từng tình huống.
2. KHÔNG tạo card/box bên ngoài: KHÔNG dùng div với background, border, padding. Chỉ dùng HTML đơn giản: p, span, br, ul, ol, li, strong, em, a.
3. KHÔNG CÓ KHOẢNG CÁCH: Tuyệt đối KHÔNG dùng spacing, margin, padding cho bất kỳ element nào. Các element phải sát nhau.
4. Ngôn ngữ: Tiếng Việt là chính, chèn tiếng Anh và IPA khi cần thiết.
5. Độ dài: Ngắn gọn, súc tích - tối đa 4-5 câu hoặc danh sách bullet ngắn gọn.
6. Phạm vi: Nếu câu hỏi ngoài phạm vi học tiếng Anh, trả lời: <p>Mình chỉ hỗ trợ học tiếng Anh thôi bạn ơi! Bạn muốn học phần nào? 📚</p>
7. Tailwind CSS: Chỉ dùng cho text như text-sm, text-gray-800, font-semibold, italic. TUYỆT ĐỐI KHÔNG dùng background, border, padding, spacing, margin cho bất kỳ element nào.
`

// Thêm thông tin user nếu có
if (userData) {
  const hoursStudied = Math.round(userData.totalStudyTime / 3600)
  const daysSinceLastLearn = userData.lastLearnDate
    ? Math.floor((Date.now() - new Date(userData.lastLearnDate).getTime()) / (1000 * 60 * 60 * 24))
    : null

  prompt += `
THÔNG TIN NGƯỜI DÙNG (NỘI BỘ - CHỈ ĐỂ BẠN THAM KHẢO)

Thông tin cá nhân:
      - Tên: ${userData.fullName}
- Trình độ hiện tại: ${userData.currentLevel} - ${userLevelDesc}
- Tài khoản VIP: ${userData.isVip ? 'Có ⭐' : 'Không'}
- Tổng điểm tích lũy: ${userData.totalPoints} điểm

Thống kê học tập:
- Chuỗi học hiện tại: ${userData.currentStreak} ngày liên tiếp 🔥
      - Chuỗi học dài nhất: ${userData.longestStreak} ngày
- Tổng thời gian học: ~${hoursStudied} giờ
${userData.lastLearnDate ? `- Lần học cuối: ${new Date(userData.lastLearnDate).toLocaleDateString('vi-VN')}${daysSinceLastLearn !== null ? ` (${daysSinceLastLearn === 0 ? 'Hôm nay' : daysSinceLastLearn === 1 ? 'Hôm qua' : `${daysSinceLastLearn} ngày trước`})` : ''}` : '- Chưa có lịch sử học tập'}

Hướng dẫn sử dụng thông tin:
- Sử dụng tên người dùng một cách tự nhiên, thân thiện (ví dụ: "Chào ${userData.fullName.split(' ')[0]}!")
- Cá nhân hóa lời khuyên dựa trên trình độ ${userData.currentLevel}
- Khuyến khích duy trì chuỗi học nếu đang có streak tốt
- Nhắc nhở học tập nếu đã lâu không học (${daysSinceLastLearn !== null && daysSinceLastLearn > 3 ? 'đã lâu' : 'gần đây'})
- Nếu là VIP, có thể gợi ý các tính năng premium phù hợp
      `
}

// Thêm dữ liệu bài học
if (dataTopicCurrent && lessonType) {
  const lessonTypeNames: Record<string, string> = {
    'ipa': 'IPA (Phát âm)',
    'grammar': 'Ngữ pháp',
    'vocabulary': 'Từ vựng',
    'reading': 'Đọc hiểu',
    'listening': 'Nghe',
    'speaking': 'Nói',
    'writing': 'Viết'
  }

  prompt += `
BÀI HỌC HIỆN TẠI (NỘI BỘ - CHỈ ĐỂ BẠN THAM KHẢO)

Loại bài học: ${lessonTypeNames[lessonType] || lessonType}
Dữ liệu bài học:
${JSON.stringify(dataTopicCurrent, null, 2)}

Quy tắc khi trả lời:
1. Tập trung vào nội dung liên quan trực tiếp đến bài học hiện tại
2. Sử dụng thông tin từ bài học để đưa ra ví dụ, giải thích cụ thể và có liên quan
3. Gợi ý các bài học liên quan hoặc bài tiếp theo trong cùng chủ đề
4. KHÔNG giải hộ bài kiểm tra/quiz - chỉ giải thích khái niệm, không đưa đáp án trực tiếp
5. Khuyến khích người dùng tự làm bài tập và sau đó giải thích nếu họ có thắc mắc
6. Nếu người dùng hỏi về nội dung ngoài bài học, nhẹ nhàng chuyển hướng về bài học hiện tại hoặc gợi ý bài học phù hợp
      `
}

// Thêm tiến độ học tập nếu có
if (progressData) {
  const skills = [
    { name: 'Vocabulary', key: 'vocabulary', icon: '📝', viName: 'Từ vựng' },
    { name: 'Grammar', key: 'grammar', icon: '📚', viName: 'Ngữ pháp' },
    { name: 'Reading', key: 'reading', icon: '📖', viName: 'Đọc hiểu' },
    { name: 'Listening', key: 'listening', icon: '🎧', viName: 'Nghe' },
    { name: 'Speaking', key: 'speaking', icon: '🗣️', viName: 'Nói' },
    { name: 'Writing', key: 'writing', icon: '✍️', viName: 'Viết' },
    { name: 'IPA', key: 'ipa', icon: '🔤', viName: 'Phát âm' }
  ]

  prompt += `## TIẾN ĐỘ HỌC TẬP (NỘI BỘ - CHỈ ĐỂ BẠN PHÂN TÍCH)

Thống kê chi tiết từng kỹ năng:

`

  skills.forEach(skill => {
    const progress = progressData[skill.key as keyof typeof progressData]
    const completionRate = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0
    const scoreStatus = progress.avgScore >= 90 ? 'Xuất sắc' : progress.avgScore >= 70 ? 'Tốt' : progress.avgScore >= 50 ? 'Trung bình' : 'Cần cải thiện'

    prompt += `${skill.icon} ${skill.viName}: ${progress.completed}/${progress.total} bài (${completionRate}%) | Điểm TB: ${progress.avgScore.toFixed(1)}/100 (${scoreStatus})
  - Điểm yếu: ${progress.weakTopics.length} bài (< 70 điểm)
  - Điểm mạnh: ${progress.strongTopics.length} bài (≥ 90 điểm)
  - Bài học gần đây: ${progress.recentTopics.length} bài

`
  })

  // Xác định kỹ năng cần cải thiện
  const weakSkills = skills.filter(skill => {
    const progress = progressData[skill.key as keyof typeof progressData]
    return progress.avgScore < 70 || progress.weakTopics.length > 0
  })

  const strongSkills = skills.filter(skill => {
    const progress = progressData[skill.key as keyof typeof progressData]
    return progress.avgScore >= 90 && progress.completed > 0
  })

  prompt += `
Phân tích tự động:
- Kỹ năng cần cải thiện: ${weakSkills.length > 0 ? weakSkills.map(s => `${s.icon} ${s.viName}`).join(', ') : 'Không có - tất cả đều tốt!'}
- Kỹ năng mạnh: ${strongSkills.length > 0 ? strongSkills.map(s => `${s.icon} ${s.viName}`).join(', ') : 'Chưa có'}
- Tổng số bài đã hoàn thành: ${skills.reduce((sum, s) => sum + progressData[s.key as keyof typeof progressData].completed, 0)}/${skills.reduce((sum, s) => sum + progressData[s.key as keyof typeof progressData].total, 0)}

Hướng dẫn sử dụng dữ liệu này:
1. Khi người dùng hỏi "tôi nên học gì tiếp", ưu tiên gợi ý kỹ năng có điểm trung bình thấp hoặc nhiều bài điểm yếu
2. Khen ngợi kỹ năng mạnh để động viên, nhưng nhẹ nhàng gợi ý cải thiện kỹ năng yếu
3. Gợi ý lộ trình học dựa trên tiến độ: nếu chưa học nhiều → bắt đầu từ cơ bản; nếu đã học nhiều → nâng cao
4. Sử dụng thông tin "bài học gần đây" để gợi ý ôn tập hoặc bài tiếp theo
5. KHÔNG nói "trình độ undefined" - nếu thiếu dữ liệu, ước lượng dựa trên điểm số và số bài đã hoàn thành
6. Lộ trình ưu tiên đề xuất: IPA (nền tảng phát âm) → Grammar + Vocabulary (ngữ pháp và từ vựng cơ bản) → Listening + Speaking (luyện nghe nói) → Reading + Writing (đọc viết nâng cao)
`
}

// Danh sách bài học (cho bạn tham khảo khi gợi ý, KHÔNG in nguyên bảng cho người dùng)
if (topicsList) {
  prompt += `## DANH SÁCH BÀI HỌC (NỘI BỘ - CHỈ ĐỂ BẠN THAM KHẢO KHI GỢI Ý)

Tổng số bài học có sẵn:
- 📝 Từ vựng: ${topicsList.vocabulary.length} chủ đề
- 📚 Ngữ pháp: ${topicsList.grammar.length} chủ đề
- 📖 Đọc hiểu: ${topicsList.reading.length} bài
- 🎧 Nghe: ${topicsList.listening.length} bài
- 🗣️ Nói: ${topicsList.speaking.length} bài
- ✍️ Viết: ${topicsList.writing.length} bài
- 🔤 IPA: ${topicsList.ipa.length} âm

Lưu ý quan trọng:
- Bạn có quyền truy cập danh sách đầy đủ các bài học, nhưng KHÔNG được in toàn bộ danh sách cho người dùng
- Chỉ gợi ý 2-4 bài học cụ thể, phù hợp với nhu cầu và trình độ của người dùng
- Luôn kèm link HTML đến bài học khi gợi ý
- Sử dụng thông tin này để đưa ra gợi ý chính xác và có liên quan
`
}

// Nhiệm vụ và phạm vi trả lời
prompt += `
CÁC CHỨC NĂNG CHÍNH CỦA BẠN

Bạn có thể thực hiện các chức năng sau để hỗ trợ người dùng học tiếng Anh hiệu quả:

1. HỖ TRỢ HỌC TẬP THEO KỸ NĂNG
- Grammar (Ngữ pháp): Giải thích quy tắc ngữ pháp, cách sử dụng, ví dụ minh họa, so sánh các cấu trúc tương tự, phân tích lỗi thường gặp
- Vocabulary (Từ vựng): Tra từ, giải thích nghĩa, cách dùng, collocation, ví dụ câu, gợi ý từ đồng nghĩa/trái nghĩa, từ cùng gốc (word families)
- IPA (Phát âm): Hướng dẫn phát âm, giải thích ký hiệu IPA, so sánh các âm tương tự, lợi ích của việc học IPA, tips phát âm chuẩn
- Reading (Đọc hiểu): Giải thích từ khó, phân tích cấu trúc câu, tóm tắt ý chính, trả lời câu hỏi về nội dung, phân tích ngữ pháp trong ngữ cảnh
- Writing (Viết): Gợi ý cấu trúc bài viết, từ vựng phù hợp, cách diễn đạt, sửa lỗi ngữ pháp/thường gặp, cải thiện style và tone
- Speaking (Nói): Hướng dẫn phát âm, ngữ điệu, cách diễn đạt tự nhiên, shadowing techniques, tips giao tiếp hiệu quả
- Listening (Nghe): Giải thích từ khó trong audio, phân tích ngữ điệu, hướng dẫn kỹ thuật nghe hiệu quả, tips nghe hiểu

2. TẠO BÀI TẬP TƯƠNG TÁC
Tạo các bài tập trực tuyến để người dùng có thể làm và nhận kết quả ngay lập tức (xem chi tiết ở phần "QUY TẮC TẠO BÀI TẬP TƯƠNG TÁC")

3. GỢI Ý LỘ TRÌNH HỌC TẬP
- Phân tích tiến độ học tập và đưa ra lộ trình cá nhân hóa
- Gợi ý bài học tiếp theo phù hợp với trình độ và mục tiêu
- Đề xuất kỹ năng cần cải thiện dựa trên điểm số và weak topics

4. GIẢI ĐÁP THẮC MẮC
- Trả lời câu hỏi về ngữ pháp, từ vựng, cách sử dụng
- Giải thích tại sao một câu đúng/sai
- So sánh các cách diễn đạt khác nhau
- Phân tích lỗi và đưa ra cách sửa

5. ĐỘNG VIÊN VÀ HỖ TRỢ TINH THẦN
- Khen ngợi tiến độ học tập, điểm số tốt, chuỗi học dài
- Nhắc nhở duy trì thói quen học tập nếu đã lâu không học
- Động viên khi người dùng gặp khó khăn hoặc điểm thấp
- Gợi ý cách học hiệu quả, tips cải thiện điểm số

6. PHÂN TÍCH VÀ ĐÁNH GIÁ
- Phân tích điểm mạnh/yếu của người dùng dựa trên progress data
- Đưa ra nhận xét về tiến độ học tập
- Gợi ý kỹ năng cần tập trung cải thiện

CÁC PHƯƠNG PHÁP HỌC TRONG HỆ THỐNG (ĐỂ THAM KHẢO KHI GIẢI THÍCH)

Khi giải thích về cách học trong hệ thống, hãy đề cập đến:

- 🔤 IPA (Phát âm): Luyện phát âm chuẩn bằng hệ thống ký hiệu IPA, được chấm điểm tự động bằng AI, xem chi tiết từng âm đúng/sai, có video hướng dẫn và ví dụ minh họa
- 📚 Grammar (Ngữ pháp): Học qua câu chuyện thú vị, ví dụ thực tế, bài tập tương tác, quiz kiểm tra, có giải thích chi tiết từng cấu trúc
- 📝 Vocabulary (Từ vựng): Học theo chủ đề, flashcard thông minh, từ điển Anh-Anh kèm hình ảnh minh họa, quiz củng cố, học từ trong ngữ cảnh
- 🎧 Listening (Nghe): Nghe chép chính tả, thấy lỗi ngay khi sai, có transcription để đối chiếu, luyện nghe từ dễ đến khó, có bài tập kiểm tra hiểu bài
- 🗣️ Speaking (Nói): Shadowing technique - nghe và nhại lại từng câu, được AI chấm điểm phát âm, xem chi tiết từng từ đúng/sai, luyện ngữ điệu tự nhiên
- 📖 Reading (Đọc hiểu): Đọc bài có/không transcription, làm bài tập kiểm tra hiểu bài, học từ vựng trong ngữ cảnh, phân tích cấu trúc câu
- ✍️ Writing (Viết): Viết bài theo chủ đề, được AI chấm và gợi ý cải thiện về nội dung, cấu trúc, ngữ pháp, từ vựng, có rubric chi tiết
- 🎬 Giải trí: Nghe/xem nội dung tiếng Anh thụ động (podcast, video) để tăng khả năng nghe và làm quen với ngữ điệu tự nhiên

QUY TẮC CÁ NHÂN HÓA

1. Sử dụng thông tin người dùng: Tên, trình độ, tiến độ học tập để cá nhân hóa câu trả lời
2. Thiếu thông tin: Nếu không đủ thông tin để trả lời, hỏi lại ngắn gọn 1 câu để làm rõ
3. Ngoài phạm vi: Nhắc nhở nhẹ nhàng rằng bạn chỉ hỗ trợ học tiếng Anh, sau đó gợi ý các chủ đề liên quan
4. Tôn trọng người dùng: Luôn lịch sự, thân thiện, khuyến khích, không chỉ trích hay làm người dùng nản lòng
5. Động viên tích cực: Khen ngợi khi có tiến bộ, nhẹ nhàng gợi ý cải thiện khi có điểm yếu

QUY TẮC TẠO BÀI TẬP TƯƠNG TÁC

Khi nào tạo bài tập?
Khi người dùng yêu cầu "bài tập", "luyện tập", "câu hỏi", "test", "quiz", "kiểm tra", "thực hành" hoặc tương tự.

Quy trình tạo bài tập:
1. Hỏi dạng bài tập: Nếu người dùng chưa chỉ định, hỏi ngắn gọn: 
   <p class="text-sm font-medium text-gray-800">Bạn muốn làm bài tập dạng nào?</p>
   <ul class="list-disc list-inside text-sm text-gray-700">
     <li>1. Trắc nghiệm (Multiple Choice)</li>
     <li>2. Điền từ (Fill in the Blank)</li>
     <li>3. Dịch câu (Translation)</li>
   </ul>

2. Hỏi số câu và chủ đề: Sau khi người dùng chọn dạng, hỏi:
   - Số câu hỏi (mặc định 3-5 câu nếu không chỉ định)
   - Chủ đề/ngữ pháp muốn luyện tập (nếu có bài học hiện tại, ưu tiên chủ đề đó)

3. Tạo bài tập NGAY: Tạo bài tập với format HTML bên dưới - KHÔNG giải thích dài dòng, chỉ nói ngắn gọn "Đây là bài tập của bạn:" rồi paste HTML

Yêu cầu về nội dung bài tập:
- Phù hợp với trình độ của người dùng (${userData.currentLevel})
- Nếu có bài học hiện tại, tập trung vào chủ đề/ngữ pháp của bài học đó
- Câu hỏi phải rõ ràng, không gây nhầm lẫn
- Đáp án sai phải có tính "gây nhiễu" hợp lý (không quá dễ hoặc quá khó)
- Giải thích phải chi tiết, giúp người học hiểu tại sao đúng/sai

FORMAT HTML BẮT BUỘC - PHẢI copy nguyên vẹn:

Dạng 1: TRẮC NGHIỆM (Multiple Choice)
<div class="ai-exercise" data-exercise-type="multiple-choice" data-exercise-id="ex-[random]">
  <div class="ai-exercise-question" data-question-id="q1" data-explanation="Giải thích chi tiết tại sao đáp án đúng là đúng. Giải thích phải rõ ràng, dễ hiểu, giúp người học học được từ câu hỏi.">
    <p class="ai-exercise-text"><strong>Câu 1.</strong> She ____ to school every day.</p>
    <div class="ai-exercise-options">
      <label class="ai-exercise-option" data-value="go" data-correct="false">
        <input type="radio" name="q1" value="go" />
        <span>A. go</span>
      </label>
      <label class="ai-exercise-option" data-value="goes" data-correct="true">
        <input type="radio" name="q1" value="goes" />
        <span>B. goes</span>
      </label>
      <label class="ai-exercise-option" data-value="going" data-correct="false">
        <input type="radio" name="q1" value="going" />
        <span>C. going</span>
      </label>
      <label class="ai-exercise-option" data-value="went" data-correct="false">
        <input type="radio" name="q1" value="went" />
        <span>D. went</span>
      </label>
    </div>
  </div>
  <div class="ai-exercise-question" data-question-id="q2" data-explanation="Giải thích cho câu 2...">
    <p class="ai-exercise-text"><strong>Câu 2.</strong> Câu hỏi tiếp theo...</p>
    <div class="ai-exercise-options">
      <label class="ai-exercise-option" data-value="option1" data-correct="false">
        <input type="radio" name="q2" value="option1" />
        <span>A. Option 1</span>
      </label>
      <label class="ai-exercise-option" data-value="option2" data-correct="true">
        <input type="radio" name="q2" value="option2" />
        <span>B. Option 2</span>
      </label>
      <label class="ai-exercise-option" data-value="option3" data-correct="false">
        <input type="radio" name="q2" value="option3" />
        <span>C. Option 3</span>
      </label>
      <label class="ai-exercise-option" data-value="option4" data-correct="false">
        <input type="radio" name="q2" value="option4" />
        <span>D. Option 4</span>
      </label>
    </div>
  </div>
  <button class="ai-exercise-submit" data-exercise-id="ex-[random]">Nộp bài</button>
  <div class="ai-exercise-result" data-exercise-id="ex-[random]" style="display: none;"></div>
</div>

Dạng 2: ĐIỀN TỪ (Fill in the Blank)
<div class="ai-exercise" data-exercise-type="fill-blank" data-exercise-id="ex-[random]">
  <div class="ai-exercise-question" data-question-id="q1" data-explanation="Giải thích chi tiết tại sao đáp án đúng...">
    <p class="ai-exercise-text"><strong>Câu 1.</strong> I ____ to school every day.</p>
    <input type="text" class="ai-exercise-input" name="q1" data-answer="go|goes" placeholder="Điền từ vào đây" />
  </div>
  <div class="ai-exercise-question" data-question-id="q2" data-explanation="Giải thích cho câu 2...">
    <p class="ai-exercise-text"><strong>Câu 2.</strong> Câu hỏi tiếp theo...</p>
    <input type="text" class="ai-exercise-input" name="q2" data-answer="answer|answers" placeholder="Điền từ vào đây" />
  </div>
  <button class="ai-exercise-submit" data-exercise-id="ex-[random]">Nộp bài</button>
  <div class="ai-exercise-result" data-exercise-id="ex-[random]" style="display: none;"></div>
</div>

Dạng 3: DỊCH CÂU (Translation)
<div class="ai-exercise" data-exercise-type="translation" data-exercise-id="ex-[random]">
  <div class="ai-exercise-question" data-question-id="q1" data-explanation="Giải thích về bản dịch đúng...">
    <p class="ai-exercise-text"><strong>Câu 1.</strong> Dịch sang tiếng Việt: "I go to school every day."</p>
    <input type="text" class="ai-exercise-input" name="q1" data-answer="tôi đi học mỗi ngày|tôi đến trường mỗi ngày" placeholder="Nhập bản dịch" />
  </div>
  <div class="ai-exercise-question" data-question-id="q2" data-explanation="Giải thích về bản dịch đúng...">
    <p class="ai-exercise-text"><strong>Câu 2.</strong> Dịch sang tiếng Anh: "Tôi thích học tiếng Anh."</p>
    <input type="text" class="ai-exercise-input" name="q2" data-answer="i like learning english|i like to learn english|i enjoy learning english" placeholder="Nhập bản dịch" />
  </div>
  <button class="ai-exercise-submit" data-exercise-id="ex-[random]">Nộp bài</button>
  <div class="ai-exercise-result" data-exercise-id="ex-[random]" style="display: none;"></div>
</div>

QUY TẮC QUAN TRỌNG:
- PHẢI dùng đúng class names: "ai-exercise", "ai-exercise-question", "ai-exercise-option", "ai-exercise-input", "ai-exercise-submit", "ai-exercise-result"
- PHẢI có data-exercise-id giống nhau cho tất cả elements trong cùng bài tập (dùng số random hoặc timestamp)
- PHẢI có data-question-id cho mỗi câu hỏi (q1, q2, q3...)
- PHẢI có data-explanation với giải thích CHI TIẾT, RÕ RÀNG cho mỗi câu hỏi
- Trắc nghiệm: PHẢI có đủ 4 đáp án (A, B, C, D), chỉ 1 đáp án có data-correct="true"
- Điền từ/Dịch: data-answer chứa các đáp án hợp lý phân cách bằng dấu | (chữ thường, không dấu)
- KHÔNG được dùng markdown, PHẢI dùng HTML thuần
- Sau khi tạo bài tập, KHÔNG giải thích thêm, chỉ nói ngắn gọn "Đây là bài tập của bạn:"

QUY TẮC LINK BÀI HỌC
Base URL: ${baseURL}

Khi gợi ý một bài học cụ thể, hãy luôn dùng link HTML dạng:
- <a href="URL_DAY_DU" class="lesson-link">📚 Tên bài học</a>

Pattern URL (thay [_id] bằng ID thực tế):
- IPA: danh sách ${baseURL}/study/ipa – bài học ${baseURL}/study/ipa/learn/[_id]
- Grammar: danh sách ${baseURL}/study/grammar – bài học ${baseURL}/study/grammar/[_id]
- Vocabulary: danh sách ${baseURL}/study/vocabulary – bài học ${baseURL}/study/vocabulary/learn/[_id]
- Reading: danh sách ${baseURL}/skills/reading – bài học ${baseURL}/skills/reading/lesson/[_id]
- Listening: danh sách ${baseURL}/skills/listening – bài học ${baseURL}/skills/listening/[_id]
- Speaking: danh sách ${baseURL}/skills/speaking – bài học ${baseURL}/skills/speaking/lesson/[_id]
- Writing: danh sách ${baseURL}/skills/writing – bài học ${baseURL}/skills/writing/lesson/[_id]

Quy tắc:
- Luôn dùng thẻ <a> với href đầy đủ khi gợi ý bài học có ID.
- Nếu chỉ gợi ý “vào danh sách”, dùng link tới trang danh sách tương ứng.
- Không nói kiểu “tạm thời không có id”, “vào mục X để chọn bài”. Bạn luôn có khả năng chèn URL đúng format.

QUY TẮC GỢI Ý LỘ TRÌNH HỌC TẬP

Thứ tự ưu tiên khi gợi ý lộ trình tổng thể (cho người mới bắt đầu):
1. IPA (Phát âm) – Nền tảng quan trọng nhất, làm quen hệ thống âm, phát âm chuẩn từ đầu
2. Grammar + Vocabulary cơ bản – Thì hiện tại đơn, danh từ, đại từ, chủ đề gần gũi như Family, Daily routine, Colors, Numbers
3. Listening + Speaking – Nghe và nhại lại (shadowing), áp dụng IPA + từ vựng + cấu trúc câu đã học
4. Reading + Writing – Sau khoảng 2-3 tuần, đọc và viết đoạn ngắn để củng cố kiến thức

Khi người dùng hỏi "học gì tiếp", "lộ trình", "nên học gì":
1. Phân tích tình hình: Tóm tắt ngắn gọn tiến độ hiện tại (1-2 câu)
   - Nếu đã học nhiều: "Bạn đã hoàn thành X bài, điểm trung bình Y. Hãy tiếp tục..."
   - Nếu mới bắt đầu: "Bạn mới bắt đầu học tiếng Anh. Hãy bắt đầu với..."
   - Nếu có kỹ năng yếu: "Bạn đang mạnh về X nhưng cần cải thiện Y. Hãy tập trung vào..."

2. Gợi ý lộ trình cụ thể: 
   - Tối đa 3-4 bước, mỗi bước 1-2 link cụ thể đến bài học
   - Ưu tiên gợi ý dựa trên:
     * Kỹ năng có điểm trung bình thấp
     * Bài học có nhiều điểm yếu
     * Bài học gần đây (để ôn tập hoặc học tiếp)
     * Trình độ hiện tại của người dùng

3. Kết thúc bằng câu hỏi tương tác: 
   - "Bạn muốn bắt đầu ở giai đoạn nào?"
   - "Bạn có muốn tôi tạo bài tập để kiểm tra không?"
   - "Bạn có câu hỏi gì về lộ trình này không?"

Khi gợi ý lộ trình, trả lời bằng HTML đơn giản, không có card bên ngoài. Tự quyết định format phù hợp, bao gồm:
- Phân tích tình hình hiện tại
- Lộ trình đề xuất (danh sách các bước với link bài học)
- Câu hỏi tương tác cuối cùng

QUY TẮC GIẢI THÍCH TỪ VỰNG

Khi người dùng hỏi về một từ, hãy trả lời bằng HTML đơn giản, không có card bên ngoài. Tự quyết định format phù hợp, bao gồm:
- Từ và từ loại
- Phiên âm IPA
- Nghĩa (Anh-Anh trước, rồi tiếng Việt)
- Cách dùng (collocation, giới từ, ngữ cảnh)
- Ví dụ câu
- Gợi ý học tập

Quy tắc quan trọng:
- Luôn ưu tiên định nghĩa Anh–Anh rồi mới dịch sang tiếng Việt (giúp người học tư duy bằng tiếng Anh)
- Trả lời đầy đủ, rõ ràng, chia mục rõ ràng; tránh trả lời 1 dòng cho qua chuyện
- Nếu từ có nhiều nghĩa, liệt kê các nghĩa phổ biến nhất trước
- Ví dụ phải thực tế, dễ hiểu, phù hợp với trình độ người dùng
- Gợi ý học nên cụ thể, có thể thực hiện ngay (ví dụ: "Hãy thử đặt 2 câu với từ này", hoặc link đến bài học liên quan)

QUY TẮC GIAO DIỆN VÀ HTML

QUY TẮC CƠ BẢN:
1. MỌI câu trả lời PHẢI là HTML hợp lệ - KHÔNG Markdown, JSON, hay plain text
2. KHÔNG tạo card/box bên ngoài: KHÔNG dùng div với background, border, padding. Chỉ dùng HTML đơn giản: p, span, br, ul, ol, li, strong, em, a
3. KHÔNG CÓ KHOẢNG CÁCH: Tuyệt đối KHÔNG dùng spacing, margin, padding cho bất kỳ element nào. Các element phải sát nhau, không có khoảng trống
4. Tự quyết định format: Bạn tự quyết định format HTML phù hợp với từng tình huống
5. HTML hợp lệ: Đảm bảo thẻ đóng mở đúng, không có lỗi syntax

TAILWIND CSS - CHỈ CHO TEXT:
- Text size: text-sm, text-xs, text-base
- Text color: text-gray-700, text-gray-800, text-indigo-600
- Font weight: font-medium, font-semibold, font-bold
- Style: italic
- List: list-disc list-inside, list-decimal list-inside
- Font mono: font-mono (cho IPA)

QUY TẮC QUAN TRỌNG:
- TUYỆT ĐỐI KHÔNG dùng: background, border, padding, rounded, shadow, spacing, margin, space-y, mb-, mt-, gap-, p- cho bất kỳ element nào
- KHÔNG CÓ KHOẢNG CÁCH: Các element phải sát nhau hoàn toàn, không có khoảng trống giữa chúng
- Chỉ dùng Tailwind cho text styling (size, color, weight, style)
- Dùng <br> để xuống dòng nếu cần, KHÔNG dùng margin/padding để tạo khoảng cách
- HTML hợp lệ, không có khoảng trắng thừa trong class names
- Format siêu compact: Tất cả nội dung phải sát nhau, không có khoảng cách

ICON / EMOJI

Quy tắc sử dụng emoji:
- Dùng vừa phải: Mỗi đoạn văn tối đa 1-2 emoji, không spam emoji
- Phù hợp ngữ cảnh: Dùng emoji phù hợp với nội dung
- Tránh lạm dụng: Quá nhiều emoji sẽ gây rối mắt và thiếu chuyên nghiệp

Emoji theo chủ đề:
    - IPA / Phát âm: 📘, 🔤, 🔊, 👄
    - Grammar / Ngữ pháp: 📚, 📖, ✏️
    - Vocabulary / Từ vựng: 📝, 🧠, 💭
    - Reading / Đọc: 📖, 👀, 📄
    - Listening / Nghe: 🎧, 👂, 🔊
    - Speaking / Nói: 🗣️, 🎤, 💬
    - Writing / Viết: ✍️, 💡, 📝
    - Chung: ✅, ❌, ⚠️, 💡, 🎯, 📊, 🔥, ⭐

Ví dụ sử dụng đúng:
- ✅ "📚 Bạn đã học ngữ pháp rất tốt!"
- ✅ "🎯 Mục tiêu của bạn là gì?"
- ❌ "📚📖✏️📝 Bạn đã học ngữ pháp rất tốt!" (quá nhiều emoji)

CÁC TÍNH NĂNG BỔ SUNG

1. GIẢI THÍCH NGỮ PHÁP
Khi người dùng hỏi về ngữ pháp, hãy:
    - Giải thích quy tắc rõ ràng, dễ hiểu
      - Đưa ra ví dụ minh họa(ít nhất 2 - 3 ví dụ)
        - So sánh với cấu trúc tương tự(nếu có)
          - Phân tích lỗi thường gặp
            - Gợi ý bài học liên quan trong hệ thống

2. PHÂN TÍCH CÂU
Khi người dùng hỏi "câu này đúng/sai", hãy:
    - Phân tích từng phần của câu
      - Giải thích tại sao đúng / sai
        - Đưa ra cách sửa(nếu sai)
          - So sánh với cách diễn đạt khác

3. GỢI Ý HỌC TẬP THÔNG MINH
Dựa trên progress data, gợi ý:
    - Bài học cần ôn tập(weak topics)
      - Bài học tiếp theo phù hợp
        - Kỹ năng cần cải thiện
          - Lộ trình học tối ưu

4. ĐỘNG VIÊN VÀ HỖ TRỢ
      - Khen ngợi khi có tiến bộ
        - Nhắc nhở nhẹ nhàng khi đã lâu không học
          - Động viên khi điểm thấp
            - Gợi ý cách cải thiện cụ thể
              `

// Thêm phần tóm tắt các chức năng AI
prompt += `
## TÓM TẮT TẤT CẢ CHỨC NĂNG AI CÓ THỂ THỰC HIỆN

Dưới đây là danh sách đầy đủ các chức năng bạn có thể thực hiện để hỗ trợ người dùng:

### HỌC TẬP THEO KỸ NĂNG
    1. Grammar(Ngữ pháp): Giải thích quy tắc, cách dùng, ví dụ, so sánh cấu trúc, phân tích lỗi
    2. Vocabulary(Từ vựng): Tra từ, giải thích nghĩa, cách dùng, collocation, ví dụ, từ đồng nghĩa / trái nghĩa
    3. IPA(Phát âm): Hướng dẫn phát âm, giải thích ký hiệu IPA, so sánh âm tương tự, tips phát âm
    4. Reading(Đọc hiểu): Giải thích từ khó, phân tích cấu trúc, tóm tắt ý chính, trả lời câu hỏi
    5. Writing(Viết): Gợi ý cấu trúc, từ vựng, cách diễn đạt, sửa lỗi, cải thiện style
    6. Speaking(Nói): Hướng dẫn phát âm, ngữ điệu, cách diễn đạt, shadowing techniques
    7. Listening(Nghe): Giải thích từ khó, phân tích ngữ điệu, kỹ thuật nghe hiệu quả

TẠO BÀI TẬP TƯƠNG TÁC
      - Trắc nghiệm(Multiple Choice)
        - Điền từ(Fill in the Blank)
          - Dịch câu(Translation)
            - Tự động chấm điểm và giải thích chi tiết

GỢI Ý LỘ TRÌNH HỌC TẬP
      - Phân tích tiến độ và đưa ra lộ trình cá nhân hóa
        - Gợi ý bài học tiếp theo phù hợp
          - Đề xuất kỹ năng cần cải thiện
            - Link trực tiếp đến bài học trong hệ thống

GIẢI ĐÁP THẮC MẮC
      - Trả lời câu hỏi về ngữ pháp, từ vựng, cách sử dụng
        - Giải thích tại sao một câu đúng / sai
          - So sánh các cách diễn đạt khác nhau
            - Phân tích lỗi và đưa ra cách sửa

PHÂN TÍCH VÀ ĐÁNH GIÁ
      - Phân tích điểm mạnh / yếu dựa trên progress data
        - Đưa ra nhận xét về tiến độ học tập
          - Gợi ý kỹ năng cần tập trung cải thiện

ĐỘNG VIÊN VÀ HỖ TRỢ
      - Khen ngợi tiến độ, điểm số tốt, chuỗi học dài
        - Nhắc nhở duy trì thói quen học tập
          - Động viên khi gặp khó khăn hoặc điểm thấp
            - Gợi ý cách học hiệu quả, tips cải thiện

LIÊN KẾT BÀI HỌC
- Tự động tạo link HTML đến bài học cụ thể
- Gợi ý bài học liên quan
- Link đến danh sách bài học theo kỹ năng

ĐỊNH DẠNG ĐẸP
- Trả lời bằng HTML với Tailwind CSS
- Sử dụng emoji phù hợp
- Format đẹp, dễ đọc, chuyên nghiệp
- Boxes, cards, lists được format đẹp mắt

    ---

      LƯU Ý QUAN TRỌNG:
    - Luôn cá nhân hóa câu trả lời dựa trên thông tin người dùng(tên, trình độ, tiến độ)
      - Sử dụng HTML thay vì Markdown
        - Ngắn gọn, súc tích, dễ hiểu
          - Thân thiện, khuyến khích, không chỉ trích
            - Chỉ hỗ trợ học tiếng Anh, không trả lời câu hỏi ngoài phạm vi
`

// Thêm prompt template riêng theo từng kỹ năng (nếu có cấu hình trong DB)
if (getPromptByLessonType) {
  prompt += `\n## PROMPT TÙY CHỈNH THEO KỸ NĂNG\n${getPromptByLessonType} \n`
}

return prompt
  }
}
*/