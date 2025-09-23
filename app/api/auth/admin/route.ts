import { NextRequest, NextResponse } from "next/server";
import { dbUtils } from "@/lib/db-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminId, password } = body;

    console.log("Admin login attempt:", { adminId: adminId || "missing" });

    if (!adminId || !password) {
      return NextResponse.json(
        { success: false, message: "아이디와 비밀번호를 모두 입력해주세요." },
        { status: 400 }
      );
    }

    const isValidAdmin = await dbUtils.validateAdmin(
      adminId.trim(),
      password.trim()
    );

    console.log("Admin validation result:", isValidAdmin);

    if (isValidAdmin) {
      return NextResponse.json(
        { success: true, message: "로그인 성공" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "아이디 또는 비밀번호가 일치하지 않습니다.",
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Admin authentication error:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
