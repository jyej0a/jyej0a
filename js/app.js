// 메인 애플리케이션 로직
class BlogApp {
    constructor() {
        this.posts = [];
        this.filteredPosts = [];
        this.currentFilters = {
            search: '',
            tags: [],
            categories: []
        };
        this.init();
    }

    async init() {
        await this.loadPosts();
        this.renderPosts();
        this.setupFilters();
        this.bindEvents();
    }

    // posts.json에서 게시글 데이터 로드
    async loadPosts() {
        try {
            const response = await fetch('posts.json');
            if (!response.ok) {
                throw new Error('posts.json을 불러올 수 없습니다.');
            }
            this.posts = await response.json();
            this.filteredPosts = [...this.posts];
        } catch (error) {
            console.error('게시글 로드 오류:', error);
            this.showError('게시글을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
        }
    }

    // 게시글 목록 렌더링
    renderPosts() {
        const container = document.getElementById('posts-container');
        const noResults = document.getElementById('no-results');

        if (!container) return;

        if (this.filteredPosts.length === 0) {
            container.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }

        noResults.style.display = 'none';

        container.innerHTML = this.filteredPosts.map(post => `
            <a href="post.html?file=${encodeURIComponent(post.file)}" class="post-card">
                <h2>${this.escapeHtml(post.title)}</h2>
                <div class="post-meta">
                    <time>${this.formatDate(post.date)}</time>
                    ${post.category ? `<span class="category">${this.escapeHtml(post.category)}</span>` : ''}
                </div>
                <p class="post-excerpt">${this.escapeHtml(post.excerpt)}</p>
                ${post.tags && post.tags.length > 0 ? `
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}
            </a>
        `).join('');

        // 코드 하이라이팅 적용
        this.highlightCodeBlocks();
    }

    // 필터 UI 생성
    setupFilters() {
        this.renderTagsFilter();
        this.renderCategoriesFilter();
    }

    // 태그 필터 렌더링
    renderTagsFilter() {
        const tagsList = document.getElementById('tags-list');
        if (!tagsList) return;

        const allTags = [...new Set(this.posts.flatMap(post => post.tags || []))].sort();

        tagsList.innerHTML = allTags.map(tag => `
            <span class="tag filter-tag" data-tag="${this.escapeHtml(tag)}">
                ${this.escapeHtml(tag)}
            </span>
        `).join('');
    }

    // 카테고리 필터 렌더링
    renderCategoriesFilter() {
        const categoriesList = document.getElementById('categories-list');
        if (!categoriesList) return;

        const allCategories = [...new Set(this.posts.map(post => post.category).filter(Boolean))].sort();

        categoriesList.innerHTML = allCategories.map(category => `
            <span class="category filter-category" data-category="${this.escapeHtml(category)}">
                ${this.escapeHtml(category)}
            </span>
        `).join('');
    }

    // 이벤트 바인딩
    bindEvents() {
        // 검색 입력 이벤트
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }

        // 태그 필터 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-tag')) {
                e.preventDefault();
                this.toggleTagFilter(e.target.dataset.tag);
            }
        });

        // 카테고리 필터 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-category')) {
                e.preventDefault();
                this.toggleCategoryFilter(e.target.dataset.category);
            }
        });
    }

    // 태그 필터 토글
    toggleTagFilter(tag) {
        const index = this.currentFilters.tags.indexOf(tag);
        if (index > -1) {
            this.currentFilters.tags.splice(index, 1);
        } else {
            this.currentFilters.tags.push(tag);
        }
        this.updateFilterUI();
        this.applyFilters();
    }

    // 카테고리 필터 토글
    toggleCategoryFilter(category) {
        const index = this.currentFilters.categories.indexOf(category);
        if (index > -1) {
            this.currentFilters.categories.splice(index, 1);
        } else {
            this.currentFilters.categories.push(category);
        }
        this.updateFilterUI();
        this.applyFilters();
    }

    // 필터 UI 업데이트
    updateFilterUI() {
        // 태그 필터 UI 업데이트
        document.querySelectorAll('.filter-tag').forEach(el => {
            const tag = el.dataset.tag;
            if (this.currentFilters.tags.includes(tag)) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });

        // 카테고리 필터 UI 업데이트
        document.querySelectorAll('.filter-category').forEach(el => {
            const category = el.dataset.category;
            if (this.currentFilters.categories.includes(category)) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
    }

    // 필터 적용
    applyFilters() {
        this.filteredPosts = this.posts.filter(post => {
            // 검색 필터
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                const matchesTitle = post.title.toLowerCase().includes(searchTerm);
                const matchesContent = post.excerpt.toLowerCase().includes(searchTerm);
                const matchesTags = post.tags && post.tags.some(tag =>
                    tag.toLowerCase().includes(searchTerm)
                );
                if (!matchesTitle && !matchesContent && !matchesTags) {
                    return false;
                }
            }

            // 태그 필터
            if (this.currentFilters.tags.length > 0) {
                if (!post.tags || !this.currentFilters.tags.some(tag => post.tags.includes(tag))) {
                    return false;
                }
            }

            // 카테고리 필터
            if (this.currentFilters.categories.length > 0) {
                if (!this.currentFilters.categories.includes(post.category)) {
                    return false;
                }
            }

            return true;
        });

        this.renderPosts();
    }

    // 코드 블록 하이라이팅
    highlightCodeBlocks() {
        // Prism.js가 로드된 경우에만 실행
        if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
        }
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
        const container = document.getElementById('posts-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #dc3545;">
                    <p>${this.escapeHtml(message)}</p>
                </div>
            `;
        }
    }
}

// DOM 로드 완료 후 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    new BlogApp();
});

