# Knowledge - 공통 학습 자료

이 폴더의 모든 `.md` 파일은 **모든 멘토가 공통으로 학습**합니다.

## 📚 현재 학습 자료

- `markit_info.md` - Markit 회사 정보 (1,688줄)
- `pharma_info.md` - 제약업계 AI 챗봇 활용 현황 (187줄)

## 🚀 사용 방법

### 1. 새로운 학습 자료 추가

```bash
# 1. 이 폴더에 .md 파일 추가
cp your_new_file.md /Users/markit/Documents/SageTalk/knowledge/

# 2. Assistant 재설정 실행
cd /Users/markit/Documents/SageTalk/websagechat
npm run setup-assistants

# 3. 서버 재시작
pkill -f "node server.js"
node server.js
```

### 2. 학습 자료 수정

```bash
# 1. 파일 수정
vim /Users/markit/Documents/SageTalk/knowledge/markit_info.md

# 2. Assistant 재설정 (필수!)
cd /Users/markit/Documents/SageTalk/websagechat
npm run setup-assistants
```

## 📊 확장성

- **현재**: 2개 파일
- **최대**: 100개 파일 지원
- **파일 형식**: `.md` (Markdown)
- **용량 제한**: 파일당 최대 512MB

## 🎯 학습 범위

이 폴더의 파일들은:
- ✅ 김성훈대표
- ✅ 법륜스님
- ✅ 세스고든
- ✅ 세종대왕
- ✅ 이나모리가즈오
- ✅ 최명기선생님

**모든 멘토**가 학습하고 답변에 활용합니다.

## ⚠️ 주의사항

1. **파일 추가/수정 후 반드시 `setup-assistants` 실행**
2. OpenAI API 비용 발생 (파일당 약 $0.10/GB/day)
3. 첫 설정 시 시간이 걸림 (6명 × 파일수)

## 📝 작성 날짜

${new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}

