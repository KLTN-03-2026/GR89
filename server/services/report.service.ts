import mongoose from "mongoose";
import { Payment } from "../models/payment.model";
import { StudyHistory } from "../models/studyHistory.model";
import { Plan } from "../models/plan.model";
import { GrammarTopic } from "../models/grammarTopic.model";
import { VocabularyTopic } from "../models/vocabularyTopic.model";
import { Reading } from "../models/reading.model";
import { Listening } from "../models/listening.model";
import { Speaking } from "../models/speaking.model";
import { Ipa } from "../models/ipa.model";
import { writingModel as Writing } from "../models/writing.model";

type StudyCategory = "all" | "grammar" | "vocabulary" | "reading" | "listening" | "speaking" | "ipa" | "writing";

interface IReportFilters {
  startDate?: string;
  endDate?: string;
  category?: StudyCategory;
}

const CATEGORY_LABELS: Record<string, string> = {
  grammar: "Grammar",
  vocabulary: "Vocabulary",
  reading: "Reading",
  listening: "Listening",
  speaking: "Speaking",
  ipa: "IPA",
  writing: "Writing",
};

export class ReportService {
  private static parseDateRange(startDate?: string, endDate?: string) {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(end.getTime() - 1000 * 60 * 60 * 24 * 29);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  private static async getLessonTitleMapByCategory(
    category: Exclude<StudyCategory, "all">,
    lessonIds: mongoose.Types.ObjectId[]
  ): Promise<Map<string, string>> {
    if (lessonIds.length === 0) return new Map<string, string>();

    let docs: any[] = [];
    if (category === "grammar") docs = await GrammarTopic.find({ _id: { $in: lessonIds } }).select("_id title").lean();
    if (category === "vocabulary") docs = await VocabularyTopic.find({ _id: { $in: lessonIds } }).select("_id name").lean();
    if (category === "reading") docs = await Reading.find({ _id: { $in: lessonIds } }).select("_id title").lean();
    if (category === "listening") docs = await Listening.find({ _id: { $in: lessonIds } }).select("_id title").lean();
    if (category === "speaking") docs = await Speaking.find({ _id: { $in: lessonIds } }).select("_id title").lean();
    if (category === "ipa") docs = await Ipa.find({ _id: { $in: lessonIds } }).select("_id sound").lean();
    if (category === "writing") docs = await Writing.find({ _id: { $in: lessonIds } }).select("_id title").lean();

    return new Map(
      docs.map((doc: any) => [
        String(doc._id),
        String(doc.title || doc.name || doc.sound || "Bài học"),
      ])
    );
  }

  static async getDashboardReport(filters: IReportFilters) {
    const { start, end } = this.parseDateRange(filters.startDate, filters.endDate);
    const category: StudyCategory = (filters.category as StudyCategory) || "all";

    const paymentMatch = {
      status: "paid",
      paymentDate: { $gte: start, $lte: end },
    };

    const baseStudyMatch: any = {
      createdAt: { $gte: start, $lte: end },
    };
    if (category !== "all") baseStudyMatch.category = category;

    const previousDays = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime() + 1) / (1000 * 60 * 60 * 24))
    );
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - previousDays * 24 * 60 * 60 * 1000 + 1);

    const [
      revenueAgg,
      prevRevenueAgg,
      activeUsersCurrent,
      activeUsersPrev,
      completedLessonsCount,
      studyDurationAgg,
      topLessonsRaw,
      providerRevenueAgg,
      planRevenueAgg,
      categoryStatsAgg,
    ] = await Promise.all([
      Payment.aggregate([
        { $match: paymentMatch },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.aggregate([
        { $match: { ...paymentMatch, paymentDate: { $gte: prevStart, $lte: prevEnd } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      StudyHistory.distinct("userId", baseStudyMatch),
      StudyHistory.distinct("userId", {
        ...baseStudyMatch,
        createdAt: { $gte: prevStart, $lte: prevEnd },
      }),
      StudyHistory.countDocuments({ ...baseStudyMatch, status: "passed" }),
      StudyHistory.aggregate([
        { $match: baseStudyMatch },
        { $group: { _id: null, total: { $sum: "$duration" } } },
      ]),
      StudyHistory.aggregate([
        { $match: baseStudyMatch },
        {
          $group: {
            _id: { category: "$category", lessonId: "$lessonId" },
            attempts: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ["$status", "passed"] }, 1, 0] } },
            avgProgress: { $avg: "$progress" },
          },
        },
        { $sort: { attempts: -1 } },
        { $limit: 8 },
      ]),
      Payment.aggregate([
        { $match: paymentMatch },
        { $group: { _id: "$provider", users: { $addToSet: "$userId" }, revenue: { $sum: "$amount" } } },
        { $project: { _id: 1, revenue: 1, users: { $size: "$users" } } },
        { $sort: { revenue: -1 } },
      ]),
      Payment.aggregate([
        { $match: paymentMatch },
        {
          $group: {
            _id: "$planId",
            revenue: { $sum: "$amount" },
            paidCount: { $sum: 1 },
            totalDiscount: { $sum: { $ifNull: ["$discountAmount", 0] } },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 8 },
      ]),
      StudyHistory.aggregate([
        { $match: baseStudyMatch },
        {
          $group: {
            _id: "$category",
            attempts: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ["$status", "passed"] }, 1, 0] } },
            avgProgress: { $avg: "$progress" },
            totalStudyTime: { $sum: "$duration" },
          },
        },
        { $sort: { attempts: -1 } },
      ]),
    ]);

    const currentRevenue = Math.round(revenueAgg[0]?.total || 0);
    const previousRevenue = Math.round(prevRevenueAgg[0]?.total || 0);
    const revenueGrowth = previousRevenue > 0
      ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
      : 0;

    const activeUsersCurrentCount = activeUsersCurrent.length;
    const activeUsersPrevCount = activeUsersPrev.length;
    const activeUserGrowth = activeUsersPrevCount > 0
      ? Math.round(((activeUsersCurrentCount - activeUsersPrevCount) / activeUsersPrevCount) * 100)
      : 0;

    const totalStudySeconds = Math.round(studyDurationAgg[0]?.total || 0);
    const totalStudyHours = Math.round((totalStudySeconds / 3600) * 10) / 10;

    const lessonIdsByCategory = new Map<Exclude<StudyCategory, "all">, mongoose.Types.ObjectId[]>();
    for (const item of topLessonsRaw) {
      const c = String(item?._id?.category || "") as Exclude<StudyCategory, "all">;
      const lessonId = item?._id?.lessonId as mongoose.Types.ObjectId;
      if (!c || !lessonId) continue;
      if (!lessonIdsByCategory.has(c)) lessonIdsByCategory.set(c, []);
      lessonIdsByCategory.get(c)!.push(lessonId);
    }

    const titleMaps = new Map<string, Map<string, string>>();
    await Promise.all(
      Array.from(lessonIdsByCategory.entries()).map(async ([c, ids]) => {
        const map = await this.getLessonTitleMapByCategory(c, ids);
        titleMaps.set(c, map);
      })
    );

    const topLessons = topLessonsRaw.map((item: any) => {
      const c = String(item?._id?.category || "");
      const lessonId = String(item?._id?.lessonId || "");
      const attempts = Number(item?.attempts || 0);
      const completed = Number(item?.completed || 0);
      const completionRate = attempts > 0 ? Math.round((completed / attempts) * 100) : 0;
      const avgProgress = Math.round(Number(item?.avgProgress || 0));
      const lessonTitle = titleMaps.get(c)?.get(lessonId) || "Bài học";

      return {
        lessonId,
        title: lessonTitle,
        category: CATEGORY_LABELS[c] || c,
        attempts,
        completionRate,
        avgProgress,
      };
    });

    const planIds = planRevenueAgg
      .map((x: any) => x?._id)
      .filter(Boolean) as mongoose.Types.ObjectId[];
    const plans = await Plan.find({ _id: { $in: planIds } }).select("_id name").lean();
    const planNameMap = new Map(plans.map((p: any) => [String(p._id), String(p.name || "Gói")]));

    const revenueByPlan = planRevenueAgg.map((x: any) => ({
      planId: String(x?._id || ""),
      planName: planNameMap.get(String(x?._id || "")) || "Gói không xác định",
      revenue: Math.round(Number(x?.revenue || 0)),
      paidCount: Number(x?.paidCount || 0),
      totalDiscount: Math.round(Number(x?.totalDiscount || 0)),
    }));

    const providerTotalRevenue = providerRevenueAgg.reduce((sum: number, p: any) => sum + Number(p?.revenue || 0), 0);
    const revenueByProvider = providerRevenueAgg.map((x: any) => {
      const revenue = Math.round(Number(x?.revenue || 0));
      const share = providerTotalRevenue > 0 ? Math.round((revenue / providerTotalRevenue) * 1000) / 10 : 0;
      return {
        provider: String(x?._id || "unknown"),
        users: Number(x?.users || 0),
        revenue,
        share,
      };
    });

    const categoryStats = categoryStatsAgg.map((x: any) => {
      const attempts = Number(x?.attempts || 0);
      const completed = Number(x?.completed || 0);
      return {
        category: CATEGORY_LABELS[String(x?._id || "")] || String(x?._id || ""),
        attempts,
        completed,
        completionRate: attempts > 0 ? Math.round((completed / attempts) * 100) : 0,
        avgProgress: Math.round(Number(x?.avgProgress || 0)),
        studyHours: Math.round(((Number(x?.totalStudyTime || 0) / 3600) * 10)) / 10,
      };
    });

    return {
      filters: {
        startDate: start,
        endDate: end,
        category,
      },
      kpis: {
        revenue: currentRevenue,
        revenueGrowth,
        activeUsers: activeUsersCurrentCount,
        activeUsersGrowth: activeUserGrowth,
        completedLessons: completedLessonsCount,
        studyHours: totalStudyHours,
      },
      topLessons,
      revenueByProvider,
      revenueByPlan,
      categoryStats,
    };
  }
}

