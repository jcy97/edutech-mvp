import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface AdminSetting {
  setting_key: string;
  setting_value: string;
}

interface SettingUpdate {
  setting_key: string;
  setting_value: string;
  updated_at: string;
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("admin_settings")
      .select("setting_key, setting_value");

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { success: false, message: "데이터베이스 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    const settingsObj = (data as AdminSetting[]).reduce((acc, setting) => {
      const key = setting.setting_key;
      let value: any = setting.setting_value;

      if (key === "timer_minutes" || key === "total_problems") {
        value = parseInt(value) || 5;
      } else if (key === "chatbot_enabled") {
        value = value === "true";
      }

      acc[key] = value;
      return acc;
    }, {} as any);

    const settings = {
      service_name: settingsObj.service_name || "AI 수학 친구",
      admin_id: settingsObj.admin_id || "admin",
      admin_password: settingsObj.admin_password || "admin123",
      timer_minutes: settingsObj.timer_minutes || 5,
      total_problems: settingsObj.total_problems || 5,
      chatbot_enabled:
        settingsObj.chatbot_enabled !== undefined
          ? settingsObj.chatbot_enabled
          : true,
    };

    return NextResponse.json({
      success: true,
      data: settings,
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
    const {
      service_name,
      admin_id,
      admin_password,
      timer_minutes,
      total_problems,
      chatbot_enabled,
    } = body;

    if (!service_name?.trim() || !admin_id?.trim() || !admin_password?.trim()) {
      return NextResponse.json(
        { success: false, message: "필수 정보를 모두 입력해주세요." },
        { status: 400 }
      );
    }

    if (
      timer_minutes < 1 ||
      timer_minutes > 60 ||
      total_problems < 1 ||
      total_problems > 50
    ) {
      return NextResponse.json(
        { success: false, message: "입력 값의 범위를 확인해주세요." },
        { status: 400 }
      );
    }

    const settingsToUpdate = [
      { setting_key: "service_name", setting_value: service_name.trim() },
      { setting_key: "admin_id", setting_value: admin_id.trim() },
      { setting_key: "admin_password", setting_value: admin_password.trim() },
      { setting_key: "timer_minutes", setting_value: timer_minutes.toString() },
      {
        setting_key: "total_problems",
        setting_value: total_problems.toString(),
      },
      {
        setting_key: "chatbot_enabled",
        setting_value: chatbot_enabled.toString(),
      },
    ];

    for (const setting of settingsToUpdate) {
      const updateData: SettingUpdate = {
        setting_key: setting.setting_key,
        setting_value: setting.setting_value,
        updated_at: new Date().toISOString(),
      };

      const { error } = await (supabase as any)
        .from("admin_settings")
        .upsert(updateData, {
          onConflict: "setting_key",
        });

      if (error) {
        console.error(`Error updating ${setting.setting_key}:`, error);
        return NextResponse.json(
          { success: false, message: "설정 저장 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "설정이 성공적으로 저장되었습니다.",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
