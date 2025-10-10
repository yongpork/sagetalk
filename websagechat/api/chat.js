const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// multer 설정 (메모리 저장)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB 제한
  }
});

// Assistants 설정 로드 (환경변수 우선, 파일 백업)
let assistantsConfig = {};

// 1. 환경변수에서 설정 로드 (Vercel 배포용)
if (process.env.ASSISTANTS_CONFIG) {
  try {
    assistantsConfig = JSON.parse(process.env.ASSISTANTS_CONFIG);
    console.log('✅ 환경변수에서 Assistant 설정 로드됨');
  } catch (error) {
    console.error('❌ 환경변수 Assistant 설정 파싱 실패:', error);
  }
}

// 2. 파일에서 설정 로드 (로컬 개발용)
if (!assistantsConfig.mentors || Object.keys(assistantsConfig.mentors).length === 0) {
  const configPath = path.join(__dirname, '../config/assistants-config.json');
  try {
    if (fs.existsSync(configPath)) {
      assistantsConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      console.log('✅ 파일에서 Assistant 설정 로드됨');
    } else {
      console.warn('⚠️  assistants-config.json이 없습니다. setup-assistants.js를 먼저 실행하세요.');
    }
  } catch (error) {
    console.error('❌ assistants-config.json 로드 실패:', error);
  }
}

// OpenAI Assistants API 호출 (스트리밍 콜백 지원)
async function callAssistant(message, mentorId, imageFile = null, onStreamChunk = null) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY가 설정되지 않았습니다.');
  }

  // Assistant 설정 확인
  const mentorConfig = assistantsConfig.mentors?.[mentorId];
  if (!mentorConfig || !mentorConfig.assistantId) {
    throw new Error(`${mentorId}의 Assistant가 설정되지 않았습니다. setup-assistants.js를 실행하세요.`);
  }

  const openai = new OpenAI({ apiKey });

  try {
    // 1. Thread 생성
    const thread = await openai.beta.threads.create();
    console.log(`[Assistant] Thread created: ${thread.id}`);

    // 2. 이미지가 있으면 업로드
    let imageFileId = null;
    if (imageFile) {
      console.log(`[Assistant] Uploading image: ${imageFile.originalname}, size: ${imageFile.size}`);
      
      // Vercel 환경에서는 /tmp 디렉토리 사용
      const tempDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, '../temp');
      const tempFilePath = path.join(tempDir, `${Date.now()}-${imageFile.originalname}`);
      
      try {
        // 디렉토리 생성 (필요시)
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // 임시 파일로 저장
        fs.writeFileSync(tempFilePath, imageFile.buffer);
        console.log(`[Assistant] Temp file created: ${tempFilePath}`);
        
        // OpenAI에 업로드
        const uploadedFile = await openai.files.create({
          file: fs.createReadStream(tempFilePath),
          purpose: 'vision'
        });
        imageFileId = uploadedFile.id;
        console.log(`[Assistant] Image uploaded: ${imageFileId}`);
      } catch (error) {
        console.error('[Assistant] Image upload failed:', error);
        throw new Error(`이미지 업로드 실패: ${error.message}`);
      } finally {
        // 임시 파일 삭제
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
          console.log(`[Assistant] Temp file deleted: ${tempFilePath}`);
        }
      }
    }

    // 3. 메시지 추가 (이미지 포함)
    const messageContent = [];
    
    if (message) {
      messageContent.push({ type: 'text', text: message });
    }
    
    if (imageFileId) {
      messageContent.push({
        type: 'image_file',
        image_file: { file_id: imageFileId }
      });
    }

    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: messageContent
    });
    console.log(`[Assistant] Message added to thread: ${thread.id} (text: ${!!message}, image: ${!!imageFileId})`);

    // 3. Run 실행 (스트리밍)
    console.log(`[Assistant] Starting streaming run for ${mentorId}...`);
    
    const stream = await openai.beta.threads.runs.stream(thread.id, {
      assistant_id: mentorConfig.assistantId
    });

    let fullResponse = '';
    let lastLogTime = Date.now();
    
    // 스트리밍 이벤트 처리
    for await (const event of stream) {
      // 5초마다 진행 상황 로깅
      if (Date.now() - lastLogTime > 5000) {
        console.log(`[Assistant] Streaming ${mentorId}... (${fullResponse.length} chars received)`);
        lastLogTime = Date.now();
      }
      
      // text.delta 이벤트에서 텍스트 조각 추출
      if (event.event === 'thread.message.delta') {
        const delta = event.data.delta;
        if (delta.content && delta.content[0] && delta.content[0].type === 'text') {
          const textDelta = delta.content[0].text.value;
          if (textDelta) {
            fullResponse += textDelta;
            
            // 스트리밍 콜백 호출 (프론트엔드로 실시간 전송)
            if (onStreamChunk && typeof onStreamChunk === 'function') {
              onStreamChunk({
                mentorId,
                chunk: textDelta,
                fullText: fullResponse
              });
            }
          }
        }
      }
    }
    
    console.log(`[Assistant] Streaming completed for ${mentorId} (${fullResponse.length} chars)`);

    // 스트리밍으로 받은 응답이 있으면 사용, 없으면 API에서 다시 가져오기
    let responseText = fullResponse;
    
    if (!responseText || responseText.length === 0) {
      console.log(`[Assistant] Streaming response empty, fetching from API...`);
      const messages = await openai.beta.threads.messages.list(thread.id);
      const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');
      
      if (assistantMessages.length === 0) {
        throw new Error('Assistant 응답을 찾을 수 없습니다.');
      }

      const latestMessage = assistantMessages[0];
      const textContent = latestMessage.content.find(content => content.type === 'text');
      
      if (!textContent) {
        throw new Error('텍스트 응답을 찾을 수 없습니다.');
      }
      
      responseText = textContent.text.value;
    }

    // OpenAI File Search 참조 주석 제거
    responseText = responseText.replace(/【\d+:\d+†[^】]+】/g, ''); // 【4:3†markit_info.md】
    responseText = responseText.replace(/\[\d+:\d+\+[^\]]+\]/g, ''); // [4:6+source]
    responseText = responseText.replace(/\(\d+:\d+\+[^)]+\)/g, ''); // (4:5+source)
    responseText = responseText.replace(/【\d+:\d+†source】/g, ''); // 【4:7†source】

    return responseText;

  } catch (error) {
    console.error('OpenAI Assistants API 오류:', error);
    throw error;
  }
}

// multer 미들웨어 적용
const uploadMiddleware = upload.single('image');

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

  // multer 미들웨어 실행
  await new Promise((resolve, reject) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });

  try {
    // FormData 파싱
    const { message, mentorIds, roomId, stream } = req.body;
    const imageFile = req.file; // multer가 처리한 파일
    const mentorIdsArray = typeof mentorIds === 'string' ? JSON.parse(mentorIds) : mentorIds;
    const enableStream = stream === 'true' || stream === true;

    if ((!message && !imageFile) || !mentorIdsArray || mentorIdsArray.length === 0) {
      return res.status(400).json({ error: '메시지 또는 이미지와 멘토 ID가 필요합니다.' });
    }

    console.log(`[Chat API] Room: ${roomId}, Message: ${message || '이미지 전용'}, Mentors: ${mentorIdsArray.join(',')}, HasImage: ${!!imageFile}, Stream: ${enableStream}`);

    // 스트리밍 모드
    if (enableStream) {
      // SSE 헤더 설정
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      // 각 멘토별로 병렬 스트리밍 (Vercel 타임아웃 방지)
      const mentorPromises = mentorIdsArray.map(async (mentorId) => {
        try {
          // 멘토 시작 이벤트
          res.write(`data: ${JSON.stringify({ type: 'start', mentorId })}\n\n`);
          
          await callAssistant(message, mentorId, imageFile, (chunk) => {
            // 각 텍스트 조각을 SSE로 전송
            res.write(`data: ${JSON.stringify({ 
              type: 'chunk', 
              mentorId,
              chunk: chunk.chunk
            })}\n\n`);
          });
          
          // 멘토 완료 이벤트
          res.write(`data: ${JSON.stringify({ type: 'done', mentorId })}\n\n`);
        } catch (error) {
          console.error(`멘토 ${mentorId} 스트리밍 실패:`, error);
          res.write(`data: ${JSON.stringify({ 
            type: 'error', 
            mentorId,
            message: '응답 생성 중 오류가 발생했습니다.'
          })}\n\n`);
        }
      });

      // 모든 멘토 완료 대기
      await Promise.all(mentorPromises);
      
      // 스트리밍 종료
      res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);
      return res.end();
    }

    // 일반 모드 (기존 방식)
    const responses = [];
    for (const mentorId of mentorIdsArray) {
      try {
        const mentorResponse = await callAssistant(message, mentorId, imageFile);
        responses.push({
          mentorId: mentorId,
          message: mentorResponse,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error(`멘토 ${mentorId} 응답 오류:`, error);
        
        // Assistant 미설정 오류인 경우 안내 메시지
        if (error.message.includes('설정되지 않았습니다')) {
          responses.push({
            mentorId: mentorId,
            message: '죄송합니다. 현재 이 멘토는 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.',
            timestamp: new Date().toISOString()
          });
        } else {
          responses.push({
            mentorId: mentorId,
            message: '죄송합니다. 응답을 생성하는데 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
            timestamp: new Date().toISOString()
          });
        }
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
