// post-loader.js - 마크다운 로딩 및 파싱, Giscus 댓글 로딩

// URL에서 게시글 파일명 추출
function getPostFilename() {
    const params = new URLSearchParams(window.location.search);
    return params.get('file');
}

// posts.json 로드 및 현재 게시글 정보 가져오기
async function loadPost() {
    const filename = getPostFilename();

    if (!filename) {
        console.error('게시글 파일명이 없습니다.');
        return;
    }

    try {
        // posts.json 로드
        const response = await fetch('posts.json');
        if (!response.ok) {
            throw new Error('posts.json을 불러올 수 없습니다.');
        }

        const posts = await response.json();
        const post = posts.find(p => p.file === filename);

        if (!post) {
            console.error('게시글을 찾을 수 없습니다.');
            return;
        }

        // 마크다운 파일 로드
        const markdownResponse = await fetch(`pages/${filename}`);
        if (!markdownResponse.ok) {
            throw new Error('마크다운 파일을 불러올 수 없습니다.');
        }

        const markdownText = await markdownResponse.text();

        // 마크다운을 HTML로 변환
        const html = marked.parse(markdownText);

        // 게시글 제목 설정
        document.title = post.title + ' - 블로그';

        // 게시글 컨텐츠 렌더링
        const contentArea = document.getElementById('post-content');
        if (contentArea) {
            contentArea.innerHTML = html;
        }

        // 코드 하이라이팅 적용
        Prism.highlightAll();

        // Giscus 댓글 로드
        loadGiscus();

    } catch (error) {
        console.error('게시글 로딩 오류:', error);
    }
}

// Giscus 댓글 시스템 로드
function loadGiscus() {
    // Giscus 컨테이너 생성
    const giscusContainer = document.createElement('div');
    giscusContainer.className = 'giscus-container';
    giscusContainer.id = 'giscus';

    // 게시글 컨텐츠 뒤에 추가
    const contentArea = document.getElementById('post-content');
    if (contentArea && contentArea.parentNode) {
        contentArea.parentNode.appendChild(giscusContainer);
    }

    // Giscus 스크립트 생성 및 설정
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'jyej0a/jyej0a');
    script.setAttribute('data-repo-id', 'R_kgDOQLHmDQ');
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'DIC_kwDOQLHmDc4CxMdu');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '1'); // 실시간 업데이트를 위해 1로 설정
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'preferred_color_scheme');
    script.setAttribute('data-lang', 'ko');
    script.crossOrigin = 'anonymous';
    script.async = true;

    // Giscus 컨테이너에 스크립트 추가
    giscusContainer.appendChild(script);
}

// 페이지 로드 시 게시글 로드
document.addEventListener('DOMContentLoaded', loadPost);

