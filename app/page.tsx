"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Settings, Sparkles, BookOpen, Heart, Star } from "lucide-react";
import { useSettings } from "@/lib/settings-context";
import Link from "next/link";

export default function Home() {
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const { settings, loading } = useSettings();

  const canStart = name.trim() !== "" && className.trim() !== "";

  const handleStart = async () => {
    if (canStart) {
      try {
        const response = await fetch("/api/study/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            class_name: className.trim(),
          }),
        });

        const data = await response.json();
        if (data.success) {
          localStorage.setItem("study_session", JSON.stringify(data.data));
          window.location.href = "/study";
        } else {
          alert("문제를 시작할 수 없습니다. 다시 시도해주세요.");
        }
      } catch (error) {
        console.error("Start error:", error);
        alert("오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-yellow-300 animate-pulse">
          <Star size={20} />
        </div>
        <div className="absolute top-20 right-20 text-pink-300 animate-bounce delay-100">
          <Heart size={16} />
        </div>
        <div className="absolute top-40 left-1/4 text-blue-300 animate-pulse delay-200">
          <Sparkles size={18} />
        </div>
        <div className="absolute bottom-40 right-1/4 text-purple-300 animate-bounce delay-300">
          <Star size={22} />
        </div>
        <div className="absolute bottom-20 left-20 text-green-300 animate-pulse delay-75">
          <BookOpen size={20} />
        </div>
        <div className="absolute top-1/3 right-10 text-orange-300 animate-bounce delay-200">
          <Sparkles size={16} />
        </div>
      </div>

      <div className="absolute top-4 right-4 md:top-6 md:right-6">
        <Link href="/admin">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-full"
          >
            <Settings size={20} />
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-6 pt-8 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-white">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <BookOpen className="text-white" size={24} />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">
              {settings.service_name}
            </h1>
            <div className="flex justify-center gap-1">
              {[1, 2, 3].map((i) => (
                <Sparkles
                  key={i}
                  className="text-yellow-200 animate-pulse"
                  size={16}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            <div className="text-center mb-8">
              <p className="text-gray-700 text-lg font-medium leading-relaxed">
                이름과 반을 입력하고 신나는
                <br />
                문제 풀기를 시작해볼까요?
              </p>
              <div className="mt-3 flex justify-center gap-1">
                {["🌟", "🎯", "🌟"].map((emoji, i) => (
                  <span
                    key={i}
                    className="text-xl animate-bounce"
                    style={{ animationDelay: `${i * 200}ms` }}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-gray-700 font-semibold text-base flex items-center gap-2"
                >
                  <span className="text-pink-500">✨</span>
                  이름
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                  className="h-12 text-base rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-purple-50/50 placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="class"
                  className="text-gray-700 font-semibold text-base flex items-center gap-2"
                >
                  <span className="text-blue-500">🏫</span>반
                </Label>
                <Input
                  id="class"
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="5반, 사랑반 등"
                  className="h-12 text-base rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 bg-blue-50/50 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleStart}
                disabled={!canStart}
                size="lg"
                className={`w-full h-14 text-lg font-bold rounded-xl transition-all duration-300 ${
                  canStart
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {canStart ? (
                  <span className="flex items-center gap-2">
                    <Sparkles size={20} />
                    문제 풀기 시작!
                    <Sparkles size={20} />
                  </span>
                ) : (
                  "정보를 모두 입력해주세요"
                )}
              </Button>

              {canStart && (
                <div className="mt-3 text-center">
                  <span className="text-sm text-gray-500 animate-pulse">
                    모든 준비가 끝났어요! 🚀
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
