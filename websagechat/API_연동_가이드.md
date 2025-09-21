# WebSageChat API 연동 가이드

## 🔑 API 키 설정

### 1. 환경 변수 파일 생성
`.env.local` 파일을 websagechat 폴더에 생성:

```env
# Claude API (Anthropic)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx...

# OpenAI GPT API  
OPENAI_API_KEY=sk-xxxxx...

# Next.js 앱 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. 필요한 패키지 설치
```bash
npm install @anthropic-ai/sdk openai
```

## 🛠️ API 연동 구현

### 1. Claude API 연동 (route.ts 수정)

```typescript
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Claude API 호출 함수 (실제 구현)
async function callClaudeAPI(messages: any[], systemPrompt: string) {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    });
    
    return {
      content: response.content[0].text
    };
  } catch (error) {
    console.error('Claude API error:', error);
    return {
      content: "죄송합니다. Claude API 호출 중 오류가 발생했습니다."
    };
  }
}

// OpenAI GPT API 호출 함수 (실제 구현)
async function callOpenAIAPI(messages: any[], systemPrompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ]
    });
    
    return {
      content: response.choices[0].message.content || "응답을 생성할 수 없습니다."
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      content: "죄송합니다. GPT API 호출 중 오류가 발생했습니다."
    };
  }
}
```

## 🔄 API 키 획득 방법

### Claude API (Anthropic)
1. https://console.anthropic.com 방문
2. 계정 생성 및 로그인
3. API Keys 섹션에서 새 키 생성
4. 월 $20-50 정도 예산 (사용량에 따라)

### OpenAI API
1. https://platform.openai.com 방문
2. 계정 생성 및 로그인
3. API Keys 섹션에서 새 키 생성
4. 월 $15-40 정도 예산 (사용량에 따라)

## 📊 비용 예상

### 월간 예상 비용
- **Claude API**: $20-50 (Sonnet 모델 기준)
- **OpenAI API**: $15-40 (GPT-4 기준)
- **총 예상 비용**: $35-90/월

### 비용 절약 팁
1. 짧은 대화로 유지
2. 시스템 프롬프트 최적화
3. 캐싱 활용 (같은 질문 반복 방지)

## 🧪 테스트 방법

### 1. API 키 유효성 확인
```typescript
// 테스트 코드를 route.ts에 임시 추가
console.log('Claude API Key:', process.env.ANTHROPIC_API_KEY?.substring(0, 10) + '...');
console.log('OpenAI API Key:', process.env.OPENAI_API_KEY?.substring(0, 10) + '...');
```

### 2. 간단한 테스트 메시지
WebSageChat에서 "안녕하세요" 라고 보내서 실제 AI 응답 확인

## 🔒 보안 주의사항

1. **API 키 노출 금지**
   - .env.local 파일을 .gitignore에 추가
   - 코드에 직접 API 키 하드코딩 금지

2. **요청 제한 설정**
   - Rate limiting 구현
   - 사용량 모니터링

3. **에러 처리**
   - API 호출 실패 시 적절한 fallback 제공
   - 사용자에게 친화적인 에러 메시지

## ✅ 체크리스트

- [ ] Claude API 키 발급
- [ ] OpenAI API 키 발급  
- [ ] .env.local 파일 생성
- [ ] API 클라이언트 라이브러리 설치
- [ ] route.ts 파일 실제 API 호출로 수정
- [ ] 테스트 메시지로 동작 확인
- [ ] 비용 모니터링 설정
