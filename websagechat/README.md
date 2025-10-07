# SageTalk - AI 멘토 상담 시스템

카카오톡 스타일의 UI로 여러 AI 멘토와 대화할 수 있는 Next.js 기반 웹 애플리케이션입니다.

## 🔒 보안 주의사항

**⚠️ 중요: API 키는 절대 Git에 커밋하지 마세요!**

이 프로젝트는 `.gitignore`에 모든 `.env` 파일을 포함하여 API 키가 노출되지 않도록 설정되어 있습니다.

## 🚀 시작하기

### 1. 환경 변수 설정

먼저 `.env.local` 파일을 생성하세요:

```bash
cp .env.example .env.local
```

그 다음 `.env.local` 파일을 열고 실제 API 키를 입력하세요:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-4o-mini
NODE_ENV=development
```

**OpenAI API 키 발급:**
1. https://platform.openai.com/api-keys 접속
2. "Create new secret key" 클릭
3. 생성된 키를 복사하여 `.env.local`에 붙여넣기

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 📦 Vercel 배포

### 환경 변수 설정

Vercel에 배포하기 전에 환경 변수를 설정해야 합니다:

1. Vercel 프로젝트 설정 페이지 접속
2. **Settings** → **Environment Variables** 클릭
3. 다음 환경 변수 추가:

| 변수명 | 값 | 환경 |
|--------|-----|------|
| `OPENAI_API_KEY` | `sk-your-api-key` | Production, Preview, Development |
| `OPENAI_MODEL` | `gpt-4o-mini` | Production, Preview, Development |

4. **Save** 클릭 후 자동 재배포

### 배포하기

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

자세한 내용은 [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)을 참고하세요.

## 🔐 보안 체크리스트

- ✅ `.env.local` 파일은 `.gitignore`에 포함됨
- ✅ `.env.example` 템플릿만 Git에 커밋
- ✅ 실제 API 키는 로컬과 Vercel 환경 변수로만 관리
- ✅ GitHub에 API 키가 노출되지 않음

## 📚 추가 정보

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Vercel Platform](https://vercel.com)
