# GitHub 자동 백업 설정 가이드

> **작성일**: 2025년 9월 21일  
> **목적**: GitHub Personal Access Token 설정으로 자동 백업 시스템 활성화

---

## 🔑 GitHub Personal Access Token 생성

### **1단계: GitHub에서 토큰 생성**

1. **GitHub 로그인**
   - https://github.com 접속
   - 계정으로 로그인

2. **Settings 이동**
   - 우상단 프로필 클릭 → "Settings" 클릭

3. **Developer settings**
   - 좌측 메뉴 하단 "Developer settings" 클릭

4. **Personal access tokens**
   - "Personal access tokens" → "Tokens (classic)" 클릭

5. **새 토큰 생성**
   - "Generate new token" → "Generate new token (classic)" 클릭

### **2단계: 토큰 권한 설정**

**Token description:**
```
SageTalk 자동 백업 시스템
```

**Expiration:**
```
No expiration (또는 1년)
```

**권한 선택 (Scopes):**
```
✅ repo (전체 저장소 권한)
   ✅ repo:status
   ✅ repo_deployment
   ✅ public_repo
   ✅ repo:invite
   ✅ security_events

✅ workflow (GitHub Actions 권한)
```

### **3단계: 토큰 생성 및 복사**

1. **"Generate token" 클릭**
2. **생성된 토큰 복사** (한 번만 표시됨!)
   ```
   예: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. **안전한 곳에 보관** (다시 볼 수 없음)

---

## ⚙️ Vercel 환경 변수 설정

### **Vercel 대시보드에서 설정**

1. **Vercel 프로젝트 대시보드 접속**
   - https://vercel.com/yongporks-projects/sagetalk

2. **Settings 이동**
   - "Settings" 탭 클릭

3. **Environment Variables**
   - "Environment Variables" 섹션 클릭

4. **새 환경 변수 추가**
   ```
   Name: GITHUB_TOKEN
   Value: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   Environment: Production, Preview, Development (모두 선택)
   ```

5. **"Save" 클릭**

### **환경 변수 확인**

설정 후 다음 정보가 표시되어야 합니다:
```
✅ GITHUB_TOKEN
   Production: ✓
   Preview: ✓  
   Development: ✓
```

---

## 🧪 테스트 방법

### **1. 환경 변수 확인**

```bash
# Vercel Functions에서 확인
console.log('GitHub Token:', process.env.GITHUB_TOKEN ? '설정됨' : '설정 안됨');
```

### **2. 자동 백업 테스트**

1. **웹사이트에서 대화 진행**
   - https://sagetalk.vercel.app 접속
   - 아무 채팅방에서 대화 시작

2. **GitHub 저장소 확인**
   - https://github.com/yongpork/sagetalk 접속
   - "Conversation" 폴더 확인
   - 최근 커밋 메시지 확인

3. **예상 결과:**
   ```
   Auto-save conversation: 대화_비밀대화.md - 2025년 9월 21일 15:30:00
   ```

---

## 🔍 문제 해결

### **문제 1: "GitHub Token이 설정되지 않음" 오류**

**해결 방법:**
1. Vercel 환경 변수 재확인
2. 토큰 권한 확인 (repo 권한 필요)
3. 토큰 만료일 확인

### **문제 2: "403 Forbidden" 오류**

**해결 방법:**
1. 토큰 권한 재확인
2. 저장소 접근 권한 확인
3. 새로운 토큰 생성

### **문제 3: "404 Not Found" 오류**

**해결 방법:**
1. 저장소 이름 확인 (`yongpork/sagetalk`)
2. 파일 경로 확인 (`Conversation/대화_비밀대화.md`)

---

## 📊 백업 상태 모니터링

### **API 응답 예시**

```json
{
  "success": true,
  "message": "대화 기록이 저장되었습니다.",
  "files": ["대화_비밀대화.md", "sage_talk_conversations.md"],
  "local": {
    "saved": true,
    "files": ["대화_비밀대화.md", "sage_talk_conversations.md"]
  },
  "github": [
    {
      "file": "대화_비밀대화.md",
      "success": true,
      "message": "GitHub에 자동 백업되었습니다."
    },
    {
      "file": "sage_talk_conversations.md", 
      "success": true,
      "message": "GitHub에 자동 백업되었습니다."
    }
  ],
  "timestamp": "2025-09-21T15:30:00.000Z"
}
```

### **성공적인 백업 확인 방법**

1. **GitHub 커밋 히스토리 확인**
   ```
   https://github.com/yongpork/sagetalk/commits/main
   ```

2. **최근 커밋 메시지 패턴**
   ```
   Auto-save conversation: 대화_비밀대화.md - 2025년 9월 21일 15:30:00
   Auto-save conversation: 통합 대화 저장: 대화_비밀대화.md - 2025년 9월 21일 15:30:00
   ```

3. **파일 변경 사항 확인**
   ```
   Conversation/대화_비밀대화.md
   sage_talk_conversations.md
   ```

---

## 🚀 고급 설정

### **배치 백업 (여러 파일 한 번에)**

```javascript
// 향후 구현 예정
const files = [
  { path: 'Conversation/대화_비밀대화.md', content: content1 },
  { path: 'sage_talk_conversations.md', content: content2 }
];

await batchCommitToGitHub(files, '대화 기록 일괄 백업');
```

### **백업 실패 시 재시도**

```javascript
// 자동 재시도 로직 (향후 구현)
let retryCount = 0;
const maxRetries = 3;

while (retryCount < maxRetries) {
  try {
    await autoCommitToGitHub(filePath, content);
    break; // 성공 시 루프 종료
  } catch (error) {
    retryCount++;
    await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
  }
}
```

---

## 📋 체크리스트

### **설정 완료 확인**

- [ ] GitHub Personal Access Token 생성
- [ ] 토큰에 repo 권한 부여
- [ ] Vercel 환경 변수에 GITHUB_TOKEN 설정
- [ ] Production, Preview, Development 환경 모두 설정
- [ ] 웹사이트에서 대화 테스트
- [ ] GitHub 커밋 히스토리 확인
- [ ] 백업 파일 내용 확인

### **정상 작동 확인**

- [ ] 대화 저장 시 GitHub 자동 커밋
- [ ] 커밋 메시지에 타임스탬프 포함
- [ ] 개별 파일과 통합 파일 모두 백업
- [ ] API 응답에 github 백업 결과 포함

---

## 💡 추가 팁

### **보안 강화**

1. **토큰 주기적 갱신**
   - 6개월마다 새 토큰 생성
   - 이전 토큰 즉시 삭제

2. **토큰 범위 최소화**
   - 필요한 권한만 부여
   - 불필요한 권한 제거

### **성능 최적화**

1. **배치 처리**
   - 여러 대화를 한 번에 백업
   - API 호출 횟수 최소화

2. **비동기 처리**
   - 백업 실패가 대화 저장을 방해하지 않음
   - 백그라운드에서 백업 진행

---

**마지막 업데이트**: 2025년 9월 21일  
**상태**: 구현 완료, 테스트 대기  
**우선순위**: 높음
