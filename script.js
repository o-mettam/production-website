// Page loader
window.addEventListener('load', () => {
    const loader = document.getElementById('page-loader');
    if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 500);
    }
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

function closeMobileMenu() {
    mobileMenu.classList.add('hidden');
    mobileMenuBtn.setAttribute('aria-expanded', false);
    mobileMenuBtn.setAttribute('aria-label', 'Open navigation menu');
    mobileMenuBtn.focus();
}

function openMobileMenu() {
    mobileMenu.classList.remove('hidden');
    mobileMenuBtn.setAttribute('aria-expanded', true);
    mobileMenuBtn.setAttribute('aria-label', 'Close navigation menu');
    const firstLink = mobileMenu.querySelector('a');
    if (firstLink) firstLink.focus();
}

mobileMenuBtn.addEventListener('click', () => {
    const isHidden = mobileMenu.classList.contains('hidden');
    isHidden ? openMobileMenu() : closeMobileMenu();
});

// Close mobile menu on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
        closeMobileMenu();
    }
});

// Trap focus within mobile menu when open
mobileMenu.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = mobileMenu.querySelectorAll('a, button');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            closeMobileMenu();
        }
    });
});

// Dark mode
function initDarkMode() {
    const toggleDesktop = document.getElementById('dark-mode-toggle');
    const toggleMobile = document.getElementById('dark-mode-toggle-mobile');
    const html = document.documentElement;

    if (localStorage.getItem('darkMode') === 'true' ||
        (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.classList.add('dark');
        updateDarkModeIcons(true);
    }

    [toggleDesktop, toggleMobile].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                html.classList.toggle('dark');
                const isDark = html.classList.contains('dark');
                localStorage.setItem('darkMode', isDark);
                updateDarkModeIcons(isDark);
            });
        }
    });
}

function updateDarkModeIcons(isDark) {
    document.querySelectorAll('.icon-moon').forEach(el => el.classList.toggle('hidden', isDark));
    document.querySelectorAll('.icon-sun').forEach(el => el.classList.toggle('hidden', !isDark));
}

initDarkMode();

// Scroll-triggered reveal animations
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => revealObserver.observe(el));

// Combined scroll handler: active nav highlight + back-to-top button
const backToTop = document.getElementById('back-to-top');

const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    // Active nav highlight (only on pages with section anchors)
    if (sections.length) {
        const navLinks = document.querySelectorAll('.nav-link');
        let current = '';

        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('nav-active', 'text-indigo-600');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('nav-active', 'text-indigo-600');
            }
        });
    }

    // Back to top visibility
    backToTop.classList.toggle('visible', window.scrollY > 500);
});

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
