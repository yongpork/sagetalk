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
      {/* 헤더 - 카카오톡 스타일 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white shadow-sm">
        <h1 className="text-[22px] font-bold text-[#191919]">채팅</h1>
        <div className="flex items-center space-x-1">
          {onCreateGroup && (
            <button
              onClick={onCreateGroup}
              className="w-10 h-10 flex items-center justify-center text-[#191919] hover:bg-gray-100 rounded-lg transition-colors active:bg-gray-200"
              title="그룹 만들기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          )}
          <button
            className="w-10 h-10 flex items-center justify-center text-[#191919] hover:bg-gray-100 rounded-lg transition-colors active:bg-gray-200"
            title="검색"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button
            className="w-10 h-10 flex items-center justify-center text-[#191919] hover:bg-gray-100 rounded-lg transition-colors active:bg-gray-200"
            title="설정"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 채팅방 목록 - 카카오톡 스타일 */}
      <div className="flex-1 overflow-y-auto bg-white">
        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 px-6">
            <div className="w-24 h-24 mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-[15px] text-gray-400 mb-2">아직 채팅방이 없어요</p>
            <p className="text-[13px] text-gray-400 text-center mb-6">멘토를 선택하여<br/>새로운 대화를 시작해보세요</p>
            {onCreateGroup && (
              <button
                onClick={onCreateGroup}
                className="px-6 py-3 bg-[#FEE500] text-[#3C1E1E] rounded-lg text-[15px] font-semibold hover:bg-[#FFE812] transition-colors shadow-sm active:scale-95 transform"
              >
                멘토와 대화 시작하기
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rooms.map(room => (
              <button
                key={room.id}
                onClick={() => router.push(`/chat/${room.id}`)}
                className="w-full px-5 py-4 flex items-center space-x-3.5 hover:bg-gray-50 active:bg-gray-100 transition-all"
              >
                {/* 프로필/아이콘 - 카카오톡 스타일 */}
                <div className="relative flex-shrink-0">
                  <div className="w-[54px] h-[54px] rounded-full flex items-center justify-center text-[28px] bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-sm">
                    {room.icon}
                  </div>
                  {room.isGroup && room.memberCount && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-[#3C1E1E] text-white text-[11px] font-semibold rounded-full w-[22px] h-[22px] flex items-center justify-center border-2 border-white">
                      {room.memberCount}
                    </div>
                  )}
                </div>

                {/* 채팅방 정보 - 카카오톡 스타일 */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-semibold text-[#191919] text-[16px] truncate">
                      {room.name}
                    </h3>
                    <span className="text-[12px] text-gray-400 ml-2 flex-shrink-0 font-medium">
                      {formatTime(room.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] text-gray-500 truncate flex-1">
                      {room.lastMessage || '대화를 시작하세요'}
                    </p>
                    {room.unreadCount && room.unreadCount > 0 && (
                      <div className="ml-2 bg-[#FA5252] text-white text-[11px] font-bold rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-2 flex-shrink-0 shadow-sm">
                        {room.unreadCount > 999 ? '999+' : room.unreadCount}
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

