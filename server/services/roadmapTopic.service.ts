import { StudyHistory } from "../models/studyHistory.model";
import mongoose from "mongoose";
import ErrorHandler from "../utils/ErrorHandler";
import { IRoadmapTopic, RoadmapTopic } from "../models/roadmapTopic.model";
import { Ipa } from "../models/ipa.model";
import { GrammarTopic } from "../models/grammarTopic.model";
import { VocabularyTopic } from "../models/vocabularyTopic.model";
import { Listening } from "../models/listening.model";
import { Speaking } from "../models/speaking.model";
import { Reading } from "../models/reading.model";
import { writingModel } from "../models/writing.model";

export interface ICreateRoadmapTopicData {
  title: string;
  description?: string;
  icon?: string;
  createdBy: string;
}

export interface IUpdateRoadmapTopicData {
  title?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  orderIndex?: number;
  updatedBy?: string;
}

export interface IReorderRoadmapTopicRequest {
  topicId: string;
  orderIndex: number;
}

export interface IGetLessonsByTypeData {
  _id: string;
  title: string;
  description?: string;
}

export interface Lesson {
  _id: string
  type: 'ipa' | 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'speaking' | 'writing' | 'review'
  title: string
  isUnlocked: boolean
  isCompleted: boolean
  progress: number
}

export interface IRoadmapTopicUserResult {
  _id: string
  title: string
  description: string
  icon: string
  status: 'in-progress' | 'locked' | 'completed'
  progress: number
  lessons: Lesson[]
}

export interface IRoadmapTopicListItem {
  _id: string;
  title: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  orderIndex: number;
  lessonsCount: number;
}

export interface IRoadmapTopicLessonItem {
  _id: string;
  lessonId: string;
  type: "grammar" | "vocabulary" | "ipa" | "listening" | "speaking" | "reading" | "writing" | "review";
  orderIndex: number;
  title: string;
  description?: string;
  isActive: boolean;
}

export interface IAddLessonToTopicData {
  type: "grammar" | "vocabulary" | "ipa" | "listening" | "speaking" | "reading" | "writing" | "review";
  lessonId: string;
  updatedBy: string;
}

export interface IRemoveLessonFromTopicData {
  lessonId: string;
  updatedBy: string;
}

export class RoadmapTopicService {
  /*============================ TIỆN ÍCH & THỐNG KÊ ============================*/

  // (ADMIN) Lấy danh sách bài học IPA chưa được sử dụng trong roadmap
  static async getIpaLessons(): Promise<IGetLessonsByTypeData[]> {
    const usedIds = await this.getUsedLessonIds("ipa");
    const ipas = await Ipa.find({ isActive: true, _id: { $nin: usedIds } });
    return ipas.map((ipa) => ({
      _id: ipa._id.toString(),
      title: ipa.sound,
      description: ipa.soundType,
    }));
  }

  // (ADMIN) Lấy danh sách bài học Ngữ pháp chưa được sử dụng trong roadmap
  static async getGrammarLessons(): Promise<IGetLessonsByTypeData[]> {
    const usedIds = await this.getUsedLessonIds("grammar");
    const grammars = await GrammarTopic.find({ isActive: true, _id: { $nin: usedIds } });
    return grammars.map((grammar) => ({
      _id: String(grammar._id),
      title: grammar.title,
      description: grammar.description,
    }));
  }

  // (ADMIN) Lấy danh sách bài học Từ vựng chưa được sử dụng trong roadmap
  static async getVocabularyLessons(): Promise<IGetLessonsByTypeData[]> {
    const usedIds = await this.getUsedLessonIds("vocabulary");
    const vocabularies = await VocabularyTopic.find({ isActive: true, _id: { $nin: usedIds } });
    return vocabularies.map((vocabulary) => ({
      _id: String(vocabulary._id),
      title: vocabulary.name,
      description: vocabulary.image ? vocabulary.image.toString() : undefined,
    }));
  }

  // (ADMIN) Lấy danh sách bài học Nghe chưa được sử dụng trong roadmap
  static async getListeningLessons(): Promise<IGetLessonsByTypeData[]> {
    const usedIds = await this.getUsedLessonIds("listening");
    const listenings = await Listening.find({ isActive: true, _id: { $nin: usedIds } });
    return listenings.map((listening) => ({
      _id: String(listening._id),
      title: listening.title,
      description: listening.description,
    }));
  }

  // (ADMIN) Lấy danh sách bài học Nói chưa được sử dụng trong roadmap
  static async getSpeakingLessons(): Promise<IGetLessonsByTypeData[]> {
    const usedIds = await this.getUsedLessonIds("speaking");
    const speakings = await Speaking.find({ isActive: true, _id: { $nin: usedIds } });
    return speakings.map((speaking) => ({
      _id: String(speaking._id),
      title: speaking.title,
      description: speaking.description,
    }));
  }

  // (ADMIN) Lấy danh sách bài học Đọc chưa được sử dụng trong roadmap
  static async getReadingLessons(): Promise<IGetLessonsByTypeData[]> {
    const usedIds = await this.getUsedLessonIds("reading");
    const readings = await Reading.find({ isActive: true, _id: { $nin: usedIds } });
    return readings.map((reading) => ({
      _id: String(reading._id),
      title: reading.title,
      description: reading.description,
    }));
  }

  // (ADMIN) Lấy danh sách bài học Viết chưa được sử dụng trong roadmap
  static async getWritingLessons(): Promise<IGetLessonsByTypeData[]> {
    const usedIds = await this.getUsedLessonIds("writing");
    const writings = await writingModel.find({ isActive: true, _id: { $nin: usedIds } });
    return writings.map((writing) => ({
      _id: String(writing._id),
      title: writing.title,
      description: writing.description,
    }));
  }

  /*============================ QUẢN TRỊ - THAO TÁC HÀNG LOẠT ============================*/

  // (ADMIN) Lấy danh sách tất cả chủ đề roadmap
  static async getAllTopics(): Promise<IRoadmapTopicListItem[]> {
    const topics = await RoadmapTopic.find()
      .sort({ orderIndex: 1, createdAt: 1 })
      .populate("createdBy", "fullName email")
      .populate("updatedBy", "fullName email");

    return topics.map((topic) => ({
      _id: String(topic._id),
      title: topic.title,
      description: topic.description,
      icon: topic.icon,
      isActive: topic.isActive,
      orderIndex: topic.orderIndex,
      lessonsCount: Array.isArray(topic.lessons) ? topic.lessons.length : 0,
    }));
  }

  // (ADMIN) Sắp xếp lại thứ tự các chủ đề roadmap
  static async reorderTopics(
    topics: IReorderRoadmapTopicRequest[],
    updatedBy: string
  ): Promise<IRoadmapTopic[]> {
    if (!Array.isArray(topics) || topics.length === 0) {
      throw new ErrorHandler("Danh sách sắp xếp chủ đề trống", 400);
    }

    const bulkOps = topics.map((item) => {
      if (!mongoose.Types.ObjectId.isValid(item.topicId)) {
        throw new ErrorHandler(`ID chủ đề không hợp lệ: ${item.topicId}`, 400);
      }

      return {
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(item.topicId) },
          update: {
            $set: {
              orderIndex: item.orderIndex,
              updatedBy: new mongoose.Types.ObjectId(updatedBy),
            },
          },
        },
      };
    });

    await RoadmapTopic.bulkWrite(bulkOps);

    return RoadmapTopic.find()
      .sort({ orderIndex: 1, createdAt: 1 })
      .populate("createdBy", "fullName email")
      .populate("updatedBy", "fullName email");
  }

  // (ADMIN) Sắp xếp lại thứ tự các bài học trong một chủ đề
  static async reorderLessons(
    topicId: string,
    lessons: { lessonId: string; orderIndex: number }[],
    updatedBy: string
  ): Promise<IRoadmapTopic> {
    if (!Array.isArray(lessons) || lessons.length === 0) {
      throw new ErrorHandler("Danh sách sắp xếp bài học trống", 400);
    }

    const topic = await RoadmapTopic.findById(topicId);
    if (!topic) {
      throw new ErrorHandler("Chủ đề roadmap không tồn tại", 404);
    }

    const orderMap = new Map(lessons.map((l) => [l.lessonId, l.orderIndex]));

    topic.lessons = topic.lessons.map((lesson) => {
      const newOrder = orderMap.get(String(lesson.lessonId));
      if (newOrder !== undefined) {
        lesson.orderIndex = newOrder;
      }
      return lesson;
    }).sort((a, b) => a.orderIndex - b.orderIndex) as any;

    topic.updatedBy = new mongoose.Types.ObjectId(updatedBy);
    await topic.save();

    return topic;
  }

  /*============================ NGƯỜI DÙNG & CHUNG ============================*/

  // (USER) Lấy danh sách lộ trình học tập cho người dùng
  static async getUserRoadmaps(userId: string): Promise<IRoadmapTopicUserResult[]> {
    // ── Bước 1: Lấy danh sách roadmap topics ──
    const topics = await RoadmapTopic.find({ isActive: true })
      .sort({ orderIndex: 1, createdAt: 1 });

    if (topics.length === 0) return [];

    // Thu thập lessonId theo type
    const idsByType: Record<string, string[]> = {};
    for (const topic of topics) {
      for (const lesson of topic.lessons) {
        if (!idsByType[lesson.type]) idsByType[lesson.type] = [];
        idsByType[lesson.type].push(String(lesson.lessonId));
      }
    }

    // Batch fetch scores + titles song song
    const userObjId = new mongoose.Types.ObjectId(userId);
    const [scoreMap, titleMap] = await Promise.all([
      this.fetchUserScores(userObjId, idsByType),
      this.fetchLessonTitles(idsByType),
    ]);

    // ── Bước 2 + 3: Dựng dữ liệu đầu ra, duyệt tuần tự để unlock ──
    const results: IRoadmapTopicUserResult[] = [];
    let prevTopicCompleted = true;

    for (const topic of topics) {
      const sorted = [...topic.lessons].sort((a, b) => a.orderIndex - b.orderIndex);
      const isTopicUnlocked = prevTopicCompleted;

      // Bước 2: khởi tạo tất cả lessons → false
      const lessons: Lesson[] = sorted.map((lesson) => ({
        _id: String(lesson.lessonId),
        type: lesson.type,
        title: titleMap.get(String(lesson.lessonId)) || `Bài học ${lesson.orderIndex}`,
        isUnlocked: false,
        isCompleted: false,
        progress: 0,
      }));

      // Bước 3: duyệt tuần tự, kiểm tra điểm
      let topicAllCompleted = true;

      if (isTopicUnlocked) {
        for (const lesson of lessons) {
          const score = scoreMap.get(lesson._id) ?? 0;
          lesson.progress = score;

          if (score >= this.PASS_SCORE) {
            // Đạt >= 80 → hoàn thành, mở khóa, tiếp tục bài tiếp theo
            lesson.isCompleted = true;
            lesson.isUnlocked = true;
          } else {
            // Chưa đạt → mở khóa bài này (bài hiện tại), dừng lặp
            lesson.isUnlocked = true;
            topicAllCompleted = false;
            break;
          }
        }
      } else {
        topicAllCompleted = false;
      }

      // Tính topic progress & status
      const totalScore = lessons.reduce((sum, l) => sum + l.progress, 0);
      const topicProgress = sorted.length > 0 ? Math.round(totalScore / sorted.length) : 0;

      let status: 'in-progress' | 'locked' | 'completed';
      if (!isTopicUnlocked) {
        status = 'locked';
      } else if (topicAllCompleted && sorted.length > 0) {
        status = 'completed';
      } else {
        status = 'in-progress';
      }

      results.push({
        _id: String(topic._id),
        title: topic.title,
        description: topic.description || '',
        icon: topic.icon || '',
        status,
        progress: topicProgress,
        lessons,
      });

      prevTopicCompleted = topicAllCompleted;
    }

    return results;
  }

  /*============================ QUẢN TRỊ - THAO TÁC ĐƠN LẺ ============================*/

  // (ADMIN) Lấy chi tiết chủ đề roadmap theo ID
  static async getTopicById(topicId: string): Promise<IRoadmapTopic> {
    const topic = await RoadmapTopic.findById(topicId)
      .populate("createdBy", "fullName email")
      .populate("updatedBy", "fullName email");

    if (!topic) {
      throw new ErrorHandler("Chủ đề roadmap không tồn tại", 404);
    }

    return topic;
  }

  // (ADMIN) Lấy danh sách các bài học trong một chủ đề
  static async getTopicLessons(topicId: string): Promise<IRoadmapTopicLessonItem[]> {
    const topic = await RoadmapTopic.findById(topicId).select("lessons");
    if (!topic) {
      throw new ErrorHandler("Chủ đề roadmap không tồn tại", 404);
    }

    const lessons = [...(topic.lessons || [])].sort((a, b) => a.orderIndex - b.orderIndex);
    const result: IRoadmapTopicLessonItem[] = [];

    for (const lesson of lessons) {
      const lessonId = String(lesson.lessonId);
      const type = lesson.type;

      let title = `Bài học ${lesson.orderIndex}`;
      let description = "";
      let isActive = true;

      if (type === "ipa") {

        const item = await Ipa.findById(lesson.lessonId).select("sound soundType isActive").lean();
        console.log(item)
        if (item) {
          title = item.sound || title;
          description = item.soundType || "";
          isActive = !!item.isActive;
        }
      } else if (type === "grammar") {
        const item = await GrammarTopic.findById(lesson.lessonId).select("title description isActive").lean();

        if (item) {
          title = item.title || title;
          description = item.description || "";
          isActive = !!item.isActive;
        }
      } else if (type === "vocabulary") {
        const item = await VocabularyTopic.findById(lesson.lessonId).select("name isActive").lean();
        if (item) {
          title = item.name || title;
          description = "";
          isActive = !!item.isActive;
        }
      } else if (type === "listening") {
        const item = await Listening.findById(lesson.lessonId).select("title description isActive").lean();
        if (item) {
          title = item.title || title;
          description = item.description || "";
          isActive = !!item.isActive;
        }
      } else if (type === "speaking") {
        const item = await Speaking.findById(lesson.lessonId).select("title description isActive").lean();
        if (item) {
          title = item.title || title;
          description = item.description || "";
          isActive = !!item.isActive;
        }
      } else if (type === "reading") {
        const item = await Reading.findById(lesson.lessonId).select("title description isActive").lean();
        if (item) {
          title = item.title || title;
          description = item.description || "";
          isActive = !!item.isActive;
        }
      } else if (type === "writing") {
        const item = await writingModel.findById(lesson.lessonId).select("title description isActive").lean();
        if (item) {
          title = item.title || title;
          description = item.description || "";
          isActive = !!item.isActive;
        }
      }

      result.push({
        _id: lessonId,
        lessonId,
        type,
        orderIndex: lesson.orderIndex,
        title,
        description,
        isActive,
      });
    }

    return result;
  }

  // (ADMIN) Tạo chủ đề roadmap mới
  static async createTopic(data: ICreateRoadmapTopicData): Promise<IRoadmapTopic> {
    const title = (data.title || "").trim();
    if (!title) {
      throw new ErrorHandler("Vui lòng nhập tiêu đề chủ đề", 400);
    }

    const maxOrder = await RoadmapTopic.findOne().sort({ orderIndex: -1 }).select("orderIndex").lean();
    const nextOrderIndex = maxOrder ? (maxOrder.orderIndex || 0) + 1 : 1;

    return RoadmapTopic.create({
      title,
      description: data.description?.trim() || "",
      icon: data.icon?.trim() || "📚",
      lessons: [],
      isActive: true,
      orderIndex: nextOrderIndex,
      createdBy: new mongoose.Types.ObjectId(data.createdBy),
    });
  }

  // (ADMIN) Cập nhật thông tin chủ đề roadmap
  static async updateTopic(topicId: string, data: IUpdateRoadmapTopicData): Promise<IRoadmapTopic> {
    const topic = await RoadmapTopic.findById(topicId);
    if (!topic) {
      throw new ErrorHandler("Chủ đề roadmap không tồn tại", 404);
    }

    if (typeof data.title === "string") {
      const title = data.title.trim();
      if (!title) {
        throw new ErrorHandler("Tiêu đề chủ đề không được để trống", 400);
      }
      topic.title = title;
    }

    if (typeof data.description === "string") {
      topic.description = data.description.trim();
    }

    if (typeof data.icon === "string") {
      topic.icon = data.icon.trim() || "📚";
    }

    if (typeof data.isActive === "boolean") {
      topic.isActive = data.isActive;
    }

    if (typeof data.orderIndex === "number") {
      topic.orderIndex = data.orderIndex;
    }

    if (data.updatedBy) {
      topic.updatedBy = new mongoose.Types.ObjectId(data.updatedBy);
    }

    await topic.save();
    return topic;
  }

  // (ADMIN) Xóa chủ đề roadmap
  static async deleteTopic(topicId: string): Promise<IRoadmapTopic> {
    const topic = await RoadmapTopic.findByIdAndDelete(topicId);
    if (!topic) {
      throw new ErrorHandler("Chủ đề roadmap không tồn tại", 404);
    }

    return topic;
  }

  // (ADMIN) Thêm bài học vào chủ đề roadmap
  static async addLessonToTopic(topicId: string, data: IAddLessonToTopicData): Promise<IRoadmapTopic> {
    if (!mongoose.Types.ObjectId.isValid(data.lessonId)) {
      throw new ErrorHandler("ID bài học không hợp lệ", 400);
    }

    const topic = await RoadmapTopic.findById(topicId);
    if (!topic) {
      throw new ErrorHandler("Chủ đề roadmap không tồn tại", 404);
    }

    const hasDuplicate = topic.lessons.some(
      (lesson) => lesson.type === data.type && lesson.lessonId.toString() === data.lessonId
    );

    if (hasDuplicate) {
      throw new ErrorHandler("Bài học này đã tồn tại trong chủ đề", 409);
    }

    const nextOrderIndex =
      topic.lessons.length > 0
        ? Math.max(...topic.lessons.map((lesson) => lesson.orderIndex)) + 1
        : 1;

    topic.lessons.push({
      type: data.type,
      lessonId: new mongoose.Types.ObjectId(data.lessonId),
      orderIndex: nextOrderIndex,
    });

    topic.updatedBy = new mongoose.Types.ObjectId(data.updatedBy);
    await topic.save();

    return topic;
  }

  // (ADMIN) Xóa bài học khỏi chủ đề roadmap
  static async removeLessonFromTopic(topicId: string, data: IRemoveLessonFromTopicData): Promise<IRoadmapTopic> {
    if (!mongoose.Types.ObjectId.isValid(data.lessonId)) {
      throw new ErrorHandler("ID bài học không hợp lệ", 400);
    }

    const topic = await RoadmapTopic.findById(topicId);
    if (!topic) {
      throw new ErrorHandler("Chủ đề roadmap không tồn tại", 404);
    }

    const lessonId = String(data.lessonId);
    const beforeCount = topic.lessons.length;

    topic.lessons = topic.lessons.filter((lesson) => String(lesson.lessonId) !== lessonId);

    if (topic.lessons.length === beforeCount) {
      throw new ErrorHandler("Không tìm thấy bài học trong chủ đề", 404);
    }

    topic.lessons = topic.lessons
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((lesson, index) => ({
        ...lesson,
        orderIndex: index + 1,
      })) as any;

    topic.updatedBy = new mongoose.Types.ObjectId(data.updatedBy);
    await topic.save();

    return topic;
  }

  private static async getUsedLessonIds(type: string): Promise<mongoose.Types.ObjectId[]> {
    const topics = await RoadmapTopic.find({ "lessons.type": type })
      .select("lessons")
      .lean();

    return topics.flatMap((topic) =>
      topic.lessons
        .filter((l) => l.type === type)
        .map((l) => l.lessonId)
    );
  }

  private static readonly PASS_SCORE = 80;

  // (PRIVATE) Lấy điểm tất cả các loại bài học cho người dùng theo category
  private static async fetchUserScores(
    userId: mongoose.Types.ObjectId,
    idsByCategory: Record<string, string[]>
  ): Promise<Map<string, number>> {
    const scoreMap = new Map<string, number>();
    const categories = Object.keys(idsByCategory);
    const allLessonIds = Object.values(idsByCategory).flat().map(id => new mongoose.Types.ObjectId(id));

    // Lấy bản ghi tốt nhất cho mỗi lessonId từ StudyHistory
    const progresses = await StudyHistory.aggregate([
      {
        $match: {
          userId,
          category: { $in: categories },
          lessonId: { $in: allLessonIds }
        }
      },
      { $sort: { progress: -1, createdAt: -1 } },
      { $group: { _id: "$lessonId", bestProgress: { $max: "$progress" } } }
    ]);

    progresses.forEach(p => {
      scoreMap.set(String(p._id), p.bestProgress || 0);
    });

    return scoreMap;
  }

  private static async fetchLessonTitles(
    idsByType: Record<string, string[]>
  ): Promise<Map<string, string>> {
    const titleMap = new Map<string, string>();

    const [ipas, grammars, vocabs, listenings, speakings, readings, writings] = await Promise.all([
      idsByType['ipa']?.length ? Ipa.find({ _id: { $in: idsByType['ipa'] } }).select("sound").lean() : [],
      idsByType['grammar']?.length ? GrammarTopic.find({ _id: { $in: idsByType['grammar'] } }).select("title").lean() : [],
      idsByType['vocabulary']?.length ? VocabularyTopic.find({ _id: { $in: idsByType['vocabulary'] } }).select("name").lean() : [],
      idsByType['listening']?.length ? Listening.find({ _id: { $in: idsByType['listening'] } }).select("title").lean() : [],
      idsByType['speaking']?.length ? Speaking.find({ _id: { $in: idsByType['speaking'] } }).select("title").lean() : [],
      idsByType['reading']?.length ? Reading.find({ _id: { $in: idsByType['reading'] } }).select("title").lean() : [],
      idsByType['writing']?.length ? writingModel.find({ _id: { $in: idsByType['writing'] } }).select("title").lean() : [],
    ]);

    for (const i of ipas) titleMap.set(String(i._id), (i as any).sound ?? '');
    for (const i of grammars) titleMap.set(String(i._id), (i as any).title ?? '');
    for (const i of vocabs) titleMap.set(String(i._id), (i as any).name ?? '');
    for (const i of listenings) titleMap.set(String(i._id), (i as any).title ?? '');
    for (const i of speakings) titleMap.set(String(i._id), (i as any).title ?? '');
    for (const i of readings) titleMap.set(String(i._id), (i as any).title ?? '');
    for (const i of writings) titleMap.set(String(i._id), (i as any).title ?? '');

    return titleMap;
  }
}

