# 🧮 AI 수학 친구

> 초등학교 5학년을 위한 AI 챗봇 기반 수학 학습 플랫폼

AI 챗봇을 활용하여 개인 맞춤형 수학 학습 경험을 제공하는 에듀테크 MVP 서비스입니다.

## 📋 프로젝트 개요

**타겟**: 초등학교 5학년 학생  
**과목**: 수학  
**형태**: 웹앱 (반응형 디자인)

### 주요 기능

- 🤖 **AI 챗봇 상담**: 학습 중 실시간 도움 제공
- 📚 **문제 풀이**: 랜덤 출제되는 수학 문제 해결
- 💡 **힌트 시스템**: 단계별 힌트 제공 및 타이머 기반 자동 공개
- 📊 **학습 결과 분석**: 개인별 상세 학습 리포트
- 🛠️ **관리자 기능**: 문제 관리 및 학습 통계 대시보드

## 🛠️ 기술 스택

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: ShadcnUI
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Font**: Pretendard (한글 최적화)
- **Notifications**: Sonner

## 🚀 시작하기

### 환경 설정

1. **저장소 클론**

   ```bash
   git clone <repository-url>
   cd edutech
   ```

2. **의존성 설치**

   ```bash
   npm install
   # 또는
   yarn install
   ```

3. **환경 변수 설정**
   `.env.local` 파일 생성:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **데이터베이스 설정**
   Supabase SQL Editor에서 `supabase/schema.sql` 실행

### 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
```

[http://localhost:3000](http://localhost:3000)에서 서비스를 확인할 수 있습니다.

## 📁 프로젝트 구조

```
edutech/
├── app/                      # Next.js 14 App Router
│   ├── admin/               # 관리자 페이지
│   │   ├── dashboard/       # 대시보드
│   │   ├── problems/        # 문제 관리
│   │   └── settings/        # 일반 설정
│   ├── api/                 # API 라우트
│   │   ├── admin/          # 관리자 API
│   │   ├── auth/           # 인증 API
│   │   └── study/          # 학습 API
│   ├── study/              # 학습 페이지
│   └── globals.css         # 전역 스타일
├── components/             # 재사용 가능한 컴포넌트
│   └── ui/                # ShadcnUI 컴포넌트
├── lib/                   # 유틸리티 함수
│   ├── supabase.ts        # Supabase 클라이언트
│   ├── db-utils.ts        # DB 유틸리티
│   └── settings-context.tsx # 전역 설정 관리
└── supabase/
    └── schema.sql         # 데이터베이스 스키마
```

## 🎯 주요 기능 상세

### 👨‍🎓 학생 기능

- **문제 풀이**: 설정된 개수만큼 랜덤 출제
- **힌트 시스템**: 문제당 최대 3개 힌트, 5분 타이머 기반 자동 공개
- **AI 챗봇**: 문제 풀이 중 실시간 상담 (UI 완성)
- **결과 확인**: 개인화된 학습 결과 리포트

### 👨‍💼 관리자 기능

- **대시보드**: 학습 통계 및 분석 (반응형)
- **문제 관리**: 문제 등록/수정/삭제, 출제 여부 제어
- **일반 설정**: 서비스명, 타이머, 문제수 등 설정
- **사용자 통계**: 날짜별 학습 이력 조회

## 📱 반응형 디자인

모든 화면이 **모바일, 태블릿, 데스크톱**에 최적화되어 있습니다:

- 모바일: 햄버거 메뉴, 세로 레이아웃
- 태블릿: 혼합 레이아웃
- 데스크톱: 전체 기능 표시

## 🗃️ 데이터베이스 구조

### 주요 테이블

- `problems`: 수학 문제 정보
- `hints`: 문제별 힌트
- `users`: 학습자 정보
- `user_sessions`: 학습 세션
- `user_answers`: 문제 답변 기록
- `admin_settings`: 시스템 설정
- `chatbot_conversations`: 챗봇 대화 기록

## 🔧 관리자 계정

기본 관리자 계정은 데이터베이스 `admin_settings` 테이블에서 관리됩니다.

## 🚀 배포

### Vercel 배포 (권장)

1. GitHub 저장소 연결
2. 환경 변수 설정
3. 자동 배포

### 기타 플랫폼

Next.js 배포 가이드를 참고하세요: [Next.js 배포 문서](https://nextjs.org/docs/app/building-your-application/deploying)

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 지원

문의사항이 있으시면 이슈를 생성해 주세요.

---

**Made with ❤️ for elementary school students**
