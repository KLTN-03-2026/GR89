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

type LessonCategory = 'grammar' | 'vocabulary' | 'reading' | 'listening' | 'speaking' | 'ipa' | 'writing'

export interface IRecentStudyHistoryForAI {
  lessonId: string
  category: LessonCategory
  progress: number
  status: 'passed' | 'failed' | 'in_progress'
  duration: number
  weakPoints: string[]
  createdAt?: Date
  lessonTitle?: string
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
      isVip: user.vipStartDate && user.vipExpireDate && user.vipExpireDate > new Date() || false,
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      totalStudyTime: user.totalStudyTime || 0,
      totalPoints: user.totalPoints || 0,
      lastLearnDate: user.lastLearnDate || undefined
    }
  }

  //2. Lấy Progress của toàn bộ kỹ năng theo người dùng 
  // Chỉ lấy progress của các bài học còn tồn tại và isActive: true
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

  // Helper: Build progress cho một skill
  // Vì học theo orderIndex nên recentTopics chỉ cần lấy 10 bài cuối cùng
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

  // 3. Lấy danh sách tất cả topics (chỉ ID, name/title, orderIndex)
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

  static async getRecentStudyHistory(userId: string, limit = 20): Promise<IRecentStudyHistoryForAI[]> {
    const histories = await StudyHistory.find({ userId: new Types.ObjectId(userId) })
      .select('lessonId category progress status duration weakPoints createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return histories.map((item: any) => ({
      lessonId: String(item.lessonId),
      category: item.category,
      progress: item.progress || 0,
      status: item.status || 'in_progress',
      duration: item.duration || 0,
      weakPoints: Array.isArray(item.weakPoints) ? item.weakPoints : [],
      createdAt: item.createdAt || undefined
    }))
  }

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
            path: 'quizzes',
            select: 'question answer explanation'
          })
          .lean()
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

    // Query user data, progress data và history gần nhất song song
    const [userData, progressData, recentStudyHistory] = await Promise.all([
      this.getUserData(userId),
      this.getProgressData(userId, totals),
      this.getRecentStudyHistory(userId, 20)
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
          return {
            ...pick(lesson, ['_id', 'name', 'orderIndex', 'level', 'isVipRequired']),
            vocabularyCount: Array.isArray(lesson.vocabularies) ? lesson.vocabularies.length : 0,
            quizCount: Array.isArray(lesson.quizzes) ? lesson.quizzes.length : 0
          }
        case 'grammar':
          return {
            ...pick(lesson, ['_id', 'title', 'description', 'orderIndex', 'level', 'isVipRequired']),
            sections: Array.isArray(lesson.sections)
              ? lesson.sections.slice(0, 5).map((x: any) => ({
                ...pick(x, ['id', 'title', 'description', 'note', 'formula']),
                examples: Array.isArray(x.examples)
                  ? x.examples.slice(0, 3).map((e: any) => pick(e, ['en', 'vi']))
                  : undefined
              }))
              : undefined,
            practice: Array.isArray(lesson.practice)
              ? lesson.practice.slice(0, 8).map((x: any) => pick(x, ['id', 'type', 'question', 'hint']))
              : undefined,
            quizCount: Array.isArray(lesson.quizzes) ? lesson.quizzes.length : 0
          }
        case 'reading':
          return {
            ...pick(lesson, ['_id', 'title', 'description', 'level', 'orderIndex', 'isVipRequired']),
            vocabularyCount: Array.isArray(lesson.vocabulary) ? lesson.vocabulary.length : 0,
            quizCount: Array.isArray(lesson.quizzes) ? lesson.quizzes.length : 0
          }
        case 'listening':
          return pick(lesson, ['_id', 'title', 'description', 'level', 'orderIndex', 'isVipRequired', 'subtitle'])
        case 'speaking':
          return {
            ...pick(lesson, ['_id', 'title', 'description', 'level', 'orderIndex', 'isVipRequired']),
            videoUrl: lesson.videoUrl?.url ?? undefined
          }
        case 'writing':
          return {
            ...pick(lesson, ['_id', 'title', 'description', 'level', 'orderIndex', 'isVipRequired', 'minWords', 'maxWords', 'duration']),
            suggestedVocabulary: Array.isArray(lesson.suggestedVocabulary) ? lesson.suggestedVocabulary.slice(0, 12) : undefined,
            suggestedStructure: Array.isArray(lesson.suggestedStructure)
              ? lesson.suggestedStructure.slice(0, 6).map((x: any) => pick(x, ['step', 'title', 'description']))
              : undefined
          }
        case 'ipa':
          return {
            ...pick(lesson, ['_id', 'sound', 'soundType', 'description', 'isVipRequired']),
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
    const lessonTitleByCategoryAndId = {
      vocabulary: new Map(topicsList.vocabulary.map(item => [item._id, item.name])),
      grammar: new Map(topicsList.grammar.map(item => [item._id, item.title])),
      reading: new Map(topicsList.reading.map(item => [item._id, item.title])),
      listening: new Map(topicsList.listening.map(item => [item._id, item.title])),
      speaking: new Map(topicsList.speaking.map(item => [item._id, item.title])),
      writing: new Map(topicsList.writing.map(item => [item._id, item.title])),
      ipa: new Map(topicsList.ipa.map(item => [item._id, item.sound]))
    } as const

    const recentStudyHistoryWithTitle = recentStudyHistory.map(item => ({
      ...item,
      lessonTitle: lessonTitleByCategoryAndId[item.category]?.get(item.lessonId)
    }))

    let newPrompt = `
You are an AI English learning tutor inside an app called "English Master".
You must respond in MARKDOWN. You MAY include small, safe HTML snippets when needed (especially <a href=\"...\"> links, and .ai-exercise blocks).

PRIORITY POLICY (highest priority, must never be violated):
- Do scope-checking internally and silently. Never reveal your internal classification process.
- Treat these as IN_SCOPE:
  1) English learning content and practice,
  2) English Master app/website features, lessons, navigation, progress,
  3) brief social conversation (greeting, thanks, small talk) that does not request unrelated knowledge.
- Treat as OUT_OF_SCOPE when the user asks for unrelated knowledge/tasks (politics, coding outside this app, current events, math/trivia, legal/medical/finance advice, etc.).
- If OUT_OF_SCOPE, you MUST politely refuse in a gentle, cute, and positive Vietnamese tone.
- The refusal must keep the same meaning as: you cannot answer because it is outside your support scope, and invite the user back to English-learning/app-related topics.
- Use 1-2 short sentences max. Do not answer the actual off-topic question.
- In OUT_OF_SCOPE mode, do not include markdown headings, bullets, links, or long explanations.

PRIVACY & MEMORY RULE:
- Do not claim that you learned from other users.
- Do not mention or use private information from anyone else.
- Only use the current conversation and provided app context.

LEARNING INTEGRITY RULE (do not solve directly):
- Do NOT provide direct final answers for quizzes/tests/homework when the user asks to "giải hộ", "đưa đáp án", or similar.
- Instead, provide guided help: short hints, step-by-step thinking, key grammar/vocabulary clues, and ask the learner to try first.
- If the user shares their own attempt, you may review and explain mistakes, then suggest improvements.
- Keep support educational (coach mode), not answer-dumping mode.

Response style:
- Vietnamese first; include English examples and IPA when helpful.
- Always be warm, cheerful, polite, supportive, and emotionally positive.
- Use a cute and caring tone (friendly, gentle, encouraging), but still clear and professional for learning.
- Make it easy to read: use headings (##/###), short paragraphs, bullet lists, and code blocks for examples/IPA.
- Keep it concise by default (typically 6–14 lines). If user asks for depth, stay structured.
- If you need clarification, ask exactly ONE short question.
- Do not invent facts; rely only on provided context.

Scope guard (strict):
- Your allowed scope is ONLY:
  1) English learning (vocabulary, grammar, reading, listening, speaking, writing, IPA, study strategy),
  2) Features/content/navigation of the English Master website/app.
- Friendly social chat (greeting/thanks) is allowed and should be answered naturally.
- If a user asks anything outside this scope (politics, coding not related to this app, personal advice, current events, math, general trivia, etc.):
  - DO NOT answer the actual question.
  - MUST follow the PRIORITY POLICY refusal style.

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
- NEVER output plain text URLs.

Recommendation rule (very important):
- Always read \`recentStudyHistory\` first to understand what the learner studied recently.
- If the user asks "học gì tiếp", "lộ trình", "nên học bài nào", always suggest 2-4 next lessons across useful skills.
- Prioritize:
  1) weak skills / weakPoints,
  2) then continue the same topic family from recent history,
  3) then complementary skills (e.g. vocab + grammar + listening on same theme).
- For each suggested lesson, ALWAYS include a clickable lesson link using the pattern in \`appLinks.patterns\`.
- Prefer concrete guidance style, for example:
  - "Bạn vừa học chủ đề Gia đình, hôm nay học tiếp từ vựng Gia đình + thì hiện tại đơn + bài nghe về Gia đình."
  - "Bạn đang yếu thì hiện tại đơn, nên học lại bài này ngay hôm nay."
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
      allLessons: topicsList,
      progressBySkill: progressData,
      recentStudyHistory: recentStudyHistoryWithTitle,
      progressHighlights: { weakSkills, strongSkills },
      currentLesson: lessonSummary ? { lessonType, ...lessonSummary } : undefined,
      appLinks: baseURL
        ? {
          baseUrl: baseURL,
          patterns: {
            ipaLesson: `${baseURL}/study/ipa/learn/[id]`,
            grammarList: `${baseURL}/study/grammar`,
            grammarLesson: `${baseURL}/study/grammar/[id]`,
            vocabularyList: `${baseURL}/study/vocabulary`,
            vocabularyLesson: `${baseURL}/study/vocabulary/[id]`,
            readingList: `${baseURL}/skills/reading`,
            readingLesson: `${baseURL}/skills/reading/[id]`,
            listeningList: `${baseURL}/skills/listening`,
            listeningLesson: `${baseURL}/skills/listening/[id]`,
            speakingList: `${baseURL}/skills/speaking`,
            speakingLesson: `${baseURL}/skills/speaking/[id]`,
            writingList: `${baseURL}/skills/writing`,
            writingLesson: `${baseURL}/skills/writing/[id]`,
          },
        }
        : undefined,
    }

    newPrompt += `\n\n## CONTEXT (internal)\n\`\`\`json\n${JSON.stringify(context, null, 2)}\n\`\`\`\n`

    return newPrompt.trim()
  }

  static async buildSuggestionPrompt(userId: string): Promise<string> {
    // Lấy danh sách tất cả bài học
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

    // Lấy thông tin user, tiến trình, và lịch sử học tập
    const [userData, progressData, recentStudyHistory] = await Promise.all([
      this.getUserData(userId),
      this.getProgressData(userId, totals),
      this.getRecentStudyHistory(userId, 20)
    ])

    const baseURL = process.env.CLIENT_BASE_URL || ''

    const lessonTitleByCategoryAndId = {
      vocabulary: new Map(topicsList.vocabulary.map(item => [item._id, item.name])),
      grammar: new Map(topicsList.grammar.map(item => [item._id, item.title])),
      reading: new Map(topicsList.reading.map(item => [item._id, item.title])),
      listening: new Map(topicsList.listening.map(item => [item._id, item.title])),
      speaking: new Map(topicsList.speaking.map(item => [item._id, item.title])),
      writing: new Map(topicsList.writing.map(item => [item._id, item.title])),
      ipa: new Map(topicsList.ipa.map(item => [item._id, item.sound]))
    } as const

    const recentStudyHistoryWithTitle = recentStudyHistory.map(item => ({
      ...item,
      lessonTitle: lessonTitleByCategoryAndId[item.category]?.get(item.lessonId)
    }))

    const context: Record<string, any> = {
      user: {
        firstName: userData?.fullName ? userData.fullName.trim().split(/\s+/)[0] : 'User',
        level: userData?.currentLevel,
        isVip: userData?.isVip,
        totalPoints: userData?.totalPoints,
      },
      allLessons: topicsList,
      progressBySkill: progressData,
      recentStudyHistory: recentStudyHistoryWithTitle,
      appLinksPatterns: {
        ipaLesson: `${baseURL}/study/ipa/learn/[id]`,
        grammarLesson: `${baseURL}/study/grammar/[id]`,
        vocabularyLesson: `${baseURL}/study/vocabulary/[id]`,
        readingLesson: `${baseURL}/skills/reading/[id]`,
        listeningLesson: `${baseURL}/skills/listening/[id]`,
        speakingLesson: `${baseURL}/skills/speaking/[id]`,
        writingLesson: `${baseURL}/skills/writing/[id]`,
      }
    }

    const prompt = `
You are an AI learning assistant for "English Master". Your ONLY job is to suggest the next 5-8 daily study goals for the user based on their context.

# INSTRUCTIONS:
1. Analyze the user's \`recentStudyHistory\` to see what they learned recently.
2. Analyze the user's \`progressBySkill\` to identify weak skills or incomplete lessons.
3. Look at \`allLessons\` to pick the EXACT NEXT lessons the user should take.
4. Provide a balanced mix:
   - 1-2 lessons to review/improve weak points or recently failed tasks.
   - 2-4 new lessons from topics they haven't completed yet (follow the \`orderIndex\` logic).
   - 1-2 fun/complementary skills (listening, speaking, or entertainment).

# REQUIRED JSON FORMAT:
You MUST respond with a valid JSON array of objects. Do not include a "suggestions" root key. Return ONLY the array itself.
Do NOT use markdown blocks (\`\`\`json) or any other text.

[
  {
    "title": "Tên mục tiêu ngắn gọn (VD: Cải thiện kỹ năng Nói, Học từ vựng chủ đề X...)",
    "description": "Mô tả ngắn gọn (VD: Luyện tập lại bài Tính từ cơ bản)",
    "href": "Đường dẫn thực tế (Dựa vào appLinksPatterns và ID bài học tương ứng, VD: /skills/speaking/60d...)",
    "icon": "Tên icon Lucide-React hợp lệ (Chọn 1 trong: PlayCircle, Target, BarChart3, Users, Mic, BookOpen, Headphones, PenTool, Radio, Film)",
    "color": "Class màu (Chọn 1 trong: from-green-500 to-emerald-500, from-blue-500 to-cyan-500, from-purple-500 to-pink-500, from-orange-500 to-red-500, from-amber-500 to-orange-500, from-indigo-500 to-blue-600)",
    "isCompleted": false
  }
]

## CONTEXT (internal)
${JSON.stringify(context, null, 2)}
`
    return prompt.trim()
  }
}
