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
// Event Listener for Exit Menu Link
document.getElementById('exitLink').addEventListener('click', function(event) {
    event.preventDefault();
    // 1. Find the dropdown components
    const dropdownMenu = this.closest('.dropdown-menu');
    const dropdownParent = dropdownMenu ? dropdownMenu.parentElement : null;
    const dropdownToggle = dropdownParent ? dropdownParent.querySelector('[data-bs-toggle="dropdown"]') : null;
    // 2. Forcefully remove the 'show' class from both the menu and the toggle
    if (dropdownMenu) {
        dropdownMenu.classList.remove('show');
    }
    if (dropdownToggle) {
        dropdownToggle.classList.remove('show');
        dropdownToggle.setAttribute('aria-expanded', 'false');
    }
    // 3. Optional: Small timeout to allow UI to repaint if closeApp() is heavy
    // Remove this setTimeout if closeApp() handles navigation/termination instantly
    setTimeout(() => {
        closeApp();
    }, 10); 
});

// Get URL parameters
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

// Simulate dynamic pages
if (params.lesson || params.page) {
    let less = params.lesson;
    let page = params.page;
    let lh = document.getElementById('lessonheader');
    let lp = document.getElementById('lessonpage');
    if (lh) {
        lh.textContent = `Lesson ${less} Introduction`;
    }
    if (lp) {
        lp.textContent = `Lesson ${less}: Page ${page}`;
        const state = {
            "lesson": less,
            "page": page
        }
        localStorage.setItem('demo', JSON.stringify(state));
    }
}

// used for next/back button on lesson pages
function doNavigation(action) {
    if (!action) { return false; }
    let state = getState();
    if (state) {
        if (action === 'back') {
            let less = state.lesson;
            let page = state.page;
            let newpage = page - 1;
            location.href = (`lesson_page.html?lesson=${less}&page=${newpage}`);
        }
        if (action === 'next') {
            let less = state.lesson;
            let page = Number(state.page);
            let newpage = page ++;
            location.href = (`lesson_page.html?lesson=${less}&page=${newpage}`);
        }        
    }
}

function getState() {
    let d = localStorage.getItem('demo');
    if (d) {
        let state = JSON.parse(d);
        if (state) {
            let less = state.lesson;
            let page = state.page;
            console.log(`Lesson is: ${less} and Page is: ${page}`);
            return state;
        }
    } else {
        return false;
    }
}
