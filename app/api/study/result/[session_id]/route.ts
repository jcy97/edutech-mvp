import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface User {
  name: string;
  class_name: string;
}

interface Session {
  id: string;
  start_time: string;
  end_time: string;
  total_problems: number;
  users: User;
}

interface Problem {
  question: string;
  correct_answers: string[];
}

interface Answer {
  problem_id: string;
  user_answer: string;
  is_correct: boolean;
  hints_used: number;
  time_spent: number;
  created_at: string;
  problems: Problem;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { session_id: string } }
) {
  try {
    const { session_id } = params;

    const [sessionResult, answersResult] = await Promise.all([
      supabase
        .from("user_sessions")
        .select(
          `
          *,
          users (name, class_name)
        `
        )
        .eq("id", session_id)
        .single(),
      supabase
        .from("user_answers")
        .select(
          `
          *,
          problems (question, correct_answers)
        `
        )
        .eq("session_id", session_id)
        .order("created_at", { ascending: true }),
    ]);

    if (sessionResult.error) {
      console.error("Session fetch error:", sessionResult.error);
      return NextResponse.json(
        { success: false, message: "세션 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (answersResult.error) {
      console.error("Answers fetch error:", answersResult.error);
      return NextResponse.json(
        { success: false, message: "답안 정보를 찾을 수 없습니다." },
        { status: 500 }
      );
    }

    const session = sessionResult.data as Session;
    const answers = answersResult.data as Answer[];

    const problemGroups = answers.reduce(
      (groups: Record<string, Answer[]>, answer: Answer) => {
        const problemId = answer.problem_id;
        if (!groups[problemId]) {
          groups[problemId] = [];
        }
        groups[problemId].push(answer);
        return groups;
      },
      {}
    );

    const finalResults = Object.entries(problemGroups).map(
      ([problemId, attempts], index) => {
        const sortedAttempts = attempts.sort(
          (a: Answer, b: Answer) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        const firstAttempt = sortedAttempts[0];
        const lastAttempt = sortedAttempts[sortedAttempts.length - 1];

        const totalTime = attempts.reduce(
          (sum: number, attempt: Answer) => sum + (attempt.time_spent || 0),
          0
        );

        const wrongAttempts = attempts.filter((attempt) => !attempt.is_correct);
        const maxHintsUsed = Math.max(
          ...attempts.map((attempt) => attempt.hints_used || 0)
        );

        return {
          problemNumber: index + 1,
          question: firstAttempt.problems.question,
          userAnswer: lastAttempt.user_answer,
          correctAnswers: firstAttempt.problems.correct_answers,
          isCorrect: lastAttempt.is_correct,
          hintsUsed: maxHintsUsed,
          timeSpent: totalTime,
          totalAttempts: attempts.length,
          wrongAttempts: wrongAttempts.length,
        };
      }
    );

    const totalTime = finalResults.reduce(
      (sum, result) => sum + result.timeSpent,
      0
    );
    const correctCount = finalResults.filter(
      (result) => result.isCorrect
    ).length;
    const wrongCount = finalResults.filter(
      (result) => !result.isCorrect
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        user: {
          name: session.users.name,
          class_name: session.users.class_name,
        },
        session: {
          id: session.id,
          start_time: session.start_time,
          end_time: session.end_time,
          total_problems: session.total_problems,
        },
        summary: {
          totalProblems: finalResults.length,
          correctCount,
          wrongCount,
          accuracy:
            finalResults.length > 0
              ? Math.round((correctCount / finalResults.length) * 100)
              : 0,
          totalTime,
        },
        results: finalResults,
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
