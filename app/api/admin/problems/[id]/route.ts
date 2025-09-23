import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface Problem {
  id: string;
  question: string;
  correct_answers: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Hint {
  id: string;
  problem_id: string;
  hint_text: string;
  order_index: number;
  created_at: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const [problemResult, hintsResult] = await Promise.all([
      supabase.from("problems").select("*").eq("id", id).single(),
      supabase
        .from("hints")
        .select("*")
        .eq("problem_id", id)
        .order("order_index", { ascending: true }),
    ]);

    if (problemResult.error) {
      console.error("Problem query error:", problemResult.error);
      return NextResponse.json(
        { success: false, message: "문제를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (hintsResult.error) {
      console.error("Hints query error:", hintsResult.error);
      return NextResponse.json(
        { success: false, message: "힌트 조회 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        problem: problemResult.data as Problem,
        hints: hintsResult.data as Hint[],
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { question, correct_answers, hints, is_active } = body;

    if (!question?.trim() || !correct_answers || correct_answers.length === 0) {
      return NextResponse.json(
        { success: false, message: "문제 내용과 정답을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    const filteredAnswers = correct_answers.filter((answer: string) =>
      answer?.trim()
    );
    if (filteredAnswers.length === 0) {
      return NextResponse.json(
        { success: false, message: "최소 하나의 정답을 입력해주세요." },
        { status: 400 }
      );
    }

    const { error: problemError } = await (supabase as any)
      .from("problems")
      .update({
        question: question.trim(),
        correct_answers: filteredAnswers,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (problemError) {
      console.error("Problem update error:", problemError);
      return NextResponse.json(
        { success: false, message: "문제 수정에 실패했습니다." },
        { status: 500 }
      );
    }

    const { error: deleteError } = await (supabase as any)
      .from("hints")
      .delete()
      .eq("problem_id", id);

    if (deleteError) {
      console.error("Hints delete error:", deleteError);
      return NextResponse.json(
        { success: false, message: "기존 힌트 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    if (hints && hints.length > 0) {
      const filteredHints = hints
        .filter((hint: string) => hint?.trim())
        .slice(0, 3)
        .map((hint: string, index: number) => ({
          problem_id: id,
          hint_text: hint.trim(),
          order_index: index + 1,
        }));

      if (filteredHints.length > 0) {
        const { error: hintsError } = await (supabase as any)
          .from("hints")
          .insert(filteredHints);

        if (hintsError) {
          console.error("Hints insert error:", hintsError);
          return NextResponse.json(
            { success: false, message: "힌트 등록에 실패했습니다." },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "문제가 성공적으로 수정되었습니다.",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
