// 게시글 로더 및 파서
class PostLoader {
    constructor() {
        this.init();
    }

    init() {
        const urlParams = new URLSearchParams(window.location.search);
        const fileName = urlParams.get('file');

        if (fileName) {
            this.loadPost(fileName);
        } else {
            this.showError('게시글 파일을 찾을 수 없습니다.');
        }
    }

    // 마크다운 파일 로드
    async loadPost(fileName) {
        try {
            const response = await fetch(`pages/${fileName}`);
            if (!response.ok) {
                throw new Error('게시글을 불러올 수 없습니다.');
            }

            const markdown = await response.text();
            this.parseAndRenderPost(markdown, fileName);
            this.loadGiscus();
        } catch (error) {
            console.error('게시글 로드 오류:', error);
            this.showError('게시글을 불러올 수 없습니다.');
        }
    }

    // 마크다운 파싱 및 렌더링
    parseAndRenderPost(markdown, fileName) {
        // Front Matter 파싱
        const frontMatterMatch = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        let metadata = {};
        let content = markdown;

        if (frontMatterMatch) {
            const frontMatter = frontMatterMatch[1];
            content = frontMatterMatch[2];

            // Front Matter 라인 파싱
            const lines = frontMatter.split('\n');
            lines.forEach((line) => {
                const colonIndex = line.indexOf(':');
                if (colonIndex > 0) {
                    const key = line.substring(0, colonIndex).trim();
                    let value = line.substring(colonIndex + 1).trim();

                    // 따옴표 제거
                    if (
                        (value.startsWith('"') && value.endsWith('"')) ||
                        (value.startsWith("'") && value.endsWith("'"))
                    ) {
                        value = value.slice(1, -1);
                    }

                    // 배열 파싱 (tags)
                    if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
                        try {
                            value = JSON.parse(value);
                        } catch {
                            value = value
                                .slice(1, -1)
                                .split(',')
                                .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ''));
                        }
                    }

                    metadata[key] = value;
                }
            });
        }

        // HTML 변환
        const htmlContent = this.markdownToHtml(content);

        // 페이지 업데이트
        this.updatePage(metadata, htmlContent, fileName);

        // 코드 하이라이팅 적용
        this.highlightCodeBlocks();
    }

    // 마크다운을 HTML로 변환
    markdownToHtml(markdown) {
        // Marked.js 옵션 설정
        marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: true,
            mangle: false
        });

        return marked.parse(markdown);
    }

    // 페이지 콘텐츠 업데이트
    updatePage(metadata, htmlContent, fileName) {
        // 제목 업데이트
        const title = metadata.title || fileName.replace('.md', '');
        document.title = `${title} - 내 블로그`;
        document.getElementById('post-title').content = title;

        // 메타 설명 업데이트
        if (metadata.description) {
            document.getElementById('post-description').content = metadata.description;
        }

        // 게시글 제목
        const titleDisplay = document.getElementById('post-title-display');
        if (titleDisplay) {
            titleDisplay.textContent = title;
        }

        // 날짜
        const dateElement = document.getElementById('post-date');
        if (dateElement && metadata.date) {
            dateElement.textContent = this.formatDate(metadata.date);
        }

        // 태그들
        const tagsElement = document.getElementById('post-tags');
        if (tagsElement && metadata.tags && metadata.tags.length > 0) {
            tagsElement.innerHTML = metadata.tags.map(tag => `
                <span class="tag">${this.escapeHtml(tag)}</span>
            `).join('');
        }

        // 내용
        const contentElement = document.getElementById('post-content');
        if (contentElement) {
            contentElement.innerHTML = htmlContent;
        }
    }

    // Giscus 댓글 시스템 로드
    loadGiscus() {
        const script = document.createElement('script');
        script.src = 'https://giscus.app/client.js';
        script.setAttribute('data-repo', 'your-github-username/your-github-username.github.io');
        script.setAttribute('data-repo-id', 'YOUR_REPO_ID');
        script.setAttribute('data-category', 'General');
        script.setAttribute('data-category-id', 'YOUR_CATEGORY_ID');
        script.setAttribute('data-mapping', 'pathname');
        script.setAttribute('data-strict', '0');
        script.setAttribute('data-reactions-enabled', '1');
        script.setAttribute('data-emit-metadata', '1');
        script.setAttribute('data-input-position', 'bottom');
        script.setAttribute('data-theme', this.getGiscusTheme());
        script.setAttribute('data-lang', 'ko');
        script.setAttribute('crossorigin', 'anonymous');
        script.async = true;

        const container = document.getElementById('giscus-container');
        if (container) {
            container.appendChild(script);
        }
    }

    // 현재 테마에 맞는 Giscus 테마 반환
    getGiscusTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        return currentTheme === 'dark' ? 'dark' : 'light';
    }

    // 코드 블록 하이라이팅
    highlightCodeBlocks() {
        // DOM 업데이트 후 잠시 대기
        setTimeout(() => {
            if (typeof Prism !== 'undefined') {
                Prism.highlightAll();
            }
        }, 100);
    }

    // 날짜 포맷팅
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    }

    // HTML 이스케이프
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 오류 표시
    showError(message) {
        const contentElement = document.getElementById('post-content');
        if (contentElement) {
            contentElement.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #dc3545;">
                    <h2>오류</h2>
                    <p>${this.escapeHtml(message)}</p>
                </div>
            `;
        }
    }
}

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    new PostLoader();
});

