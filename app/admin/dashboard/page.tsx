"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, User, FileText, Search } from "lucide-react";

interface UserStat {
  user_id: string;
  name: string;
  class_name: string;
  session_date: string;
  total_problems: number;
  correct_answers: number;
  hints_used: number;
  total_time: number;
  chatbot_used: boolean;
}

interface ProblemStat {
  problem_id: string;
  question: string;
  total_attempts: number;
  correct_rate: number;
  hint_usage_rate: number;
  chatbot_usage_rate: number;
  avg_time: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [userStats, setUserStats] = useState<UserStat[]>([]);
  const [problemStats, setProblemStats] = useState<ProblemStat[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [problemLoading, setProblemLoading] = useState(false);

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstDay.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  }, []);

  const fetchUserStats = async () => {
    if (!startDate || !endDate) return;

    setUserLoading(true);
    try {
      const response = await fetch(
        `/api/admin/stats/users?startDate=${startDate}&endDate=${endDate}`
      );
      const data = await response.json();
      if (data.success) {
        setUserStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    } finally {
      setUserLoading(false);
    }
  };

  const fetchProblemStats = async () => {
    setProblemLoading(true);
    try {
      const response = await fetch(`/api/admin/stats/problems`);
      const data = await response.json();
      if (data.success) {
        setProblemStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch problem stats:", error);
    } finally {
      setProblemLoading(false);
    }
  };

  useEffect(() => {
    fetchProblemStats();
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0
      ? `${minutes}분 ${remainingSeconds}초`
      : `${remainingSeconds}초`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        </div>
      </header>

      <div className="p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">통계 정보</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="users" className="gap-2">
                  <User size={16} />
                  사용자별 통계
                </TabsTrigger>
                <TabsTrigger value="problems" className="gap-2">
                  <FileText size={16} />
                  문제별 통계
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      사용자별 상세 이력
                    </h3>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Calendar size={18} />
                        조회 기간 설정
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row items-end gap-4">
                        <div className="w-full sm:flex-1">
                          <Label htmlFor="startDate">시작일</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div className="w-full sm:flex-1">
                          <Label htmlFor="endDate">종료일</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <Button
                          onClick={fetchUserStats}
                          disabled={userLoading}
                          className="gap-2 w-full sm:w-auto"
                        >
                          <Search size={16} />
                          {userLoading ? "조회 중..." : "조회"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="border rounded-lg">
                    <div className="max-h-96 overflow-y-auto overflow-x-auto">
                      <Table className="min-w-full">
                        <TableHeader className="sticky top-0 bg-white z-10">
                          <TableRow>
                            <TableHead className="whitespace-nowrap">
                              학생명
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              반
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              날짜
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              총 문제
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              정답 수
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              정답률
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              힌트 사용
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              총 시간
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              챗봇 사용
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userStats.length > 0 ? (
                            userStats.map((stat, index) => (
                              <TableRow key={index}>
                                <TableCell>{stat.name}</TableCell>
                                <TableCell>{stat.class_name}</TableCell>
                                <TableCell>
                                  {new Date(
                                    stat.session_date
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell>{stat.total_problems}</TableCell>
                                <TableCell>{stat.correct_answers}</TableCell>
                                <TableCell>
                                  {(
                                    (stat.correct_answers /
                                      stat.total_problems) *
                                    100
                                  ).toFixed(1)}
                                  %
                                </TableCell>
                                <TableCell>{stat.hints_used}</TableCell>
                                <TableCell>
                                  {formatTime(stat.total_time)}
                                </TableCell>
                                <TableCell>
                                  {stat.chatbot_used ? "사용" : "미사용"}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={9}
                                className="text-center py-8 text-gray-500"
                              >
                                {userLoading
                                  ? "데이터를 불러오는 중..."
                                  : "해당 기간에 데이터가 없습니다."}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="problems" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    문제별 정답률 및 학습 난이도 분석
                  </h3>
                  <div className="border rounded-lg">
                    <div className="max-h-96 overflow-y-auto overflow-x-auto">
                      <Table className="min-w-full">
                        <TableHeader className="sticky top-0 bg-white z-10">
                          <TableRow>
                            <TableHead className="max-w-xs">
                              문제 내용
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              시도 횟수
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              정답률
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              힌트 사용률
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              챗봇 사용률
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              평균 시간
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              난이도
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {problemStats.length > 0 ? (
                            problemStats.map((stat, index) => (
                              <TableRow key={index}>
                                <TableCell className="max-w-xs truncate">
                                  {stat.question}
                                </TableCell>
                                <TableCell>{stat.total_attempts}</TableCell>
                                <TableCell>
                                  {stat.correct_rate.toFixed(1)}%
                                </TableCell>
                                <TableCell>
                                  {stat.hint_usage_rate.toFixed(1)}%
                                </TableCell>
                                <TableCell>
                                  {stat.chatbot_usage_rate.toFixed(1)}%
                                </TableCell>
                                <TableCell>
                                  {formatTime(Math.round(stat.avg_time))}
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                      stat.correct_rate >= 80
                                        ? "bg-green-100 text-green-800"
                                        : stat.correct_rate >= 60
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {stat.correct_rate >= 80
                                      ? "쉬움"
                                      : stat.correct_rate >= 60
                                      ? "보통"
                                      : "어려움"}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={7}
                                className="text-center py-8 text-gray-500"
                              >
                                {problemLoading
                                  ? "데이터를 불러오는 중..."
                                  : "데이터가 없습니다."}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
