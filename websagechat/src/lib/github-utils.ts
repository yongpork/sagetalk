import { Octokit } from '@octokit/rest';

// GitHub API 클라이언트 설정
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // GitHub Personal Access Token
});

// 저장소 정보
const REPO_OWNER = 'yongpork';
const REPO_NAME = 'sagetalk';

/**
 * GitHub에 대화 기록 자동 커밋
 * @param filePath 저장할 파일 경로 (예: 'Conversation/대화_비밀대화.md')
 * @param content 저장할 내용
 * @param commitMessage 커밋 메시지
 */
export async function autoCommitToGitHub(
  filePath: string,
  content: string,
  commitMessage: string = 'Auto-save conversation'
) {
  try {
    console.log(`🔄 GitHub 자동 커밋 시작: ${filePath}`);
    
    // 1. 현재 파일 내용 가져오기 (있는 경우)
    let currentContent = '';
    let sha = '';
    
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: filePath,
      });
      
      if ('content' in data) {
        currentContent = Buffer.from(data.content, 'base64').toString('utf8');
        sha = data.sha;
      }
    } catch (error: unknown) {
      // 파일이 존재하지 않는 경우 (404 에러)
      if ((error as { status?: number }).status !== 404) {
        throw error;
      }
      console.log(`📄 새 파일 생성: ${filePath}`);
    }
    
    // 2. 새 내용 추가
    const newContent = currentContent + content;
    
    // 3. GitHub에 파일 업로드/업데이트
    const { data: commitData } = await octokit.rest.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filePath,
      message: `${commitMessage} - ${new Date().toLocaleString('ko-KR')}`,
      content: Buffer.from(newContent, 'utf8').toString('base64'),
      sha: sha || undefined, // 기존 파일이 있으면 SHA 제공
      branch: 'main',
    });
    
    console.log(`✅ GitHub 자동 커밋 성공: ${commitData.commit.html_url}`);
    
    return {
      success: true,
      commitUrl: commitData.commit.html_url,
      commitSha: commitData.commit.sha,
      message: 'GitHub에 자동 백업되었습니다.'
    };
    
  } catch (error: unknown) {
    console.error('❌ GitHub 자동 커밋 실패:', error.message);
    
    return {
      success: false,
      error: error.message,
      message: 'GitHub 자동 백업에 실패했습니다.'
    };
  }
}

/**
 * 여러 파일을 한 번에 커밋
 * @param files 커밋할 파일 목록
 * @param commitMessage 커밋 메시지
 */
export async function batchCommitToGitHub(
  files: Array<{ path: string; content: string }>,
  commitMessage: string = 'Auto-save multiple conversations'
) {
  try {
    console.log(`🔄 GitHub 배치 커밋 시작: ${files.length}개 파일`);
    
    const tree = [];
    
    for (const file of files) {
      // 각 파일의 현재 내용 가져오기
      let currentContent = '';
      let sha = '';
      
      try {
        const { data } = await octokit.rest.repos.getContent({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          path: file.path,
        });
        
        if ('content' in data) {
          currentContent = Buffer.from(data.content, 'base64').toString('utf8');
          sha = data.sha;
        }
      } catch (error: unknown) {
        if (error.status !== 404) throw error;
      }
      
      // 새 내용 추가
      const newContent = currentContent + file.content;
      
      tree.push({
        path: file.path,
        mode: '100644',
        type: 'blob',
        content: newContent,
        sha: sha || undefined,
      });
    }
    
    // 커밋 생성
    const { data: commitData } = await octokit.rest.git.createCommit({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      message: `${commitMessage} - ${new Date().toLocaleString('ko-KR')}`,
      tree: tree.map(item => ({ path: item.path, sha: item.sha })),
    });
    
    console.log(`✅ GitHub 배치 커밋 성공: ${commitData.html_url}`);
    
    return {
      success: true,
      commitUrl: commitData.html_url,
      commitSha: commitData.sha,
      message: `${files.length}개 파일이 GitHub에 자동 백업되었습니다.`
    };
    
  } catch (error: unknown) {
    console.error('❌ GitHub 배치 커밋 실패:', error.message);
    
    return {
      success: false,
      error: error.message,
      message: 'GitHub 배치 백업에 실패했습니다.'
    };
  }
}

/**
 * 커밋 상태 확인
 * @param commitSha 커밋 SHA
 */
export async function checkCommitStatus(commitSha: string) {
  try {
    const { data } = await octokit.rest.repos.getCommit({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: commitSha,
    });
    
    return {
      success: true,
      status: data.commit.verification?.verified ? 'verified' : 'unverified',
      message: data.commit.message,
      url: data.html_url,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error.message,
    };
  }
}
