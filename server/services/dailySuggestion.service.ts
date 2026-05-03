import mongoose from 'mongoose';
import DailySuggestion, { IDailySuggestionItem } from '../models/dailySuggestion.model';
import { StudyHistory } from '../models/studyHistory.model';
import { ChatbotService } from './chatbot.service';
import { AIProvider } from '../providers/ai.provider';
import moment from 'moment-timezone';

export class DailySuggestionService {
  static async getDailySuggestion(userId: string) {
    const today = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');

    // 1. Kiểm tra user đã có suggest hôm nay chưa. nếu có trả về suggest
    let suggestion = await DailySuggestion.findOne({ user: userId, dateString: today });

    if (!suggestion) {
      // 2. Tạo suggest bằng cách gọi AI với prompt từ ChatbotService
      const systemPrompt = await ChatbotService.buildSuggestionPrompt(userId);
      const userPrompt = "Hãy gợi ý cho tôi 5-8 bài học tiếp theo dựa trên tiến trình và lịch sử học tập của tôi.";

      let validSuggestions = [];
      try {
        const aiResponse = await AIProvider.evaluateEssay<IDailySuggestionItem[]>(systemPrompt, userPrompt);

        // 3. Kiểm tra suggestions có đúng định dạng không
        if (!aiResponse || !Array.isArray(aiResponse)) {
          throw new Error("AI did not return valid suggestions array");
        }

        validSuggestions = aiResponse;
      } catch (error) {
        console.error('Lỗi khi gọi AI lấy suggestion:', error);
        // Fallback về data mặc định nếu API lỗi
        validSuggestions = [
          { title: "Tiếp tục học", description: "Từ vựng - Business English", href: "/study/vocabulary", icon: "PlayCircle", color: "from-green-500 to-emerald-500" },
          { title: "Luyện kỹ năng", description: "Luyện nghe - chép chính tả", href: "/skills/listening", icon: "Target", color: "from-blue-500 to-cyan-500" },
          { title: "Học ngữ pháp", description: "Ôn tập thì hiện tại đơn", href: "/study/grammar", icon: "BarChart3", color: "from-purple-500 to-pink-500" },
          { title: "Giải trí", description: "Phim & Video", href: "/entertainment/movies", icon: "Users", color: "from-orange-500 to-red-500" }
        ];
      }

      // 4. Lưu suggest mới
      suggestion = await DailySuggestion.create({
        user: userId,
        dateString: today,
        suggestions: validSuggestions
      });
    }

    // 5. Tính toán progress và isCompleted động từ StudyHistory của ngày hôm nay
    const startOfToday = moment().tz('Asia/Ho_Chi_Minh').startOf('day').toDate();
    const endOfToday = moment().tz('Asia/Ho_Chi_Minh').endOf('day').toDate();

    const enrichedSuggestions = await Promise.all(suggestion.suggestions.map(async (item) => {
      const itemObj = item.toObject() as IDailySuggestionItem;
      const parts = itemObj.href.split('/');
      const possibleId = parts[parts.length - 1];

      let maxProgress = 0;

      if (mongoose.Types.ObjectId.isValid(possibleId)) {
        // Tìm history cao nhất của bài học này trong hôm nay
        const history = await StudyHistory.findOne({
          userId: userId,
          lessonId: possibleId,
          createdAt: { $gte: startOfToday, $lte: endOfToday }
        }).sort({ progress: -1 });

        if (history) {
          maxProgress = history.progress || 0;
        }
      }

      return {
        ...itemObj,
        progress: maxProgress,
        isCompleted: maxProgress >= 80 // Hoàn thành nếu progress đạt 100%
      };
    }));

    return {
      _id: suggestion._id,
      user: suggestion.user,
      dateString: suggestion.dateString,
      suggestions: enrichedSuggestions,
      createdAt: suggestion.createdAt,
      updatedAt: suggestion.updatedAt
    };
  }
}
