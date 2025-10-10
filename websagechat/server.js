const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = 3000;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API 라우트
const chatAPI = require('./api/chat');
const createRoomAPI = require('./api/create-room');
const historyAPI = require('./api/history');
const saveConversationAPI = require('./api/save-conversation');

// API 엔드포인트
app.post('/api/chat', (req, res) => chatAPI(req, res));
app.post('/api/create-room', (req, res) => createRoomAPI(req, res));
app.get('/api/history', (req, res) => historyAPI(req, res));
app.post('/api/save-conversation', (req, res) => saveConversationAPI(req, res));

// 정적 파일 서빙 (캐시 방지)
app.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/chat.html', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`\n🚀 SageTalk 서버가 실행되었습니다!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`⏰ 시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}\n`);
  console.log(`✅ 환경 변수: ${process.env.OPENAI_API_KEY ? 'OPENAI_API_KEY 설정됨' : '⚠️ OPENAI_API_KEY 없음'}`);
  console.log(`✅ 모델: ${process.env.OPENAI_MODEL || 'gpt-4o (기본값)'}\n`);
});



