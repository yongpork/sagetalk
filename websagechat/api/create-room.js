// 대화방 생성 API

function generateRoomId(mentorIds) {
  const timestamp = Date.now();
  const mentorString = mentorIds.join(',');
  return `room-${mentorString}-${timestamp}`;
}

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
    const { mentorIds } = req.body;

    if (!mentorIds || mentorIds.length === 0) {
      return res.status(400).json({ error: '멘토를 선택해주세요.' });
    }

    const roomId = generateRoomId(mentorIds);

    console.log(`[Create Room] Room ID: ${roomId}, Mentors: ${mentorIds.join(',')}`);

    return res.status(200).json({
      success: true,
      roomId: roomId,
      mentorIds: mentorIds,
      createdAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Create Room API 오류:', error);
    return res.status(500).json({
      error: '대화방 생성에 실패했습니다.',
      details: error.message
    });
  }
};

