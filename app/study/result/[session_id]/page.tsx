"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Lightbulb,
  RotateCcw,
  Home,
  Sparkles,
  Heart,
} from "lucide-react";

interface ResultData {
  user: {
    name: string;
    class_name: string;
  };
  summary: {
    totalProblems: number;
    correctCount: number;
    wrongCount: number;
    accuracy: number;
    totalTime: number;
  };
  results: Array<{
    problemNumber: number;
    question: string;
    userAnswer: string;
    correctAnswers: string[];
    isCorrect: boolean;
    hintsUsed: number;
    timeSpent: number;
  }>;
}

export default function StudyResult({
  params,
}: {
  params: { session_id: string };
}) {
  const router = useRouter();
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, []);

  const fetchResult = async () => {
    try {
      const response = await fetch(`/api/study/result/${params.session_id}`);
      const data = await response.json();

      if (data.success) {
        setResultData(data.data);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Fetch result error:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}분 ${secs}초`;
    }
    return `${secs}초`;
  };

  const getAccuracyMessage = (accuracy: number) => {
    if (accuracy >= 90)
      return { emoji: "🏆", message: "완벽해요!", color: "text-yellow-600" };
    if (accuracy >= 80)
      return {
        emoji: "🌟",
        message: "정말 잘했어요!",
        color: "text-green-600",
      };
    if (accuracy >= 70)
      return { emoji: "👏", message: "잘했어요!", color: "text-blue-600" };
    if (accuracy >= 60)
      return { emoji: "💪", message: "좋아요!", color: "text-purple-600" };
    return {
      emoji: "📚",
      message: "더 열심히 해봐요!",
      color: "text-orange-600",
    };
  };

  const handleRestart = () => {
    localStorage.removeItem("study_session");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📊</div>
          <div className="text-xl font-semibold text-gray-600">
            결과를 정리하고 있어요...
          </div>
        </div>
      </div>
    );
  }

  if (!resultData) {
    return null;
  }

  const accuracyInfo = getAccuracyMessage(resultData.summary.accuracy);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-yellow-300 animate-bounce">
          <Trophy size={32} />
        </div>
        <div className="absolute top-20 right-20 text-pink-300 animate-pulse">
          <Heart size={28} />
        </div>
        <div className="absolute bottom-20 left-20 text-blue-300 animate-bounce delay-200">
          <Star size={30} />
        </div>
        <div className="absolute bottom-40 right-1/4 text-purple-300 animate-pulse delay-300">
          <Sparkles size={26} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{accuracyInfo.emoji}</div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {resultData.user.name} 학생({resultData.user.class_name})의
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-purple-600 mb-4">
            🎉 학습 결과 리포트 🎉
          </h2>
          <div className={`text-2xl font-bold ${accuracyInfo.color}`}>
            {accuracyInfo.message}
          </div>
        </div>

        <Card className="mb-8 bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Trophy className="text-yellow-500" />
              전체 결과 요약
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center bg-blue-50 rounded-2xl p-4">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {resultData.summary.totalProblems}
                </div>
                <div className="text-sm font-semibold text-blue-800">
                  총 문제 수
                </div>
              </div>

              <div className="text-center bg-green-50 rounded-2xl p-4">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {resultData.summary.correctCount}
                </div>
                <div className="text-sm font-semibold text-green-800">
                  정답 개수
                </div>
              </div>

              <div className="text-center bg-red-50 rounded-2xl p-4">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {resultData.summary.wrongCount}
                </div>
                <div className="text-sm font-semibold text-red-800">
                  틀린 개수
                </div>
              </div>

              <div className="text-center bg-purple-50 rounded-2xl p-4">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {resultData.summary.accuracy}%
                </div>
                <div className="text-sm font-semibold text-purple-800">
                  정답률
                </div>
              </div>
            </div>

            <div className="mt-6 text-center bg-orange-50 rounded-2xl p-4">
              <div className="flex items-center justify-center gap-2 text-orange-600">
                <Clock size={20} />
                <span className="text-lg font-semibold">
                  총 풀이 시간: {formatTime(resultData.summary.totalTime)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Star className="text-yellow-500" />
              문제별 상세 결과
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resultData.results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-2xl border-2 ${
                    result.isCorrect
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className="text-lg px-3 py-1 bg-white/80"
                      >
                        문제 {result.problemNumber}
                      </Badge>
                      {result.isCorrect ? (
                        <CheckCircle className="text-green-600" size={24} />
                      ) : (
                        <XCircle className="text-red-600" size={24} />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {result.hintsUsed > 0 && (
                        <div className="flex items-center gap-1">
                          <Lightbulb size={16} />
                          힌트 {result.hintsUsed}개
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        {formatTime(result.timeSpent)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-semibold text-gray-800">
                      📝 {result.question}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-600 mb-1">
                          내가 쓴 답:
                        </div>
                        <div
                          className={`font-bold ${
                            result.isCorrect ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {result.userAnswer}
                        </div>
                      </div>

                      {!result.isCorrect && (
                        <div>
                          <div className="text-sm font-semibold text-gray-600 mb-1">
                            정답:
                          </div>
                          <div className="font-bold text-green-600">
                            {result.correctAnswers.join(", ")}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            size="lg"
            className="px-8 py-6 text-xl font-bold border-2 rounded-2xl shadow-xl hover:bg-gray-50"
          >
            <Home size={24} className="mr-3" />
            처음으로 🏠
          </Button>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-block bg-white/80 rounded-2xl px-6 py-4 shadow-lg">
            <div className="text-lg font-semibold text-gray-700 mb-2">
              🌟 수고했어요! 🌟
            </div>
            <div className="text-gray-600">
              계속 열심히 하면 더욱 발전할 거예요!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
