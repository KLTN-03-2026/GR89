import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.AI_BASE_URL,
  apiKey: process.env.AI_API_KEY,
});

export class AIProvider {
  static async evaluateEssay<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
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

  static async chat(messages: OpenAI.Chat.ChatCompletionMessageParam[]): Promise<string> {
    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages,
    });
    return completion.choices[0].message?.content || "Lỗi khi chat với AI. Vui lòng thử lại sau.";
  }

  static async chatbotAi(messages: OpenAI.Chat.ChatCompletionMessageParam[]): Promise<string> {
    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages,
    });
    return completion.choices[0].message?.content || "Lỗi khi chat với AI. Vui lòng thử lại sau.";
  }
}
