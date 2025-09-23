"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSettings } from "@/lib/settings-context";

interface SettingsData {
  service_name: string;
  admin_id: string;
  admin_password: string;
  timer_minutes: number;
  total_problems: number;
  chatbot_enabled: boolean;
}

export default function AdminSettings() {
  const {
    settings: globalSettings,
    loading: globalLoading,
    refreshSettings,
  } = useSettings();
  const [settings, setSettings] = useState<SettingsData>({
    service_name: "",
    admin_id: "",
    admin_password: "",
    timer_minutes: 5,
    total_problems: 5,
    chatbot_enabled: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!globalLoading && globalSettings) {
      setSettings(globalSettings);
    }
  }, [globalSettings, globalLoading]);

  const handleSave = async () => {
    if (!settings.service_name.trim()) {
      toast.error("서비스 이름을 입력해주세요.");
      return;
    }
    if (!settings.admin_id.trim()) {
      toast.error("관리자 아이디를 입력해주세요.");
      return;
    }
    if (!settings.admin_password.trim()) {
      toast.error("관리자 비밀번호를 입력해주세요.");
      return;
    }
    if (settings.timer_minutes < 1 || settings.timer_minutes > 60) {
      toast.error("힌트 타이머는 1-60분 사이로 설정해주세요.");
      return;
    }
    if (settings.total_problems < 1 || settings.total_problems > 50) {
      toast.error("문제 수는 1-50개 사이로 설정해주세요.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();
      if (data.success) {
        await refreshSettings();
        toast.success("설정이 저장되었습니다.");
      } else {
        toast.error(data.message || "설정 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("설정 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    key: keyof SettingsData,
    value: string | number | boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (globalLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">일반설정</h1>
          </div>
        </header>
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
            <p className="text-gray-600">설정을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Settings size={28} />
            일반설정
          </h1>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>시스템 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="service_name">서비스 이름</Label>
                <Input
                  id="service_name"
                  value={settings.service_name}
                  onChange={(e) =>
                    handleInputChange("service_name", e.target.value)
                  }
                  placeholder="AI 수학 친구"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin_id">관리자 아이디</Label>
                <Input
                  id="admin_id"
                  value={settings.admin_id}
                  onChange={(e) =>
                    handleInputChange("admin_id", e.target.value)
                  }
                  placeholder="admin"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin_password">관리자 비밀번호</Label>
                <Input
                  id="admin_password"
                  type="password"
                  value={settings.admin_password}
                  onChange={(e) =>
                    handleInputChange("admin_password", e.target.value)
                  }
                  placeholder="비밀번호를 입력하세요"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timer_minutes">문제별 힌트 타이머 (분)</Label>
                <Input
                  id="timer_minutes"
                  type="number"
                  min="1"
                  max="60"
                  value={settings.timer_minutes}
                  onChange={(e) =>
                    handleInputChange(
                      "timer_minutes",
                      parseInt(e.target.value) || 5
                    )
                  }
                  placeholder="5"
                  className="h-12"
                />
                <p className="text-sm text-gray-500">
                  5분 후 자동으로 힌트가 공개됩니다
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_problems">랜덤 출제 문제 수</Label>
                <Input
                  id="total_problems"
                  type="number"
                  min="1"
                  max="50"
                  value={settings.total_problems}
                  onChange={(e) =>
                    handleInputChange(
                      "total_problems",
                      parseInt(e.target.value) || 5
                    )
                  }
                  placeholder="5"
                  className="h-12"
                />
                <p className="text-sm text-gray-500">
                  학생에게 출제할 문제 개수
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="chatbot_enabled">챗봇 기능</Label>
                    <p className="text-sm text-gray-500">
                      챗봇 상담 기능 사용 여부
                    </p>
                  </div>
                  <Switch
                    id="chatbot_enabled"
                    checked={settings.chatbot_enabled}
                    onCheckedChange={(checked) =>
                      handleInputChange("chatbot_enabled", checked)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <Button
                onClick={handleSave}
                disabled={saving}
                size="lg"
                className="w-full md:w-auto gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    설정 저장
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
