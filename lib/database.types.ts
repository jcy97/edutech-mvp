export interface Database {
  public: {
    Tables: {
      problems: {
        Row: {
          id: string;
          question: string;
          correct_answers: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question: string;
          correct_answers: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question?: string;
          correct_answers?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      hints: {
        Row: {
          id: string;
          problem_id: string;
          hint_text: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          problem_id: string;
          hint_text: string;
          order_index: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          problem_id?: string;
          hint_text?: string;
          order_index?: number;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          name: string;
          class_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          class_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          class_name?: string;
          created_at?: string;
        };
      };
      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          start_time: string;
          end_time: string | null;
          total_problems: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          start_time?: string;
          end_time?: string | null;
          total_problems: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          start_time?: string;
          end_time?: string | null;
          total_problems?: number;
          created_at?: string;
        };
      };
      user_answers: {
        Row: {
          id: string;
          session_id: string;
          problem_id: string;
          user_answer: string;
          is_correct: boolean;
          hints_used: number;
          time_spent: number;
          chatbot_used: boolean;
          wrong_attempts: any; // JSONB array
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          problem_id: string;
          user_answer: string;
          is_correct: boolean;
          hints_used?: number;
          time_spent?: number;
          chatbot_used?: boolean;
          wrong_attempts?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          problem_id?: string;
          user_answer?: string;
          is_correct?: boolean;
          hints_used?: number;
          time_spent?: number;
          chatbot_used?: boolean;
          wrong_attempts?: any;
          created_at?: string;
        };
      };
      admin_settings: {
        Row: {
          id: string;
          setting_key: string;
          setting_value: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          setting_key: string;
          setting_value: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          setting_key?: string;
          setting_value?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      chatbot_conversations: {
        Row: {
          id: string;
          session_id: string;
          problem_id: string;
          user_message: string | null;
          bot_response: string | null;
          context: any | null; // JSONB
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          problem_id: string;
          user_message?: string | null;
          bot_response?: string | null;
          context?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          problem_id?: string;
          user_message?: string | null;
          bot_response?: string | null;
          context?: any | null;
          created_at?: string;
        };
      };
    };
    Views: {
      admin_dashboard_stats: {
        Row: {
          total_problems: number;
          active_problems: number;
          total_students: number;
          average_accuracy: number;
        };
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
