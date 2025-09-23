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
  problem_id: string;
}

export async function GET() {
  try {
    const { data: problems, error: problemsError } = await supabase
      .from("problems")
      .select(
        `
        id,
        question,
        correct_answers,
        is_active,
        created_at,
        updated_at
       `
      )
      .order("created_at", { ascending: true });

    if (problemsError) {
      console.error("Problems query error:", problemsError);
      return NextResponse.json(
        { success: false, message: "문제 조회 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    const { data: hintsData, error: hintsError } = await supabase
      .from("hints")
      .select("problem_id");

    if (hintsError) {
      console.error("Hints count error:", hintsError);
      return NextResponse.json(
        { success: false, message: "힌트 개수 조회 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    const hintsCount = ((hintsData as Hint[]) || []).reduce(
      (acc: Record<string, number>, hint) => {
        acc[hint.problem_id] = (acc[hint.problem_id] || 0) + 1;
        return acc;
      },
      {}
    );

    const problemsWithCounts = ((problems as Problem[]) || []).map(
      (problem, index) => ({
        ...problem,
        no: index + 1,
        hints_count: hintsCount[problem.id] || 0,
        answers_count: problem.correct_answers?.length || 0,
      })
    );

    return NextResponse.json({
      success: true,
      data: problemsWithCounts,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, is_active }: { id: string; is_active: boolean } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "문제 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const { error } = await (supabase as any)
      .from("problems")
      .update({
        is_active: is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Update error:", error);
      return NextResponse.json(
        { success: false, message: "문제 상태 업데이트에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "문제 상태가 업데이트되었습니다.",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "문제 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("problems").delete().eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      return NextResponse.json(
        { success: false, message: "문제 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "문제가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const { data: problemData, error: problemError } = await (supabase as any)
      .from("problems")
      .insert({
        question: question.trim(),
        correct_answers: filteredAnswers,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();

    if (problemError) {
      console.error("Problem insert error:", problemError);
      return NextResponse.json(
        { success: false, message: "문제 등록에 실패했습니다." },
        { status: 500 }
      );
    }

    if (hints && hints.length > 0) {
      const filteredHints = hints
        .filter((hint: string) => hint?.trim())
        .slice(0, 3)
        .map((hint: string, index: number) => ({
          problem_id: problemData.id,
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
      message: "문제가 성공적으로 등록되었습니다.",
      data: { id: problemData.id },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
