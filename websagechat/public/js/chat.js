let roomId = '';
let mentors = [];
let messages = [];
let isLoading = false;
let selectedImage = null;

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

// 마크다운 형식 변환 함수
function formatMentorMessage(content) {
    // 0. OpenAI File Search 참조 주석 제거 (가장 먼저 처리)
    content = content.replace(/【\d+:\d+†[^】]+】/g, '');
    content = content.replace(/\[\d+:\d+\+[^\]]+\]/g, '');
    content = content.replace(/\(\d+:\d+\+[^)]+\)/g, '');
    
    // 1. ### 챕터 제목을 h3 태그로 변환
    content = content.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    
    // 2. ## 제목을 h2 태그로 변환
    content = content.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    
    // 3. # 제목을 h1 태그로 변환
    content = content.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // 4. **굵은 글씨**를 strong 태그로 변환
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 5. *기울임*을 em 태그로 변환
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // 6. 번호가 있는 리스트 처리
    content = content.replace(/^(\d+)\.\s+(.*$)/gm, '<li><strong>$1.</strong> $2</li>');
    
    // 7. - 또는 * 불릿 포인트 처리
    content = content.replace(/^[-*]\s+(.*$)/gm, '<li>$1</li>');
    
    // 8. 연속된 li 태그를 ul로 감싸기
    content = content.replace(/(<li>.*<\/li>(\s*<li>.*<\/li>)*)/g, '<ul>$1</ul>');
    
    // 9. 줄바꿈을 br 태그로 변환 (단, HTML 태그 내부는 제외)
    content = content.replace(/\n/g, '<br>');
    
    // 10. 빈 줄을 더 명확하게 구분
    content = content.replace(/<br><br>/g, '<br><br>');
    
    return content;
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

    const $bubble = $('<div>').addClass('message-bubble');
    
    if (isUser) {
        $bubble.text(content);
    } else {
        // 멘토 메시지는 마크다운 형식으로 변환
        const formattedContent = formatMentorMessage(content);
        $bubble.html(formattedContent);
    }
    
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

// 스트리밍 메시지 전송
function sendMessageStreaming() {
    const message = $('#chatInput').val().trim();
    if ((!message && !selectedImage) || isLoading) {
        return;
    }

    // 사용자 메시지 표시 (이미지 포함)
    const displayMessage = selectedImage ? 
        message + (message ? '\n\n📷 이미지 첨부됨' : '📷 이미지 전송') : 
        message;
    addMessage(displayMessage, true);
    
    // 이미지가 있으면 미리보기 표시
    if (selectedImage) {
        const reader = new FileReader();
        reader.onload = function(e) {
            addImageMessage(e.target.result, true);
        };
        reader.readAsDataURL(selectedImage);
    }
    
    $('#chatInput').val('');
    $('#sendButton').prop('disabled', true);
    
    isLoading = true;
    showLoading();

    // FormData로 이미지와 텍스트 전송
    const formData = new FormData();
    formData.append('roomId', roomId);
    formData.append('message', message || '이미지를 분석해주세요');
    formData.append('mentorIds', JSON.stringify(mentors.map(function(m) { return m.id; })));
    formData.append('stream', 'true');
    
    if (selectedImage) {
        formData.append('image', selectedImage);
    }

    // 멘토별 메시지 버블 추적
    const mentorBubbles = {};
    const mentorTexts = {};

    // FormData를 URLSearchParams로 변환 (EventSource는 GET만 지원)
    // 대신 fetch + EventSource 조합 사용
    const url = '/api/chat';
    
    console.log('[Streaming] 요청 시작:', url);
    
    fetch(url, {
        method: 'POST',
        body: formData
    }).then(response => {
        console.log('[Streaming] 응답 상태:', response.status, response.statusText);
        
        if (!response.ok) {
            console.error('[Streaming] 응답 실패:', response.status);
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        function processStream() {
            reader.read().then(({ done, value }) => {
                if (done) {
                    hideLoading();
                    isLoading = false;
                    $('#sendButton').prop('disabled', false);
                    $('#chatInput').focus();
                    
                    // 이미지 초기화
                    selectedImage = null;
                    $('#imagePreview').hide();
                    $('#imageInput').val('');
                    return;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop(); // 마지막 불완전한 라인은 버퍼에 유지

                lines.forEach(line => {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.substring(6));
                            
                            if (data.type === 'start') {
                                // 멘토 시작: 빈 버블 생성
                                console.log('[Streaming] 멘토 시작:', data.mentorId);
                                const mentor = mentors.find(m => m.id === data.mentorId);
                                if (mentor) {
                                    const $message = $('<div>').addClass('message mentor');
                                    const $avatar = $('<img>')
                                        .addClass('message-avatar')
                                        .attr('src', mentor.icon)
                                        .attr('alt', mentor.name);
                                    const $bubble = $('<div>')
                                        .addClass('message-bubble')
                                        .attr('data-mentor-id', data.mentorId);
                                    
                                    $message.append($avatar).append($bubble);
                                    $('#chatMessages').append($message);
                                    
                                    mentorBubbles[data.mentorId] = $bubble;
                                    mentorTexts[data.mentorId] = '';
                                    scrollToBottom();
                                }
                            } else if (data.type === 'chunk') {
                                // 텍스트 조각 추가
                                console.log('[Streaming] 청크 수신:', data.mentorId, data.chunk);
                                if (mentorBubbles[data.mentorId]) {
                                    mentorTexts[data.mentorId] += data.chunk;
                                    const formattedText = formatMentorMessage(mentorTexts[data.mentorId]);
                                    mentorBubbles[data.mentorId].html(formattedText);
                                    scrollToBottom();
                                }
                            } else if (data.type === 'done') {
                                // 멘토 완료
                                console.log(`멘토 ${data.mentorId} 완료`);
                            } else if (data.type === 'error') {
                                // 에러 처리
                                if (mentorBubbles[data.mentorId]) {
                                    mentorBubbles[data.mentorId].text(data.message || '응답 생성 중 오류가 발생했습니다.');
                                }
                            }
                        } catch (e) {
                            console.error('SSE 파싱 오류:', e);
                        }
                    }
                });

                processStream();
            }).catch(error => {
                console.error('스트림 읽기 오류:', error);
                hideLoading();
                isLoading = false;
                $('#sendButton').prop('disabled', false);
                addMessage('스트리밍 중 오류가 발생했습니다.', false, mentors[0]);
            });
        }

        processStream();
    }).catch(error => {
        console.error('fetch 오류:', error);
        hideLoading();
        isLoading = false;
        $('#sendButton').prop('disabled', false);
        addMessage('연결 오류가 발생했습니다.', false, mentors[0]);
    });
}

// 메시지 전송 (sendMessageStreaming 사용)
function sendMessage() {
    sendMessageStreaming();
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

    // 이미지 업로드 버튼 클릭
    $('#imageUploadBtn').click(function() {
        $('#imageInput').click();
    });

    // 이미지 파일 선택
    $('#imageInput').change(function(e) {
        const file = e.target.files[0];
        if (file) {
            selectedImage = file;
            showImagePreview(file);
        }
    });

    // 이미지 제거
    $('#removeImageBtn').click(function() {
        selectedImage = null;
        $('#imagePreview').hide();
        $('#imageInput').val('');
    });

    // 입력창 포커스
    $('#chatInput').focus();
});

// 이미지 미리보기 표시
function showImagePreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        $('#previewImg').attr('src', e.target.result);
        $('#imagePreview').show();
    };
    reader.readAsDataURL(file);
}

// 이미지 메시지 표시
function addImageMessage(imageSrc, isUser) {
    const $messages = $('#chatMessages');
    const messageClass = isUser ? 'user-message' : 'mentor-message';
    const messageHtml = `
        <div class="message ${messageClass}">
            <div class="message-content">
                <img src="${imageSrc}" style="max-width: 200px; max-height: 200px; border-radius: 8px; margin-top: 8px;">
            </div>
        </div>
    `;
    $messages.append(messageHtml);
    $messages.scrollTop($messages[0].scrollHeight);
}

