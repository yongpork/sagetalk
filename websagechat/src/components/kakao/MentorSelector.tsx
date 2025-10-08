'use client';

import React, { useState, useMemo } from 'react';

interface Mentor {
  id: string;
  name: string;
  fullName: string;
  icon: string;
  color: string;
  category: string;
  tags: string[];
  description: string;
  subtitle?: string; // 추가: 부제목 (전문 분야)
}

interface MentorSelectorProps {
  mentors: Mentor[];
  categories: Array<{ id: string; name: string; icon: string }>;
  selectedMentors: string[];
  onToggleMentor: (mentorId: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  minSelection?: number;
  maxSelection?: number;
}

export function MentorSelector({
  mentors,
  categories,
  selectedMentors,
  onToggleMentor,
  onConfirm,
  onCancel,
  minSelection = 1,
  maxSelection = 999
}: MentorSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);

  // 필터링된 멘토 목록
  const filteredMentors = useMemo(() => {
    return mentors.filter(mentor => {
      // 카테고리 필터
      if (selectedCategory !== 'all') {
        const category = categories.find(c => c.id === selectedCategory);
        if (category && !mentor.category.includes(category.name)) {
          return false;
        }
      }

      // 검색어 필터
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          mentor.name.toLowerCase().includes(query) ||
          mentor.fullName.toLowerCase().includes(query) ||
          mentor.description.toLowerCase().includes(query) ||
          mentor.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [mentors, selectedCategory, searchQuery, categories]);

  const canConfirm = selectedMentors.length >= minSelection && selectedMentors.length <= maxSelection;
  const selectedMentor = selectedMentorId ? mentors.find(m => m.id === selectedMentorId) : null;

  return (
    <div className="flex h-full bg-[#B8C5D6]">
      {/* 좌측: 멘토 목록 */}
      <div className="w-[430px] flex flex-col bg-[#B8C5D6] border-r border-[#95A3B6]">
        {/* 헤더 */}
        <div className="flex items-center justify-center px-5 py-4 bg-[#A8B4C5] border-b border-[#95A3B6]">
          <h1 className="text-[17px] font-semibold text-white">멘토 선택</h1>
          <button
            onClick={onCancel}
            className="absolute left-5 text-white hover:opacity-80 transition-opacity"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            className={`absolute right-5 px-4 py-1.5 rounded-md text-[15px] font-medium transition-all ${
              canConfirm
                ? 'bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FFE812]'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            확인
          </button>
        </div>

        {/* 검색바 */}
        <div className="px-4 py-3 bg-[#B8C5D6]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름 검색"
            className="w-full px-4 py-2.5 bg-white rounded-md text-[15px] text-[#191919] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FEE500]"
          />
        </div>

        {/* 카테고리 필터 */}
        <div className="px-4 py-2.5 bg-[#B8C5D6] border-b border-[#A0AEBF] overflow-x-auto scrollbar-hide">
          <div className="flex space-x-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-[#FEE500] text-[#3C1E1E] shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 멘토 카운트 */}
        <div className="px-5 py-2 bg-[#F7F7F7] border-b border-gray-200">
          <p className="text-[13px] text-gray-500 font-medium">
            멘토 {filteredMentors.length}명
          </p>
        </div>

        {/* 멘토 목록 */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="divide-y divide-gray-100">
            {filteredMentors.map(mentor => {
              const isSelected = selectedMentors.includes(mentor.id);
              const isDisabled = !isSelected && selectedMentors.length >= maxSelection;
              const isHovered = selectedMentorId === mentor.id;

              return (
                <button
                  key={mentor.id}
                  onClick={() => {
                    setSelectedMentorId(mentor.id);
                    if (!isDisabled) {
                      onToggleMentor(mentor.id);
                    }
                  }}
                  disabled={isDisabled}
                  className={`w-full px-5 py-3.5 flex items-center space-x-3 transition-all ${
                    isDisabled
                      ? 'opacity-40 cursor-not-allowed'
                      : 'hover:bg-gray-50 active:bg-gray-100'
                  } ${isSelected ? 'bg-[#FFF9E6]' : isHovered ? 'bg-gray-50' : 'bg-white'}`}
                >
                  {/* 체크박스 */}
                  <div
                    className={`flex-shrink-0 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#FEE500] border-[#FEE500]'
                        : 'bg-white border-gray-400'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-3.5 h-3.5 text-[#3C1E1E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* 멘토 프로필 */}
                  <div className="flex-shrink-0 w-[50px] h-[50px] rounded-full flex items-center justify-center text-[26px] bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-sm">
                    {mentor.icon}
                  </div>

                  {/* 멘토 정보 */}
                  <div className="flex-1 text-left min-w-0">
                    <h3 className="font-semibold text-[#191919] text-[15px] truncate mb-0.5">
                      {mentor.name}
                    </h3>
                    <p className="text-[13px] text-gray-500 truncate">
                      {mentor.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 우측: 선택된 멘토 상세 정보 */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white p-8">
        {selectedMentor ? (
          <div className="max-w-md w-full text-center">
            {/* 멘토 아이콘 */}
            <div className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center text-[72px] bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 shadow-lg">
              {selectedMentor.icon}
            </div>

            {/* 멘토 이름 */}
            <h2 className="text-[32px] font-bold text-[#191919] mb-2">
              {selectedMentor.fullName}
            </h2>

            {/* 부제목 (전문 분야) */}
            {selectedMentor.subtitle && (
              <p className="text-[16px] text-gray-600 mb-6 leading-relaxed">
                {selectedMentor.subtitle}
              </p>
            )}

            {/* 화살표 & 설명 */}
            <div className="flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-[#FEE500]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z" />
              </svg>
            </div>

            <div className="text-left bg-gray-50 rounded-lg p-6">
              <p className="text-[15px] text-gray-700 leading-relaxed">
                {selectedMentor.description}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-[16px]">멘토를 선택하면 상세 정보가 표시됩니다</p>
          </div>
        )}
      </div>
    </div>
  );
}

