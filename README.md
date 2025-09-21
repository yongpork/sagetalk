# SageTalk - 멘토 상담 시스템 (Mentor Counseling System)

## 프로젝트 개요
이 프로젝트는 위대한 인물들의 지혜와 철학을 바탕으로 개인적인 고민과 문제를 상담하는 AI 멘토링 시스템입니다. 가족 문제, 스트레스 관리, 비즈니스 문제 등 다양한 주제에 대해 전문적인 상담을 제공합니다.

## 🚀 배포 상태
- **웹 애플리케이션**: Next.js 기반 실시간 채팅 시스템
- **배포 플랫폼**: Vercel (GitHub 연동)
- **AI 모델**: OpenAI GPT-4o-mini
- **상태**: 개발 완료, 배포 준비 중

## 📁 프로젝트 구조
```
SageTalk/
├── README.md                           # 프로젝트 개요 및 배포 가이드
├── websagechat/                        # Next.js 웹 애플리케이션
│   ├── src/
│   │   ├── app/                        # Next.js App Router
│   │   ├── components/                 # UI 컴포넌트
│   │   └── lib/                        # 유틸리티 함수
│   ├── package.json                    # 의존성 및 스크립트
│   ├── vercel.json                     # Vercel 배포 설정
│   └── next.config.ts                  # Next.js 설정
├── Conversation/                       # 대화 기록 저장소
├── mentors/                            # 멘토 프로필 디렉토리
├── utils/                              # 유틸리티 스크립트
└── 멘토상담시스템_가이드.md            # 시스템 전체 가이드라인
```

## 멘토 소개

### 1. 이나모리가즈오 (稲盛和夫)
- **전문 분야**: 경영철학, 인생관, 가족관계
- **핵심 철학**: 아마노모리(감사하는 마음), 인간 중심 경영
- **상담 스타일**: 겸손하고 실용적인 조언

### 2. 일런 머스크 (Elon Musk)
- **전문 분야**: 혁신, 도전, 목표 달성
- **핵심 철학**: 첫 번째 원칙 사고, 혁신적 문제 해결
- **상담 스타일**: 체계적이고 창의적인 접근

### 3. 세종대왕 (世宗大王)
- **전문 분야**: 리더십, 교육, 실용주의
- **핵심 철학**: 민본주의, 실용적 접근, 지속적 개선
- **상담 스타일**: 체계적이고 교육적인 관점

## 사용법

### 1. 상담 시작
상담하고 싶은 주제나 문제를 자유롭게 말씀해 주세요. 예시:
- "가족과의 관계가 어려워요"
- "업무 스트레스가 심해요"
- "마크잇 운영에 대한 조언이 필요해요"

### 2. 멘토 선택
시스템이 문제 유형에 따라 적합한 멘토를 추천하거나, 특정 멘토의 관점에서 상담받고 싶다면 직접 요청할 수 있습니다.

### 3. 상담 진행
선택된 멘토의 철학과 경험을 바탕으로:
- 문제 분석
- 멘토의 관점에서의 조언
- 구체적이고 실천 가능한 해결 방안
- 단계별 실행 계획

## 상담 주제

### 가족 문제
- 부모-자녀 관계
- 부부 관계
- 가족 간 소통
- 가족 교육

### 스트레스 관리
- 업무 스트레스
- 인간관계 스트레스
- 개인적 고민
- 감정 관리

### 비즈니스 문제
- 경영 전략
- 팀 관리
- 고객 서비스
- 혁신과 성장

## 시스템 특징

### 1. 다각적 관점
- 각 멘토의 고유한 철학과 접근법
- 문제를 다양한 각도에서 분석
- 종합적이고 균형 잡힌 조언

### 2. 실용적 조언
- 이론보다는 실천 가능한 방법
- 단계별 실행 계획
- 지속적 모니터링 방안

### 3. 개인화된 접근
- 개인의 상황과 배경 고려
- 감정적 지지와 동기부여
- 지속적인 성장 지원

## 🛠️ 개발 환경 설정

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn
- OpenAI API 키

### 로컬 개발 환경 설정
```bash
# 저장소 클론
git clone https://github.com/[your-username]/SageTalk.git
cd SageTalk/websagechat

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에 OPENAI_API_KEY 추가

# 개발 서버 실행
npm run dev
```

## 🚀 배포 가이드

### 1. GitHub 저장소 생성
1. GitHub에서 새 저장소 생성
2. 로컬 저장소와 연결:
```bash
git remote add origin https://github.com/[your-username]/SageTalk.git
git branch -M main
git push -u origin main
```

### 2. Vercel 배포
1. [Vercel](https://vercel.com) 계정 생성
2. GitHub 저장소 연결
3. 환경 변수 설정:
   - `OPENAI_API_KEY`: OpenAI API 키
   - `OPENAI_MODEL`: gpt-4o-mini
4. 자동 배포 완료

### 3. 환경 변수 설정
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

## 📱 사용법

### 웹 애플리케이션
1. 배포된 URL 접속
2. 채팅방 생성 또는 기존 방 참여
3. 멘토와 실시간 대화 시작

### 멘토 선택
- **김상무님 (김성훈)**: 경영 전략, 비즈니스 문제
- **법상무님 (법륜스님)**: 마음가짐, 스트레스 관리
- **이상무님 (이나모리 가즈오)**: 경영철학, 인생관
- **최상무님 (최명기)**: 심리 상담, 감정 관리

## 🔧 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4o-mini
- **Deployment**: Vercel
- **Version Control**: Git, GitHub

## 📋 주요 기능

- 실시간 AI 채팅
- 멘토별 맞춤 상담
- 대화 기록 저장
- 반응형 웹 디자인
- 다크/라이트 모드

## 🚨 주의사항

- 이 시스템은 참고용 상담 도구입니다
- 심각한 정신 건강 문제는 전문의와 상담하세요
- 개인정보나 민감한 정보는 공유하지 마세요
- OpenAI API 사용량에 따른 비용이 발생할 수 있습니다

## 📄 라이선스

이 프로젝트는 교육 및 개인 사용 목적으로 제작되었습니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**SageTalk**으로 더 나은 자신과 가족, 비즈니스를 만들어가세요! 🚀
