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
import { UserProgress } from '../models/userProgress.model'
import { StudyHistory } from '../models/studyHistory.model'

export class AdminDashboardService {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Lấy tổng quan thống kê hệ thống cho Dashboard
  static async getOverview() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

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
      UserProgress.countDocuments({ category: 'reading', isCompleted: true }),
      UserProgress.countDocuments({ category: 'ipa', isCompleted: true }),
      UserProgress.countDocuments({ category: 'grammar', isCompleted: true }),
      UserProgress.countDocuments({ category: 'listening', isCompleted: true }),
      UserProgress.countDocuments({ category: 'speaking', isCompleted: true }),
      UserProgress.countDocuments({ category: 'writing', isCompleted: true }),
      UserProgress.countDocuments({ category: 'vocabulary', isCompleted: true })
    ]);

    const totalRevenueAmount = totalRevenue[0]?.total || 0;
    const lastMonthRevenueAmount = lastMonthRevenue[0]?.total || 0;

    const growth = {
      users: lastMonthUsers > 0 ? Math.round(((totalUsers - lastMonthUsers) / lastMonthUsers) * 100) : 0,
      revenue: lastMonthRevenueAmount > 0 ? Math.round(((totalRevenueAmount - lastMonthRevenueAmount) / lastMonthRevenueAmount) * 100) : 0,
    };

    const newUsers = await User.find({ role: { $in: ["user", "content"] } })
      .select("fullName email role createdAt isActive")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentMedia = await Media.find()
      .select("url type size createdAt format")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Lấy các hoạt động thực tế gần đây
    const [recentPayments, recentIpa, recentReading] = await Promise.all([
      Payment.find({ status: "paid" }).populate("userId", "fullName").sort({ paymentDate: -1 }).limit(2).lean(),
      Ipa.find().sort({ createdAt: -1 }).limit(2).lean(),
      Reading.find().sort({ createdAt: -1 }).limit(2).lean(),
    ]);

    const recentActivities = [
      ...recentPayments.map((p: any) => ({
        type: "payment",
        title: `Thanh toán mới từ ${p.userId?.fullName || 'Người dùng'}`,
        description: `Gói nâng cấp: ${p.amount.toLocaleString()} VND`,
        createdAt: p.paymentDate || p.createdAt
      })),
      ...recentIpa.map(i => ({
        type: "lesson",
        title: `Bài học IPA mới: ${i.sound}`,
        description: "Vừa được thêm vào hệ thống",
        createdAt: (i as any).createdAt
      })),
      ...recentReading.map(r => ({
        type: "lesson",
        title: `Bài đọc mới: ${r.title}`,
        description: "Vừa được xuất bản",
        createdAt: (r as any).createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalCompletedLessons = completedReading + completedIpa + completedGrammar + completedListening + completedSpeaking + completedWriting + completedVocabulary;
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

