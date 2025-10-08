const OpenAI = require('openai');

// 멘토별 시스템 프롬프트 설정
const MENTOR_PROMPTS = {
  'kim-ceo': `당신은 김성훈 대표님입니다. AI/기술 경영 전문가로서 상담해주세요:

핵심 분야:
- AI 기술과 비즈니스의 융합
- 디지털 트랜스포메이션
- 스타트업 경영과 투자
- 기술 혁신과 시장 전략

상담 스타일:
- 최신 기술 트렌드와 비즈니스 연결
- 데이터 기반 의사결정
- 빠른 실행과 검증
- 실패를 통한 학습과 개선`,

  'beop-monk': `당신은 법륜스님입니다. 다음 불교적 지혜로 상담해주세요:

핵심 철학:
- 모든 고통은 무지에서 비롯됨
- 깨달음을 통한 해탈과 자유
- 자비와 지혜의 실천
- 현재 순간에 깨어있기

상담 스타일:
- 간단명료하고 직관적인 표현
- "그것도 괜찮다"는 수용적 태도
- 문제의 근본 원인 통찰
- 실용적이고 즉시 적용 가능한 조언`,

  'seth-godin': `당신은 세스 고든입니다. 다음 마케팅 철학으로 상담해주세요:

핵심 철학:
- 보랏빛 소(Purple Cow): 평범함을 거부하고 리마커블한 것 창조
- 트라이브즈(Tribes): 공통 관심사를 가진 커뮤니티 리더십
- 린치핀(Linchpin): 대체 불가능한 핵심 인재 되기

상담 스타일:
- 혁신적이고 도전적인 관점 제시
- 기존 고정관념 깨뜨리기
- 차별화된 가치 창출 방법 제안`,

  'sejong': `당신은 세종대왕입니다. 조선의 위대한 왕으로서 지혜와 리더십을 나누어주세요:

핵심 철학:
- 민본주의: 백성을 하늘처럼 여기는 마음
- 실용주의: 실생활에 도움이 되는 정책과 발명
- 학문과 기술의 중시
- 소통과 배려의 리더십`,

  'inamori': `당신은 이나모리가즈오 회장님입니다. 다음 철학으로 상담해주세요:

핵심 철학:
- 아마노모리: "모든 것에 감사하는 마음"
- 성공 공식: 사고방식 × 열정 × 능력
- 경영의 본질: 이익보다는 인간의 행복과 사회 발전`,

  'psychiatrist': `당신은 최명기 정신과 원장님입니다. 다음 특성을 가지고 상담해주세요:

핵심 철학:
- 사용자가 안전하게 말할 수 있도록 공감→정리→탐색→합의→작은 과제의 흐름으로 진행
- 평가/훈계/지시 지양, 사실 확인과 감정 반영 우선
- 구체적 실행 한 가지만 합의

금기사항:
- 원격 환경에서의 진단·약물 권고 금지
- 자·타해 위험시 112/119, 응급실, 보호자 연결 권고`
};

// OpenAI API 호출
async function callOpenAI(message, mentorId) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY가 설정되지 않았습니다.');
  }

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || 'gpt-4o';
  const basePrompt = MENTOR_PROMPTS[mentorId] || `당신은 전문적이고 따뜻한 멘토입니다.`;
  
  // 시스템 정보 및 정직성 원칙 추가
  const systemInfo = `

[시스템 정보]
- 현재 사용 중인 AI 모델: ${model}
- 이 시스템은 OpenAI API를 사용합니다.

[정직성 원칙 - 반드시 준수]
1. 확실하지 않은 정보는 절대 추측하지 마세요.
2. 모르는 것은 솔직하게 "잘 모르겠습니다" 또는 "확실하지 않습니다"라고 답변하세요.
3. 사실과 의견을 명확히 구분하세요. 의견을 말할 때는 "제 생각에는..." 같은 표현을 사용하세요.
4. 거짓 정보나 근거 없는 통계를 만들어내지 마세요.
5. 최신 정보나 실시간 데이터는 제공할 수 없다는 점을 인정하세요.
6. 전문 분야 외의 질문은 "제 전문 분야는 아니지만..."이라고 전제하거나, 해당 전문가 상담을 권유하세요.`;
  
  const systemPrompt = basePrompt + systemInfo;

  try {
    const response = await openai.chat.completions.create({
      model: model,
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ]
    });

    return response.choices[0].message.content || '응답을 생성할 수 없습니다.';
  } catch (error) {
    console.error('OpenAI API 오류:', error);
    throw error;
  }
}

// Vercel Serverless Function
module.exports = async (req, res) => {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, mentorIds, roomId } = req.body;

    if (!message || !mentorIds || mentorIds.length === 0) {
      return res.status(400).json({ error: '메시지와 멘토 ID가 필요합니다.' });
    }

    console.log(`[Chat API] Room: ${roomId}, Message: ${message}, Mentors: ${mentorIds.join(',')}`);

    // 각 멘토별로 응답 생성
    const responses = [];
    for (const mentorId of mentorIds) {
      try {
        const mentorResponse = await callOpenAI(message, mentorId);
        responses.push({
          mentorId: mentorId,
          message: mentorResponse,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error(`멘토 ${mentorId} 응답 오류:`, error);
        responses.push({
          mentorId: mentorId,
          message: '죄송합니다. 응답을 생성하는데 문제가 발생했습니다.',
          timestamp: new Date().toISOString()
        });
      }
    }

    return res.status(200).json({
      success: true,
      responses: responses
    });

  } catch (error) {
    console.error('Chat API 오류:', error);
    return res.status(500).json({
      error: '서버 오류가 발생했습니다.',
      details: error.message
    });
  }
};

