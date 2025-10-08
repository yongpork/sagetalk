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

  return (
    <div className="flex flex-col h-full bg-[#B8C5D6]">
      {/* 헤더 - 카카오톡 스타일 */}
      <div className="flex items-center justify-between px-5 py-4 bg-[#A8B4C5] border-b border-[#95A3B6]">
        <button
          onClick={onCancel}
          className="text-white hover:opacity-80 transition-opacity"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-[17px] font-semibold text-white">
          멘토 선택
        </h1>
        <button
          onClick={onConfirm}
          disabled={!canConfirm}
          className={`px-4 py-1.5 rounded-md text-[15px] font-medium transition-all ${
            canConfirm
              ? 'bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FFE812]'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          확인
        </button>
      </div>

      {/* 검색바 - 카카오톡 스타일 */}
      <div className="px-4 py-3 bg-[#B8C5D6]">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름 검색"
            className="w-full px-4 py-2.5 bg-white rounded-md text-[15px] text-[#191919] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FEE500]"
          />
        </div>
      </div>

      {/* 카테고리 필터 - 카카오톡 스타일 */}
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

      {/* 멘토 목록 - 카카오톡 친구 목록 스타일 */}
      <div className="flex-1 overflow-y-auto bg-white">
        {filteredMentors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-white">
            <svg className="w-20 h-20 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-[15px] text-gray-400">검색 결과가 없습니다</p>
          </div>
        ) : (
          <>
            {/* 친구 카운트 헤더 */}
            <div className="px-5 py-2 bg-[#F7F7F7] border-b border-gray-200">
              <p className="text-[13px] text-gray-500 font-medium">
                멘토 {filteredMentors.length}명
              </p>
            </div>
            
            <div className="divide-y divide-gray-100">
              {filteredMentors.map(mentor => {
                const isSelected = selectedMentors.includes(mentor.id);
                const isDisabled = !isSelected && selectedMentors.length >= maxSelection;

                return (
                  <button
                    key={mentor.id}
                    onClick={() => !isDisabled && onToggleMentor(mentor.id)}
                    disabled={isDisabled}
                    className={`w-full px-5 py-3.5 flex items-center space-x-3 transition-all ${
                      isDisabled
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:bg-gray-50 active:bg-gray-100'
                    } ${isSelected ? 'bg-[#FFF9E6]' : 'bg-white'}`}
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

                    {/* 멘토 프로필 이미지 */}
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
          </>
        )}
      </div>

      {/* 하단 선택 정보 - 카카오톡 스타일 */}
      {selectedMentors.length > 0 && (
        <div className="px-5 py-3.5 bg-[#F7F7F7] border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2">
            {minSelection > 1 && selectedMentors.length < minSelection ? (
              <>
                <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-[14px] text-orange-600 font-medium">
                  최소 {minSelection}명 선택 필요 (현재 {selectedMentors.length}명)
                </span>
              </>
            ) : (
              <>
                <div className="w-5 h-5 bg-[#FEE500] rounded-full flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-[#3C1E1E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[14px] text-[#3C1E1E] font-medium">
                  {selectedMentors.length}명 선택됨
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

