'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MessageBubble } from '@/components/kakao/MessageBubble';
import { ChatInput } from '@/components/kakao/ChatInput';

interface Message {
  id: string;
  sender: 'user' | 'mentor';
  mentorName?: string;
  mentorIcon?: string;
  content: string;
  timestamp: Date;
  type: 'message' | 'system';
}

interface RoomInfo {
  id: string;
  name: string;
  icon: string;
  mentorIds: string[];
  mentors: string[];
  isGroup: boolean;
  memberCount?: number;
}

interface Mentor {
  id: string;
  name: string;
  fullName: string;
  icon: string;
  systemPrompt: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mentorMap, setMentorMap] = useState<Map<string, Mentor>>(new Map());

  useEffect(() => {
    loadRoomInfo();
    loadMessages();
    loadMentorData();
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMentorData = async () => {
    try {
      const response = await fetch('/mentors.json');
      const data = await response.json();
      const map = new Map<string, Mentor>();
      data.mentors.forEach((mentor: Mentor) => {
        map.set(mentor.systemPrompt, mentor);
      });
      setMentorMap(map);
    } catch (error) {
      console.error('Failed to load mentor data:', error);
    }
  };

  const loadRoomInfo = () => {
    try {
      const saved = localStorage.getItem(`room_${roomId}`);
      if (saved) {
        setRoomInfo(JSON.parse(saved));
      } else {
        // 기존 하드코딩된 방 정보 처리 (하위 호환성)
        const legacyRooms: { [key: string]: RoomInfo } = {
          'kim-ceo': { id: 'kim-ceo', name: '김상무님', icon: '🤖', mentorIds: ['kim-ceo'], mentors: ['김성훈대표'], isGroup: false },
          'beop-monk': { id: 'beop-monk', name: '법상무님', icon: '🧘‍♂️', mentorIds: ['beop-monk'], mentors: ['법륜스님'], isGroup: false },
          'seth-godin': { id: 'seth-godin', name: '세상무님', icon: '📈', mentorIds: ['seth-godin'], mentors: ['세스고든'], isGroup: false },
          'sejong': { id: 'sejong', name: '세종대왕님', icon: '👑', mentorIds: ['sejong'], mentors: ['세종대왕'], isGroup: false },
          'inamori': { id: 'inamori', name: '이상무님', icon: '💼', mentorIds: ['inamori'], mentors: ['이나모리가즈오'], isGroup: false },
          'psychiatrist': { id: 'psychiatrist', name: '최상무님', icon: '🧠', mentorIds: ['psychiatrist'], mentors: ['최명기정신과'], isGroup: false },
          'group-meeting': { id: 'group-meeting', name: '전체회의', icon: '🏛️', mentorIds: [], mentors: ['김성훈대표', '법륜스님', '세스고든', '세종대왕', '이나모리가즈오', '최명기정신과'], isGroup: true, memberCount: 6 }
        };
        
        if (legacyRooms[roomId]) {
          setRoomInfo(legacyRooms[roomId]);
        }
      }
    } catch (error) {
      console.error('Failed to load room info:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/history?roomId=${roomId}`);
      const data = await response.json();
      if (data.success && Array.isArray(data.messages)) {
        const parsed = data.messages.map((m: Message) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        setMessages(parsed);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !roomInfo || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date(),
      type: 'message'
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            { role: 'user', content: currentInput }
          ],
          mentors: roomInfo.mentors,
          aiModel: 'claude',
          roomId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        data.responses.forEach((mentorResponse: { mentor: string; content: string }, index: number) => {
          setTimeout(() => {
            const mentorData = mentorMap.get(mentorResponse.mentor);
            const aiMessage: Message = {
              id: (Date.now() + index + 1).toString(),
              sender: 'mentor',
              mentorName: mentorData?.name || mentorResponse.mentor,
              mentorIcon: mentorData?.icon || '👤',
              content: mentorResponse.content,
              timestamp: new Date(),
              type: 'message'
            };
            setMessages(prev => [...prev, aiMessage]);
          }, index * 1500);
        });
        
        // 대화 저장
        setTimeout(async () => {
          try {
            await fetch('/api/save-conversation', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                roomId,
                messages: [
                  userMessage,
                  ...data.responses.map((mentorResponse: { mentor: string; content: string }) => ({
                    id: Date.now().toString(),
                    sender: 'mentor',
                    mentorName: mentorResponse.mentor,
                    content: mentorResponse.content,
                    timestamp: new Date(),
                    type: 'message'
                  }))
                ],
                aiModel: 'claude'
              }),
            });

            // 채팅방 목록 업데이트 (마지막 메시지)
            updateChatRoomList(userMessage.content);
          } catch (saveError) {
            console.error('Failed to save conversation:', saveError);
          }
        }, data.responses.length * 1500 + 500);
      } else {
        throw new Error(data.error || 'API 호출 실패');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        sender: 'mentor',
        content: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        timestamp: new Date(),
        type: 'message'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateChatRoomList = (lastMessage: string) => {
    try {
      const saved = localStorage.getItem('chatRooms');
      if (saved) {
        const rooms = JSON.parse(saved);
        const updatedRooms = rooms.map((room: any) => {
          if (room.id === roomId) {
            return {
              ...room,
              lastMessage,
              lastMessageTime: new Date().toISOString()
            };
          }
          return room;
        });
        localStorage.setItem('chatRooms', JSON.stringify(updatedRooms));
      }
    } catch (error) {
      console.error('Failed to update chat room list:', error);
    }
  };

  if (!roomInfo) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FEE500] mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">채팅방을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#B2C7D9]">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#F5F5F5] border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/')}
            className="text-gray-700 hover:text-gray-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{roomInfo.icon}</span>
            <div>
              <h1 className="font-semibold text-[#191919] text-base">
                {roomInfo.name}
              </h1>
              {roomInfo.isGroup && roomInfo.memberCount && (
                <p className="text-xs text-gray-500">
                  {roomInfo.memberCount}명
              </p>
            )}
          </div>
          </div>
        </div>
        <button className="text-gray-700 hover:text-gray-900 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-2">
          {messages.map(message => (
            <MessageBubble
                    key={message.id}
              content={message.content}
              sender={message.sender}
              mentorName={message.mentorName}
              mentorIcon={message.mentorIcon}
              timestamp={message.timestamp}
              type={message.type}
            />
          ))}
              
              {/* 로딩 인디케이터 */}
              {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-lg border border-gray-200">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
                    </div>
              )}
              
              <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력 영역 */}
      <ChatInput
                value={inputMessage}
        onChange={setInputMessage}
        onSend={handleSendMessage}
                disabled={isLoading}
        placeholder="메시지를 입력하세요"
      />
    </div>
  );
}
