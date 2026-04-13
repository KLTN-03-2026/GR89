import { Types } from 'mongoose'
import { User, IUser } from '../models/user.model'
import { Plan } from '../models/plan.model'
import { StudyHistory } from '../models/studyHistory.model'
import { VocabularyTopic } from '../models/vocabularyTopic.model'
import { Reading } from '../models/reading.model'
import { Listening } from '../models/listening.model'
import { GrammarTopic } from '../models/grammarTopic.model'
import { writingModel } from '../models/writing.model'
import { Ipa } from '../models/ipa.model'
import { Speaking } from '../models/speaking.model'
import ErrorHandler from '../utils/ErrorHandler'

type TotalsMap = Map<string, number>

interface ListeningTotals {
  points: TotalsMap
  time: TotalsMap
}

interface SkillTotals {
  vocabulary: TotalsMap
  grammar: TotalsMap
  reading: TotalsMap
  listening: ListeningTotals
  writing: TotalsMap
  ipa: TotalsMap
  speaking: TotalsMap
}

interface PaginatedResult<T> {
  users: T[]
  totalDocs: number
  limit: number
  page: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
  next: number | null
  prev: number | null
  pagingCounter: number
}

interface UserScoreSummary {
  _id: Types.ObjectId
  userId: Types.ObjectId
  fullName: string
  email: string
  totalPoints: number
  vocabularyPoints: number
  grammarPoints: number
  readingPoints: number
  listeningPoints: number
  speakingPoints: number
  writingPoints: number
  ipaPoints: number
  currentStreak: number
  longestStreak: number
  totalStudyTime: number
  lastActiveDate: Date
  isActive: boolean
  isVip?: boolean
  vipStartDate?: Date | string
  vipPlanId?: Types.ObjectId | string
  vipPlanName?: string
  vipExpiryDate?: Date | string
}

interface PaginatedQuery {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  isActive?: boolean
}

const toObjectId = (ids: string[]): Types.ObjectId[] => ids.map((id) => new Types.ObjectId(id))

const buildTotalsMap = (docs: Array<{ _id: Types.ObjectId; total: number }>): TotalsMap => {
  const map = new Map<string, number>()
  docs.forEach(doc => map.set(String(doc._id), doc.total || 0))
  return map
}

const sumMapValues = (map: TotalsMap): number => {
  let total = 0
  map.forEach(value => {
    total += value || 0
  })
  return total
}

export class UserScoreService {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Lấy thống kê tổng quan về điểm số của tất cả người dùng
  static async getStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    averagePoints: number;
    totalStudyTime: number;
  }> {
    const users = await User.find({ role: "user" });
    const totals = await this.collectSkillTotals(users.map((u) => String(u._id)));
    const summaries = await Promise.all(users.map((user) => this.buildUserScore(user, totals)));

    const totalUsers = users.length;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = users.filter((user) => {
      const lastActive = user.lastActiveDate || (user as any).updatedAt || (user as any).createdAt;
      return new Date(lastActive) >= sevenDaysAgo;
    }).length;

    const totalPointsSum = summaries.reduce((sum, item) => sum + (item.totalPoints || 0), 0);
    const totalStudyTime = summaries.reduce((sum, item) => sum + (item.totalStudyTime || 0), 0);
    const averagePoints = totalUsers ? Math.round(totalPointsSum / totalUsers) : 0;

    return {
      totalUsers,
      activeUsers,
      averagePoints,
      totalStudyTime,
    };
  }

  // (ADMIN) Phân tích kỹ năng trung bình của tất cả người dùng
  static async getSkillAnalysis(): Promise<any[]> {
    const users = await User.find({ role: "user" }).select("_id");
    if (users.length === 0) {
      return [
        { name: "Từ vựng", avg: 0 },
        { name: "Ngữ pháp", avg: 0 },
        { name: "Đọc hiểu", avg: 0 },
        { name: "Nghe hiểu", avg: 0 },
        { name: "Nói", avg: 0 },
        { name: "Viết", avg: 0 },
        { name: "IPA", avg: 0 },
      ];
    }

    const totals = await this.collectSkillTotals(users.map((u) => String(u._id)));
    const userCount = users.length;

    const averageOf = (map: TotalsMap): number =>
      userCount ? Math.round(sumMapValues(map) / userCount) : 0;

    return [
      { name: "Từ vựng", avg: averageOf(totals.vocabulary) },
      { name: "Ngữ pháp", avg: averageOf(totals.grammar) },
      { name: "Đọc hiểu", avg: averageOf(totals.reading) },
      { name: "Nghe hiểu", avg: averageOf(totals.listening.points) },
      { name: "Nói", avg: averageOf(totals.speaking) },
      { name: "Viết", avg: averageOf(totals.writing) },
      { name: "IPA", avg: averageOf(totals.ipa) },
    ];
  }

  // (ADMIN) Đồng bộ và cập nhật điểm số cho một người dùng
  static async createOrUpdateUserScore(userId: string, _scoreData?: any): Promise<UserScoreSummary> {
    const user = await User.findOne({ _id: userId, role: "user" }).select("-password");
    if (!user) {
      throw new ErrorHandler("Không tìm thấy người dùng hoặc không có quyền cập nhật", 404);
    }

    const totals = await this.collectSkillTotals([userId]);
    const summary = await this.buildUserScore(user, totals);

    const updatedUser = await User.findById(userId);
    if (updatedUser) {
      updatedUser.totalPoints = summary.totalPoints;
      updatedUser.totalStudyTime = summary.totalStudyTime;
      updatedUser.currentStreak = summary.currentStreak;
      updatedUser.longestStreak = summary.longestStreak;
      updatedUser.isActive = summary.isActive;
      updatedUser.lastActiveDate = summary.lastActiveDate
        ? new Date(summary.lastActiveDate)
        : updatedUser.lastActiveDate;
      await updatedUser.save();
    }

    return summary;
  }

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy danh sách điểm số người dùng (có phân trang & tìm kiếm)
  static async getAllUserScoresPaginated(
    params: PaginatedQuery
  ): Promise<PaginatedResult<UserScoreSummary>> {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "totalPoints",
      sortOrder = "desc",
      isActive,
    } = params;

    const filter: any = { role: "user" };
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ fullName: regex }, { email: regex }];
    }
    if (typeof isActive === "boolean") {
      filter.isActive = isActive;
    }

    const users = await User.find(filter).select("-password");
    const totals = await this.collectSkillTotals(users.map((u) => String(u._id)));
    const summaries = await Promise.all(users.map((user) => this.buildUserScore(user, totals)));

    this.sortUserScores(summaries, sortBy, sortOrder);

    const totalDocs = summaries.length;
    const pageNumber = Math.max(1, page);
    const limitNumber = Math.max(1, limit);
    const pages = Math.max(1, Math.ceil(totalDocs / limitNumber));
    const startIndex = (pageNumber - 1) * limitNumber;
    const paginatedUsers = summaries.slice(startIndex, startIndex + limitNumber);

    return {
      users: paginatedUsers,
      totalDocs,
      limit: limitNumber,
      page: pageNumber,
      pages,
      hasNext: pageNumber < pages,
      hasPrev: pageNumber > 1,
      next: pageNumber < pages ? pageNumber + 1 : null,
      prev: pageNumber > 1 ? pageNumber - 1 : null,
      pagingCounter: startIndex + 1,
    };
  }

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // (USER) Lấy danh sách người dùng có điểm số cao nhất (Bảng xếp hạng)
  static async getTopUsers(limit: number = 5): Promise<UserScoreSummary[]> {
    const users = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });
    const totals = await this.collectSkillTotals(users.map((u) => String(u._id)));
    const summaries = await Promise.all(users.map((user) => this.buildUserScore(user, totals)));
    this.sortUserScores(summaries, "totalPoints", "desc");
    return summaries.slice(0, limit);
  }

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Lấy chi tiết điểm số của một người dùng theo ID
  static async getUserScoreById(userId: string): Promise<UserScoreSummary> {
    const user = await User.findOne({ _id: userId, role: "user" }).select("-password");
    if (!user) {
      throw new ErrorHandler("Không tìm thấy người dùng hoặc không có quyền xem", 404);
    }

    const totals = await this.collectSkillTotals([userId]);
    return await this.buildUserScore(user, totals);
  }

  private static async collectSkillTotals(userIds?: string[]): Promise<SkillTotals> {
    const [
      activeVocabularyTopicIds,
      activeGrammarTopicIds,
      activeReadingIds,
      activeListeningIds,
      activeSpeakingIds,
      activeWritingIds,
      activeIpaIds,
    ] = await Promise.all([
      VocabularyTopic.find({ isActive: true }).distinct("_id"),
      GrammarTopic.find({ isActive: true }).distinct("_id"),
      Reading.find({ isActive: true }).distinct("_id"),
      Listening.find({ isActive: true }).distinct("_id"),
      Speaking.find({ isActive: true }).distinct("_id"),
      writingModel.find({ isActive: true }).distinct("_id"),
      Ipa.find({ isActive: true }).distinct("_id"),
    ]);

    const matchByUserId = userIds && userIds.length
      ? [{ $match: { userId: { $in: toObjectId(userIds) } } }]
      : [];

    const getSkillAggregation = (category: string, activeIds: any[]) => {
      return StudyHistory.aggregate([
        ...matchByUserId,
        { $match: { category, lessonId: { $in: activeIds } } },
        { $sort: { progress: -1, createdAt: -1 } },
        { $group: { _id: { userId: "$userId", lessonId: "$lessonId" }, best: { $first: "$progress" } } },
        { $group: { _id: "$_id.userId", total: { $sum: "$best" } } }
      ]);
    };

    const getListeningAggregation = (activeIds: any[]) => {
      return Promise.all([
        StudyHistory.aggregate([
          ...matchByUserId,
          { $match: { category: 'listening', lessonId: { $in: activeIds } } },
          { $sort: { progress: -1, createdAt: -1 } },
          { $group: { _id: { userId: "$userId", lessonId: "$lessonId" }, best: { $first: "$progress" } } },
          { $group: { _id: "$_id.userId", total: { $sum: "$best" } } }
        ]),
        StudyHistory.aggregate([
          ...matchByUserId,
          { $match: { category: 'listening', lessonId: { $in: activeIds } } },
          { $group: { _id: "$userId", total: { $sum: "$duration" } } }
        ])
      ]);
    };

    const [
      vocabularyTotalsRaw,
      grammarTotalsRaw,
      readingTotalsRaw,
      [listeningPointsRaw, listeningTimeRaw],
      writingTotalsRaw,
      ipaTotalsRaw,
      speakingTotalsRaw,
    ] = await Promise.all([
      getSkillAggregation('vocabulary', activeVocabularyTopicIds),
      getSkillAggregation('grammar', activeGrammarTopicIds),
      getSkillAggregation('reading', activeReadingIds),
      getListeningAggregation(activeListeningIds),
      getSkillAggregation('writing', activeWritingIds),
      getSkillAggregation('ipa', activeIpaIds),
      getSkillAggregation('speaking', activeSpeakingIds),
    ]);

    const listeningPointsMap = buildTotalsMap(listeningPointsRaw);
    const listeningTimeMap = buildTotalsMap(listeningTimeRaw);

    return {
      vocabulary: buildTotalsMap(vocabularyTotalsRaw),
      grammar: buildTotalsMap(grammarTotalsRaw),
      reading: buildTotalsMap(readingTotalsRaw),
      listening: {
        points: listeningPointsMap,
        time: listeningTimeMap,
      },
      writing: buildTotalsMap(writingTotalsRaw),
      ipa: buildTotalsMap(ipaTotalsRaw),
      speaking: buildTotalsMap(speakingTotalsRaw),
    };
  }

  private static async buildUserScore(user: IUser, totals: SkillTotals): Promise<UserScoreSummary> {
    const userObjectId = user._id as Types.ObjectId;
    const userId = String(user._id);

    const vocabularyPoints = totals.vocabulary.get(userId) || 0;
    const grammarPoints = totals.grammar.get(userId) || 0;
    const readingPoints = totals.reading.get(userId) || 0;
    const listeningPoints = totals.listening.points.get(userId) || 0;
    const speakingPoints = totals.speaking.get(userId) || 0;
    const writingPoints = totals.writing.get(userId) || 0;
    const ipaPoints = totals.ipa.get(userId) || 0;

    const totalPoints =
      vocabularyPoints +
      grammarPoints +
      readingPoints +
      listeningPoints +
      writingPoints +
      ipaPoints +
      speakingPoints;
    const totalStudyTime = totals.listening.time.get(userId) ?? user.totalStudyTime ?? 0;

    const isVip = user.isVip || false;
    const vipStartDate = user.vipStartDate || undefined;
    const vipPlanId = user.vipPlanId || undefined;
    let vipPlanName: string | undefined = undefined;
    let vipExpiryDate: Date | undefined = undefined;

    if (isVip && vipPlanId && vipStartDate) {
      const plan = await Plan.findById(vipPlanId);
      if (plan) {
        vipPlanName = plan.name;

        const startDate = new Date(vipStartDate);
        if (plan.billingCycle === "monthly") {
          vipExpiryDate = new Date(startDate);
          vipExpiryDate.setMonth(vipExpiryDate.getMonth() + 1);
        } else if (plan.billingCycle === "yearly") {
          vipExpiryDate = new Date(startDate);
          vipExpiryDate.setFullYear(vipExpiryDate.getFullYear() + 1);
        } else if (plan.billingCycle === "lifetime") {
          vipExpiryDate = undefined;
        }
      }
    }

    return {
      _id: userObjectId,
      userId: userObjectId,
      fullName: user.fullName,
      email: user.email,
      totalPoints,
      vocabularyPoints,
      grammarPoints,
      readingPoints,
      listeningPoints,
      speakingPoints,
      writingPoints,
      ipaPoints,
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      totalStudyTime,
      lastActiveDate: user.lastActiveDate || (null as unknown as Date),
      isActive: user.isActive ?? true,
      isVip,
      vipStartDate: vipStartDate ? new Date(vipStartDate).toISOString() : undefined,
      vipPlanId: vipPlanId ? String(vipPlanId) : undefined,
      vipPlanName,
      vipExpiryDate: vipExpiryDate ? vipExpiryDate.toISOString() : undefined,
    };
  }

  private static sortUserScores(
    users: UserScoreSummary[],
    sortBy: string,
    sortOrder: "asc" | "desc"
  ) {
    const direction = sortOrder === "asc" ? 1 : -1;
    users.sort((a, b) => {
      const valueA = (a as Record<string, any>)[sortBy] ?? 0;
      const valueB = (b as Record<string, any>)[sortBy] ?? 0;

      if (typeof valueA === "number" && typeof valueB === "number") {
        return direction * (valueA - valueB);
      }

      const stringA = String(valueA).toLowerCase();
      const stringB = String(valueB).toLowerCase();
      if (stringA < stringB) return -direction;
      if (stringA > stringB) return direction;
      return 0;
    });
  }
}
