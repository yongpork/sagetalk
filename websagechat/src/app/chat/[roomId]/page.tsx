'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { Meteors } from '@/components/ui/meteors';
import { BorderBeam } from '@/components/ui/border-beam';

// 메시지 타입 정의
interface Message {
  id: string;
  sender: 'user' | 'mentor';
  mentorName?: string;
  content: string;
  timestamp: Date;
  type: 'message' | 'system';
}

// 채팅방 정보 매핑
const roomInfo: { [key: string]: { name: string; icon: string; color: string; mentors: string[] } } = {
  'kim-ceo': { 
    name: '김상무님 (김성훈대표)', 
    icon: '🤖', 
    color: 'bg-blue-500',
    mentors: ['김성훈대표']
  },
  'beop-monk': { 
    name: '법상무님 (법륜스님)', 
    icon: '🧘‍♂️', 
    color: 'bg-orange-500',
    mentors: ['법륜스님']
  },
  'secret-chat': { 
    name: '비밀대화', 
    icon: '🔒', 
    color: 'bg-gray-700',
    mentors: []
  },
  'seth-godin': { 
    name: '세상무님 (세스고든)', 
    icon: '📈', 
    color: 'bg-purple-500',
    mentors: ['세스고든']
  },
  'sejong': { 
    name: '세종대왕님', 
    icon: '👑', 
    color: 'bg-yellow-500',
    mentors: ['세종대왕']
  },
  'inamori': { 
    name: '이상무님 (이나모리가즈오)', 
    icon: '💼', 
    color: 'bg-green-500',
    mentors: ['이나모리가즈오']
  },
  'group-meeting': { 
    name: '전체회의', 
    icon: '🏛️', 
    color: 'bg-indigo-500',
    mentors: ['김성훈대표', '법륜스님', '세스고든', '세종대왕', '이나모리가즈오', '최명기정신과']
  },
  'psychiatrist': { 
    name: '최상무님 (최명기정신과)', 
    icon: '🧠', 
    color: 'bg-teal-500',
    mentors: ['최명기정신과']
  }
};

// 비밀대화 전용 멘토 리스트
const availableMentors = [
  { id: 'kim-ceo', name: '김상무님', fullName: '김성훈업스테이지대표', icon: '🤖', color: 'bg-blue-500' },
  { id: 'beop-monk', name: '법상무님', fullName: '법륜스님', icon: '🧘‍♂️', color: 'bg-orange-500' },
  { id: 'seth-godin', name: '세상무님', fullName: '세스고든', icon: '📈', color: 'bg-purple-500' },
  { id: 'inamori', name: '이상무님', fullName: '이나모리가즈오', icon: '💼', color: 'bg-green-500' },
  { id: 'psychiatrist', name: '최상무님', fullName: '최명기심리연구소장', icon: '🧠', color: 'bg-teal-500' },
  { id: 'sejong', name: '세종대왕님', fullName: '세종대왕님', icon: '👑', color: 'bg-yellow-500' }
];

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // 과거 기록과 현재 세션 메시지를 분리 보관
  const [historyMessages, setHistoryMessages] = useState<Message[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeMentors, setActiveMentors] = useState<string[]>([]);
  const [aiModel] = useState<'claude' | 'gpt'>('claude');
  const [isHistoryVisible, setIsHistoryVisible] = useState(false); // 초기 숨김
  
  // 비밀대화 전용 상태
  const [selectedMentors, setSelectedMentors] = useState<string[]>([]);
  const [showMentorSelection, setShowMentorSelection] = useState(roomId === 'secret-chat');
  const [chatStarted, setChatStarted] = useState(false);

  const currentRoom = roomInfo[roomId];

  useEffect(() => {
    if (currentRoom) {
      // 기록 불러오기 (초기엔 화면에 숨김)
      (async () => {
        try {
          const res = await fetch(`/api/history?roomId=${roomId}`);
          const data = await res.json();
          if (data.success && Array.isArray(data.messages)) {
            const parsed = data.messages.map((m: {id: string, sender: string, mentorName?: string, content: string, timestamp: string, type: string}) => ({
              id: m.id,
              sender: m.sender,
              mentorName: m.mentorName,
              content: m.content,
              timestamp: new Date(m.timestamp),
              type: m.type
            })) as Message[];
            setHistoryMessages(parsed);
          }
        } catch {
          // 무시하고 기본 웰컴 메시지로 진행
        }
      })();
      // 초기 멘토 설정
      if (roomId === 'secret-chat') {
        setActiveMentors([]); // 비밀대화는 멘토 없이 시작
      } else {
        setActiveMentors(currentRoom.mentors);
      }
      
      // 웰컴 메시지는 헤더에 표시하므로 별도 메시지 불필요
    }
  }, [roomId, currentRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isHistoryVisible]);

  // 임시 디버깅 스크립트
  useEffect(() => {
    const script = document.createElement('script');
    script.textContent = `
      setTimeout(() => {
        console.clear();
        console.log('🔍 WebSageChat 레이아웃 자동 분석');
        
        const header = document.querySelector('[class*="fixed"]');
        const spacer = document.querySelector('[class*="h-56"]');
        const messageContainer = document.querySelector('[class*="space-y-4"]');
        
        if (header && messageContainer) {
          const headerRect = header.getBoundingClientRect();
          const messageRect = messageContainer.getBoundingClientRect();
          const spacerRect = spacer ? spacer.getBoundingClientRect() : null;
          
          const results = {
            헤더높이: Math.round(headerRect.height),
            헤더하단: Math.round(headerRect.bottom),
            Spacer높이: spacerRect ? Math.round(spacerRect.height) : 0,
            메시지시작: Math.round(messageRect.top),
            실제여백: Math.round(messageRect.top - headerRect.bottom),
            겹침발생: messageRect.top < headerRect.bottom
          };
          
          console.log('📊 측정 결과:', results);
          
          // 시각적 표시
          header.style.outline = '3px solid red';
          messageContainer.style.outline = '3px solid blue';
          
          setTimeout(() => {
            header.style.outline = '';
            messageContainer.style.outline = '';
          }, 5000);
          
        } else {
          console.log('❌ 요소를 찾을 수 없음');
        }
      }, 2000);
    `;
    document.head.appendChild(script);
    
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 멘토 선택 토글 함수
  const toggleMentorSelection = (mentorId: string) => {
    console.log('멘토 선택 클릭:', mentorId);
    setSelectedMentors(prev => {
      const newSelection = prev.includes(mentorId) 
        ? prev.filter(id => id !== mentorId)
        : [...prev, mentorId];
      console.log('선택된 멘토 업데이트:', newSelection);
      return newSelection;
    });
  };

  // 멘토 선택 완료 (2명 이상 선택시 대화 시작)
  const startChat = () => {
    if (selectedMentors.length >= 2) {
      // 멘토 이름 매핑
      const mentorMapping: { [key: string]: string } = {
        'kim-ceo': '김성훈대표',
        'beop-monk': '법륜스님', 
        'seth-godin': '세스고든',
        'inamori': '이나모리가즈오',
        'psychiatrist': '최명기정신과',
        'sejong': '세종대왕'
      };
      
      const activeMentorNames = selectedMentors.map(id => mentorMapping[id]);
      setActiveMentors(activeMentorNames);
      setShowMentorSelection(false);
      setChatStarted(true);
    }
  };

  // 멘토 선택 리셋 (대화 기록 삭제하고 다시 멘토 선택)
  const resetMentorSelection = () => {
    setSelectedMentors([]);
    setActiveMentors([]);
    setChatMessages([]);
    setShowMentorSelection(true);
    setChatStarted(false);
  };

  // 자동 시작 제거 - 사용자가 직접 "대화 시작" 버튼을 눌러야 함

  // 멘토 초대/퇴장 명령어 처리
  const handleMentorCommand = (message: string): boolean => {
    if (roomId !== 'secret-chat') return false;

    const inviteMatch = message.match(/@초대\s+(.+)|\/invite\s+(.+)/);
    const removeMatch = message.match(/@퇴장\s+(.+)|\/remove\s+(.+)/);
    const membersMatch = message.match(/@참여자|\/members/);

    if (inviteMatch) {
      const mentorName = inviteMatch[1] || inviteMatch[2];
      const mentorKey = mentorName.replace(/님$/, '');
      
      // 멘토 맵핑
      const mentorMapping: { [key: string]: string } = {
        '최상무': '최명기정신과',
        '이상무': '이나모리가즈오',
        '세상무': '세스고든',
        '법상무': '법륜스님',
        '김상무': '김성훈대표',
        '세종대왕': '세종대왕'
      };

      const actualMentor = mentorMapping[mentorKey] || mentorKey;
      
      if (!activeMentors.includes(actualMentor)) {
        setActiveMentors([...activeMentors, actualMentor]);
        const systemMsg: Message = {
          id: Date.now().toString(),
          sender: 'mentor',
          content: `🔔 ${mentorName}님이 비밀대화에 참여했습니다.`,
          timestamp: new Date(),
          type: 'system'
        };
        setMessages(prev => [...prev, systemMsg]);
      }
      return true;
    }

    if (removeMatch) {
      const mentorName = removeMatch[1] || removeMatch[2];
      const mentorKey = mentorName.replace(/님$/, '');
      
      const mentorMapping: { [key: string]: string } = {
        '최상무': '최명기정신과',
        '이상무': '이나모리가즈오',
        '세상무': '세스고든',
        '법상무': '법륜스님',
        '김상무': '김성훈대표',
        '세종대왕': '세종대왕'
      };

      const actualMentor = mentorMapping[mentorKey] || mentorKey;
      
      if (activeMentors.includes(actualMentor)) {
        setActiveMentors(activeMentors.filter(m => m !== actualMentor));
        const systemMsg: Message = {
          id: Date.now().toString(),
          sender: 'mentor',
          content: `👋 ${mentorName}님이 대화를 떠났습니다.`,
          timestamp: new Date(),
          type: 'system'
        };
        setMessages(prev => [...prev, systemMsg]);
      }
      return true;
    }

    if (membersMatch) {
      const membersList = activeMentors.length > 0 
        ? `현재 참여 중: ${activeMentors.join(', ')}`
        : '현재 참여 중인 멘토가 없습니다.';
      
      const systemMsg: Message = {
        id: Date.now().toString(),
        sender: 'mentor',
        content: membersList,
        timestamp: new Date(),
        type: 'system'
      };
      setMessages(prev => [...prev, systemMsg]);
      return true;
    }

    return false;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentRoom) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date(),
      type: 'message'
    };

    setChatMessages(prev => [...prev, userMessage]);
    
    // 멘토 명령어 처리
    if (handleMentorCommand(inputMessage)) {
      setInputMessage('');
      return;
    }

    const currentInput = inputMessage;
    setInputMessage('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    setIsLoading(true);

    try {
      const mentors = roomId === 'secret-chat' ? activeMentors : currentRoom.mentors;
      
      if (mentors.length === 0) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'mentor',
          content: '현재 참여 중인 멘토가 없습니다. @초대 명령어로 멘토를 초대해보세요.',
          timestamp: new Date(),
          type: 'message'
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
        return;
      }

      // API 호출
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...[...historyMessages, ...chatMessages].map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            { role: 'user', content: currentInput }
          ],
          mentors,
          aiModel,
          roomId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const newMessages: Message[] = [];
        
        // 사용자 메시지 추가
        const userMsg: Message = {
          id: Date.now().toString(),
          sender: 'user',
          content: currentInput,
          timestamp: new Date(),
          type: 'message'
        };
        newMessages.push(userMsg);
        
        // 멘토 응답 메시지들 추가
        data.responses.forEach((mentorResponse: {mentor: string, content: string}, index: number) => {
          const aiMessage: Message = {
            id: (Date.now() + index + 1).toString(),
            sender: 'mentor',
            mentorName: mentorResponse.mentor,
            content: mentorResponse.content,
            timestamp: new Date(),
            type: 'message'
          };
          newMessages.push(aiMessage);
        });
        
        // 메시지를 순차적으로 표시
        data.responses.forEach((mentorResponse: {mentor: string, content: string}, index: number) => {
          setTimeout(() => {
            const aiMessage: Message = {
              id: (Date.now() + index + 1).toString(),
              sender: 'mentor',
              mentorName: mentorResponse.mentor,
              content: mentorResponse.content,
              timestamp: new Date(),
              type: 'message'
            };
            setChatMessages(prev => [...prev, aiMessage]);
          }, index * 1500); // 1.5초 간격으로 표시
        });
        
        // 모든 응답이 완료된 후 파일에 저장
        setTimeout(async () => {
          try {
            await fetch('/api/save-conversation', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                roomId,
                messages: newMessages,
                aiModel
              }),
            });
          } catch (saveError) {
            console.error('Failed to save conversation:', saveError);
          }
        }, data.responses.length * 1500 + 500); // 모든 메시지 표시 후 0.5초 대기
        
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
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!currentRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800 mb-4">채팅방을 찾을 수 없습니다</h1>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col relative overflow-hidden">
      {/* 비밀대화일 때만 Meteors 배경 효과 추가 */}
      {roomId === 'secret-chat' && (
        <Meteors 
          number={12} 
          className="opacity-20" 
          minDelay={0.5}
          maxDelay={3}
          minDuration={4}
          maxDuration={12}
        />
      )}
      {/* 헤더 - 깔끔하게 정리 */}
      <div className="fixed inset-x-0 top-0 z-[100] bg-white border-b shadow-sm">
        <div className="flex items-start px-4 py-3">
          <button 
            onClick={() => router.push('/')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className={`w-8 h-8 ${currentRoom.color} rounded-full flex items-center justify-center text-white mr-4 text-sm`}>
            {currentRoom.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h1 className="font-semibold text-gray-900 text-base truncate">{currentRoom.name}</h1>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                {new Date().toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1 truncate">
              비밀 대화방에 오신 것을 환영합니다!
            </p>
            {roomId === 'secret-chat' && activeMentors.length > 0 && chatStarted && (
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                {availableMentors
                  .filter(m => selectedMentors.includes(m.id))
                  .map(m => m.fullName)
                  .join(', ')}
              </p>
            )}
          </div>
          
          <div className="flex flex-col items-end space-y-1">
            {roomId === 'secret-chat' && chatStarted && (
              <button
                onClick={resetMentorSelection}
                className="text-xs px-2 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                멘토선택
              </button>
            )}
            {historyMessages.length > 0 && !showMentorSelection && (
              <button
                onClick={() => setIsHistoryVisible(v => !v)}
                className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                {isHistoryVisible ? '기록 숨기기' : '기록 보기'}
              </button>
            )}
          </div>
        </div>
      </div>
      {/* 헤더는 문서 흐름 안에 있으므로 별도 여백 불필요 */}

      {/* 헤더 공간 보정 - 절대 침범하지 않도록 매우 큰 여백 */}
      <div style={{ height: '240px' }} className="bg-transparent shrink-0" />

      {/* 메시지 영역 */}
      <div 
        className="flex-1 overflow-y-auto px-4 pt-12 pb-6" 
        style={{ 
          paddingTop: 'calc(env(safe-area-inset-top) + 4rem)',
          maxHeight: 'calc(100vh - 300px)',
          marginTop: '4rem',
          minHeight: 'calc(100vh - 400px)'
        }}
      >
        <div className="max-w-2xl mx-auto space-y-4 mt-16">
          {/* 비밀대화 멘토 선택 UI */}
          {roomId === 'secret-chat' && showMentorSelection && (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">멘토를 선택하세요</h2>
                <p className="text-sm text-gray-600">2명 이상의 멘토를 선택하면 대화가 시작됩니다</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
                {availableMentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    className={`
                      flex items-center p-4 rounded-xl border-2 transition-all duration-200
                      ${selectedMentors.includes(mentor.id)
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }
                    `}
                  >
                    <div className={`w-12 h-12 ${mentor.color} rounded-full flex items-center justify-center text-white text-xl mr-4`}>
                      {mentor.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base text-gray-800">{mentor.name}</h3>
                      <p className="text-sm text-gray-600">{mentor.fullName}</p>
                    </div>
                    <ShimmerButton
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleMentorSelection(mentor.id);
                      }}
                      background={selectedMentors.includes(mentor.id) 
                        ? '#f97316' // orange-500
                        : '#3b82f6'  // blue-500
                      }
                      shimmerColor={selectedMentors.includes(mentor.id) ? '#fbbf24' : '#60a5fa'}
                      shimmerDuration="2s"
                      className="text-sm font-medium"
                    >
                      {selectedMentors.includes(mentor.id) ? '선택해제' : '선택하기'}
                    </ShimmerButton>
                  </div>
                ))}
              </div>
              
              <div className="text-center space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    선택된 멘토: {selectedMentors.length}명
                  </p>
                  {selectedMentors.length > 0 && (
                    <div className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg inline-block">
                      {selectedMentors.map(id => availableMentors.find(m => m.id === id)?.name).join(', ')}
                    </div>
                  )}
                </div>
                
                {selectedMentors.length >= 2 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-green-600 font-medium">
                      ✅ 2명 이상 선택되었습니다! 더 선택하거나 대화를 시작하세요.
                    </p>
                    <button
                      onClick={startChat}
                      className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                    >
                      🎯 선택한 멘토들과 대화 시작
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    최소 2명의 멘토를 선택하세요 ({2 - selectedMentors.length}명 더 필요)
                  </p>
                )}
                
                {selectedMentors.length > 0 && (
                  <p className="text-xs text-gray-400">
                    💡 &quot;선택해제&quot; 버튼으로 선택을 취소할 수 있습니다
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 일반 대화 메시지 (멘토 선택이 완료된 후) */}
          {(!showMentorSelection || roomId !== 'secret-chat') && (
            <>
              {/* 기록이 있고 표시 중일 때만 구분선 표시 */}
              {isHistoryVisible && historyMessages.length > 0 && (
                <div className="flex items-center my-6">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <div className="px-3 text-xs text-gray-500 bg-gray-50">이전 대화</div>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
              )}

          {(
            [...(isHistoryVisible ? historyMessages : []), ...chatMessages]
          ).map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                max-w-[280px] px-3 py-2 rounded-2xl
                ${message.sender === 'user' 
                  ? 'bg-blue-500 text-white rounded-br-md' 
                  : message.type === 'system' 
                    ? 'bg-gray-100 text-gray-700 text-sm rounded-xl'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                }
              `}>
                {message.mentorName && (
                  <div className="text-xs text-blue-600 mb-1 font-medium">
                    {message.mentorName}
                  </div>
                )}
                <div className="break-words leading-relaxed">{message.content}</div>
                <div className={`text-xs mt-1.5 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                  {message.timestamp.toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl rounded-bl-md border border-gray-200">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* 입력 영역 - 멘토 선택 완료 후에만 표시 */}
      {(!showMentorSelection || roomId !== 'secret-chat') && (
        <div className="bg-white border-t border-gray-200 p-4 pb-safe">
        <div className="max-w-2xl mx-auto flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
                if (inputRef.current) {
                  inputRef.current.style.height = 'auto';
                  inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 360)}px`;
                }
              }}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              rows={3}
              className="w-full px-4 py-9 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none max-h-[360px] transition-all"
              disabled={isLoading}
            />
            <BorderBeam
              size={100}
              duration={8}
              delay={0}
              colorFrom="#3b82f6"
              colorTo="#8b5cf6"
              borderWidth={2}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="px-5 py-9 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium self-end"
          >
            전송
          </button>
        </div>
        </div>
      )}
    </div>
  );
}
