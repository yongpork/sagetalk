const fs = require('fs');
const path = require('path');

// assistants-config.json 파일 읽기
const configPath = path.join(__dirname, '../config/assistants-config.json');

if (!fs.existsSync(configPath)) {
  console.error('❌ assistants-config.json 파일이 없습니다.');
  console.log('먼저 npm run setup-assistants를 실행하세요.');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// 환경변수 설정 명령어 생성
console.log('🔧 Vercel 환경변수 설정 명령어:');
console.log('');
console.log('vercel env add ASSISTANTS_CONFIG');
console.log('');
console.log('다음 내용을 복사해서 붙여넣으세요:');
console.log('');
console.log(JSON.stringify(config, null, 2));
console.log('');
console.log('설정 후 다음 명령어로 재배포하세요:');
console.log('vercel --prod');
