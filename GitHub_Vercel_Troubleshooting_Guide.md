# GitHub & Vercel 트러블슈팅 가이드

> **작성일**: 2025년 9월 21일  
> **작성자**: 커비서  
> **프로젝트**: SageTalk  
> **목적**: 향후 개발자가 GitHub & Vercel 배포 문제를 빠르게 해결할 수 있도록 함

## 📋 목차

1. [일반적인 배포 문제](#일반적인-배포-문제)
2. [Git 관련 문제](#git-관련-문제)
3. [TypeScript 컴파일 오류](#typescript-컴파일-오류)
4. [Vercel 캐싱 문제](#vercel-캐싱-문제)
5. [환경 변수 설정](#환경-변수-설정)
6. [자동 배포 실패](#자동-배포-실패)
7. [응급 상황 대응](#응급-상황-대응)

---

## 🚨 일반적인 배포 문제

### 문제 1: Git Push 실패 (대용량 파일)

**증상:**
```bash
error: RPC failed; HTTP 413 curl 22 The requested URL returned error: 413
```

**원인:** `node_modules`, `.next`, `logs` 폴더 등 대용량 파일이 포함됨

**해결 방법:**

1. **`.gitignore` 파일 확인 및 수정:**
```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Production
/build
/dist
.next/
out/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# macOS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
```

2. **기존 대용량 파일 제거:**
```bash
# Git 히스토리에서 대용량 파일 완전 제거
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch -r node_modules logs .next' \
--prune-empty --tag-name-filter cat -- --all

# 강제 푸시
git push origin main --force
```

3. **수동 업로드 (응급시):**
```bash
# 필수 파일만 포함한 새 폴더 생성
mkdir /Users/markit/Desktop/SageTalk
rsync -av --progress /Users/markit/Documents/SageTalk/ /Users/markit/Desktop/SageTalk/ \
--exclude="node_modules" \
--exclude=".next" \
--exclude="logs" \
--exclude=".git" \
--exclude="*.log"
```

---

## 🔧 Git 관련 문제

### 문제 2: Git Lock 파일 오류

**증상:**
```bash
fatal: Unable to create '/Users/markit/Documents/SageTalk/.git/index.lock': File exists.
```

**해결 방법:**
```bash
# Git lock 파일 제거
rm -f .git/index.lock

# 또는 모든 lock 파일 제거
find .git -name "*.lock" -delete
```

### 문제 3: Git 충돌 해결

**증상:**
```bash
error: The following untracked working tree files would be overwritten by checkout
```

**해결 방법:**
```bash
# 강제 정리 후 브랜치 전환
git clean -fdx
git checkout main

# 또는 특정 파일만 제거
git clean -fd
git checkout main
```

### 문제 4: Git 저장소 동기화 문제

**해결 방법:**
```bash
# 로컬과 원격 동기화
git fetch origin
git reset --hard origin/main

# 강제 푸시 (주의!)
git push origin main --force-with-lease
```

---

## 💻 TypeScript 컴파일 오류

### 문제 5: OpenAI API 타입 오류

**증상:**
```bash
Type '{ role: string; content: string; }' is not assignable to type 'ChatCompletionMessageParam'
Property 'name' is missing in type '{ role: string; content: string; }' but required in type 'ChatCompletionFunctionMessageParam'
```

**해결 방법:**

1. **명시적 타입 캐스팅:**
```typescript
// ❌ 잘못된 방법
...messages.slice(-10).map(msg => ({
  role: msg.role === 'user' ? 'user' : 'assistant',
  content: msg.content
}))

// ✅ 올바른 방법
...messages.slice(-10).map(msg => {
  const role = msg.role === 'user' ? 'user' : 'assistant';
  return {
    role: role as 'user' | 'assistant',
    content: msg.content
  };
})
```

2. **as const 사용:**
```typescript
...messages.slice(-10).map(msg => ({
  role: msg.role === 'user' ? 'user' : 'assistant',
  content: msg.content
} as const))
```

### 문제 6: 객체 인덱싱 타입 오류

**증상:**
```bash
Element implicitly has an 'any' type because expression of type 'any' can't be used to index type
```

**해결 방법:**
```typescript
// ❌ 잘못된 방법
const systemPrompt = MENTOR_PROMPTS[mentor] || `기본값`;

// ✅ 올바른 방법
const systemPrompt = MENTOR_PROMPTS[mentor as keyof typeof MENTOR_PROMPTS] || `기본값`;
```

### 문제 7: 정의되지 않은 변수 오류

**증상:**
```bash
Cannot find name 'timestamp'
```

**해결 방법:**
```typescript
// ❌ 잘못된 방법
const sageContent = `\n### ${fileName.replace('.md', '')} - ${timestamp}\n`;

// ✅ 올바른 방법
const sageContent = `\n### ${fileName.replace('.md', '')} - ${new Date().toLocaleString('ko-KR')}\n`;
```

### 문제 8: 함수명 오류

**증상:**
```bash
Cannot find name 'setMessages'. Did you mean 'postMessage'?
```

**해결 방법:**
```typescript
// ❌ 잘못된 방법
setMessages(prev => [...prev, systemMsg]);

// ✅ 올바른 방법
setChatMessages(prev => [...prev, systemMsg]);
```

---

## 🔄 Vercel 캐싱 문제

### 문제 9: Vercel이 이전 커밋 사용

**증상:** Vercel이 최신 커밋을 인식하지 못함

**해결 방법:**

1. **Git 연결 해제 후 재연결:**
   - Vercel 대시보드 → Settings → Git
   - "Disconnect" 클릭
   - "Connect Git Repository" 클릭
   - GitHub 저장소 다시 선택

2. **강제 재배포:**
```bash
# 새로운 커밋 생성
echo "# Force redeploy $(date)" >> README.md
git add README.md
git commit -m "Force redeploy - $(date)"
git push origin main
```

3. **Vercel 프로젝트 재생성:**
   - Vercel 대시보드에서 프로젝트 삭제
   - "New Project" → GitHub 저장소 선택
   - "Import" 클릭

### 문제 10: 빌드 캐시 문제

**해결 방법:**
- Vercel 대시보드에서 "Redeploy" 클릭
- **"Use existing Build Cache" 체크박스 해제**
- "Redeploy" 클릭

---

## ⚙️ 환경 변수 설정

### 문제 11: OpenAI API 키 설정

**해결 방법:**

1. **Vercel 대시보드에서 설정:**
   - Settings → Environment Variables
   - Name: `OPENAI_API_KEY`
   - Value: `sk-...` (실제 API 키)
   - Environment: Production, Preview, Development 모두 선택

2. **로컬 환경 변수 (.env.local):**
```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

**⚠️ 주의사항:**
- API 키는 절대 코드에 하드코딩하지 말 것
- `.env.local` 파일은 `.gitignore`에 포함
- Vercel에서는 환경 변수로만 관리

---

## 🚫 자동 배포 실패

### 문제 12: Git 연결 후 자동 배포 안됨

**해결 방법:**

1. **수동 트리거:**
```bash
# 새로운 커밋으로 배포 트리거
echo "# Trigger deployment $(date)" >> README.md
git add README.md
git commit -m "Trigger deployment - $(date)"
git push origin main
```

2. **Vercel CLI 사용:**
```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 수동 배포
vercel --prod --yes
```

3. **웹훅 확인:**
   - GitHub 저장소 → Settings → Webhooks
   - Vercel webhook이 정상 등록되어 있는지 확인

---

## 🆘 응급 상황 대응

### 문제 13: 완전한 배포 실패

**응급 해결 방법:**

1. **새로운 Vercel 프로젝트 생성:**
   - Vercel 대시보드 → "New Project"
   - GitHub 저장소 선택
   - Root Directory: `websagechat` 설정
   - "Deploy" 클릭

2. **Git 저장소 재초기화:**
```bash
# 기존 저장소 백업
cp -r /Users/markit/Documents/SageTalk /Users/markit/Documents/SageTalk_backup

# 새 저장소 생성
cd /Users/markit/Documents
rm -rf SageTalk
git clone https://github.com/yongpork/sagetalk.git SageTalk

# 최신 브랜치로 전환
cd SageTalk
git checkout main
git pull origin main
```

3. **필수 파일만 업로드:**
```bash
# 필수 파일만 포함한 압축 파일 생성
tar -czf sagetalk-essential.tar.gz \
--exclude=node_modules \
--exclude=.next \
--exclude=logs \
--exclude=.git \
websagechat/
```

---

## 📊 배포 상태 확인

### 성공적인 배포 확인 방법:

1. **Vercel 대시보드:**
   - Status: "Ready" (초록색)
   - Error Rate: 0%
   - 최신 커밋 해시 확인

2. **애플리케이션 테스트:**
   - "Visit" 버튼으로 실제 사이트 접속
   - 모든 채팅방 정상 로딩 확인
   - API 응답 정상 확인

3. **로그 확인:**
   - Vercel 대시보드 → Logs
   - Runtime Logs에서 오류 없음 확인

---

## 🔍 디버깅 체크리스트

배포 문제 발생 시 다음 순서로 확인:

- [ ] `.gitignore` 파일에 불필요한 파일들이 제외되어 있는가?
- [ ] Git 저장소가 깨끗한 상태인가? (`git status` 확인)
- [ ] TypeScript 컴파일 오류가 없는가? (`npm run build` 로컬 테스트)
- [ ] Vercel이 최신 커밋을 사용하고 있는가?
- [ ] 환경 변수가 올바르게 설정되어 있는가?
- [ ] GitHub webhook이 정상 작동하는가?

---

## 📞 추가 도움

문제가 지속될 경우:

1. **Vercel 공식 문서:** https://vercel.com/docs
2. **Next.js 배포 가이드:** https://nextjs.org/docs/deployment
3. **GitHub Actions:** https://docs.github.com/en/actions
4. **TypeScript 컴파일러 옵션:** https://www.typescriptlang.org/tsconfig

---

**💡 팁:** 이 가이드를 참고하여 문제를 해결한 후, 새로운 문제와 해결 방법을 이 문서에 추가하여 지속적으로 업데이트하세요.

**마지막 업데이트:** 2025년 9월 21일  
**문서 버전:** 1.0
