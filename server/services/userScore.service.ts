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

interface UserSkillTotals {
  vocabularyPoints: number
  grammarPoints: number
  readingPoints: number
  listeningPoints: number
  speakingPoints: number
  writingPoints: number
  ipaPoints: number
  totalStudyTime: number
}

interface ActiveLessonIds {
  vocabulary: any[]
  grammar: any[]
  reading: any[]
  listening: any[]
  speaking: any[]
  writing: any[]
  ipa: any[]
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
    const activeLessonIds = await this.getActiveLessonIds();
    const summaries = await Promise.all(users.map((user) => this.buildUserScore(user, activeLessonIds)));

    const totalUsers = users.length;
    const activeUsers = await User.countDocuments({ role: "user", isActive: true });

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

    const activeLessonIds = await this.getActiveLessonIds();
    const summaries = await Promise.all(users.map((user) => this.getUserSkillTotals(String(user._id), activeLessonIds)));
    const userCount = summaries.length;
    const sumBy = (key: keyof UserSkillTotals) => summaries.reduce((sum, item) => sum + (item[key] || 0), 0);
    const averageOf = (key: keyof UserSkillTotals): number =>
      userCount ? Math.round(sumBy(key) / userCount) : 0;

    return [
      { name: "Từ vựng", avg: averageOf("vocabularyPoints") },
      { name: "Ngữ pháp", avg: averageOf("grammarPoints") },
      { name: "Đọc hiểu", avg: averageOf("readingPoints") },
      { name: "Nghe hiểu", avg: averageOf("listeningPoints") },
      { name: "Nói", avg: averageOf("speakingPoints") },
      { name: "Viết", avg: averageOf("writingPoints") },
      { name: "IPA", avg: averageOf("ipaPoints") },
    ];
  }

  // (ADMIN) Đồng bộ và cập nhật điểm số cho một người dùng
  static async createOrUpdateUserScore(userId: string, _scoreData?: any): Promise<UserScoreSummary> {
    const user = await User.findOne({ _id: userId, role: "user" }).select("-password");
    if (!user) {
      throw new ErrorHandler("Không tìm thấy người dùng hoặc không có quyền cập nhật", 404);
    }

    const activeLessonIds = await this.getActiveLessonIds();
    const summary = await this.buildUserScore(user, activeLessonIds);

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
    const activeLessonIds = await this.getActiveLessonIds();
    const summaries = await Promise.all(users.map((user) => this.buildUserScore(user, activeLessonIds)));

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
    const activeLessonIds = await this.getActiveLessonIds();
    const summaries = await Promise.all(users.map((user) => this.buildUserScore(user, activeLessonIds)));
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

    const activeLessonIds = await this.getActiveLessonIds();
    return await this.buildUserScore(user, activeLessonIds);
  }

  private static async getActiveLessonIds(): Promise<ActiveLessonIds> {
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

    return {
      vocabulary: activeVocabularyTopicIds,
      grammar: activeGrammarTopicIds,
      reading: activeReadingIds,
      listening: activeListeningIds,
      speaking: activeSpeakingIds,
      writing: activeWritingIds,
      ipa: activeIpaIds,
    };
  }

  private static async getUserSkillTotals(
    userId: string,
    activeLessonIds: ActiveLessonIds
  ): Promise<UserSkillTotals> {

    const [
      vocabularyTotalsRaw,
      grammarTotalsRaw,
      readingTotalsRaw,
      listeningTotalsRaw,
      writingTotalsRaw,
      ipaTotalsRaw,
      speakingTotalsRaw,
      durationRaw,
    ] = await Promise.all([
      this.aggregateBestProgressByCategory(userId, 'vocabulary', activeLessonIds.vocabulary),
      this.aggregateBestProgressByCategory(userId, 'grammar', activeLessonIds.grammar),
      this.aggregateBestProgressByCategory(userId, 'reading', activeLessonIds.reading),
      this.aggregateBestProgressByCategory(userId, 'listening', activeLessonIds.listening),
      this.aggregateBestProgressByCategory(userId, 'writing', activeLessonIds.writing),
      this.aggregateBestProgressByCategory(userId, 'ipa', activeLessonIds.ipa),
      this.aggregateBestProgressByCategory(userId, 'speaking', activeLessonIds.speaking),
      StudyHistory.aggregate([
        { $match: { userId: new Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: "$duration" } } }
      ]),
    ]);

    return {
      vocabularyPoints: vocabularyTotalsRaw[0]?.total || 0,
      grammarPoints: grammarTotalsRaw[0]?.total || 0,
      readingPoints: readingTotalsRaw[0]?.total || 0,
      listeningPoints: listeningTotalsRaw[0]?.total || 0,
      writingPoints: writingTotalsRaw[0]?.total || 0,
      ipaPoints: ipaTotalsRaw[0]?.total || 0,
      speakingPoints: speakingTotalsRaw[0]?.total || 0,
      totalStudyTime: durationRaw[0]?.total || 0,
    };
  }

  private static async aggregateBestProgressByCategory(
    userId: string,
    category: string,
    activeLessonIds: any[]
  ): Promise<Array<{ _id: Types.ObjectId; total: number }>> {
    return await StudyHistory.aggregate([
      { $match: { userId: new Types.ObjectId(userId), category, lessonId: { $in: activeLessonIds } } },
      { $sort: { progress: -1, createdAt: -1 } },
      { $group: { _id: "$lessonId", best: { $first: "$progress" } } },
      { $group: { _id: new Types.ObjectId(userId), total: { $sum: "$best" } } },
    ]);
  }

  private static async buildUserScore(user: IUser, activeLessonIds: ActiveLessonIds): Promise<UserScoreSummary> {
    const userObjectId = user._id as Types.ObjectId;
    const totals = await this.getUserSkillTotals(String(user._id), activeLessonIds);

    const vocabularyPoints = totals.vocabularyPoints;
    const grammarPoints = totals.grammarPoints;
    const readingPoints = totals.readingPoints;
    const listeningPoints = totals.listeningPoints;
    const speakingPoints = totals.speakingPoints;
    const writingPoints = totals.writingPoints;
    const ipaPoints = totals.ipaPoints;

    const totalPoints =
      vocabularyPoints +
      grammarPoints +
      readingPoints +
      listeningPoints +
      writingPoints +
      ipaPoints +
      speakingPoints;
    const totalStudyTime = totals.totalStudyTime;

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
