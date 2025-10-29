// main-comments.js - 메인 화면용 Giscus 댓글 시스템

// 메인 화면 전용 Giscus 댓글 로드
function loadMainGiscus() {
    // 기존 Giscus 컨테이너가 있으면 제거
    const existingGiscus = document.getElementById('main-giscus');
    if (existingGiscus) {
        existingGiscus.remove();
    }

    // Giscus 컨테이너 생성
    const giscusContainer = document.createElement('div');
    giscusContainer.className = 'giscus-container';
    giscusContainer.id = 'main-giscus';

    // 메인 Giscus 컨테이너에 추가
    const mainContainer = document.getElementById('main-giscus-container');
    if (!mainContainer) {
        console.error('main-giscus-container를 찾을 수 없습니다.');
        return;
    }
    mainContainer.appendChild(giscusContainer);

    // Giscus 스크립트 생성 및 설정 (메인 화면 전용)
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'jyej0a/jyej0a');
    script.setAttribute('data-repo-id', 'R_kgDOQLHmDQ');
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'DIC_kwDOQLHmDc4CxMdu');

    // 메인 화면은 특정 페이지 매핑이 아닌 전체 댓글로 설정
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-term', '메인 페이지 - 블로그 소통공간');

    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '1');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'preferred_color_scheme');
    script.setAttribute('data-lang', 'ko');
    script.crossOrigin = 'anonymous';
    script.async = true;

    // Giscus 컨테이너에 스크립트 추가
    giscusContainer.appendChild(script);
}

// 페이지 로드 시 메인 댓글 로드
document.addEventListener('DOMContentLoaded', () => {
    // 약간의 지연을 두어 페이지 렌더링 후 로드
    setTimeout(loadMainGiscus, 500);
});

// 페이지가 다시 로드될 때를 대비한 이벤트 리스너
window.addEventListener('load', () => {
    // 이미 로드되었으면 다시 로드하지 않음
    if (!document.getElementById('main-giscus')) {
        loadMainGiscus();
    }
});

