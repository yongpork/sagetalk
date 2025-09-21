export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// 채팅방 ID와 파일 경로 매핑 (save-conversation과 동일 유지)
const ROOM_FILE_MAPPING: Record<string, string> = {
  'kim-ceo': '대화_김상무님:김성훈대표.md',
  'beop-monk': '대화_법상무님:법륜스님.md',
  'secret-chat': '대화_비밀대화.md',
  'seth-godin': '대화_세상무님:세스고든.md',
  'sejong': '대화_세종대왕님.md',
  'inamori': '대화_이상무:이나모리가즈오.md',
  'group-meeting': '대화_전체회의_open.md',
  'psychiatrist': '대화_최상무님:최명기정신과.md'
};

interface ApiMessage {
  id: string;
  sender: 'user' | 'mentor';
  mentorName?: string;
  content: string;
  timestamp: string;
  type: 'message' | 'system';
}

function parseMarkdownToMessages(md: string): ApiMessage[] {
  const lines = md.split(/\r?\n/);
  const messages: ApiMessage[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // 시스템 안내
    if (trimmed.startsWith('> 시스템:')) {
      messages.push({
        id: `${messages.length}-${Date.now()}`,
        sender: 'mentor',
        content: trimmed.replace(/^> 시스템:\s*/, ''),
        timestamp: new Date().toISOString(),
        type: 'system'
      });
      continue;
    }

    // 사용자 질문 (🗣️ **승용질문** : "내용")
    const userMatch = trimmed.match(/^🗣️\s*\*\*승용질문\*\*\s*:\s*"([\s\S]*?)"/);
    if (userMatch) {
      messages.push({
        id: `${messages.length}-${Date.now()}`,
        sender: 'user',
        content: userMatch[1],
        timestamp: new Date().toISOString(),
        type: 'message'
      });
      continue;
    }

    // 멘토 답변 (**멘토** [MODEL]: 내용)
    const mentorMatch = trimmed.match(/^\*\*([^*]+)\*\*\s*(\[[^\]]+\])?\s*:\s*([\s\S]+)/);
    if (mentorMatch) {
      messages.push({
        id: `${messages.length}-${Date.now()}`,
        sender: 'mentor',
        mentorName: mentorMatch[1].trim(),
        content: mentorMatch[3].trim(),
        timestamp: new Date().toISOString(),
        type: 'message'
      });
      continue;
    }
  }

  // 마지막 100개만 반환
  return messages.slice(-100);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId') || '';
    const fileName = ROOM_FILE_MAPPING[roomId];
    if (!fileName) {
      return NextResponse.json({ success: false, error: 'Invalid roomId' }, { status: 400 });
    }

    const conversationDir = path.join(process.cwd(), '..', 'Conversation');
    const filePath = path.join(conversationDir, fileName);

    let fileContent = '';
    try {
      fileContent = await fs.readFile(filePath, 'utf8');
    } catch {
      // 파일이 아직 없을 수 있음
      return NextResponse.json({ success: true, messages: [] });
    }

    const messages = parseMarkdownToMessages(fileContent);
    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load history' }, { status: 500 });
  }
}


