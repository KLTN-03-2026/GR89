import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "./CatchAsyncError";
import { VocabularyTopic } from "../models/vocabularyTopic.model";
import { GrammarTopic } from "../models/grammarTopic.model";
import { Reading } from "../models/reading.model";
import { Listening } from "../models/listening.model";
import { Speaking } from "../models/speaking.model";
import { writingModel } from "../models/writing.model";
import { UserInfo } from "../services/auth.service";
import { Entertainment } from "../models/entertainment.model";
import { Ipa } from "../models/ipa.model";
import { StudyHistory } from "../models/studyHistory.model";

// MIDDLEWARE PHÂN QUYỀN
export const checkUnlockContentUser = (contentType: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'speaking' | 'writing' | 'ipa', paramName: string = 'id') => {
  return CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const contentId = req.params[paramName]
    if (!req.user) return next(new ErrorHandler('Vui lòng đăng nhập', 401))

    //Kiếm tra role
    if (req.user.role !== 'user') return next(new ErrorHandler('Bạn không có quyền truy cập', 403))

    if (!contentType || !contentId) return next(new ErrorHandler('Nội dung không tồn tại', 400))

    // Mapping model để kiểm tra isActive của content gốc
    const modelMap: any = {
      vocabulary: VocabularyTopic,
      grammar: GrammarTopic,
      reading: Reading,
      listening: Listening,
      speaking: Speaking,
      writing: writingModel,
      ipa: Ipa
    }

    const ContentModel = modelMap[contentType]
    if (ContentModel) {
      const content = await ContentModel.findById(contentId)
      if (!content) return next(new ErrorHandler('Nội dung không tồn tại', 404))
      if (content.isActive === false) return next(new ErrorHandler('Nội dung này hiện đã bị khóa', 403))
    }

    // Với hệ thống mới, ta cho phép truy cập nếu không phải VIP hoặc đã có VIP
    // Các bài học sẽ được mở khóa dựa trên lộ trình (Roadmap) hoặc mặc định mở hết nếu không VIP
    next();
  })
}

export const checkVipContentUser = (contentType: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'speaking' | 'writing' | 'entertainment' | 'ipa' | 'chatbotAI', paramName: string = 'id') => {
  return CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    let contentId: string | undefined
    const user = req.user as UserInfo
    if (!user) return next(new ErrorHandler('Vui lòng đăng nhập', 401))

    //Kiếm tra role
    if (user.role !== 'user') return next(new ErrorHandler('Bạn không có quyền truy cập', 403))
    if (!contentType) return next(new ErrorHandler('Nội dung không tồn tại', 400))

    if (contentType !== 'chatbotAI') {
      contentId = String(req.params[paramName])
      if (!contentId) return next(new ErrorHandler('Nội dung không tồn tại', 400))
    }
    else {
      if (!user.isVip) return next(new ErrorHandler('Bạn cần nâng cấp tài khoản để sử dụng nội dung này', 403))
    }

    //Kiểm tra vip
    switch (contentType) {
      case 'vocabulary':
        const vocabularyTopic = await VocabularyTopic.findById(contentId)
        if (!vocabularyTopic) return next(new ErrorHandler('Bài học từ vựng không tồn tại', 404))
        if (vocabularyTopic.isVipRequired && !user.isVip) return next(new ErrorHandler('Bạn cần nâng cấp tài khoản để sử dụng nội dung này', 403))
        break

      case 'grammar':
        const grammarTopic = await GrammarTopic.findById(contentId)
        if (!grammarTopic) return next(new ErrorHandler('Chủ đề ngữ pháp không tồn tại', 404))
        if (grammarTopic.isVipRequired && !user.isVip) return next(new ErrorHandler('Bạn cần nâng cấp tài khoản để sử dụng nội dung này', 403))
        break

      case 'reading':
        const reading = await Reading.findById(contentId)
        if (!reading) return next(new ErrorHandler('Bài đọc không tồn tại', 404))
        if (reading.isVipRequired && !user.isVip) return next(new ErrorHandler('Bạn cần nâng cấp tài khoản để sử dụng nội dung này', 403))
        break

      case 'listening':
        const listening = await Listening.findById(contentId)
        if (!listening) return next(new ErrorHandler('Bài nghe không tồn tại', 404))
        if (listening.isVipRequired && !user.isVip) return next(new ErrorHandler('Bạn cần nâng cấp tài khoản để sử dụng nội dung này', 403))
        break

      case 'speaking':
        const speaking = await Speaking.findById(contentId)
        if (!speaking) return next(new ErrorHandler('Bài nói không tồn tại', 404))
        if (speaking.isVipRequired && !user.isVip) return next(new ErrorHandler('Bạn cần nâng cấp tài khoản để sử dụng nội dung này', 403))
        break

      case 'writing':
        const writing = await writingModel.findById(contentId)
        if (!writing) return next(new ErrorHandler('Bài viết không tồn tại', 404))
        if (writing.isVipRequired && !user.isVip) return next(new ErrorHandler('Bạn cần nâng cấp tài khoản để sử dụng nội dung này', 403))
        break

      case 'entertainment':
        const entertainment = await Entertainment.findById(contentId)
        if (!entertainment) return next(new ErrorHandler('Nội dung giải trí không tồn tại', 404))
        if (entertainment.isVipRequired && !user.isVip) return next(new ErrorHandler('Bạn cần nâng cấp tài khoản để sử dụng nội dung này', 403))
        break

      case 'ipa':
        const ipa = await Ipa.findById(contentId)
        if (!ipa) return next(new ErrorHandler('Nội dung IPA không tồn tại', 404))
        if (ipa.isVipRequired && !user.isVip) return next(new ErrorHandler('Bạn cần nâng cấp tài khoản để sử dụng nội dung này', 403))
        break
    }

    next(); // ⚠️ QUAN TRỌNG: Thêm next() ở đây
  })
}