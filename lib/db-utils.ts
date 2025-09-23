import { supabase } from "./supabase";
import { Database } from "./database.types";

type Problem = Database["public"]["Tables"]["problems"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];
type UserSession = Database["public"]["Tables"]["user_sessions"]["Row"];
type UserAnswer = Database["public"]["Tables"]["user_answers"]["Row"];
type Hint = Database["public"]["Tables"]["hints"]["Row"];
type AdminSetting = Database["public"]["Tables"]["admin_settings"]["Row"];
type ChatbotConversation =
  Database["public"]["Tables"]["chatbot_conversations"]["Row"];
type AdminDashboardStats =
  Database["public"]["Views"]["admin_dashboard_stats"]["Row"];

export const dbUtils = {
  async getActiveProblems() {
    const { data, error } = await (supabase as any)
      .from("problems")
      .select("*")
      .eq("is_active", true);

    if (error) throw error;
    return data as Problem[];
  },

  async getProblemWithHints(problemId: string) {
    const { data: problem, error: problemError } = await (supabase as any)
      .from("problems")
      .select("*")
      .eq("id", problemId)
      .single();

    if (problemError) throw problemError;

    const { data: hints, error: hintsError } = await (supabase as any)
      .from("hints")
      .select("*")
      .eq("problem_id", problemId)
      .order("order_index");

    if (hintsError) throw hintsError;

    return {
      problem: problem as Problem,
      hints: hints as Hint[],
    };
  },

  async createUser(name: string, className: string) {
    const { data, error } = await (supabase as any)
      .from("users")
      .insert({ name, class_name: className })
      .select()
      .single();

    if (error) throw error;
    return data as User;
  },

  async createUserSession(userId: string, totalProblems: number) {
    const { data, error } = await (supabase as any)
      .from("user_sessions")
      .insert({ user_id: userId, total_problems: totalProblems })
      .select()
      .single();

    if (error) throw error;
    return data as UserSession;
  },

  async saveUserAnswer(answerData: {
    sessionId: string;
    problemId: string;
    userAnswer: string;
    isCorrect: boolean;
    hintsUsed?: number;
    timeSpent?: number;
    chatbotUsed?: boolean;
    wrongAttempts?: string[];
  }) {
    const { data, error } = await (supabase as any)
      .from("user_answers")
      .insert({
        session_id: answerData.sessionId,
        problem_id: answerData.problemId,
        user_answer: answerData.userAnswer,
        is_correct: answerData.isCorrect,
        hints_used: answerData.hintsUsed || 0,
        time_spent: answerData.timeSpent || 0,
        chatbot_used: answerData.chatbotUsed || false,
        wrong_attempts: answerData.wrongAttempts || [],
      })
      .select()
      .single();

    if (error) throw error;
    return data as UserAnswer;
  },

  async endUserSession(sessionId: string) {
    const { data, error } = await (supabase as any)
      .from("user_sessions")
      .update({ end_time: new Date().toISOString() })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) throw error;
    return data as UserSession;
  },

  async getSessionResults(sessionId: string) {
    const { data, error } = await (supabase as any)
      .from("user_answers")
      .select(
        `
        *,
        problem:problems(*)
      `
      )
      .eq("session_id", sessionId);

    if (error) throw error;
    return data;
  },

  async getAdminSetting(key: string) {
    const { data, error } = await (supabase as any)
      .from("admin_settings")
      .select("setting_value")
      .eq("setting_key", key)
      .single();

    if (error) throw error;
    return data?.setting_value;
  },

  async updateAdminSetting(key: string, value: string) {
    const { data, error } = await (supabase as any)
      .from("admin_settings")
      .upsert({
        setting_key: key,
        setting_value: value,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as AdminSetting;
  },

  async getAllProblems() {
    const { data, error } = await (supabase as any)
      .from("problems")
      .select(
        `
        *,
        hints(*)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async createProblem(
    question: string,
    correctAnswers: string[],
    isActive: boolean = true
  ) {
    const { data, error } = await (supabase as any)
      .from("problems")
      .insert({
        question,
        correct_answers: correctAnswers,
        is_active: isActive,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Problem;
  },

  async updateProblem(id: string, updates: Partial<Problem>) {
    const { data, error } = await (supabase as any)
      .from("problems")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Problem;
  },

  async deleteProblem(id: string) {
    const { error } = await (supabase as any)
      .from("problems")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async createHint(problemId: string, hintText: string, orderIndex: number) {
    const { data, error } = await (supabase as any)
      .from("hints")
      .insert({
        problem_id: problemId,
        hint_text: hintText,
        order_index: orderIndex,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Hint;
  },

  async getUserStats() {
    const { data, error } = await (supabase as any).from("user_answers")
      .select(`
        *,
        session:user_sessions(*),
        user:user_sessions(user:users(*))
      `);

    if (error) throw error;
    return data;
  },

  async getServiceName() {
    const { data, error } = await (supabase as any)
      .from("admin_settings")
      .select("setting_value")
      .eq("setting_key", "service_name")
      .single();

    if (error) throw error;
    return data?.setting_value || "AI 수학 친구";
  },

  async updateServiceName(name: string) {
    return this.updateAdminSetting("service_name", name);
  },

  async getDashboardStats() {
    const { data, error } = await (supabase as any)
      .from("admin_dashboard_stats")
      .select("*")
      .single();

    if (error) throw error;
    return data as AdminDashboardStats;
  },

  async saveChatbotConversation(conversationData: {
    sessionId: string;
    problemId: string;
    userMessage?: string;
    botResponse?: string;
    context?: any;
  }) {
    const { data, error } = await (supabase as any)
      .from("chatbot_conversations")
      .insert({
        session_id: conversationData.sessionId,
        problem_id: conversationData.problemId,
        user_message: conversationData.userMessage || null,
        bot_response: conversationData.botResponse || null,
        context: conversationData.context || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as ChatbotConversation;
  },

  async getChatbotHistory(sessionId: string, problemId?: string) {
    let query = (supabase as any)
      .from("chatbot_conversations")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (problemId) {
      query = query.eq("problem_id", problemId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as ChatbotConversation[];
  },

  async getRandomProblems(count?: number) {
    const totalProblems =
      count || parseInt((await this.getAdminSetting("total_problems")) || "5");

    const { data, error } = await (supabase as any).rpc("get_random_problems", {
      problem_count: totalProblems,
    });

    if (error) {
      const { data: fallbackData, error: fallbackError } = await (
        supabase as any
      )
        .from("problems")
        .select("*")
        .eq("is_active", true)
        .limit(totalProblems);

      if (fallbackError) throw fallbackError;

      const shuffled = [...(fallbackData || [])].sort(
        () => Math.random() - 0.5
      );
      return shuffled.slice(0, totalProblems);
    }

    return data;
  },

  async validateAdmin(id: string, password: string) {
    const [adminId, adminPassword] = await Promise.all([
      this.getAdminSetting("admin_id"),
      this.getAdminSetting("admin_password"),
    ]);

    return id === adminId && password === adminPassword;
  },
};
