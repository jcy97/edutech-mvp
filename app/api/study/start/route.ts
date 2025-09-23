import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  name: string;
  class_name: string;
}

interface Problem {
  id: string;
  question: string;
  correct_answers: string[];
}

interface Hint {
  id: string;
  problem_id: string;
  hint_text: string;
  order_index: number;
}

interface Settings {
  total_problems: number;
  timer_minutes: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, class_name }: { name: string; class_name: string } = body;

    if (!name?.trim() || !class_name?.trim()) {
      return NextResponse.json(
        { success: false, message: "이름과 반을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    const { data: settingsData, error: settingsError } = await supabase
      .from("admin_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["total_problems", "timer_minutes"]);

    if (settingsError || !settingsData) {
      console.error("Settings fetch error:", settingsError);
      return NextResponse.json(
        { success: false, message: "설정 정보를 불러올 수 없습니다." },
        { status: 500 }
      );
    }

    const settingsObj = settingsData.reduce((acc: any, setting: any) => {
      const key = setting.setting_key;
      let value: any = setting.setting_value;

      if (key === "timer_minutes" || key === "total_problems") {
        value = parseInt(value) || 5;
      }

      acc[key] = value;
      return acc;
    }, {});

    const settings: Settings = {
      total_problems: settingsObj.total_problems || 5,
      timer_minutes: settingsObj.timer_minutes || 5,
    };

    const { data: userData, error: userError } = await (supabase as any)
      .from("users")
      .insert({
        name: name.trim(),
        class_name: class_name.trim(),
      })
      .select()
      .single();

    if (userError) {
      console.error("User creation error:", userError);
      return NextResponse.json(
        { success: false, message: "사용자 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    const { data: problems, error: problemsError } = await (
      supabase as any
    ).rpc("get_random_problems", { problem_count: settings.total_problems });

    if (problemsError || !problems || problems.length === 0) {
      console.error("Problems fetch error:", problemsError);
      return NextResponse.json(
        { success: false, message: "문제를 불러올 수 없습니다." },
        { status: 500 }
      );
    }

    const uniqueProblems = problems
      .filter(
        (problem: Problem, index: number, self: Problem[]) =>
          index === self.findIndex((p: Problem) => p.id === problem.id)
      )
      .slice(0, settings.total_problems);

    const problemIds = uniqueProblems.map((p: Problem) => p.id);
    const { data: hints, error: hintsError } = await supabase
      .from("hints")
      .select("*")
      .in("problem_id", problemIds)
      .order("problem_id")
      .order("order_index", { ascending: true });

    if (hintsError) {
      console.error("Hints fetch error:", hintsError);
      return NextResponse.json(
        { success: false, message: "힌트 정보를 불러올 수 없습니다." },
        { status: 500 }
      );
    }

    const { data: sessionData, error: sessionError } = await (supabase as any)
      .from("user_sessions")
      .insert({
        user_id: userData.id,
        total_problems: uniqueProblems.length,
      })
      .select()
      .single();

    if (sessionError) {
      console.error("Session creation error:", sessionError);
      return NextResponse.json(
        { success: false, message: "세션 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    const problemsWithHints = uniqueProblems.map((problem: Problem) => ({
      ...problem,
      hints: (hints as Hint[]).filter((hint) => hint.problem_id === problem.id),
    }));

    return NextResponse.json({
      success: true,
      data: {
        user: userData as User,
        session: sessionData,
        problems: problemsWithHints,
        settings,
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
