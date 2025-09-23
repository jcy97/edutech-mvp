import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface UserStatsParams {
  start_date: string;
  end_date: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: "시작일과 종료일이 필요합니다." },
        { status: 400 }
      );
    }

    const params: UserStatsParams = {
      start_date: startDate,
      end_date: endDate,
    };

    const { data, error } = await (supabase as any).rpc(
      "get_user_stats",
      params
    );

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { success: false, message: "데이터베이스 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
