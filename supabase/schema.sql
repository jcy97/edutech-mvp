-- Enable UUID extension for generating unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 문제 정보를 저장하는 테이블
-- ADM-004, ADM-005, ADM-006, ADM-007, STU-002 기능 지원
CREATE TABLE IF NOT EXISTS problems (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question TEXT NOT NULL,
  correct_answers TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 문제별 힌트를 저장하는 테이블 (최대 3개)
-- STU-005, STU-006, BOT-003 기능 지원
CREATE TABLE IF NOT EXISTS hints (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  hint_text TEXT NOT NULL,
  order_index INTEGER NOT NULL CHECK (order_index >= 1 AND order_index <= 3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 학생 정보를 저장하는 테이블
-- STU-001 기능 지원
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 학생별 문제 풀이 세션을 저장하는 테이블
-- STU-002, RES-001 기능 지원
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  total_problems INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 학생별 문제 답안 및 통계를 저장하는 테이블
-- STU-003, STU-007, RES-002, BOT-003 기능 지원
CREATE TABLE IF NOT EXISTS user_answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  hints_used INTEGER DEFAULT 0 CHECK (hints_used >= 0 AND hints_used <= 3),
  time_spent INTEGER DEFAULT 0,
  chatbot_used BOOLEAN DEFAULT false,
  wrong_attempts JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 관리자 설정을 저장하는 테이블
-- ADM-008 기능 및 서비스 이름 제어 지원
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 챗봇 대화 기록을 저장하는 테이블 (선택적)
-- BOT-002, BOT-004 기능 지원
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  user_message TEXT,
  bot_response TEXT,
  context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 테이블 주석 추가 (테이블 생성 후)
COMMENT ON TABLE problems IS '수학 문제 정보를 저장하는 테이블';
COMMENT ON TABLE hints IS '문제별 힌트 정보를 저장하는 테이블 (최대 3개)';
COMMENT ON TABLE users IS '학생 정보를 저장하는 테이블';
COMMENT ON TABLE user_sessions IS '학생별 문제 풀이 세션 정보를 저장하는 테이블';
COMMENT ON TABLE user_answers IS '학생별 문제 답안 및 풀이 통계를 저장하는 테이블';
COMMENT ON TABLE admin_settings IS '관리자 시스템 설정을 저장하는 테이블';
COMMENT ON TABLE chatbot_conversations IS '챗봇 대화 기록을 저장하는 테이블';

-- 컬럼 주석 추가
COMMENT ON COLUMN problems.question IS '문제 내용 (예: 2 + 3 = ?)';
COMMENT ON COLUMN problems.correct_answers IS '정답 배열 (예: ["5", "오", "다섯"])';
COMMENT ON COLUMN problems.is_active IS '출제 여부 제어 (true: 출제, false: 비출제)';

COMMENT ON COLUMN hints.hint_text IS '힌트 내용';
COMMENT ON COLUMN hints.order_index IS '힌트 표시 순서 (1-3, 1이 먼저 공개됨)';

COMMENT ON COLUMN users.name IS '학생 이름';
COMMENT ON COLUMN users.class_name IS '학생 반 (자유 형식: 5반, 사랑반 등)';

COMMENT ON COLUMN user_sessions.start_time IS '문제 풀이 시작 시간';
COMMENT ON COLUMN user_sessions.end_time IS '문제 풀이 완료 시간 (완료 시 업데이트)';
COMMENT ON COLUMN user_sessions.total_problems IS '해당 세션에서 출제된 총 문제 수';

COMMENT ON COLUMN user_answers.user_answer IS '학생이 최종 제출한 답';
COMMENT ON COLUMN user_answers.is_correct IS '정답 여부 (STU-003 채점 결과)';
COMMENT ON COLUMN user_answers.hints_used IS '사용한 힌트 개수 (0-3)';
COMMENT ON COLUMN user_answers.time_spent IS '문제 풀이에 소요된 시간 (초 단위)';
COMMENT ON COLUMN user_answers.chatbot_used IS '챗봇 사용 여부 (BOT-002 추적)';
COMMENT ON COLUMN user_answers.wrong_attempts IS '오답 시도 목록 JSON 배열 (챗봇 컨텍스트용)';

COMMENT ON COLUMN admin_settings.setting_key IS '설정 키 (예: total_problems, service_name, admin_id)';
COMMENT ON COLUMN admin_settings.setting_value IS '설정 값 (예: 5, AI 수학 친구, admin)';
COMMENT ON COLUMN admin_settings.description IS '설정에 대한 설명';

COMMENT ON COLUMN chatbot_conversations.user_message IS '사용자가 챗봇에게 보낸 메시지';
COMMENT ON COLUMN chatbot_conversations.bot_response IS '챗봇이 사용자에게 보낸 응답';
COMMENT ON COLUMN chatbot_conversations.context IS 'AI에 전달된 컨텍스트 (문제, 오답, 힌트 등)';

-- 관리자 대시보드 통계를 위한 뷰
-- ADM-003 기능 지원
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM problems) as total_problems,
  (SELECT COUNT(*) FROM problems WHERE is_active = true) as active_problems,
  (SELECT COUNT(DISTINCT user_id) FROM user_sessions) as total_students,
  (SELECT ROUND(AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END) * 100, 2) FROM user_answers) as average_accuracy
;

-- 성능 향상을 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_hints_problem_id ON hints(problem_id);
CREATE INDEX IF NOT EXISTS idx_hints_order ON hints(problem_id, order_index);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_end_time ON user_sessions(end_time);
CREATE INDEX IF NOT EXISTS idx_user_answers_session_id ON user_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_problem_id ON user_answers(problem_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_correct ON user_answers(is_correct);
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_chatbot_session_problem ON chatbot_conversations(session_id, problem_id);
CREATE INDEX IF NOT EXISTS idx_problems_active ON problems(is_active);

-- 기본 관리자 설정 데이터 삽입
INSERT INTO admin_settings (setting_key, setting_value, description) 
VALUES 
  ('total_problems', '5', '랜덤 출제할 문제 수'),
  ('service_name', 'AI 수학 친구', '서비스 이름 (메인 화면 제목)'),
  ('admin_id', 'admin', '관리자 로그인 ID'),
  ('admin_password', 'admin123', '관리자 로그인 비밀번호'),
  ('chatbot_enabled', 'true', '챗봇 기능 사용 여부'),
  ('timer_minutes', '5', '문제별 자동 힌트 타이머 (분)')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 초등학교 5학년 수준의 샘플 문제 삽입
INSERT INTO problems (question, correct_answers, is_active) VALUES
  ('2 + 3 = ?', ARRAY['5', '오', '다섯'], true),
  ('10 - 4 = ?', ARRAY['6', '육', '여섯'], true),
  ('3 × 4 = ?', ARRAY['12', '십이', '열둘'], true),
  ('15 ÷ 3 = ?', ARRAY['5', '오', '다섯'], true),
  ('7 + 8 = ?', ARRAY['15', '십오', '열다섯'], true),
  ('24 ÷ 6 = ?', ARRAY['4', '사', '네'], true),
  ('9 × 7 = ?', ARRAY['63', '육십삼', '예순셋'], true),
  ('45 - 18 = ?', ARRAY['27', '이십칠', '스물일곱'], true),
  ('16 + 29 = ?', ARRAY['45', '사십오', '마흔다섯'], true),
  ('8 × 9 = ?', ARRAY['72', '칠십이', '일흔둘'], true)
ON CONFLICT DO NOTHING;

-- 샘플 문제에 대한 힌트 삽입
WITH problem_data AS (
  SELECT id, question FROM problems 
  WHERE question IN ('2 + 3 = ?', '10 - 4 = ?', '3 × 4 = ?', '15 ÷ 3 = ?', '7 + 8 = ?')
)
INSERT INTO hints (problem_id, hint_text, order_index)
SELECT 
  id,
  CASE 
    WHEN question = '2 + 3 = ?' THEN 
      CASE row_number() OVER (PARTITION BY id ORDER BY id)
        WHEN 1 THEN '더하기는 두 수를 합치는 것이에요'
        WHEN 2 THEN '손가락으로 2개부터 세어보세요'
        WHEN 3 THEN '2 다음에 3개 더 세면: 3, 4, 5!'
      END
    WHEN question = '10 - 4 = ?' THEN
      CASE row_number() OVER (PARTITION BY id ORDER BY id)
        WHEN 1 THEN '빼기는 큰 수에서 작은 수를 빼는 것이에요'
        WHEN 2 THEN '10에서 4개를 빼면 몇 개가 남을까요?'
        WHEN 3 THEN '10에서 거꾸로 세어보세요: 9, 8, 7, 6'
      END
    WHEN question = '3 × 4 = ?' THEN
      CASE row_number() OVER (PARTITION BY id ORDER BY id)
        WHEN 1 THEN '곱하기는 같은 수를 여러 번 더하는 것이에요'
        WHEN 2 THEN '3을 4번 더해보세요: 3 + 3 + 3 + 3'
        WHEN 3 THEN '3 × 4 = 3 + 3 + 3 + 3 = 12'
      END
    WHEN question = '15 ÷ 3 = ?' THEN
      CASE row_number() OVER (PARTITION BY id ORDER BY id)
        WHEN 1 THEN '나누기는 전체를 같은 크기로 나누는 것이에요'
        WHEN 2 THEN '15를 3개씩 몇 묶음으로 나눌 수 있을까요?'
        WHEN 3 THEN '3 × ? = 15가 되는 수를 찾아보세요'
      END
    WHEN question = '7 + 8 = ?' THEN
      CASE row_number() OVER (PARTITION BY id ORDER BY id)
        WHEN 1 THEN '큰 수부터 세면 더 쉬워요'
        WHEN 2 THEN '8에서 시작해서 7개를 더 세어보세요'
        WHEN 3 THEN '8 + 7 = 8 + 2 + 5 = 10 + 5 = 15'
      END
  END as hint_text,
  row_number() OVER (PARTITION BY id ORDER BY id) as order_index
FROM problem_data
CROSS JOIN generate_series(1, 3)
ON CONFLICT DO NOTHING;

-- 랜덤 문제 선택을 위한 함수 생성
-- STU-002 기능 지원: 활성화된 문제 중 랜덤 선택
CREATE OR REPLACE FUNCTION get_random_problems(problem_count INTEGER)
RETURNS TABLE(
  id UUID,
  question TEXT,
  correct_answers TEXT[],
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    p.problem_id,
    p.question,
    p.correct_answers,
    p.is_active,
    p.created_at,
    p.updated_at
  FROM (
    SELECT 
      prob.id as problem_id,
      prob.question,
      prob.correct_answers,
      prob.is_active,
      prob.created_at,
      prob.updated_at,
      ROW_NUMBER() OVER (ORDER BY RANDOM()) as rn
    FROM problems prob 
    WHERE prob.is_active = true
  ) p
  WHERE p.rn <= problem_count;
END;
$$ LANGUAGE plpgsql;

-- 사용자별 통계 조회 함수
CREATE OR REPLACE FUNCTION get_user_stats(start_date DATE, end_date DATE)
RETURNS TABLE(
  user_id UUID,
  name TEXT,
  class_name TEXT,
  session_date DATE,
  total_problems BIGINT,
  correct_answers BIGINT,
  hints_used BIGINT,
  total_time BIGINT,
  chatbot_used BOOLEAN,
  chatbot_accuracy NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.class_name,
    session_date_val,
    COUNT(ua.id)::BIGINT,
    COUNT(CASE WHEN ua.is_correct THEN 1 END)::BIGINT,
    COALESCE(SUM(ua.hints_used), 0)::BIGINT,
    COALESCE(SUM(ua.time_spent), 0)::BIGINT,
    COALESCE(BOOL_OR(ua.chatbot_used), false),
    COALESCE(
      AVG(CASE WHEN COALESCE(ua.chatbot_used, false) = true THEN 
        CASE WHEN ua.is_correct THEN 100.0 ELSE 0.0 END 
      END), 
      0
    )::NUMERIC
  FROM (
    SELECT DISTINCT
      u.id,
      u.name,
      u.class_name,
      us.start_time::DATE as session_date_val,
      us.id as session_id
    FROM users u
    JOIN user_sessions us ON u.id = us.user_id
    WHERE us.start_time::DATE BETWEEN start_date AND end_date
  ) u
  LEFT JOIN user_answers ua ON u.session_id = ua.session_id
  GROUP BY u.id, u.name, u.class_name, u.session_date_val
  ORDER BY u.session_date_val DESC;
END;
$$ LANGUAGE plpgsql;

-- 문제별 통계 조회 함수
CREATE OR REPLACE FUNCTION get_problem_stats(start_date DATE, end_date DATE)
RETURNS TABLE(
  problem_id UUID,
  question TEXT,
  total_attempts BIGINT,
  correct_rate NUMERIC,
  hint_usage_rate NUMERIC,
  chatbot_usage_rate NUMERIC,
  avg_time NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as problem_id,
    p.question,
    COUNT(ua.id) as total_attempts,
    ROUND(
      AVG(CASE WHEN ua.is_correct THEN 100.0 ELSE 0.0 END), 
      2
    ) as correct_rate,
    ROUND(
      AVG(CASE WHEN ua.hints_used > 0 THEN 100.0 ELSE 0.0 END), 
      2
    ) as hint_usage_rate,
    ROUND(
      AVG(CASE WHEN COALESCE(ua.chatbot_used, false) = true THEN 100.0 ELSE 0.0 END), 
      2
    ) as chatbot_usage_rate,
    ROUND(AVG(ua.time_spent), 2) as avg_time
  FROM problems p
  JOIN user_answers ua ON p.id = ua.problem_id
  JOIN user_sessions us ON ua.session_id = us.id
  WHERE us.start_time::DATE BETWEEN start_date AND end_date
  GROUP BY p.id, p.question
  HAVING COUNT(ua.id) > 0
  ORDER BY COUNT(ua.id) DESC;
END;
$$ LANGUAGE plpgsql;

-- 모든 문제별 통계 조회 함수 (날짜 제한 없음)
CREATE OR REPLACE FUNCTION get_problem_stats_all()
RETURNS TABLE(
  problem_id UUID,
  question TEXT,
  total_attempts BIGINT,
  correct_rate NUMERIC,
  hint_usage_rate NUMERIC,
  chatbot_usage_rate NUMERIC,
  avg_time NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as problem_id,
    p.question,
    COUNT(ua.id) as total_attempts,
    ROUND(
      AVG(CASE WHEN ua.is_correct THEN 100.0 ELSE 0.0 END), 
      2
    ) as correct_rate,
    ROUND(
      AVG(CASE WHEN ua.hints_used > 0 THEN 100.0 ELSE 0.0 END), 
      2
    ) as hint_usage_rate,
    ROUND(
      AVG(CASE WHEN COALESCE(ua.chatbot_used, false) = true THEN 100.0 ELSE 0.0 END), 
      2
    ) as chatbot_usage_rate,
    ROUND(AVG(ua.time_spent), 2) as avg_time
  FROM problems p
  JOIN user_answers ua ON p.id = ua.problem_id
  GROUP BY p.id, p.question
  HAVING COUNT(ua.id) > 0
  ORDER BY COUNT(ua.id) DESC;
END;
$$ LANGUAGE plpgsql;
