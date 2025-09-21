# 환경 변수 설정 가이드

## 📋 필수 환경 변수

SageTalk 애플리케이션을 실행하기 위해 다음 환경 변수들이 필요합니다.

### 1. OpenAI API 설정

#### OPENAI_API_KEY
- **설명**: OpenAI API를 사용하기 위한 인증 키
- **필수**: ✅ 필수
- **형식**: `sk-...`로 시작하는 문자열
- **획득 방법**: 
  1. [OpenAI Platform](https://platform.openai.com) 접속
  2. 계정 생성 및 로그인
  3. API Keys 섹션에서 새 키 생성
  4. 생성된 키를 안전하게 보관

#### OPENAI_MODEL
- **설명**: 사용할 OpenAI 모델 지정
- **기본값**: `gpt-4o-mini`
- **권장 모델**:
  - `gpt-4o-mini`: 비용 효율적, 빠른 응답
  - `gpt-4o`: 더 정확한 응답, 높은 비용
  - `gpt-3.5-turbo`: 가장 저렴한 옵션

## 🛠️ 환경 변수 설정 방법

### 로컬 개발 환경

#### 1. .env.local 파일 생성
```bash
# websagechat 디렉토리에서 실행
cd websagechat
touch .env.local
```

#### 2. 환경 변수 추가
```env
# .env.local 파일 내용
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

#### 3. 파일 권한 설정 (선택사항)
```bash
chmod 600 .env.local
```

### Vercel 배포 환경

#### 1. Vercel 대시보드 접속
1. [Vercel Dashboard](https://vercel.com/dashboard) 로그인
2. 프로젝트 선택

#### 2. 환경 변수 설정
1. **Settings** 탭 클릭
2. **Environment Variables** 섹션으로 이동
3. 다음 변수들 추가:

| 변수명 | 값 | 환경 |
|--------|-----|------|
| `OPENAI_API_KEY` | `sk-your-actual-api-key-here` | Production, Preview, Development |
| `OPENAI_MODEL` | `gpt-4o-mini` | Production, Preview, Development |

#### 3. 배포 재시작
환경 변수 추가 후 자동으로 재배포됩니다.

## 🔒 보안 주의사항

### API 키 보안
- ✅ **DO**: 환경 변수 파일 사용
- ✅ **DO**: .gitignore에 .env* 파일 추가
- ✅ **DO**: Vercel 환경 변수 사용
- ❌ **DON'T**: 코드에 API 키 하드코딩
- ❌ **DON'T**: 공개 저장소에 API 키 커밋
- ❌ **DON'T**: 클라이언트 사이드에서 API 키 노출

### 권한 관리
- OpenAI API 키는 최소 권한으로 설정
- 정기적으로 API 키 로테이션
- 사용량 모니터링 설정

## 🧪 환경 변수 테스트

### 로컬 테스트
```bash
# 환경 변수 로드 확인
node -e "console.log(process.env.OPENAI_API_KEY ? 'API Key loaded' : 'API Key missing')"
```

### Vercel 테스트
1. Vercel 함수에서 환경 변수 출력
2. 배포된 애플리케이션에서 API 호출 테스트

## 📊 비용 관리

### OpenAI API 사용량 모니터링
1. [OpenAI Usage Dashboard](https://platform.openai.com/usage) 확인
2. 월별 사용량 제한 설정
3. 비용 알림 설정

### 권장 설정
- **개발 환경**: `gpt-4o-mini` 사용
- **프로덕션**: 필요에 따라 `gpt-4o` 또는 `gpt-4o-mini`
- **사용량 제한**: 월 $50-100 정도로 시작

## 🚨 문제 해결

### 일반적인 오류

#### "API key not found"
- 환경 변수 파일 경로 확인
- 파일명이 정확한지 확인 (.env.local)
- 애플리케이션 재시작

#### "Invalid API key"
- API 키 형식 확인 (sk-로 시작)
- OpenAI 계정 상태 확인
- API 키 권한 확인

#### "Rate limit exceeded"
- API 사용량 확인
- 요청 빈도 조절
- 더 높은 등급 계정 고려

## 📞 지원

문제가 지속되면 다음을 확인하세요:
1. [OpenAI API 문서](https://platform.openai.com/docs)
2. [Vercel 환경 변수 가이드](https://vercel.com/docs/concepts/projects/environment-variables)
3. 프로젝트 이슈 트래커에 문제 보고
