# 🖥️ WebSageChat 24시간 서버 운영 체크리스트

## ✅ 현재 완료된 설정
- [x] PM2 설치 및 서비스 실행
- [x] PM2 프로세스 목록 저장 (`pm2 save`)
- [x] 서비스 상태 확인 (정상 동작 중)

## 🔧 사용자가 직접 실행해야 할 설정

### 1. 절전모드 비활성화 (필수)
```bash
# 절전모드 완전 비활성화
sudo pmset -a sleep 0

# 디스플레이만 10분 후 끄기
sudo pmset -a displaysleep 10
```

### 2. PM2 자동 시작 설정 (필수)
```bash
sudo env PATH=$PATH:/Users/markit/.nvm/versions/node/v20.19.3/bin /Users/markit/.nvm/versions/node/v20.19.3/lib/node_modules/pm2/bin/pm2 startup launchd -u markit --hp /Users/markit
```

### 3. 방화벽 설정 (선택사항)
- 시스템 환경설정 → 보안 및 개인 정보 보호 → 방화벽
- Node.js/터미널 외부 연결 허용

## 📊 서비스 관리 명령어

### 상태 확인
```bash
pm2 list                # 서비스 상태 확인
pm2 logs WebSageChat     # 로그 확인
pm2 monit               # 실시간 모니터링
```

### 서비스 제어
```bash
pm2 restart WebSageChat  # 재시작
pm2 stop WebSageChat     # 중지
pm2 start WebSageChat    # 시작
```

### 설정 확인
```bash
pmset -g                # 전원 관리 설정 확인
curl http://localhost:3000  # 서비스 접속 테스트
```

## 🌐 접속 정보
- **로컬 접속**: http://localhost:3000
- **네트워크 접속**: http://192.168.0.39:3000
- **서비스 이름**: WebSageChat
- **포트**: 3000

## ⚠️ 주의사항
1. **사용자 로그아웃하면 서비스 중단됨**
2. **컴퓨터 종료하면 서비스 중단됨**
3. **위의 절전모드 비활성화 설정 필수**
4. **정기적으로 `pm2 list`로 상태 확인 권장**
