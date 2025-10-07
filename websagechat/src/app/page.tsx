'use client';

import { useState, useEffect } from 'react';
import { ChatRoomList } from '@/components/kakao/ChatRoomList';
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

export default function HomePage() {
  const router = useRouter();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

  useEffect(() => {
    // 저장된 채팅방 불러오기
    loadChatRooms();
  }, []);

  const loadChatRooms = async () => {
    try {
      // TODO: API에서 채팅방 목록 불러오기
      // 임시로 localStorage에서 불러오기
      const saved = localStorage.getItem('chatRooms');
      if (saved) {
        const rooms = JSON.parse(saved);
        setChatRooms(rooms.map((room: ChatRoom) => ({
          ...room,
          lastMessageTime: room.lastMessageTime ? new Date(room.lastMessageTime) : undefined
        })));
      }
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
    }
  };

  const handleCreateGroup = () => {
    router.push('/create-group');
  };

  return (
    <div className="h-screen bg-white">
      <ChatRoomList 
        rooms={chatRooms} 
        onCreateGroup={handleCreateGroup}
      />
    </div>
  );
}
