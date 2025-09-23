"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FileText, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Problem {
  id: string;
  no: number;
  question: string;
  correct_answers: string[];
  hints_count: number;
  answers_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function ProblemsManagement() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/problems");
      const data = await response.json();
      if (data.success) {
        setProblems(data.data);
      } else {
        toast.error("문제 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to fetch problems:", error);
      toast.error("문제 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (
    problemId: string,
    currentActive: boolean
  ) => {
    setUpdating(problemId);
    try {
      const response = await fetch("/api/admin/problems", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: problemId,
          is_active: !currentActive,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setProblems((prev) =>
          prev.map((problem) =>
            problem.id === problemId
              ? { ...problem, is_active: !currentActive }
              : problem
          )
        );
        toast.success("문제 상태가 변경되었습니다.");
      } else {
        toast.error("문제 상태 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to toggle problem:", error);
      toast.error("문제 상태 변경 중 오류가 발생했습니다.");
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteProblem = async (problemId: string) => {
    try {
      const response = await fetch(`/api/admin/problems?id=${problemId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        setProblems((prev) =>
          prev.filter((problem) => problem.id !== problemId)
        );
        toast.success("문제가 삭제되었습니다.");
      } else {
        toast.error("문제 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to delete problem:", error);
      toast.error("문제 삭제 중 오류가 발생했습니다.");
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileText size={24} className="sm:w-7 sm:h-7" />
            문제 관리
          </h1>
          <Link href="/admin/problems/add">
            <Button className="gap-2 w-full sm:w-auto">
              <Plus size={16} />
              문제 추가
            </Button>
          </Link>
        </div>
      </header>

      <div className="p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle>문제 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-600">
                  문제를 불러오는 중...
                </span>
              </div>
            ) : (
              <div className="border rounded-lg overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 whitespace-nowrap">
                        No
                      </TableHead>
                      <TableHead className="max-w-xs">문제 내용</TableHead>
                      <TableHead className="w-20 whitespace-nowrap">
                        힌트 수
                      </TableHead>
                      <TableHead className="w-20 whitespace-nowrap">
                        정답 수
                      </TableHead>
                      <TableHead className="w-24 whitespace-nowrap">
                        사용 여부
                      </TableHead>
                      <TableHead className="w-32 whitespace-nowrap">
                        관리
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {problems.length > 0 ? (
                      problems.map((problem) => (
                        <TableRow key={problem.id}>
                          <TableCell className="font-medium">
                            {problem.no}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-md">
                              <span title={problem.question}>
                                {truncateText(problem.question)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {problem.hints_count}
                          </TableCell>
                          <TableCell className="text-center">
                            {problem.answers_count}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={problem.is_active}
                              onCheckedChange={() =>
                                handleToggleActive(
                                  problem.id,
                                  problem.is_active
                                )
                              }
                              disabled={updating === problem.id}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Link href={`/admin/problems/edit/${problem.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1 px-2 sm:px-3"
                                >
                                  <Edit size={14} />
                                  <span className="hidden sm:inline">수정</span>
                                </Button>
                              </Link>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 px-2 sm:px-3 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 size={14} />
                                    <span className="hidden sm:inline">
                                      삭제
                                    </span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      문제를 삭제하시겠습니까?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      이 작업은 되돌릴 수 없습니다. 문제와
                                      관련된 모든 데이터가 영구적으로
                                      삭제됩니다.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>취소</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteProblem(problem.id)
                                      }
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      삭제
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-gray-500"
                        >
                          등록된 문제가 없습니다.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
