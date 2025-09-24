import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface AttemptResult {
  problemId: string;
  userAnswer: string;
  isCorrect: boolean;
  hintsUsed: number;
  timeSpent: number;
  chatbotUsed: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, attempts } = body;

    if (!session_id) {
      return NextResponse.json(
        { success: false, message: "세션 ID가 필요합니다." },
        { status: 400 }
      );
    }

    if (!attempts || !Array.isArray(attempts)) {
      return NextResponse.json(
        { success: false, message: "시도 데이터가 필요합니다." },
        { status: 400 }
      );
    }

    const userAnswersToInsert = attempts.map((attempt: AttemptResult) => ({
      session_id,
      problem_id: attempt.problemId,
      user_answer: attempt.userAnswer,
      is_correct: attempt.isCorrect,
      hints_used: attempt.hintsUsed,
      time_spent: attempt.timeSpent,
      wrong_attempts: [],
      chatbot_used: attempt.chatbotUsed || false,
    }));

    const [sessionResult, answersResult] = await Promise.all([
      (supabase as any)
        .from("user_sessions")
        .update({
          end_time: new Date().toISOString(),
        })
        .eq("id", session_id),
      (supabase as any).from("user_answers").insert(userAnswersToInsert),
    ]);

    if (sessionResult.error) {
      console.error("Session update error:", sessionResult.error);
      return NextResponse.json(
        { success: false, message: "세션 완료 처리에 실패했습니다." },
        { status: 500 }
      );
    }

    if (answersResult.error) {
      console.error("Answers insert error:", answersResult.error);
      return NextResponse.json(
        { success: false, message: "답안 저장에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "세션이 완료되었습니다.",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
