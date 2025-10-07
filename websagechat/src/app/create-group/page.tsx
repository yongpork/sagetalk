'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MentorSelector } from '@/components/kakao/MentorSelector';

interface Mentor {
  id: string;
  name: string;
  fullName: string;
  icon: string;
  color: string;
  category: string;
  tags: string[];
  description: string;
  systemPrompt: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface MentorData {
  mentors: Mentor[];
  categories: Category[];
}

export default function CreateGroupPage() {
  const router = useRouter();
  const [mentorData, setMentorData] = useState<MentorData>({ mentors: [], categories: [] });
  const [selectedMentors, setSelectedMentors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMentorData();
  }, []);

  const loadMentorData = async () => {
    try {
      const response = await fetch('/mentors.json');
      const data = await response.json();
      setMentorData(data);
    } catch (error) {
      console.error('Failed to load mentor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMentor = (mentorId: string) => {
    setSelectedMentors(prev => {
      if (prev.includes(mentorId)) {
        return prev.filter(id => id !== mentorId);
      }
      return [...prev, mentorId];
    });
  };

  const handleConfirm = () => {
    if (selectedMentors.length === 0) {
      alert('최소 1명의 멘토를 선택해주세요');
      return;
    }

    // 선택된 멘토 정보 가져오기
    const selectedMentorData = mentorData.mentors.filter(m => 
      selectedMentors.includes(m.id)
    );

    // 채팅방 생성
    const roomId = `group-${Date.now()}`;
    const roomName = selectedMentors.length === 1
      ? selectedMentorData[0].name
      : `${selectedMentorData[0].name} 외 ${selectedMentors.length - 1}명`;

    // 채팅방 정보 저장
    const newRoom = {
      id: roomId,
      name: roomName,
      icon: selectedMentors.length === 1 ? selectedMentorData[0].icon : '👥',
      mentorIds: selectedMentors,
      mentors: selectedMentorData.map(m => m.systemPrompt),
      isGroup: selectedMentors.length > 1,
      memberCount: selectedMentors.length,
      createdAt: new Date().toISOString()
    };

    // localStorage에 저장
    try {
      const saved = localStorage.getItem('chatRooms');
      const rooms = saved ? JSON.parse(saved) : [];
      rooms.unshift(newRoom);
      localStorage.setItem('chatRooms', JSON.stringify(rooms));
      
      // 채팅방 상세 정보 저장
      localStorage.setItem(`room_${roomId}`, JSON.stringify(newRoom));
    } catch (error) {
      console.error('Failed to save room:', error);
    }

    // 채팅 페이지로 이동
    router.push(`/chat/${roomId}`);
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FEE500] mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">멘토 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white">
      <MentorSelector
        mentors={mentorData.mentors}
        categories={mentorData.categories}
        selectedMentors={selectedMentors}
        onToggleMentor={handleToggleMentor}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        minSelection={1}
        maxSelection={999}
      />
    </div>
  );
}

