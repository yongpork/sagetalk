// 대화 내역 조회 API
// 현재는 메모리에 저장하지 않으므로 빈 배열 반환
// 향후 데이터베이스 연동 시 실제 내역 반환

module.exports = async (req, res) => {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET 요청만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { roomId } = req.query;

    if (!roomId) {
      return res.status(400).json({ error: 'Room ID가 필요합니다.' });
    }

    console.log(`[History API] Room: ${roomId}`);

    // 현재는 Serverless이므로 메모리에 저장된 내역이 없음
    // 향후 데이터베이스(Supabase, MongoDB 등) 연동 필요
    return res.status(200).json({
      success: true,
      roomId: roomId,
      messages: []
    });

  } catch (error) {
    console.error('History API 오류:', error);
    return res.status(500).json({
      error: '대화 내역 조회에 실패했습니다.',
      details: error.message
    });
  }
};

