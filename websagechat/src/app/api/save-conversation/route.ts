import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { autoCommitToGitHub } from '@/lib/github-utils';

// 채팅방 ID와 파일 경로 매핑
const ROOM_FILE_MAPPING = {
  'kim-ceo': '대화_김상무님:김성훈대표.md',
  'beop-monk': '대화_법상무님:법륜스님.md',
  'secret-chat': '대화_비밀대화.md',
  'seth-godin': '대화_세상무님:세스고든.md',
  'sejong': '대화_세종대왕님.md',
  'inamori': '대화_이상무:이나모리가즈오.md',
  'group-meeting': '대화_전체회의_open.md',
  'psychiatrist': '대화_최상무님:최명기정신과.md'
};

// 메시지를 markdown 형식으로 변환
function formatMessageForMarkdown(message: {sender?: string, type?: string, content: string, timestamp: string, mentorName?: string}, aiModel: string): string {
  
  if (message.sender === 'user') {
    return `🗣️ **승용질문** : "${message.content}"\n\n`;
  } else if (message.type === 'system') {
    return `> 시스템: ${message.content}\n\n`;
  } else {
    const mentor = message.mentorName || '멘토';
    const modelTag = aiModel === 'claude' ? '[Claude]' : '[GPT-4]';
    return `**${mentor}** ${modelTag}: ${message.content}\n\n`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { roomId, messages, aiModel } = await request.json();
    
    if (!ROOM_FILE_MAPPING[roomId as keyof typeof ROOM_FILE_MAPPING]) {
      return NextResponse.json(
        { success: false, error: 'Invalid room ID' },
        { status: 400 }
      );
    }
    
    const fileName = ROOM_FILE_MAPPING[roomId as keyof typeof ROOM_FILE_MAPPING];
    const conversationDir = path.join(process.cwd(), '..', 'Conversation');
    const filePath = path.join(conversationDir, fileName);
    const sageFilePath = path.join(process.cwd(), '..', 'sage_talk_conversations.md');
    
    // 새로운 대화 내용을 markdown 형식으로 변환
    const newContent = messages
      .slice(-2) // 마지막 질문과 답변만
      .map((msg: {sender?: string, type?: string, content: string, timestamp: string, mentorName?: string}) => formatMessageForMarkdown(msg, aiModel))
      .join('');
    
    const separator = `\n---\n*${new Date().toLocaleString('ko-KR')} - ${aiModel.toUpperCase()} 모델 사용*\n\n`;
    const contentWithSeparator = separator + newContent + '\n';
    
    try {
      // 1. 개별 채팅방 파일에 저장 (로컬)
      await fs.appendFile(filePath, contentWithSeparator, 'utf8');
      
      // 2. sage_talk_conversations.md에도 저장 (로컬)
      const sageContent = `\n### ${fileName.replace('.md', '')} - ${new Date().toLocaleString('ko-KR')}\n${newContent}---\n\n`;
      await fs.appendFile(sageFilePath, sageContent, 'utf8');
      
      // 3. GitHub 자동 백업
      let githubBackupResult = null;
      try {
        console.log('🔄 GitHub 자동 백업 시작...');
        
        // 개별 파일과 통합 파일 모두 백업
        const backupPromises = [
          autoCommitToGitHub(
            `Conversation/${fileName}`, 
            contentWithSeparator,
            `대화 저장: ${fileName}`
          ),
          autoCommitToGitHub(
            'sage_talk_conversations.md',
            sageContent,
            `통합 대화 저장: ${fileName}`
          )
        ];
        
        const backupResults = await Promise.allSettled(backupPromises);
        githubBackupResult = backupResults.map((result, index) => ({
          file: index === 0 ? fileName : 'sage_talk_conversations.md',
          success: result.status === 'fulfilled' && result.value.success,
          message: result.status === 'fulfilled' ? result.value.message : result.reason?.message || '백업 실패'
        }));
        
        console.log('✅ GitHub 자동 백업 완료');
        
      } catch (githubError) {
        console.error('❌ GitHub 백업 오류:', githubError);
        githubBackupResult = {
          success: false,
          error: githubError instanceof Error ? githubError.message : '알 수 없는 오류'
        };
      }
      
      return NextResponse.json({ 
        success: true, 
        message: '대화 기록이 저장되었습니다.', 
        files: [fileName, 'sage_talk_conversations.md'],
        local: {
          saved: true,
          files: [fileName, 'sage_talk_conversations.md']
        },
        github: githubBackupResult,
        timestamp: new Date().toISOString()
      });
      
    } catch (fileError) {
      console.error('File write error:', fileError);
      return NextResponse.json(
        { 
          success: false, 
          error: '파일 저장 중 오류가 발생했습니다.',
          details: fileError
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Save conversation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save conversation' 
      },
      { status: 500 }
    );
  }
}
