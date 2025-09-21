// 페이지에 자동 디버깅 스크립트 삽입
(function() {
    console.clear();
    console.log('🔍 WebSageChat 레이아웃 자동 분석');
    
    setTimeout(() => {
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
            
            // 결과를 페이지에 표시
            const debugDiv = document.createElement('div');
            debugDiv.style.cssText = `
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: rgba(0,0,0,0.9); color: white; padding: 20px;
                border-radius: 10px; z-index: 10000; font-family: monospace;
                font-size: 14px; line-height: 1.5;
            `;
            debugDiv.innerHTML = `
                <h3>🔍 레이아웃 분석 결과</h3>
                <div>헤더 높이: ${results.헤더높이}px</div>
                <div>헤더 하단: ${results.헤더하단}px</div>
                <div>Spacer 높이: ${results.Spacer높이}px</div>
                <div>메시지 시작: ${results.메시지시작}px</div>
                <div>실제 여백: ${results.실제여백}px</div>
                <div style="color: ${results.겹침발생 ? 'red' : 'green'}">
                    겹침 발생: ${results.겹침발생 ? 'YES ❌' : 'NO ✅'}
                </div>
                <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px;">닫기</button>
            `;
            document.body.appendChild(debugDiv);
            
            setTimeout(() => {
                header.style.outline = '';
                messageContainer.style.outline = '';
            }, 5000);
            
        } else {
            console.log('❌ 요소를 찾을 수 없음');
        }
    }, 1000);
})();
