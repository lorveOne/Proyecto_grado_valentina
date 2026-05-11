// =========================================================
// PROTOCOLO ENTREGA Y RECIBO DE TURNO
// Interactividad didáctica · HUHMP × UAN
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

    // -------- Navbar scroll & back-to-top --------
    const navbar = document.getElementById('navbar');
    const backTop = document.getElementById('backTop');

    const onScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 30);
        backTop.classList.toggle('visible', window.scrollY > 500);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    backTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // -------- Mobile menu --------
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    navToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
    navMenu.querySelectorAll('a').forEach(a =>
        a.addEventListener('click', () => navMenu.classList.remove('active'))
    );

    // -------- IDEAS interactive tabs --------
    const ideasTabs = document.querySelectorAll('.ideas-tab');
    const ideasPanels = document.querySelectorAll('.ideas-panel');
    let userInteractedIdeas = false;

    const activateIdeas = (letter) => {
        ideasTabs.forEach(t => t.classList.toggle('active', t.dataset.letter === letter));
        ideasPanels.forEach(p => p.classList.toggle('active', p.dataset.panel === letter));
    };

    ideasTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            userInteractedIdeas = true;
            activateIdeas(tab.dataset.letter);
        });
    });

    // Auto-rotate IDEAS until user interacts
    const letters = ['i', 'd', 'e', 'a', 's'];
    let ideasIndex = 0;
    const ideasInterval = setInterval(() => {
        if (userInteractedIdeas) { clearInterval(ideasInterval); return; }
        ideasIndex = (ideasIndex + 1) % letters.length;
        activateIdeas(letters[ideasIndex]);
    }, 6500);

    // -------- Phase tabs (checklist) --------
    const phaseTabs = document.querySelectorAll('.phase-tab');
    const phaseContents = document.querySelectorAll('.phase-content');
    phaseTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const phase = tab.dataset.phase;
            phaseTabs.forEach(t => t.classList.toggle('active', t === tab));
            phaseContents.forEach(c => c.classList.toggle('active', c.dataset.phase === phase));
        });
    });

    // -------- Reveal on scroll --------
    const revealEls = document.querySelectorAll(
        '.goal-card, .info-card, .step, .prereq-item, .prio, .sch-card, .people-card, ' +
        '.def-card, .uni-item, .uni-extra, .uni-type, .check-item, .mat-card, ' +
        '.act-card, .tip-card, .road-step'
    );
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    const visibilityStyle = document.createElement('style');
    visibilityStyle.textContent = '.reveal-visible { opacity: 1 !important; transform: translateY(0) !important; }';
    document.head.appendChild(visibilityStyle);

    // -------- Smooth scroll with offset for fixed nav --------
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const href = link.getAttribute('href');
            if (href === '#' || href.length < 2) return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const offset = 80;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

});
