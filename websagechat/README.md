# SageTalk - AI 멘토 상담 시스템

**작성일:** 2025년 10월 8일
**기술 스택:** Static HTML + jQuery + Node.js Serverless Functions

## 📋 프로젝트 개요

SageTalk는 AI 멘토와 대화할 수 있는 웹 기반 상담 시스템입니다.
사용자가 원하는 멘토를 선택하고 실시간으로 대화할 수 있습니다.

## 🛠 기술 스택

### 프론트엔드
- **HTML5**: 웹페이지 구조
- **CSS3**: 모던한 UI 디자인 (그라데이션, 애니메이션)
- **jQuery 3.6.0**: DOM 조작 및 AJAX 통신

### 백엔드
- **Node.js**: 서버 런타임
- **Express**: 로컬 개발 서버
- **Vercel Serverless Functions**: 프로덕션 배포
- **OpenAI API**: GPT-4o/GPT-4o-mini로 멘토 응답 생성

## 📁 프로젝트 구조

```
websagechat/
├── public/                 # 정적 파일 (프론트엔드)
│   ├── index.html         # 멘토 선택 페이지
│   ├── chat.html          # 채팅방 페이지
│   ├── css/
│   │   └── style.css      # 전체 스타일
│   ├── js/
│   │   ├── mentor-select.js  # 멘토 선택 로직
│   │   └── chat.js           # 채팅 로직
│   ├── photo/             # 멘토 프로필 이미지
│   └── mentors.json       # 멘토 데이터
├── api/                   # Serverless Functions (백엔드)
│   ├── chat.js           # 채팅 API
│   ├── create-room.js    # 대화방 생성 API
│   ├── history.js        # 대화 내역 조회 API
│   └── save-conversation.js  # 대화 저장 API
├── server.js             # 로컬 개발 서버
├── vercel.json           # Vercel 배포 설정
├── package.json          # 의존성 관리
└── .env.local            # 환경 변수 (Git 제외)
```

## 🚀 로컬 개발 시작하기

### 1단계: 환경 설정

```bash
# .env.example을 .env.local로 복사
cp .env.example .env.local

# .env.local 파일 편집
# OPENAI_API_KEY=sk-your-actual-api-key-here
# OPENAI_MODEL=gpt-4o
```

### 2단계: 의존성 설치

```bash
npm install
```

### 3단계: 개발 서버 실행

```bash
node server.js
```

서버가 http://localhost:3000 에서 실행됩니다.

## 📦 Vercel 배포

### 배포 설정

1. **Vercel CLI 로그인**
```bash
vercel login
```

2. **프로젝트 배포**
```bash
vercel
```

3. **환경 변수 설정**
```bash
vercel env add OPENAI_API_KEY
vercel env add OPENAI_MODEL
```

### 환경 변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `OPENAI_API_KEY` | OpenAI API 키 | `sk-...` |
| `OPENAI_MODEL` | 사용할 모델 | `gpt-4o` 또는 `gpt-4o-mini` |

## 🎯 주요 기능

### 1. 멘토 선택 (index.html)
- 6명의 AI 멘토 중 선택
- 실시간 검색 기능
- 다중 선택 가능
- 선택된 멘토 아바타 표시

### 2. 채팅 (chat.html)
- 선택된 멘토와 실시간 대화
- OpenAI GPT로 멘토 응답 생성
- 로딩 인디케이터
- 말풍선 UI

### 3. 멘토 목록
- **김성훈 대표님**: AI/기술/경영
- **법륜스님**: 인생상담/깨달음
- **세스 고든**: 마케팅 혁신
- **세종대왕님**: 리더십/지혜
- **이나모리 가즈오**: 경영철학
- **최명기 선생님**: 심리상담/정신건강

## 🔧 개발 가이드

### API 엔드포인트

#### POST /api/create-room
대화방 생성
```json
Request: { "mentorIds": ["kim-ceo", "beop-monk"] }
Response: { "roomId": "room-kim-ceo-beop-monk-1234567890" }
```

#### POST /api/chat
멘토 응답 받기
```json
Request: {
  "roomId": "room-kim-ceo-1234567890",
  "message": "안녕하세요",
  "mentorIds": ["kim-ceo"]
}
Response: {
  "responses": [{
    "mentorId": "kim-ceo",
    "message": "안녕하세요! AI 기술에 대해...",
    "timestamp": "2025-10-08T..."
  }]
}
```

#### GET /api/history?roomId=xxx
대화 내역 조회 (향후 구현)

## ⚠️ 주의사항

### 보안
- `.env.local` 파일은 절대 Git에 커밋하지 마세요
- API 키는 백엔드(api/*.js)에만 작성하세요
- 프론트엔드에 API 키를 노출하지 마세요

### Vercel Serverless 제한
- Function 최대 실행 시간: 30초
- 무료 플랜: 월 100GB 트래픽
- Cold Start: 첫 요청이 1-3초 느릴 수 있음

### 데이터 저장
- 현재 대화 내역은 저장되지 않음
- 향후 데이터베이스(Supabase, MongoDB 등) 연동 필요

## 🐛 문제 해결

### 서버가 시작되지 않음
```bash
# 포트 사용 확인
lsof -i :3000

# 프로세스 종료
pkill -f "node server.js"
```

### API 오류
```bash
# 환경 변수 확인
cat .env.local

# OpenAI API 키 유효성 확인
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

## 📄 라이선스

Private Project

## 👨‍💻 개발자

개발일: 2025년 10월 8일 (화)
버전: 1.0.0
