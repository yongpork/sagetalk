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

// Assistants 설정 로드
const configPath = path.join(__dirname, '../config/assistants-config.json');
let assistantsConfig = {};

try {
  if (fs.existsSync(configPath)) {
    assistantsConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } else {
    console.warn('⚠️  assistants-config.json이 없습니다. setup-assistants.js를 먼저 실행하세요.');
  }
} catch (error) {
  console.error('❌ assistants-config.json 로드 실패:', error);
}

// OpenAI Assistants API 호출
async function callAssistant(message, mentorId, imageFile = null) {
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
      
      // 임시 파일로 저장
      const tempFilePath = path.join(__dirname, '../temp', imageFile.originalname);
      fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
      fs.writeFileSync(tempFilePath, imageFile.buffer);
      
      try {
        const uploadedFile = await openai.files.create({
          file: fs.createReadStream(tempFilePath),
          purpose: 'vision'
        });
        imageFileId = uploadedFile.id;
        console.log(`[Assistant] Image uploaded: ${imageFileId}`);
      } finally {
        // 임시 파일 삭제
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
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

    // 3. Run 실행
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: mentorConfig.assistantId
    });
    console.log(`[Assistant] Run created: ${run.id} for thread: ${thread.id}`);

    // 4. Run 완료 대기
    let runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id: thread.id });
    console.log(`[Assistant] Run status: ${runStatus.status}`);
    
    // 최대 30초 대기
    const startTime = Date.now();
    const timeout = 30000;
    
    while (runStatus.status !== 'completed') {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`[Assistant] Run status: ${runStatus.status} (${elapsed}s elapsed)`);
      
      if (Date.now() - startTime > timeout) {
        throw new Error('응답 시간 초과 (30초)');
      }

      if (runStatus.status === 'failed' || runStatus.status === 'cancelled' || runStatus.status === 'expired') {
        throw new Error(`Run 실패: ${runStatus.status} - ${runStatus.last_error?.message || '알 수 없는 오류'}`);
      }

      // 1초 대기 후 다시 확인
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id: thread.id });
    }
    
    console.log(`[Assistant] Run completed!`);

    // 5. 응답 메시지 가져오기
    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');
    
    if (assistantMessages.length === 0) {
      throw new Error('Assistant 응답을 찾을 수 없습니다.');
    }

    // 가장 최근 응답 추출
    const latestMessage = assistantMessages[0];
    const textContent = latestMessage.content.find(content => content.type === 'text');
    
    if (!textContent) {
      throw new Error('텍스트 응답을 찾을 수 없습니다.');
    }

    return textContent.text.value;

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
    const { message, mentorIds, roomId } = req.body;
    const imageFile = req.file; // multer가 처리한 파일
    const mentorIdsArray = typeof mentorIds === 'string' ? JSON.parse(mentorIds) : mentorIds;

    if ((!message && !imageFile) || !mentorIdsArray || mentorIdsArray.length === 0) {
      return res.status(400).json({ error: '메시지 또는 이미지와 멘토 ID가 필요합니다.' });
    }

    console.log(`[Chat API] Room: ${roomId}, Message: ${message || '이미지 전용'}, Mentors: ${mentorIdsArray.join(',')}, HasImage: ${!!imageFile}`);

    // 각 멘토별로 응답 생성
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
