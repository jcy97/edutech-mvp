import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
import {
  CHATBOT_SYSTEM_PROMPT,
  createChatbotPrompt,
} from "@/lib/chatbot-config";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, problemId, problemText, userAnswer, hints } =
      await request.json();

    if (!message || !sessionId || !problemId || !problemText) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    const contextPrompt = createChatbotPrompt(problemText, userAnswer, hints);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: CHATBOT_SYSTEM_PROMPT },
        { role: "system", content: contextPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const botResponse =
      completion.choices[0]?.message?.content ||
      "미안해, 잘 이해하지 못했어. 다시 물어볼래? 😅";

    await (supabase as any).from("chatbot_conversations").insert({
      session_id: sessionId,
      problem_id: problemId,
      user_message: message,
      bot_response: botResponse,
      context: {
        problem_text: problemText,
        user_answer: userAnswer,
        hints: hints,
      },
    });

    return NextResponse.json({
      message: botResponse,
      success: true,
    });
  } catch (error) {
    console.error("Chatbot API error:", error);
    return NextResponse.json(
      { error: "챗봇 응답을 가져오는 중 오류가 발생했어요. 😅" },
      { status: 500 }
    );
  }
}
