'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface ChatRoom {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  icon: string;
  memberCount?: number;
  isGroup?: boolean;
}

interface ChatRoomListProps {
  rooms: ChatRoom[];
  onCreateGroup?: () => void;
}

export function ChatRoomList({ rooms, onCreateGroup }: ChatRoomListProps) {
  const router = useRouter();

  const formatTime = (date?: Date) => {
    if (!date) return '';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffHours = diff / (1000 * 60 * 60);
    
    // 24시간 이내면 시간만 표시
    if (diffHours < 24) {
      return date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    // 그 외에는 날짜 표시
    return date.toLocaleDateString('ko-KR', { 
      month: 'numeric', 
      day: 'numeric' 
    });
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-[#F5F5F5]">
        <h1 className="text-xl font-bold text-[#191919]">채팅</h1>
        <div className="flex items-center space-x-2">
          {onCreateGroup && (
            <button
              onClick={onCreateGroup}
              className="w-9 h-9 flex items-center justify-center text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              title="그룹 만들기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
          <button
            className="w-9 h-9 flex items-center justify-center text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            title="설정"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 채팅방 목록 */}
      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg className="w-20 h-20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">채팅방이 없습니다</p>
            {onCreateGroup && (
              <button
                onClick={onCreateGroup}
                className="mt-4 px-4 py-2 bg-[#FEE500] text-[#191919] rounded-lg text-sm font-medium hover:bg-[#FDD835] transition-colors"
              >
                그룹 만들기
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rooms.map(room => (
              <button
                key={room.id}
                onClick={() => router.push(`/chat/${room.id}`)}
                className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-[#F5F5F5] active:bg-gray-200 transition-colors"
              >
                {/* 프로필/아이콘 */}
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl bg-white border border-gray-200">
                    {room.icon}
                  </div>
                  {room.isGroup && room.memberCount && (
                    <div className="absolute -bottom-1 -right-1 bg-gray-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {room.memberCount}
                    </div>
                  )}
                </div>

                {/* 채팅방 정보 */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-[#191919] text-sm truncate">
                      {room.name}
                    </h3>
                    <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                      {formatTime(room.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 truncate flex-1">
                      {room.lastMessage || '대화를 시작하세요'}
                    </p>
                    {room.unreadCount && room.unreadCount > 0 && (
                      <div className="ml-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 flex-shrink-0">
                        {room.unreadCount > 99 ? '99+' : room.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

