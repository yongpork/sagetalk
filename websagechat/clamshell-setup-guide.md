# 🖥️ 맥북 뚜껑을 덮고도 WebSageChat 실행하기

## 📋 필수 설정 명령어 (터미널에서 실행)

### 1. 절전모드 완전 비활성화
```bash
sudo pmset -a sleep 0
sudo pmset -a displaysleep 10
sudo pmset -a lidwake 0
```

### 2. PM2 자동 시작 설정
```bash
sudo env PATH=$PATH:/Users/markit/.nvm/versions/node/v20.19.3/bin /Users/markit/.nvm/versions/node/v20.19.3/lib/node_modules/pm2/bin/pm2 startup launchd -u markit --hp /Users/markit
```

## 🔧 현재 실행 중인 서비스들

### ✅ PM2 (WebSageChat)
- 상태: 실행 중
- 포트: 3000
- 로컬 접속: http://172.30.1.41:3000

### ✅ CloudFlare Tunnel
- 상태: 실행 중
- 공개 URL: https://dancing-come-evening-owen.trycloudflare.com
- 전 세계 어디서나 접속 가능

## 🎯 뚜껑을 덮고 사용하는 방법

### 방법 1: 외부 모니터 사용 (가장 안정적)
1. 외부 모니터 연결
2. 전원 어댑터 연결
3. 외부 키보드/마우스 연결
4. 맥북 뚜껑을 덮으면 자동으로 클램쉘 모드

### 방법 2: 외부 모니터 없이 사용
1. 위의 필수 설정 명령어 실행
2. 전원 어댑터 연결 (필수)
3. 맥북 뚜껑을 덮기 전에 모든 서비스가 실행 중인지 확인

## ⚠️ 주의사항

### 🔋 전원 관리
- **전원 어댑터 연결 필수** (배터리만으로는 제한적)
- 배터리 과열 방지를 위해 통풍이 잘 되는 곳에 배치

### 🌐 네트워크 연결
- WiFi 연결 상태 유지 중요
- 네트워크 연결이 끊어지면 CloudFlare Tunnel도 중단

### 📱 서비스 상태 확인 방법
휴대폰에서 다음 URL로 접속 테스트:
- https://dancing-come-evening-owen.trycloudflare.com

## 🔄 문제 발생 시 복구 방법

### 서비스 재시작
```bash
pm2 restart WebSageChat
```

### CloudFlare Tunnel 재시작
```bash
pkill cloudflared
cloudflared tunnel --url http://localhost:3000 &
```

### 전체 상태 확인
```bash
pm2 list
ps aux | grep cloudflared
```

## 📞 현재 공개 URL
**https://dancing-come-evening-owen.trycloudflare.com**

이 URL은 맥북이 켜져 있고 네트워크에 연결되어 있는 한 계속 사용 가능합니다.



