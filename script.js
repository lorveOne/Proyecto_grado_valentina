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

    // -------- Lightbox: click an image to zoom --------
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');

    const openLightbox = (src, alt) => {
        lightboxImg.src = src;
        lightboxImg.alt = alt || '';
        lightboxCaption.textContent = alt || '';
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    const isExpandable = img =>
        img.id !== 'lightboxImg' &&
        !img.closest('nav, .navbar, footer, .foot, .lightbox');

    document.querySelectorAll('img').forEach(img => {
        if (!isExpandable(img)) return;
        img.classList.add('zoomable');
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => openLightbox(img.src, img.alt));
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) {
        lightbox.addEventListener('click', e => {
            if (e.target === lightbox) closeLightbox();
        });
    }
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) closeLightbox();
    });

    // -------- Material uploader (Vercel Blob) --------
    const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
    const matCard = document.getElementById('matUploadCard');
    const matInput = document.getElementById('matFileInput');
    const matProgress = document.getElementById('matProgress');
    const matProgressFill = document.getElementById('matProgressFill');
    const matProgressText = document.getElementById('matProgressText');
    const matStatus = document.getElementById('matStatus');
    const matUploadedWrap = document.getElementById('matUploadedWrap');
    const matUploaded = document.getElementById('matUploaded');
    const matPrev = document.getElementById('matPrev');
    const matNext = document.getElementById('matNext');

    const setStatus = (message, kind) => {
        if (!matStatus) return;
        if (!message) {
            matStatus.hidden = true;
            matStatus.textContent = '';
            matStatus.className = 'mat-status';
            return;
        }
        matStatus.hidden = false;
        matStatus.textContent = message;
        matStatus.className = `mat-status mat-status-${kind || 'info'}`;
    };

    const formatBytes = (bytes) => {
        if (!bytes) return '';
        const units = ['B', 'KB', 'MB', 'GB'];
        let value = bytes;
        let i = 0;
        while (value >= 1024 && i < units.length - 1) {
            value /= 1024;
            i++;
        }
        return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
    };

    const displayName = (pathname) => {
        const base = pathname.split('/').pop() || pathname;
        return base.replace(/^\d+-/, '');
    };

    const fileKind = (pathname) => {
        const ext = pathname.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
        if (['mp4', 'webm', 'mov', 'ogg'].includes(ext)) return 'video';
        if (ext === 'pdf') return 'pdf';
        return 'other';
    };

    const renderBlob = (blob) => {
        const kind = fileKind(blob.pathname);
        const name = displayName(blob.pathname);
        const size = formatBytes(blob.size);
        const date = blob.uploadedAt ? new Date(blob.uploadedAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

        let thumb;
        if (kind === 'image') {
            thumb = `<img src="${blob.url}" alt="${name}" loading="lazy">`;
        } else if (kind === 'video') {
            thumb = `<video src="${blob.url}" preload="metadata" muted></video><div class="mat-up-play">▶</div>`;
        } else if (kind === 'pdf') {
            thumb = `<iframe class="mat-up-pdf-frame" src="${blob.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH" title="${name}" loading="lazy"></iframe><span class="mat-up-pdf-badge">PDF</span>`;
        } else {
            thumb = `<div class="mat-up-icon">📄</div>`;
        }

        const card = document.createElement('div');
        card.className = `mat-up-card mat-up-${kind}`;
        card.dataset.url = blob.url;
        card.innerHTML = `
            <a class="mat-up-thumb" href="${blob.url}" target="_blank" rel="noopener">${thumb}</a>
            <div class="mat-up-info">
                <h4 title="${name}">${name}</h4>
                <div class="mat-up-meta">
                    <span>${size}</span>
                    ${date ? `<span>· ${date}</span>` : ''}
                </div>
                <div class="mat-up-actions">
                    <a class="mat-up-btn" href="${blob.url}" target="_blank" rel="noopener">Abrir</a>
                    <button type="button" class="mat-up-del" aria-label="Eliminar archivo">Eliminar</button>
                </div>
            </div>
        `;

        const delBtn = card.querySelector('.mat-up-del');
        delBtn.addEventListener('click', async () => {
            if (!confirm(`¿Eliminar "${name}"?`)) return;
            delBtn.disabled = true;
            delBtn.textContent = 'Eliminando…';
            try {
                const res = await fetch(`/api/delete?url=${encodeURIComponent(blob.url)}`, { method: 'POST' });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error || 'No se pudo eliminar');
                }
                card.remove();
                if (!matUploaded.children.length) {
                    matUploadedWrap.hidden = true;
                }
                updateNavState();
                setStatus('Archivo eliminado.', 'success');
                setTimeout(() => setStatus(''), 3500);
            } catch (error) {
                delBtn.disabled = false;
                delBtn.textContent = 'Eliminar';
                setStatus(`Error al eliminar: ${error.message}`, 'error');
            }
        });

        return card;
    };

    const updateNavState = () => {
        if (!matPrev || !matNext || !matUploaded) return;
        const { scrollLeft, scrollWidth, clientWidth } = matUploaded;
        const atStart = scrollLeft <= 4;
        const atEnd = scrollLeft + clientWidth >= scrollWidth - 4;
        matPrev.disabled = atStart;
        matNext.disabled = atEnd;
        const hasOverflow = scrollWidth > clientWidth + 4;
        matPrev.classList.toggle('hidden', !hasOverflow);
        matNext.classList.toggle('hidden', !hasOverflow);
    };

    const scrollCarousel = (direction) => {
        if (!matUploaded) return;
        const firstCard = matUploaded.querySelector('.mat-up-card');
        const step = firstCard ? firstCard.getBoundingClientRect().width + 20 : 300;
        matUploaded.scrollBy({ left: step * direction, behavior: 'smooth' });
    };

    if (matPrev) matPrev.addEventListener('click', () => scrollCarousel(-1));
    if (matNext) matNext.addEventListener('click', () => scrollCarousel(1));
    if (matUploaded) {
        matUploaded.addEventListener('scroll', updateNavState, { passive: true });
        window.addEventListener('resize', updateNavState);
    }

    const refreshUploaded = async () => {
        if (!matUploaded) return;
        try {
            const res = await fetch('/api/list');
            if (!res.ok) {
                if (res.status === 404) return;
                throw new Error('No se pudo cargar la lista');
            }
            const data = await res.json();
            const blobs = data.blobs || [];
            matUploaded.innerHTML = '';
            blobs.forEach(b => matUploaded.appendChild(renderBlob(b)));
            matUploadedWrap.hidden = blobs.length === 0;
            requestAnimationFrame(updateNavState);
        } catch (error) {
            setStatus(`No se pudieron cargar archivos previos: ${error.message}`, 'error');
        }
    };

    const uploadFile = (file) => {
        if (file.size > MAX_UPLOAD_BYTES) {
            setStatus(`"${file.name}" supera el límite de 25 MB.`, 'error');
            return;
        }

        matCard.classList.add('is-uploading');
        matProgress.hidden = false;
        matProgressFill.style.width = '0%';
        matProgressText.textContent = `Subiendo ${file.name}…`;
        setStatus('');

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/upload', true);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
        xhr.setRequestHeader('X-Filename', encodeURIComponent(file.name));

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const pct = (e.loaded / e.total) * 100;
                matProgressFill.style.width = `${pct}%`;
                matProgressText.textContent = `Subiendo ${file.name}… ${Math.round(pct)}%`;
            }
        });

        xhr.addEventListener('load', () => {
            matCard.classList.remove('is-uploading');
            matProgress.hidden = true;
            matInput.value = '';
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const blob = JSON.parse(xhr.responseText);
                    matUploadedWrap.hidden = false;
                    matUploaded.prepend(renderBlob(blob));
                    requestAnimationFrame(updateNavState);
                    setStatus(`"${file.name}" subido correctamente.`, 'success');
                    setTimeout(() => setStatus(''), 4000);
                } catch (error) {
                    setStatus('Respuesta inválida del servidor.', 'error');
                }
            } else {
                let msg = 'Error en la subida.';
                try {
                    msg = JSON.parse(xhr.responseText).error || msg;
                } catch (_) { /* ignore */ }
                setStatus(msg, 'error');
            }
        });

        xhr.addEventListener('error', () => {
            matCard.classList.remove('is-uploading');
            matProgress.hidden = true;
            setStatus('Error de red durante la subida.', 'error');
        });

        xhr.send(file);
    };

    if (matCard && matInput) {
        matInput.addEventListener('change', () => {
            const file = matInput.files && matInput.files[0];
            if (file) uploadFile(file);
        });

        ['dragenter', 'dragover'].forEach(ev =>
            matCard.addEventListener(ev, (e) => {
                e.preventDefault();
                matCard.classList.add('is-drag');
            })
        );
        ['dragleave', 'drop'].forEach(ev =>
            matCard.addEventListener(ev, (e) => {
                e.preventDefault();
                matCard.classList.remove('is-drag');
            })
        );
        matCard.addEventListener('drop', (e) => {
            const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
            if (file) uploadFile(file);
        });

        refreshUploaded();
    }

    // -------- Slot uploads (cards estáticas: ideas + protocolo) --------
    const slotKindFromContentType = (type) => {
        if (!type) return 'other';
        if (type.startsWith('image/')) return 'image';
        if (type.startsWith('video/')) return 'video';
        if (type === 'application/pdf') return 'pdf';
        return 'other';
    };

    const renderSlotPreview = (slot, blob) => {
        const card = document.querySelector(`.mat-slot-card[data-slot="${slot}"]`);
        if (!card) return;
        const thumb = card.querySelector('[data-slot-thumb]');
        const action = card.querySelector('[data-slot-action]');
        const fileInfo = card.querySelector('[data-slot-file]');
        if (!thumb || !action || !fileInfo) return;

        const name = blob.originalName || displayName(blob.pathname);
        const size = blob.size ? formatBytes(blob.size) : '';
        const kind = slotKindFromContentType(blob.contentType) || fileKind(blob.pathname);

        action.href = blob.url;
        action.querySelector('span').textContent = kind === 'pdf' ? 'Abrir PDF' : 'Abrir archivo';

        fileInfo.hidden = false;
        fileInfo.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span class="mat-slot-name" title="${name}">${name}</span>
            ${size ? `<span class="mat-slot-size">${size}</span>` : ''}
        `;

        thumb.classList.add('mat-thumb-has-file');
        thumb.dataset.kind = kind;

        let preview;
        if (kind === 'image') {
            preview = `<img class="mat-slot-preview-media" src="${blob.url}" alt="${name}" loading="lazy">`;
        } else if (kind === 'video') {
            preview = `<video class="mat-slot-preview-media" src="${blob.url}" preload="metadata" muted controls></video>`;
        } else if (kind === 'pdf') {
            preview = `<iframe class="mat-slot-preview-media mat-slot-preview-pdf" src="${blob.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH" title="${name}"></iframe>`;
        } else {
            preview = `<div class="mat-slot-preview-doc"><div class="mat-up-icon">📄</div><span>${name}</span></div>`;
        }
        thumb.innerHTML = preview;
    };

    const uploadToSlot = async (slot, file) => {
        const card = document.querySelector(`.mat-slot-card[data-slot="${slot}"]`);
        if (!card) return;

        if (file.size > MAX_UPLOAD_BYTES) {
            setStatus(`"${file.name}" supera el límite de 25 MB.`, 'error');
            return;
        }

        card.classList.add('is-uploading');
        setStatus(`Subiendo "${file.name}"…`, 'info');

        try {
            const res = await fetch(`/api/upload?slot=${encodeURIComponent(slot)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': file.type || 'application/octet-stream',
                    'X-Filename': encodeURIComponent(file.name),
                },
                body: file,
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'No se pudo subir el archivo');
            }
            const blob = await res.json();
            renderSlotPreview(slot, blob);
            setStatus(`Archivo de "${slot}" actualizado correctamente.`, 'success');
            setTimeout(() => setStatus(''), 4000);
        } catch (error) {
            setStatus(`Error: ${error.message}`, 'error');
        } finally {
            card.classList.remove('is-uploading');
        }
    };

    document.querySelectorAll('.mat-slot-replace').forEach((btn) => {
        const slot = btn.dataset.slotTrigger;
        const input = document.querySelector(`[data-slot-input="${slot}"]`);
        btn.addEventListener('click', () => input && input.click());
    });

    document.querySelectorAll('.mat-slot-input').forEach((input) => {
        const slot = input.dataset.slotInput;
        input.addEventListener('change', () => {
            const file = input.files && input.files[0];
            if (file) uploadToSlot(slot, file);
            input.value = '';
        });
    });

    const loadSlots = async () => {
        try {
            const res = await fetch('/api/slots');
            if (!res.ok) return;
            const data = await res.json();
            const slots = data.slots || {};
            Object.keys(slots).forEach((slot) => {
                if (slots[slot]) renderSlotPreview(slot, slots[slot]);
            });
        } catch (_) { /* offline o API ausente: las cards se quedan con su contenido por defecto */ }
    };

    loadSlots();

});
