let roomId = '';
let mentors = [];
let messages = [];
let isLoading = false;

// URL에서 roomId 가져오기
function getRoomId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('room');
}

// URL에서 mentorIds 가져오기
function getMentorIds() {
    const urlParams = new URLSearchParams(window.location.search);
    const mentorsParam = urlParams.get('mentors');
    return mentorsParam ? mentorsParam.split(',') : [];
}

// 멘토 정보 로드
function loadMentorInfo(mentorIds) {
    $.ajax({
        url: '/mentors.json',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            mentors = data.mentors.filter(function(mentor) {
                return mentorIds.indexOf(mentor.id) !== -1;
            });
            updateHeader();
        }
    });
}

// 헤더 업데이트
function updateHeader() {
    if (mentors.length === 0) {
        return;
    }
    
    let mentorNames = mentors.map(function(m) {
        return m.name;
    }).join(', ');
    
    $('#mentorName').text(mentorNames);
    $('#mentorStatus').text('온라인');
}

// 메시지 추가
function addMessage(content, isUser, mentorInfo) {
    const timestamp = new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    const $message = $('<div>').addClass('message').addClass(isUser ? 'user' : 'mentor');
    
    if (!isUser && mentorInfo) {
        const $avatar = $('<img>')
            .addClass('message-avatar')
            .attr('src', mentorInfo.icon)
            .attr('alt', mentorInfo.name);
        $message.append($avatar);
    }

    const $bubble = $('<div>').addClass('message-bubble').text(content);
    $message.append($bubble);

    $('#chatMessages').append($message);
    scrollToBottom();
}

// 로딩 인디케이터 표시
function showLoading() {
    const $loading = $('<div>').addClass('message mentor');
    const $bubble = $('<div>')
        .addClass('message-bubble')
        .append(
            $('<div>').addClass('loading-indicator')
                .append($('<div>').addClass('loading-dot'))
                .append($('<div>').addClass('loading-dot'))
                .append($('<div>').addClass('loading-dot'))
        );
    $loading.append($bubble);
    $loading.attr('id', 'loadingIndicator');
    $('#chatMessages').append($loading);
    scrollToBottom();
}

// 로딩 인디케이터 제거
function hideLoading() {
    $('#loadingIndicator').remove();
}

// 스크롤 하단으로
function scrollToBottom() {
    const $messages = $('#chatMessages');
    $messages.scrollTop($messages[0].scrollHeight);
}

// 메시지 전송
function sendMessage() {
    const message = $('#chatInput').val().trim();
    if (!message || isLoading) {
        return;
    }

    // 사용자 메시지 표시
    addMessage(message, true);
    $('#chatInput').val('');
    $('#sendButton').prop('disabled', true);
    
    isLoading = true;
    showLoading();

    // API 호출
    $.ajax({
        url: '/api/chat',
        method: 'POST',
        data: JSON.stringify({
            roomId: roomId,
            message: message,
            mentorIds: mentors.map(function(m) { return m.id; })
        }),
        contentType: 'application/json',
        success: function(response) {
            hideLoading();
            
            // 멘토 응답 표시
            if (response.responses && response.responses.length > 0) {
                response.responses.forEach(function(resp) {
                    const mentor = mentors.find(function(m) {
                        return m.id === resp.mentorId;
                    });
                    addMessage(resp.message, false, mentor);
                });
            }
            
            isLoading = false;
            $('#sendButton').prop('disabled', false);
            $('#chatInput').focus();
        },
        error: function(xhr, status, error) {
            hideLoading();
            console.error('메시지 전송 실패:', error);
            
            let errorMessage = '응답을 받는데 실패했습니다.';
            if (xhr.responseJSON && xhr.responseJSON.error) {
                errorMessage = xhr.responseJSON.error;
            }
            
            addMessage(errorMessage, false, mentors[0]);
            
            isLoading = false;
            $('#sendButton').prop('disabled', false);
            $('#chatInput').focus();
        }
    });
}

// 대화 내역 로드
function loadHistory() {
    $.ajax({
        url: '/api/history?roomId=' + roomId,
        method: 'GET',
        success: function(response) {
            if (response.messages && response.messages.length > 0) {
                response.messages.forEach(function(msg) {
                    const mentor = msg.mentorId ? mentors.find(function(m) {
                        return m.id === msg.mentorId;
                    }) : null;
                    addMessage(msg.content, msg.isUser, mentor);
                });
            }
        },
        error: function() {
            console.log('대화 내역이 없습니다.');
        }
    });
}

// 이벤트 리스너
$(document).ready(function() {
    roomId = getRoomId();
    
    if (!roomId) {
        alert('잘못된 접근입니다.');
        window.location.href = '/';
        return;
    }

    // URL에서 mentorIds 추출
    const mentorIds = getMentorIds();
    if (mentorIds.length === 0) {
        alert('멘토 정보를 찾을 수 없습니다.');
        window.location.href = '/';
        return;
    }
    loadMentorInfo(mentorIds);
    
    // 대화 내역 로드
    setTimeout(function() {
        loadHistory();
    }, 500);

    // 뒤로가기
    $('#backButton').on('click', function() {
        window.location.href = '/';
    });

    // 전송 버튼 클릭
    $('#sendButton').on('click', function() {
        sendMessage();
    });

    // Enter 키로 전송
    $('#chatInput').on('keypress', function(e) {
        if (e.which === 13 && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // 입력창 포커스
    $('#chatInput').focus();
});

