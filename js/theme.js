// 테마 관리자 (다크/라이트 모드 토글)
class ThemeManager {
    constructor() {
        this.currentTheme = this.getSavedTheme() || this.getSystemTheme();
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.bindEvents();
        this.updateThemeIcon();
    }

    // 저장된 테마 가져오기
    getSavedTheme() {
        try {
            return localStorage.getItem('blog-theme');
        } catch {
            return null;
        }
    }

    // 시스템 테마 감지
    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    // 테마 적용
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        this.saveTheme(theme);
        this.updateGiscusTheme(theme);
    }

    // 테마 저장
    saveTheme(theme) {
        try {
            localStorage.setItem('blog-theme', theme);
        } catch (error) {
            console.warn('테마 저장 실패:', error);
        }
    }

    // 테마 토글
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        this.updateThemeIcon();
    }

    // 테마 아이콘 업데이트
    updateThemeIcon() {
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.currentTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    // Giscus 테마 업데이트
    updateGiscusTheme(theme) {
        const giscusFrame = document.querySelector('iframe.giscus-frame');
        if (giscusFrame) {
            const giscusTheme = theme === 'dark' ? 'dark' : 'light';
            giscusFrame.contentWindow.postMessage(
                { giscus: { setConfig: { theme: giscusTheme } } },
                'https://giscus.app'
            );
        }
    }

    // 이벤트 바인딩
    bindEvents() {
        // 테마 토글 버튼
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // 시스템 테마 변경 감지
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // 사용자가 수동으로 테마를 설정하지 않은 경우에만 시스템 테마 적용
                if (!this.getSavedTheme()) {
                    const systemTheme = e.matches ? 'dark' : 'light';
                    this.applyTheme(systemTheme);
                    this.updateThemeIcon();
                }
            });
        }

        // 키보드 단축키 (Alt + T)
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 't') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    // 현재 테마 반환
    getCurrentTheme() {
        return this.currentTheme;
    }

    // 테마가 다크인지 확인
    isDark() {
        return this.currentTheme === 'dark';
    }
}

// 전역 테마 매니저 인스턴스
let themeManager;

// DOM 로드 완료 후 테마 매니저 초기화
document.addEventListener('DOMContentLoaded', () => {
    themeManager = new ThemeManager();

    // 전역 접근을 위한 window 객체에 할당
    window.themeManager = themeManager;
});

// 전역 함수로 테마 토글 노출 (HTML에서 직접 호출 가능)
function toggleTheme() {
    if (themeManager) {
        themeManager.toggleTheme();
    }
}

