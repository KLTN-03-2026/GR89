import { User } from '../models/user.model'
import { Reading } from '../models/reading.model'
import { Media } from '../models/media.model'
import { Ipa } from '../models/ipa.model'
import { GrammarTopic } from '../models/grammarTopic.model'
import { Listening } from '../models/listening.model'
import { Speaking } from '../models/speaking.model'
import { writingModel as Writing } from '../models/writing.model'
import { VocabularyTopic } from '../models/vocabularyTopic.model'
import { Entertainment } from '../models/entertainment.model'
import { Payment } from '../models/payment.model'
import { StudyHistory } from '../models/studyHistory.model'
import { AdminActivity } from '../models/adminActivity.model'

export class AdminDashboardService {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Lấy tổng quan thống kê hệ thống cho Dashboard
  static async getOverview() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalUsers,
      lastMonthUsers,
      totalRevenue,
      lastMonthRevenue,
      readingLessons,
      ipaLessons,
      grammarTopics,
      listeningLessons,
      speakingLessons,
      writingLessons,
      vocabularyTopics,
      entertainmentItems,
      uploadedVideos,
      uploadedImages,
      totalQuizAttempts,
      completedReading,
      completedIpa,
      completedGrammar,
      completedListening,
      completedSpeaking,
      completedWriting,
      completedVocabulary
    ] = await Promise.all([
      User.countDocuments({ role: { $in: ["user", "content"] } }),
      User.countDocuments({ role: { $in: ["user", "content"] }, createdAt: { $lt: startOfMonth, $gte: startOfLastMonth } }),
      Payment.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Payment.aggregate([{ $match: { status: "paid", paymentDate: { $lt: startOfMonth, $gte: startOfLastMonth } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Reading.countDocuments({ isActive: true }),
      Ipa.countDocuments({ isActive: true }),
      GrammarTopic.countDocuments({ isActive: true }),
      Listening.countDocuments({ isActive: true }),
      Speaking.countDocuments({ isActive: true }),
      Writing.countDocuments({ isActive: true }),
      VocabularyTopic.countDocuments({ isActive: true }),
      Entertainment.countDocuments({ status: true }),
      Media.countDocuments({ type: "video" }),
      Media.countDocuments({ type: "image" }),
      StudyHistory.countDocuments(),
      StudyHistory.distinct('lessonId', { category: 'reading', status: 'passed' }),
      StudyHistory.distinct('lessonId', { category: 'ipa', status: 'passed' }),
      StudyHistory.distinct('lessonId', { category: 'grammar', status: 'passed' }),
      StudyHistory.distinct('lessonId', { category: 'listening', status: 'passed' }),
      StudyHistory.distinct('lessonId', { category: 'speaking', status: 'passed' }),
      StudyHistory.distinct('lessonId', { category: 'writing', status: 'passed' }),
      StudyHistory.distinct('lessonId', { category: 'vocabulary', status: 'passed' })
    ]);

    const completedReadingCount = (completedReading as any).length;
    const completedIpaCount = (completedIpa as any).length;
    const completedGrammarCount = (completedGrammar as any).length;
    const completedListeningCount = (completedListening as any).length;
    const completedSpeakingCount = (completedSpeaking as any).length;
    const completedWritingCount = (completedWriting as any).length;
    const completedVocabularyCount = (completedVocabulary as any).length;

    const totalRevenueAmount = totalRevenue[0]?.total || 0;
    const lastMonthRevenueAmount = lastMonthRevenue[0]?.total || 0;

    const growth = {
      users: lastMonthUsers > 0 ? Math.round(((totalUsers - lastMonthUsers) / lastMonthUsers) * 100) : 0,
      revenue: lastMonthRevenueAmount > 0 ? Math.round(((totalRevenueAmount - lastMonthRevenueAmount) / lastMonthRevenueAmount) * 100) : 0,
    };

    const newUsers = await User.find({ role: { $in: ["user", "content"] } })
      .select("fullName email role createdAt isActive")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    const recentMedia = await Media.find()
      .select("url type size createdAt format")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Hoạt động gần đây lấy từ admin activity log
    const recentActivityLogs = await AdminActivity.find()
      .populate('adminId', 'fullName')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()

    const recentActivities = recentActivityLogs.map((activity: any) => {
      const actorName = activity.adminId?.fullName || 'Admin'
      const isLessonType = ['listening', 'entertainment', 'reading', 'grammar', 'vocabulary', 'ipa', 'speaking', 'writing'].includes(activity.resourceType)

      return {
        type: isLessonType ? 'lesson' : 'admin',
        title: `${actorName}: ${activity.description}`,
        description: `${activity.action} · ${activity.resourceType}`,
        createdAt: activity.createdAt
      }
    })

    const totalCompletedLessons = completedReadingCount + completedIpaCount + completedGrammarCount + completedListeningCount + completedSpeakingCount + completedWritingCount + completedVocabularyCount;
    const totalLessonsCount = readingLessons + ipaLessons + grammarTopics + listeningLessons + speakingLessons + writingLessons + vocabularyTopics;

    return {
      kpis: {
        totalUsers,
        totalRevenue: totalRevenueAmount,
        totalLessons: totalLessonsCount,
        totalCompletedLessons,
        uploadedVideos,
        uploadedImages,
        growth,
      },
      contentStats: {
        reading: readingLessons,
        ipa: ipaLessons,
        grammar: grammarTopics,
        listening: listeningLessons,
        speaking: speakingLessons,
        writing: writingLessons,
        vocabulary: vocabularyTopics,
        entertainment: entertainmentItems,
      },
      newUsers,
      recentActivities,
      recentMedia,
      totalQuizAttempts,
    };
  }

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/
}

