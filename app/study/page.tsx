"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MessageCircle,
  Lightbulb,
  Send,
  ArrowRight,
  Clock,
  Sparkles,
  Heart,
  Star,
} from "lucide-react";

interface Problem {
  id: string;
  question: string;
  correct_answers: string[];
  hints: Array<{
    id: string;
    hint_text: string;
    order_index: number;
  }>;
}

interface StudySession {
  user: {
    id: string;
    name: string;
    class_name: string;
  };
  session: {
    id: string;
  };
  problems: Problem[];
  settings: {
    total_problems: number;
    timer_minutes: number;
  };
}

export default function StudyPage() {
  const router = useRouter();
  const [session, setSession] = useState<StudySession | null>(null);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [currentResult, setCurrentResult] = useState<{
    isCorrect: boolean;
    correctAnswers: string[];
  } | null>(null);
  const [usedHints, setUsedHints] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{ type: "user" | "bot"; message: string }>
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [shouldShake, setShouldShake] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const hintAddedByTimer = useRef<boolean>(false);
  const [allAttempts, setAllAttempts] = useState<
    Array<{
      problemId: string;
      userAnswer: string;
      isCorrect: boolean;
      hintsUsed: number;
      timeSpent: number;
    }>
  >([]);

  useEffect(() => {
    const sessionData = localStorage.getItem("study_session");
    if (!sessionData) {
      router.push("/");
      return;
    }

    const parsedSession = JSON.parse(sessionData);
    setSession(parsedSession);
    setTimeLeft(parsedSession.settings.timer_minutes * 60);
  }, [router]);

  useEffect(() => {
    if (!session) return;

    startTimeRef.current = Date.now();
    hintAddedByTimer.current = false;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimerExpired();
          return session.settings.timer_minutes * 60;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = timer;
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentProblemIndex, session]);

  const handleTimerExpired = () => {
    if (!session || hintAddedByTimer.current) return;

    const currentProblem = session.problems[currentProblemIndex];
    if (usedHints < currentProblem.hints.length) {
      setUsedHints((prev) => prev + 1);
      hintAddedByTimer.current = true;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = () => {
    if (!session || !userAnswer.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const currentProblem = session.problems[currentProblemIndex];
    const correctAnswers = currentProblem.correct_answers;
    const isCorrect = correctAnswers.some(
      (answer: string) =>
        answer.toLowerCase().trim() === userAnswer.toLowerCase().trim()
    );

    setCurrentResult({ isCorrect, correctAnswers });
    setShowResult(true);

    if (!hasSubmitted) {
      setHasSubmitted(true);
    }

    const currentTime = Date.now();
    const timeSpent = Math.floor((currentTime - startTimeRef.current) / 1000);

    setAllAttempts((prev) => [
      ...prev,
      {
        problemId: currentProblem.id,
        userAnswer: userAnswer.trim(),
        isCorrect: isCorrect,
        hintsUsed: usedHints,
        timeSpent: timeSpent,
      },
    ]);

    if (!isCorrect) {
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 1000);

      setTimeout(() => setShowResult(false), 1500);
      setIsSubmitting(false);
    } else {
      setTimeout(() => {
        setShowResult(false);
        setIsSubmitting(false);

        const finalAttempt = {
          problemId: currentProblem.id,
          userAnswer: userAnswer.trim(),
          isCorrect: isCorrect,
          hintsUsed: usedHints,
          timeSpent: timeSpent,
        };

        handleNext(finalAttempt);
      }, 1500);
    }
  };

  const handleNext = (lastAttempt?: {
    problemId: string;
    userAnswer: string;
    isCorrect: boolean;
    hintsUsed: number;
    timeSpent: number;
  }) => {
    if (!session) return;

    if (currentProblemIndex < session.problems.length - 1) {
      setCurrentProblemIndex((prev) => prev + 1);
      setUserAnswer("");
      setHasSubmitted(false);
      setCurrentResult(null);
      setUsedHints(0);
      setTimeLeft(session.settings.timer_minutes * 60);
      setChatMessages([]);
      startTimeRef.current = Date.now();
    } else {
      completeSession(lastAttempt);
    }
  };

  const handleNextClick = () => {
    handleNext();
  };

  const completeSession = async (lastAttempt?: {
    problemId: string;
    userAnswer: string;
    isCorrect: boolean;
    hintsUsed: number;
    timeSpent: number;
  }) => {
    if (!session) return;

    let finalAttempts = [...allAttempts];
    if (lastAttempt) {
      finalAttempts.push(lastAttempt);
    }

    try {
      await fetch("/api/study/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: session.session.id,
          attempts: finalAttempts,
        }),
      });

      router.push(`/study/result/${session.session.id}`);
    } catch (error) {
      console.error("Complete session error:", error);
    }
  };

  const handleHintClick = () => {
    if (!session) return;

    const currentProblem = session.problems[currentProblemIndex];
    if (usedHints < currentProblem.hints.length) {
      setUsedHints((prev) => prev + 1);
    }
  };

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      { type: "user", message: chatInput },
      {
        type: "bot",
        message:
          "안녕! 나는 너의 수학 친구야! 지금은 준비중이지만 곧 도와줄게! 😊",
      },
    ]);
    setChatInput("");
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        로딩 중...
      </div>
    );
  }

  const currentProblem = session.problems[currentProblemIndex];
  const isLastProblem = currentProblemIndex === session.problems.length - 1;
  const canShowHint = usedHints < currentProblem.hints.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-yellow-300 animate-bounce">
          <Star size={24} />
        </div>
        <div className="absolute top-20 right-20 text-pink-300 animate-pulse">
          <Heart size={20} />
        </div>
        <div className="absolute bottom-20 left-20 text-blue-300 animate-bounce delay-200">
          <Sparkles size={22} />
        </div>
        <div className="absolute bottom-40 right-1/4 text-purple-300 animate-pulse delay-300">
          <Star size={18} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="text-2xl font-bold text-purple-700 bg-white/80 px-4 py-2 rounded-full shadow-lg">
            {currentProblemIndex + 1} / {session.problems.length}
          </div>

          <div className="flex items-center gap-2 text-xl font-bold text-orange-600 bg-white/80 px-4 py-2 rounded-full shadow-lg">
            <Clock size={20} />
            {formatTime(timeLeft)}
          </div>

          <Dialog open={chatOpen} onOpenChange={setChatOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className={`rounded-full w-16 h-16 bg-green-400 hover:bg-green-500 text-white border-0 shadow-xl ${
                  shouldShake ? "animate-bounce" : ""
                }`}
              >
                <MessageCircle size={24} />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageCircle className="text-green-500" />
                  수학 친구와 채팅하기
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="h-60 overflow-y-auto border rounded-lg p-4 space-y-2">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm">
                      궁금한 것이 있으면 언제든 물어봐! 🤗
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${
                          msg.type === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-2 rounded-lg text-sm ${
                            msg.type === "user"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    onKeyPress={(e) => e.key === "Enter" && handleChatSubmit()}
                  />
                  <Button onClick={handleChatSubmit} size="sm">
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-3xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 leading-relaxed mb-6">
                {currentProblem.question}
              </h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="text-lg font-semibold text-purple-600 whitespace-nowrap">
                  내 답:
                </div>
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="답을 입력해주세요"
                  className="h-20 text-center font-bold bg-purple-50 border-2 border-purple-200 focus:border-purple-400 placeholder:text-2xl"
                  style={{ fontSize: "2.25rem", lineHeight: "2.5rem" }}
                  onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  onClick={handleSubmit}
                  disabled={!userAnswer.trim() || isSubmitting}
                  size="lg"
                  className="px-8 py-6 text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-2xl"
                >
                  {isSubmitting ? "채점 중..." : "제출하기! ✨"}
                </Button>

                {hasSubmitted && (
                  <Button
                    onClick={handleNextClick}
                    size="lg"
                    className={`px-8 py-6 text-xl font-bold rounded-2xl ${
                      isLastProblem
                        ? "bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                        : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    }`}
                  >
                    {isLastProblem ? "결과 보기! 🎉" : "다음 문제로! 🚀"}
                    <ArrowRight size={20} className="ml-2" />
                  </Button>
                )}
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleHintClick}
                  variant="outline"
                  size="lg"
                  disabled={!canShowHint}
                  className="px-6 py-4 text-lg font-semibold bg-yellow-100 hover:bg-yellow-200 border-yellow-300 text-yellow-800 rounded-2xl"
                >
                  <Lightbulb size={20} className="mr-2" />
                  힌트 보기 ({usedHints}/{currentProblem.hints.length})
                </Button>
              </div>

              {usedHints > 0 && (
                <div className="space-y-3">
                  <div className="text-center text-lg font-bold text-blue-600">
                    💡 힌트
                  </div>
                  {currentProblem.hints
                    .slice(0, usedHints)
                    .map((hint, index) => (
                      <div
                        key={hint.id}
                        className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg"
                      >
                        <div className="font-semibold text-blue-800 text-sm mb-1">
                          힌트 {index + 1}
                        </div>
                        <div className="text-blue-700">{hint.hint_text}</div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {showResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`bg-white rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl ${
              currentResult?.isCorrect
                ? "border-4 border-green-400"
                : "border-4 border-red-400"
            }`}
          >
            <div className="text-6xl mb-4">
              {currentResult?.isCorrect ? "🎉" : "😅"}
            </div>
            <div
              className={`text-2xl font-bold mb-2 ${
                currentResult?.isCorrect ? "text-green-600" : "text-red-600"
              }`}
            >
              {currentResult?.isCorrect ? "정답이에요!" : "아쉬워요!"}
            </div>
            <div className="text-gray-600">
              {currentResult?.isCorrect
                ? "잘했어요! 👏"
                : "다시 한번 생각해봐요! 💪"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
