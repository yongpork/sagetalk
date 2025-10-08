let mentors = [];
let selectedMentors = [];

// 멘토 데이터 로드
function loadMentors() {
    $.ajax({
        url: '/mentors.json',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            mentors = data.mentors.map(function(mentor) {
                return {
                    id: mentor.id,
                    name: mentor.name,
                    description: mentor.description,
                    image: mentor.icon,
                    keywords: (mentor.name + ' ' + mentor.description + ' ' + mentor.tags.join(' ')).toLowerCase()
                };
            });
            renderMentors();
        },
        error: function() {
            alert('멘토 데이터를 불러오는데 실패했습니다.');
        }
    });
}

// 멘토 목록 렌더링
function renderMentors(filteredMentors) {
    const $list = $('#mentorList');
    const $noResults = $('#noResults');
    const displayMentors = filteredMentors || mentors;
    
    $list.empty();

    if (displayMentors.length === 0) {
        $list.hide();
        $noResults.show();
        return;
    }

    $list.show();
    $noResults.hide();

    displayMentors.forEach(function(mentor) {
        const isSelected = selectedMentors.indexOf(mentor.id) !== -1;
        const $item = $('<div>')
            .addClass('mentor-item')
            .attr('data-id', mentor.id)
            .toggleClass('selected', isSelected);

        const $avatar = $('<img>')
            .addClass('mentor-avatar')
            .attr('src', mentor.image)
            .attr('alt', mentor.name);

        const $info = $('<div>').addClass('mentor-info');
        const $name = $('<div>').addClass('mentor-name').text(mentor.name);
        const $description = $('<div>').addClass('mentor-description').text(mentor.description);
        $info.append($name, $description);

        const $checkboxWrapper = $('<div>').addClass('checkbox-wrapper');
        const $checkbox = $('<div>').addClass('checkbox');
        $checkboxWrapper.append($checkbox);

        $item.append($avatar, $info, $checkboxWrapper);
        $list.append($item);
    });
}

// 선택된 멘토 아바타 업데이트
function updateSelectedAvatars() {
    const $avatars = $('#selectedAvatars');
    $avatars.empty();

    selectedMentors.forEach(function(mentorId) {
        const mentor = mentors.find(function(m) {
            return m.id === mentorId;
        });
        if (mentor) {
            const $avatar = $('<img>')
                .addClass('selected-avatar')
                .attr('src', mentor.image)
                .attr('alt', mentor.name);
            $avatars.append($avatar);
        }
    });
}

// 확인 버튼 업데이트
function updateConfirmButton() {
    const $btn = $('#confirmBtn');
    const $text = $('#confirmText');
    const count = selectedMentors.length;

    if (count > 0) {
        $btn.addClass('active');
        $text.text(count + '명의 멘토와 대화 시작하기');
    } else {
        $btn.removeClass('active');
        $text.text('대화 시작하기');
    }
}

// 멘토 검색
function searchMentors(query) {
    if (!query.trim()) {
        renderMentors();
        return;
    }

    const searchQuery = query.toLowerCase().replace(/\s/g, '');
    const filtered = mentors.filter(function(mentor) {
        const keywords = mentor.keywords.replace(/\s/g, '');
        return keywords.indexOf(searchQuery) !== -1;
    });

    renderMentors(filtered);
}

// 이벤트 리스너
$(document).ready(function() {
    // 멘토 데이터 로드
    loadMentors();

    // 멘토 선택/해제
    $(document).on('click', '.mentor-item', function() {
        const mentorId = $(this).data('id');
        const index = selectedMentors.indexOf(mentorId);

        if (index > -1) {
            selectedMentors.splice(index, 1);
            $(this).removeClass('selected');
        } else {
            selectedMentors.push(mentorId);
            $(this).addClass('selected');
        }

        updateSelectedAvatars();
        updateConfirmButton();
    });

    // 검색
    $('#searchInput').on('input', function() {
        searchMentors($(this).val());
    });

    // 대화 시작
    $('#confirmBtn').on('click', function() {
        if (!$(this).hasClass('active')) {
            return;
        }

        console.log('선택된 멘토 ID:', selectedMentors);
        
        // 서버로 전송
        $.ajax({
            url: '/api/create-room',
            method: 'POST',
            data: JSON.stringify({ mentorIds: selectedMentors }),
            contentType: 'application/json',
            success: function(response) {
                // 대화방으로 이동 (mentorIds도 함께 전달)
                const mentorIdsParam = response.mentorIds.join(',');
                window.location.href = '/chat.html?room=' + response.roomId + '&mentors=' + mentorIdsParam;
            },
            error: function(xhr, status, error) {
                console.error('대화방 생성 실패:', error);
                alert('대화방 생성에 실패했습니다. 다시 시도해주세요.');
            }
        });
    });
});

