import OpenAI from 'openai'

const qwenApiKey = process.env.QWEN_API_KEY!
const qwenBaseUrl = process.env.QWEN_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'

export const qwen = new OpenAI({
  apiKey: qwenApiKey,
  baseURL: qwenBaseUrl,
})

export async function askQwen(prompt: string, systemPrompt: string = "You are a helpful assistant for a job platform in Mangystau, Kazakhstan.") {
  try {
    console.log(`[QWEN] Using model: ${process.env.QWEN_MODEL || 'MISSING'}`);
    const response = await qwen.chat.completions.create({
      model: process.env.QWEN_MODEL || "qwen-max", // qwen-max как более надежный фолбэк если нет в env
      messages: [
        { role: "system", content: systemPrompt || "You are a helpful assistant for a job platform in Mangystau, Kazakhstan." },
        { role: "user", content: prompt }
      ],
      // @ts-ignore - Отключаем "мышление", которое ломает обычные запросы в Dashscope
      extra_body: {
        "enable_thinking": false
      }
    })
    return response.choices[0].message.content
  } catch (error) {
    console.error('Error calling Qwen:', error)
    return null
  }
}
