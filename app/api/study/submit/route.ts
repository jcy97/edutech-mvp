import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      session_id,
      problem_id,
      user_answer,
      hints_used,
      time_spent,
      wrong_attempts,
    } = body;

    if (!session_id || !problem_id || user_answer === undefined) {
      return NextResponse.json(
        { success: false, message: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    const { data: problemData, error: problemError } = await supabase
      .from("problems")
      .select("correct_answers")
      .eq("id", problem_id)
      .single();

    if (problemError) {
      console.error("Problem fetch error:", problemError);
      return NextResponse.json(
        { success: false, message: "문제 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const correctAnswers = problemData.correct_answers || [];
    const isCorrect = correctAnswers.some(
      (answer: string) =>
        answer.toLowerCase().trim() === user_answer.toLowerCase().trim()
    );

    const { error: insertError } = await (supabase as any)
      .from("user_answers")
      .insert({
        session_id,
        problem_id,
        user_answer: user_answer.trim(),
        is_correct: isCorrect,
        hints_used: hints_used || 0,
        time_spent: time_spent || 0,
        chatbot_used: false,
        wrong_attempts: wrong_attempts || [],
      });

    if (insertError) {
      console.error("Answer insert error:", insertError);
      return NextResponse.json(
        { success: false, message: "답안 저장에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        is_correct: isCorrect,
        correct_answers: correctAnswers,
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
