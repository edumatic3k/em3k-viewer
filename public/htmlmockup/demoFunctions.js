// Configuration
const MAX_PAGES = 5;
const INTRO_PAGE = 'lesson_intro.html';
const LESSON_PAGE = 'lesson_page.html';

// example of using key command (Shift+M) to toggle offcanvas menu
document.addEventListener('DOMContentLoaded', function () {
    const offcanvasEl = document.getElementById('courseMenu');
    const bsOffcanvas = new bootstrap.Offcanvas(offcanvasEl);
    const wasOpen = localStorage.getItem('courseMenuOpen') === 'true';
    if (wasOpen) {
        bsOffcanvas.show();
    }
    document.addEventListener('keydown', function (event) {
        if (event.shiftKey && event.key.toLowerCase() === 'm') {
            event.preventDefault();
            bsOffcanvas.toggle();
            offcanvasEl.addEventListener('shown.bs.offcanvas', function () {
            localStorage.setItem('courseMenuOpen', 'true');
            }, { once: true });
            offcanvasEl.addEventListener('hidden.bs.offcanvas', function () {
            localStorage.setItem('courseMenuOpen', 'false');
            }, { once: true });
        }
    });
});

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const lesson = params.get('lesson');
    const page = parseInt(params.get('page'), 10);

    // Only run logic if we are on a lesson page with valid parameters
    if (lesson && !isNaN(page)) {
        updateContent(lesson, page);
        updateNavigationUI(page);
    }
});

/**
 * Updates the text content for lesson header and page number
 */
function updateContent(lesson, page) {
    const lh = document.getElementById('lessonheader');
    const lp = document.getElementById('lessonpage');
    if (lh) lh.textContent = `Lesson ${lesson}: Page ${page}`;
    if (lp) lp.textContent = `Lesson ${lesson}: Page ${page}`;
    
    // Optional: Save to local storage if other scripts depend on it
    // localStorage.setItem('demo', JSON.stringify({ lesson, page }));
}

/**
 * Toggles visibility of Next vs Take Quiz button
 */
function updateNavigationUI(page) {
    const btnNext = document.getElementById('btnNext');
    const btnQuiz = document.getElementById('btnQuiz');

    if (!btnNext || !btnQuiz) return;

    if (page >= MAX_PAGES) {
        btnNext.classList.add('d-none');
        btnQuiz.classList.remove('d-none');
    } else {
        btnNext.classList.remove('d-none');
        btnQuiz.classList.add('d-none');
    }
}

/**
 * Handles Back and Next button clicks
 */
function doNavigation(action) {
    const params = new URLSearchParams(window.location.search);
    const lesson = params.get('lesson');
    const page = parseInt(params.get('page'), 10);

    if (!lesson || isNaN(page)) return;

    let nextPage = page;

    if (action === 'back') {
        nextPage = page - 1;
        if (nextPage < 1) {
            // Redirect to intro if going back from page 1
            window.location.href = INTRO_PAGE;
            return;
        }
    } else if (action === 'next') {
        nextPage = page + 1;
        if (nextPage > MAX_PAGES) {
            // Should not happen if UI is correct, but safety check
            return; 
        }
    }

    // Navigate to the new URL
    window.location.href = `${LESSON_PAGE}?lesson=${lesson}&page=${nextPage}`;
}