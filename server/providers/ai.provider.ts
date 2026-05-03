import OpenAI from "openai";
import { IDailySuggestion } from "../models/dailySuggestion.model";

// const openai = new OpenAI({
//   baseURL: process.env.AI_BASE_URL,
//   apiKey: process.env.AI_API_KEY,
// });

const openai = new OpenAI({
  baseURL: process.env.GEMINI_BASE_URL,
  apiKey: process.env.GEMINI_API_KEY,
});

export class AIProvider {
  static async evaluateEssay<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || "gemini-1.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0].message?.content || "{}";

    try {
      const parsed = JSON.parse(raw) as T
      return parsed;
    } catch (err) {
      throw new Error("AI did not return valid JSON");
    }
  }
  // model: "meta-llama/llama-4-scout-17b-16e-instruct",
  static async suggestionJson(prompt: string) {
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.AI_MODEL || "gemini-1.5-flash",
        messages: [
          { role: "system", content: prompt },
        ],
        response_format: { type: "json_object" },
      });
      return JSON.parse(completion.choices[0].message?.content || "{}");
    } catch (error: any) {
      console.error("AIProvider.chat Error:", error?.message || error);
      return "Hệ thống AI đang bận hoặc gặp sự cố. Vui lòng thử lại sau.";
    }
  }

  static async chatbotAi(messages: OpenAI.Chat.ChatCompletionMessageParam[]): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.AI_MODEL || "gemini-1.5-flash",
        messages,
      });
      return completion.choices[0].message?.content || "Lỗi khi chat với AI. Vui lòng thử lại sau.";
    } catch (error: any) {
      console.error("AIProvider.chatbotAi Error:", error?.message || error);
      return "Hệ thống AI đang bận hoặc gặp sự cố. Vui lòng thử lại sau.";
    }
  }
}