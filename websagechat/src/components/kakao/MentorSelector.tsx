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
    <div className="flex flex-col h-full bg-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-[#F5F5F5]">
        <button
          onClick={onCancel}
          className="text-gray-700 hover:text-gray-900 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-[#191919]">
          멘토 선택 ({selectedMentors.length}/{mentors.length})
        </h1>
        <button
          onClick={onConfirm}
          disabled={!canConfirm}
          className={`text-sm font-medium transition-colors ${
            canConfirm
              ? 'text-blue-600 hover:text-blue-700'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          확인
        </button>
      </div>

      {/* 검색바 */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="멘토 검색..."
            className="w-full px-4 py-2 pl-10 bg-[#F5F5F5] rounded-lg text-sm text-[#191919] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="px-4 py-2 bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex space-x-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-[#FEE500] text-[#191919]'
                  : 'bg-[#F5F5F5] text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* 멘토 목록 */}
      <div className="flex-1 overflow-y-auto">
        {filteredMentors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-sm">검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredMentors.map(mentor => {
              const isSelected = selectedMentors.includes(mentor.id);
              const isDisabled = !isSelected && selectedMentors.length >= maxSelection;

              return (
                <button
                  key={mentor.id}
                  onClick={() => !isDisabled && onToggleMentor(mentor.id)}
                  disabled={isDisabled}
                  className={`w-full px-4 py-3 flex items-center space-x-3 transition-colors ${
                    isDisabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-[#F5F5F5] active:bg-gray-200'
                  } ${isSelected ? 'bg-[#FEE500]/10' : 'bg-white'}`}
                >
                  {/* 체크박스 */}
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#FEE500] border-[#FEE500]'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-4 h-4 text-[#191919]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* 멘토 아이콘 */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-white border border-gray-200">
                    {mentor.icon}
                  </div>

                  {/* 멘토 정보 */}
                  <div className="flex-1 text-left min-w-0">
                    <h3 className="font-semibold text-[#191919] text-sm truncate">
                      {mentor.name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {mentor.fullName} · {mentor.category}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {mentor.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 하단 선택 정보 */}
      {selectedMentors.length > 0 && (
        <div className="px-4 py-3 bg-[#F5F5F5] border-t border-gray-200">
          <p className="text-sm text-center text-gray-600">
            {minSelection > 1 && selectedMentors.length < minSelection ? (
              <span className="text-orange-600">
                최소 {minSelection}명을 선택해주세요 ({minSelection - selectedMentors.length}명 더 필요)
              </span>
            ) : (
              <span className="text-blue-600">
                ✓ {selectedMentors.length}명 선택됨
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

