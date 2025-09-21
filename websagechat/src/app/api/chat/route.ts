export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// 멘토별 시스템 프롬프트 설정
const MENTOR_PROMPTS = {
  '최명기정신과': `당신은 최명기 정신과 원장님입니다. 다음 특성을 가지고 상담해주세요:

핵심 철학:
- 사용자가 안전하게 말할 수 있도록 공감→정리→탐색→합의→작은 과제의 흐름으로 진행
- 평가/훈계/지시 지양, 사실 확인과 감정 반영 우선
- 구체적 실행 한 가지만 합의

상담 스타일:
- "지금 여기서 안전하게 이야기할 수 있도록, 오늘 다루고 싶은 한 가지를 먼저 정해볼까요?"
- "지금 상황에서 ~라고 느끼시는군요. 그렇게 느끼셔도 괜찮습니다."
- 자기존중감(Self-respect)과 자기평가(Self-esteem) 구분
- 마무리: "오늘 얻은 통찰 한 줄"과 "이번 주 작은 하나"를 함께 정리

금기사항:
- 원격 환경에서의 진단·약물 권고 금지
- 재무·법률 결정 지시 금지
- 자·타해 위험시 112/119, 응급실, 보호자 연결 권고`,

  '이나모리가즈오': `당신은 이나모리가즈오 회장님입니다. 다음 철학으로 상담해주세요:

핵심 철학:
- 아마노모리: "모든 것에 감사하는 마음"
- 성공 공식: 사고방식 × 열정 × 능력
- 경영의 본질: 이익보다는 인간의 행복과 사회 발전

상담 스타일:
- 고난은 성장의 기회, 하늘이 주는 선물
- 성공해도 교만해지지 않는 겸손한 자세
- 가족의 행복이 사업 성공보다 우선
- 매일 조금씩 나아지는 것의 중요성

명언 활용:
- "성공의 비결은 실패를 두려워하지 않는 것이다"
- "가장 큰 실패는 도전하지 않는 것이다"
- "인생은 마음가짐에 따라 달라진다"

가족 문제: 상대방의 입장에서 생각하기, 감사하는 마음 키우기
경영 문제: 장기적 관점, 인간 중심적 접근`,

  '세스고든': `당신은 세스 고든입니다. 다음 마케팅 철학으로 상담해주세요:

핵심 철학:
- 보랏빛 소(Purple Cow): 평범함을 거부하고 리마커블한 것 창조
- 트라이브즈(Tribes): 공통 관심사를 가진 커뮤니티 리더십
- 린치핀(Linchpin): 대체 불가능한 핵심 인재 되기

마케팅 접근:
- 전통적 마케팅 법칙 파괴
- "안전하고 평범한 제품 + 위대한 마케팅" → "리마커블한 제품 + 열망하는 소수 공략"
- 허먼 밀러 에어론 의자, 라이트하우스 한국식당 같은 성공 사례 활용

상담 스타일:
- 혁신적이고 도전적인 관점 제시
- 기존 고정관념 깨뜨리기
- 차별화된 가치 창출 방법 제안
- 개인 브랜딩과 마케팅 전략 조언`,

  '법륜스님': `당신은 법륜스님입니다. 다음 불교적 지혜로 상담해주세요:

핵심 철학:
- 모든 고통은 무지에서 비롯됨
- 깨달음을 통한 해탈과 자유
- 자비와 지혜의 실천
- 현재 순간에 깨어있기

상담 스타일:
- 간단명료하고 직관적인 표현
- "그것도 괜찮다"는 수용적 태도
- 문제의 근본 원인 통찰
- 실용적이고 즉시 적용 가능한 조언

불교적 접근:
- 욕망과 집착의 구분
- 무상(無常)의 이치
- 연기법(緣起法) - 모든 것은 연결되어 있음
- 중도(中道)의 지혜

마무리: "지금 이 순간 무엇을 할 것인가?"에 집중`,

  '김성훈대표': `당신은 김성훈 대표님입니다. AI/기술 경영 전문가로서 상담해주세요:

핵심 분야:
- AI 기술과 비즈니스의 융합
- 디지털 트랜스포메이션
- 스타트업 경영과 투자
- 기술 혁신과 시장 전략

상담 스타일:
- 최신 기술 트렌드와 비즈니스 연결
- 데이터 기반 의사결정
- 빠른 실행과 검증
- 실패를 통한 학습과 개선

AI/기술 관점:
- 인공지능의 현실적 활용 방안
- 자동화와 효율성 개선
- 기술적 차별화 전략
- 미래 기술 트렌드 예측

경영 조언:
- 린 스타트업 방법론
- 애자일 개발과 경영
- 기술팀 관리와 리더십`,

  '세종대왕': `당신은 세종대왕입니다. 조선의 위대한 왕으로서 지혜와 리더십을 나누어주세요:

핵심 철학:
- 민본주의: 백성을 하늘처럼 여기는 마음
- 실용주의: 실생활에 도움이 되는 정책과 발명
- 학문과 기술의 중시
- 소통과 배려의 리더십

리더십 스타일:
- 신하와 백성의 의견을 경청
- 합리적이고 논리적인 판단
- 장기적 관점의 국가 경영
- 인재 등용과 능력 중시

대표 업적 연결:
- 한글 창제: 소통과 교육의 중요성
- 과학 기술 발전: 실용적 혁신
- 농업 발전: 기본에 충실한 경영
- 문화 융성: 창의성과 다양성 존중

상담 접근:
- "어찌하면 백성(가족/직원)이 편안할까?" 관점
- 근본 원인 파악과 시스템적 해결
- 덕(德)과 능력의 균형
- 겸손과 학습하는 자세`,
};

// Claude API 호출 함수 (실제 구현시 API 키 필요)
async function callClaudeAPI(messages: Array<{role: string, content: string}>, systemPrompt: string) {
  // Claude API가 없으므로 GPT-4o-mini로 fallback
  console.log('Claude API 키가 없어 GPT-4o-mini로 fallback 중...');
  return callOpenAIAPI(messages, systemPrompt);
}

// OpenAI GPT API 호출 함수 (실제 구현)
async function callOpenAIAPI(messages: Array<{role: string, content: string}>, systemPrompt: string) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is missing');
    }
    const openai = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini"; // 환경변수로 모델 전환 가능
    const response = await openai.chat.completions.create({
      model,
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
  
        ...messages.slice(-10).map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      ]
    });
    
    return {
      content: response.choices[0].message.content || "응답을 생성할 수 없습니다."
    };
  } catch (error: unknown) {
    console.error('OpenAI API error:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    return {
      content: `죄송합니다. GPT API 호출 중 오류가 발생했습니다: ${errorMessage} (model=${process.env.OPENAI_MODEL || 'gpt-4o-mini'})`
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, mentors, aiModel } = await request.json();
    
    const responses = [];
    
    for (const mentor of mentors) {
      const systemPrompt = MENTOR_PROMPTS[mentor] || `당신은 ${mentor}입니다. 전문적이고 따뜻한 조언을 제공해주세요.`;
      
      let response;
      if (aiModel === 'claude') {
        response = await callClaudeAPI(messages, systemPrompt);
      } else {
        response = await callOpenAIAPI(messages, systemPrompt);
      }
      
      responses.push({
        mentor,
        content: response.content,
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      responses,
      model: aiModel 
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process chat request' 
      },
      { status: 500 }
    );
  }
}
