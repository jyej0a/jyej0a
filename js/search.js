// 검색 기능 확장 모듈
class SearchManager {
    constructor(app) {
        this.app = app;
        this.searchTimeout = null;
        this.init();
    }

    init() {
        this.bindSearchEvents();
        this.setupKeyboardShortcuts();
    }

    // 검색 이벤트 바인딩
    bindSearchEvents() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        // 실시간 검색 (디바운스 적용)
        searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.app.currentFilters.search = e.target.value.toLowerCase();
                this.app.applyFilters();
                this.updateSearchUI(e.target.value);
            }, 300);
        });

        // 검색어 강조 표시
        searchInput.addEventListener('input', (e) => {
            this.highlightSearchTerms(e.target.value);
        });

        // 검색창 포커스/블러 이벤트
        searchInput.addEventListener('focus', () => {
            this.showSearchSuggestions();
        });

        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                this.hideSearchSuggestions();
            }, 150);
        });
    }

    // 키보드 단축키 설정
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K: 검색창 포커스
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }

            // ESC: 검색어 초기화
            if (e.key === 'Escape') {
                const searchInput = document.getElementById('search-input');
                if (searchInput && document.activeElement === searchInput) {
                    searchInput.value = '';
                    searchInput.blur();
                    this.app.currentFilters.search = '';
                    this.app.applyFilters();
                }
            }
        });
    }

    // 검색어 강조 표시
    highlightSearchTerms(searchTerm) {
        if (!searchTerm || searchTerm.length < 2) {
            this.clearHighlights();
            return;
        }

        const postCards = document.querySelectorAll('.post-card');
        postCards.forEach(card => {
            this.highlightInElement(card, searchTerm);
        });
    }

    // 요소 내 검색어 강조
    highlightInElement(element, searchTerm) {
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const nodes = [];
        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
                nodes.push(node);
            }
        }

        nodes.forEach(textNode => {
            const parent = textNode.parentNode;
            if (parent.classList.contains('search-highlight')) return;

            const text = textNode.textContent;
            const regex = new RegExp(`(${this.escapeRegex(searchTerm)})`, 'gi');
            const highlightedHTML = text.replace(regex, '<mark class="search-highlight">$1</mark>');

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = highlightedHTML;

            while (tempDiv.firstChild) {
                parent.insertBefore(tempDiv.firstChild, textNode);
            }
            parent.removeChild(textNode);
        });
    }

    // 강조 표시 제거
    clearHighlights() {
        const highlights = document.querySelectorAll('.search-highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        });
    }

    // 검색 제안 표시
    showSearchSuggestions() {
        // 검색 기록이나 인기 검색어 표시 가능
        // 현재는 간단하게 유지
    }

    // 검색 제안 숨기기
    hideSearchSuggestions() {
        // 검색 제안 숨기기 로직
    }

    // 검색 UI 업데이트
    updateSearchUI(searchTerm) {
        const searchInput = document.getElementById('search-input');

        // 검색 결과 수 표시
        this.updateResultCount();

        // 검색어 저장 (로컬 스토리지)
        if (searchTerm && searchTerm.length > 2) {
            this.saveSearchTerm(searchTerm);
        }
    }

    // 검색 결과 수 업데이트
    updateResultCount() {
        const resultCount = this.app.filteredPosts.length;
        const totalCount = this.app.posts.length;

        // 결과 수 표시 요소가 있다면 업데이트
        const resultCountElement = document.getElementById('result-count');
        if (resultCountElement) {
            resultCountElement.textContent = `${resultCount} / ${totalCount} 게시글`;
        }
    }

    // 검색어 저장
    saveSearchTerm(term) {
        try {
            const searches = JSON.parse(localStorage.getItem('blogSearches') || '[]');
            const filtered = searches.filter(s => s !== term);
            filtered.unshift(term);

            // 최근 10개만 저장
            localStorage.setItem('blogSearches', JSON.stringify(filtered.slice(0, 10)));
        } catch (error) {
            console.warn('검색어 저장 실패:', error);
        }
    }

    // 정규식 이스케이프
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // 검색어 제안 가져오기
    getSearchSuggestions() {
        try {
            return JSON.parse(localStorage.getItem('blogSearches') || '[]');
        } catch {
            return [];
        }
    }
}

// 앱 초기화 시 검색 매니저 연결
document.addEventListener('DOMContentLoaded', () => {
    // app.js에서 BlogApp 인스턴스가 생성된 후 실행
    setTimeout(() => {
        if (window.blogApp) {
            new SearchManager(window.blogApp);
        }
    }, 100);
});

