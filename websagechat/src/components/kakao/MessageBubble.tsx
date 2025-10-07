import React from 'react';

interface MessageBubbleProps {
  content: string;
  sender: 'user' | 'mentor';
  mentorName?: string;
  mentorIcon?: string;
  timestamp: Date;
  type?: 'message' | 'system';
}

export function MessageBubble({
  content,
  sender,
  mentorName,
  mentorIcon,
  timestamp,
  type = 'message'
}: MessageBubbleProps) {
  // 시스템 메시지
  if (type === 'system') {
    return (
      <div className="flex justify-center my-3">
        <div className="bg-black/10 text-gray-600 text-xs px-3 py-1.5 rounded-full">
          {content}
        </div>
      </div>
    );
  }

  // 사용자 메시지 (노란색, 오른쪽)
  if (sender === 'user') {
    return (
      <div className="flex justify-end mb-2">
        <div className="flex items-end space-x-1 max-w-[70%]">
          <span className="text-xs text-gray-500 mb-1">
            {timestamp.toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}
          </span>
          <div className="bg-[#FEE500] text-[#191919] px-3 py-2 rounded-lg rounded-br-sm">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {content}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 멘토 메시지 (흰색, 왼쪽)
  return (
    <div className="flex justify-start mb-2">
      <div className="flex items-start space-x-2 max-w-[70%]">
        {/* 멘토 프로필 아이콘 */}
        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg border border-gray-200">
          {mentorIcon || '👤'}
        </div>
        
        <div className="flex-1">
          {/* 멘토 이름 */}
          {mentorName && (
            <p className="text-xs text-gray-600 mb-1 ml-1">
              {mentorName}
            </p>
          )}
          
          {/* 메시지 말풍선 + 시간 */}
          <div className="flex items-end space-x-1">
            <div className="bg-white px-3 py-2 rounded-lg rounded-bl-sm border border-gray-200">
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-[#191919]">
                {content}
              </p>
            </div>
            <span className="text-xs text-gray-500 mb-1 whitespace-nowrap">
              {timestamp.toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

