'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';

// 채팅방 데이터 타입 정의
interface ChatRoom {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  mentor?: string;
  type: 'individual' | 'group' | 'special';
}

// 8개 채팅방 설정
const chatRooms: ChatRoom[] = [
  {
    id: 'kim-ceo',
    name: '김상무님',
    description: 'AI/기술 경영 전문 상담',
    icon: '🤖',
    color: 'bg-blue-500',
    mentor: '김성훈대표',
    type: 'individual'
  },
  {
    id: 'beop-monk',
    name: '법상무님',
    description: '인생상담과 깨달음 전문',
    icon: '🧘‍♂️',
    color: 'bg-orange-500',
    mentor: '법륜스님',
    type: 'individual'
  },
  {
    id: 'secret-chat',
    name: '비밀대화',
    description: '개인적이고 민감한 고민 상담',
    icon: '🔒',
    color: 'bg-gray-700',
    type: 'special'
  },
  {
    id: 'seth-godin',
    name: '세상무님',
    description: '마케팅 혁신 전문 상담',
    icon: '📈',
    color: 'bg-purple-500',
    mentor: '세스고든',
    type: 'individual'
  },
  {
    id: 'sejong',
    name: '세종대왕님',
    description: '리더십과 지혜 전문 상담',
    icon: '👑',
    color: 'bg-yellow-500',
    type: 'individual'
  },
  {
    id: 'inamori',
    name: '이상무님',
    description: '경영철학 전문 상담',
    icon: '💼',
    color: 'bg-green-500',
    mentor: '이나모리가즈오',
    type: 'individual'
  },
  {
    id: 'group-meeting',
    name: '전체회의',
    description: '모든 멘토가 참여하는 종합 회의',
    icon: '🏛️',
    color: 'bg-indigo-500',
    type: 'group'
  },
  {
    id: 'psychiatrist',
    name: '최상무님',
    description: '심리상담 및 정신건강 전문',
    icon: '🧠',
    color: 'bg-teal-500',
    mentor: '최명기정신과',
    type: 'individual'
  }
];

export default function HomePage() {
  const router = useRouter();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);


  const handleRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId);
    // 채팅 페이지로 이동
    router.push(`/chat/${roomId}`);
  };

  const getRoomTypeLabel = (type: string) => {
    switch (type) {
      case 'individual': return '개별 상담';
      case 'group': return '그룹 회의';
      case 'special': return '특별 상담';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* 헤더 */}
      <div className="max-w-md mx-auto mb-8">
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold mb-2">
            🧙‍♂️ <AnimatedGradientText
              speed={0.8}
              colorFrom="#3b82f6"
              colorTo="#8b5cf6"
              className="text-3xl font-bold"
            >
              SageChat
            </AnimatedGradientText>
          </h1>
          <p className="text-gray-600">
            지혜로운 멘토들과의 상담 플랫폼
          </p>
        </div>

        {/* 채팅방 목록 */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            채팅방 선택 (8개)
          </h2>
          
          {chatRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => handleRoomSelect(room.id)}
              className={`
                bg-white rounded-xl p-4 shadow-md cursor-pointer transform transition-all duration-200
                hover:scale-105 hover:shadow-lg active:scale-95
                ${selectedRoom === room.id ? 'ring-2 ring-blue-400' : ''}
              `}
            >
              <div className="flex items-center space-x-4">
                {/* 아이콘 */}
                <div className={`w-12 h-12 ${room.color} rounded-full flex items-center justify-center text-white text-xl`}>
                  {room.icon}
                </div>
                
                {/* 채팅방 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">
                      {room.name}
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {getRoomTypeLabel(room.type)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {room.description}
                  </p>
                  {room.mentor && (
                    <p className="text-xs text-gray-500 mt-1">
                      👨‍🏫 {room.mentor}
                    </p>
                  )}
                </div>
                
                {/* 화살표 */}
                <div className="text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* 특별 기능 표시 */}
              {room.id === 'secret-chat' && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="mr-1">✨</span>
                    멘토 초대 기능 지원
                  </div>
                </div>
              )}
              
              {room.id === 'group-meeting' && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="mr-1">👥</span>
                    모든 멘토 동시 참여
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 하단 정보 */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            언제 어디서나 지혜로운 상담을 받아보세요
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Version 1.0 | Made with ❤️ by 커비서
          </p>
        </div>
      </div>
    </div>
  );
}