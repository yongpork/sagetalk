// 대화 저장 API
// 향후 GitHub 또는 데이터베이스에 저장하는 기능 구현

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
    const { roomId, messages } = req.body;

    if (!roomId || !messages) {
      return res.status(400).json({ error: 'Room ID와 메시지가 필요합니다.' });
    }

    console.log(`[Save Conversation] Room: ${roomId}, Messages: ${messages.length}개`);

    // 향후 GitHub API 또는 데이터베이스에 저장
    // 현재는 로그만 남김

    return res.status(200).json({
      success: true,
      message: '대화 내역이 저장되었습니다.',
      savedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Save Conversation API 오류:', error);
    return res.status(500).json({
      error: '대화 저장에 실패했습니다.',
      details: error.message
    });
  }
};

