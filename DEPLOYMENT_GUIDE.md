# SageTalk GitHub 배포 가이드

## 🚀 빠른 배포 가이드

### 1단계: GitHub 저장소 생성
1. [GitHub](https://github.com) 로그인
2. "New repository" 클릭
3. 저장소 이름: `SageTalk`
4. 설명: "AI 멘토 상담 시스템"
5. Public/Private 선택
6. "Create repository" 클릭

### 2단계: 로컬 저장소 연결
```bash
# 현재 디렉토리에서 실행
cd /Users/markit/Documents/SageTalk

# GitHub 저장소와 연결
git remote add origin https://github.com/[your-username]/SageTalk.git

# 첫 번째 커밋
git add .
git commit -m "Initial commit: SageTalk 멘토 상담 시스템"

# 메인 브랜치로 푸시
git branch -M main
git push -u origin main
```

### 3단계: Vercel 배포
1. [Vercel](https://vercel.com) 계정 생성 (GitHub 연동)
2. "New Project" 클릭
3. GitHub 저장소 선택: `SageTalk`
4. 프로젝트 설정:
   - **Framework Preset**: Next.js
   - **Root Directory**: `websagechat`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 4단계: 환경 변수 설정
Vercel 프로젝트 설정에서 환경 변수 추가:

| 변수명 | 값 | 환경 |
|--------|-----|------|
| `OPENAI_API_KEY` | `sk-your-actual-api-key` | Production, Preview, Development |
| `OPENAI_MODEL` | `gpt-4o-mini` | Production, Preview, Development |

### 5단계: 배포 완료
- 자동 배포 시작
- 배포 완료 후 제공되는 URL로 접속
- 애플리케이션 테스트

## 📋 배포 체크리스트

### 사전 준비
- [ ] OpenAI API 키 준비
- [ ] GitHub 계정 생성
- [ ] Vercel 계정 생성
- [ ] 프로젝트 빌드 테스트 완료

### Git 설정
- [ ] Git 저장소 초기화
- [ ] .gitignore 파일 생성
- [ ] README.md 업데이트
- [ ] 첫 번째 커밋 완료

### GitHub 업로드
- [ ] GitHub 저장소 생성
- [ ] 로컬 저장소 연결
- [ ] 코드 푸시 완료

### Vercel 배포
- [ ] Vercel 프로젝트 생성
- [ ] GitHub 저장소 연결
- [ ] 빌드 설정 확인
- [ ] 환경 변수 설정
- [ ] 배포 완료

### 배포 후 테스트
- [ ] 웹사이트 접속 확인
- [ ] 채팅 기능 테스트
- [ ] 멘토 응답 확인
- [ ] 모바일 반응형 테스트

## 🔧 고급 설정

### 커스텀 도메인 설정
1. Vercel 프로젝트 설정
2. "Domains" 섹션
3. 도메인 추가 및 DNS 설정

### CI/CD 자동화
- GitHub Actions 설정
- 자동 테스트 실행
- 자동 배포 설정

### 모니터링 설정
- Vercel Analytics 활성화
- 에러 로깅 설정
- 성능 모니터링

## 🚨 문제 해결

### 일반적인 배포 오류

#### 빌드 실패
```bash
# 로컬에서 빌드 테스트
cd websagechat
npm run build
```

#### 환경 변수 오류
- Vercel 환경 변수 설정 확인
- 변수명 대소문자 확인
- API 키 유효성 확인

#### 라우팅 오류
- Next.js App Router 설정 확인
- API 라우트 경로 확인

## 📊 배포 후 관리

### 정기 업데이트
1. 코드 수정
2. Git 커밋 및 푸시
3. Vercel 자동 재배포

### 백업 관리
- GitHub 저장소 백업
- 환경 변수 백업
- 데이터베이스 백업 (필요시)

### 성능 최적화
- 이미지 최적화
- 번들 크기 최적화
- 캐싱 전략 설정

## 📞 지원

배포 과정에서 문제가 발생하면:
1. [Vercel 문서](https://vercel.com/docs)
2. [Next.js 문서](https://nextjs.org/docs)
3. 프로젝트 이슈 트래커에 문의
