"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Minus, Save, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AddProblem() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    correct_answers: [""],
    hints: ["", "", ""],
    is_active: true,
  });

  const handleQuestionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, question: value }));
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...formData.correct_answers];
    newAnswers[index] = value;
    setFormData((prev) => ({ ...prev, correct_answers: newAnswers }));
  };

  const addAnswer = () => {
    if (formData.correct_answers.length < 10) {
      setFormData((prev) => ({
        ...prev,
        correct_answers: [...prev.correct_answers, ""],
      }));
    }
  };

  const removeAnswer = (index: number) => {
    if (formData.correct_answers.length > 1) {
      const newAnswers = formData.correct_answers.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, correct_answers: newAnswers }));
    }
  };

  const handleHintChange = (index: number, value: string) => {
    const newHints = [...formData.hints];
    newHints[index] = value;
    setFormData((prev) => ({ ...prev, hints: newHints }));
  };

  const handleActiveChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_active: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.question.trim()) {
      toast.error("문제 내용을 입력해주세요.");
      return;
    }

    const validAnswers = formData.correct_answers.filter((answer) =>
      answer.trim()
    );
    if (validAnswers.length === 0) {
      toast.error("최소 하나의 정답을 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/problems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: formData.question.trim(),
          correct_answers: validAnswers,
          hints: formData.hints.filter((hint) => hint.trim()),
          is_active: formData.is_active,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("문제가 성공적으로 등록되었습니다.");
        router.push("/admin/problems");
      } else {
        toast.error(data.message || "문제 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("문제 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              돌아가기
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">문제 추가</h1>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>문제 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="question">문제 내용 *</Label>
                  <Textarea
                    id="question"
                    value={formData.question}
                    onChange={(e) => handleQuestionChange(e.target.value)}
                    placeholder="문제 내용을 입력하세요. (예: 2 + 3 = ?)"
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="is_active">문제 활성화</Label>
                    <p className="text-sm text-gray-500">
                      활성화된 문제만 학생들에게 출제됩니다.
                    </p>
                  </div>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={handleActiveChange}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>정답</CardTitle>
                <p className="text-sm text-gray-600">
                  단답형 특성상 정답 입력이 다양해야 할 경우 정답 추가로 여러
                  정답을 사용할 수 있습니다.
                  <br />
                  예) 1998년, 98년, '98 등
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.correct_answers.map((answer, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1">
                        <Input
                          value={answer}
                          onChange={(e) =>
                            handleAnswerChange(index, e.target.value)
                          }
                          placeholder={`정답 ${index + 1}`}
                          required={index === 0}
                        />
                      </div>
                      {formData.correct_answers.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAnswer(index)}
                          className="px-2"
                        >
                          <Minus size={16} />
                        </Button>
                      )}
                    </div>
                  ))}
                  {formData.correct_answers.length < 10 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addAnswer}
                      className="gap-2"
                    >
                      <Plus size={16} />
                      정답 추가
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>힌트 (선택사항)</CardTitle>
                <p className="text-sm text-gray-600">
                  힌트는 최대 3개까지 등록할 수 있습니다.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.hints.map((hint, index) => (
                    <div key={index} className="space-y-2">
                      <Label htmlFor={`hint-${index}`}>힌트 {index + 1}</Label>
                      <Textarea
                        id={`hint-${index}`}
                        value={hint}
                        onChange={(e) =>
                          handleHintChange(index, e.target.value)
                        }
                        placeholder={`힌트 ${index + 1}을 입력하세요`}
                        className="min-h-[80px]"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                취소
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    저장
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
