(function() {
    const stateKey = '__elementSwapperState';
    if (window[stateKey]) {
        window[stateKey].deactivate();
        return;
    }

    const EDITABLE_TEXT_SELECTOR = 'p, h1, h2, h3, h4, h5, h6, span, time, a, li, strong, em, b, i';
    const EDITABLE_MEDIA_SELECTOR = 'img, svg, mp4, video, canvas';

    const initialState = {
        isToolActive: false,
        isEditingEnabled: true,
        activeEditor: null,
        topBar: null,
        highlighter: null,
        pageOverlay: null,
    };

    window[stateKey] = initialState;
    let state = window[stateKey];
    state.deactivate = deactivate;

    // --- FUNCTION SHELLS (to be replaced) ---
    function createHighlighter() {
        const container = document.createElement('div');
        const overlay = document.createElement('div');
        overlay.className = 'xtools-highlighter-overlay';
        const borders = { top: document.createElement('div'), bottom: document.createElement('div'), left: document.createElement('div'), right: document.createElement('div') };
        Object.values(borders).forEach(border => border.className = 'xtools-highlighter-border');
        container.appendChild(overlay); Object.values(borders).forEach(b => container.appendChild(b));
        document.body.appendChild(container);
        return { overlay, borders, container };
    }

    function activate() {
        if (state.isToolActive) return;
        state.isToolActive = true;
        state.highlighter = createHighlighter();
        state.pageOverlay = document.createElement('div');
        state.pageOverlay.className = 'xtools-page-overlay';
        document.body.appendChild(state.pageOverlay);
        createTopBar();
        document.addEventListener('click', handlePageClick, true);
        document.addEventListener('mousemove', handleMouseMove, true);
        document.addEventListener('keydown', handleEscapeKey, true);
    }

    function deactivate() {
        if (!state.isToolActive) return;
        cleanup();
        if (state.topBar) state.topBar.remove();
        if (state.highlighter) state.highlighter.container.remove();
        if (state.pageOverlay) state.pageOverlay.remove();
        document.removeEventListener('click', handlePageClick, true);
        document.removeEventListener('mousemove', handleMouseMove, true);
        document.removeEventListener('keydown', handleEscapeKey, true);
        window[stateKey] = null;
    }

    function cleanup() {
        if (!state.activeEditor) return;
        const editor = state.activeEditor;

        if (editor.type === 'text') {
            if (editor.element) editor.element.style.visibility = 'visible';
            if (editor.textarea) editor.textarea.remove();
        } else if (editor.type === 'media') {
            if (editor.dropZone) editor.dropZone.remove();
            if (editor.fileInput) editor.fileInput.remove();
        }

        state.activeEditor = null;
    }

    function createTopBar() {
        if (state.topBar) state.topBar.remove();
        const bar = document.createElement('div');
        bar.className = 'xtools-top-bar';
        bar.innerHTML = `
            <span class="xtools-bar-title">Element Swapper</span>
            <div class="xtools-bar-switch">
                <label class="switch" title="Toggle Editing Mode">
                    <input type="checkbox" id="xtools-edit-toggle" checked>
                    <span class="slider round"></span>
                </label>
            </div>
            <button class="xtools-bar-close-btn" title="Close Element Swapper (Esc)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        `;
        bar.addEventListener('click', (e) => e.stopPropagation());
        bar.querySelector('#xtools-edit-toggle').addEventListener('change', (e) => {
            state.isEditingEnabled = e.target.checked;
            if (!state.isEditingEnabled) {
                cleanup();
                hideHighlighter();
            }
        });
        bar.querySelector('.xtools-bar-close-btn').addEventListener('click', deactivate);
        document.body.appendChild(bar);
        state.topBar = bar;
    }

    function isValidTextTarget(node) {
        if (!node || node.nodeType !== Node.ELEMENT_NODE || !node.matches(EDITABLE_TEXT_SELECTOR)) return false;
        const hasText = node.textContent.trim().length > 0;
        const hasMediaChildren = node.querySelector('img, svg, video');
        return hasText && !hasMediaChildren;
    }

    function handlePageClick(event) {
        if (!state.isEditingEnabled) return;

        if (state.activeEditor) {
            if (state.activeEditor.textarea && event.target === state.activeEditor.textarea) return;
            if (state.activeEditor.dropZone && state.activeEditor.dropZone.contains(event.target)) return;
        }

        state.pageOverlay.style.pointerEvents = 'none';
        const target = document.elementFromPoint(event.clientX, event.clientY);
        state.pageOverlay.style.pointerEvents = 'auto';

        if (!target) {
            if (state.activeEditor && state.activeEditor.type === 'text') cleanup();
            return;
        }

        if (state.topBar && state.topBar.contains(target)) {
             if (state.activeEditor && state.activeEditor.type === 'text') cleanup();
            return;
        }

        const mediaTarget = target.closest(EDITABLE_MEDIA_SELECTOR);
        if (mediaTarget) {
            cleanup();
            hideHighlighter();
            event.preventDefault(); event.stopPropagation();
            createImageEditor(mediaTarget);
            return;
        }

        const textTarget = target.closest(EDITABLE_TEXT_SELECTOR);
        if (isValidTextTarget(textTarget)) {
            cleanup();
            hideHighlighter();
            event.preventDefault(); event.stopPropagation();
            createTextEditor(textTarget);
            return;
        }

        if (state.activeEditor && state.activeEditor.type === 'text') {
            cleanup();
        }
    }

    function handleMouseMove(event) {
        if (!state.isEditingEnabled) { hideHighlighter(); return; }
        
        if (state.activeEditor) {
            return;
        }

        state.pageOverlay.style.pointerEvents = 'none';
        const target = document.elementFromPoint(event.clientX, event.clientY);
        state.pageOverlay.style.pointerEvents = 'auto';

        if (!target) {
            hideHighlighter();
            state.pageOverlay.style.cursor = 'default';
            return;
        }

        if (state.topBar && state.topBar.contains(target)) { hideHighlighter(); return; }

        const mediaTarget = target.closest(EDITABLE_MEDIA_SELECTOR);
        if (mediaTarget) {
            updateHighlighter(mediaTarget);
            state.pageOverlay.style.cursor = 'pointer';
            return;
        }

        const textTarget = target.closest(EDITABLE_TEXT_SELECTOR);
        if (isValidTextTarget(textTarget)) {
            updateHighlighter(textTarget);
            state.pageOverlay.style.cursor = 'text';
            return;
        }

        hideHighlighter();
        state.pageOverlay.style.cursor = 'default';
    }

    function updateHighlighter(target) {
        const rect = target.getBoundingClientRect();
        const h = state.highlighter;
        h.overlay.style.left = `${rect.left + window.scrollX}px`;
        h.overlay.style.top = `${rect.top + window.scrollY}px`;
        h.overlay.style.width = `${rect.width}px`;
        h.overlay.style.height = `${rect.height}px`;
        h.overlay.style.display = 'block';
        const borderWidth = 2;
        h.borders.top.style.cssText = `left: ${rect.left + window.scrollX}px; top: ${rect.top + window.scrollY}px; width: ${rect.width}px; height: ${borderWidth}px; display: block;`;
        h.borders.bottom.style.cssText = `left: ${rect.left + window.scrollX}px; top: ${rect.bottom + window.scrollY - borderWidth}px; width: ${rect.width}px; height: ${borderWidth}px; display: block;`;
        h.borders.left.style.cssText = `left: ${rect.left + window.scrollX}px; top: ${rect.top + window.scrollY}px; width: ${borderWidth}px; height: ${rect.height}px; display: block;`;
        h.borders.right.style.cssText = `left: ${rect.right + window.scrollX - borderWidth}px; top: ${rect.top + window.scrollY}px; width: ${borderWidth}px; height: ${rect.height}px; display: block;`;
    }

    function hideHighlighter() {
        if (!state.highlighter || state.highlighter.overlay.style.display === 'none') return;
        state.highlighter.overlay.style.display = 'none';
        Object.values(state.highlighter.borders).forEach(b => b.style.display = 'none');
    }

    function handleEscapeKey(event) {
        if (event.key === 'Escape') deactivate();
    }

    function createTextEditor(element) {
        element.style.visibility = 'hidden';
        const rect = element.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(element);
    
        const textarea = document.createElement('textarea');
        textarea.className = 'xtools-seamless-input';

        const sourceHTML = element.innerHTML.replace(/<br\s*\/?>/gi, '\n');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sourceHTML;
        textarea.value = tempDiv.textContent || tempDiv.innerText || "";
    
        Object.assign(textarea.style, {
            position: 'absolute',
            left: `${rect.left + window.scrollX}px`,
            top: `${rect.top + window.scrollY}px`,
            width: `${rect.width}px`,
            height: `auto`,
            font: computedStyle.font,
            color: computedStyle.color,
            padding: computedStyle.padding,
            margin: computedStyle.margin,
            textAlign: computedStyle.textAlign,
            lineHeight: computedStyle.lineHeight,
            letterSpacing: computedStyle.letterSpacing,
            wordSpacing: computedStyle.wordSpacing,
            textTransform: computedStyle.textTransform,
            textIndent: computedStyle.textIndent,
            whiteSpace: computedStyle.whiteSpace,
            wordWrap: computedStyle.wordWrap,
            wordBreak: computedStyle.wordBreak,
            boxSizing: 'border-box',
            zIndex: '2147483647'
        });
    
        document.body.appendChild(textarea);

        textarea.style.height = `${textarea.scrollHeight}px`;
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        });

        textarea.focus();
        textarea.select();
    
        state.activeEditor = { type: 'text', element, textarea };
    
        const saveAndCleanup = () => {
            element.textContent = textarea.value;
            cleanup();
        };
    
        textarea.addEventListener('blur', saveAndCleanup);
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                saveAndCleanup();
            }
            e.stopPropagation();
        });
    }

    function createImageEditor(targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const dropZone = document.createElement('div');
        dropZone.className = 'xtools-dropzone';
        if (rect.width < 60 || rect.height < 40) dropZone.classList.add('xtools-dropzone--small');
        dropZone.style.left = `${rect.left + window.scrollX}px`;
        dropZone.style.top = `${rect.top + window.scrollY}px`;
        dropZone.style.width = `${rect.width}px`;
        dropZone.style.height = `${rect.height}px`;
        dropZone.innerHTML = '<button class="xtools-dropzone-close-btn">&times;</button><div class="xtools-dropzone-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path><line x1="16" y1="5" x2="22" y2="5"></line><line x1="19" y1="2" x2="19" y2="8"></line><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg></div><div class="xtools-dropzone-text">Drop image or click</div>';
        document.body.appendChild(dropZone);

        dropZone.querySelector('.xtools-dropzone-close-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            cleanup();
        });

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*,video/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);

        state.activeEditor = { type: 'media', element: targetElement, dropZone, fileInput };

        const handleFile = (file) => {
            if (!file) { cleanup(); return; }
            const newSrc = URL.createObjectURL(file);

            if (file.type.startsWith('image/') && targetElement.matches('img, svg')) {
                const newImg = new Image();
                newImg.onload = () => {
                    const canvas = document.createElement('canvas');
                    const targetRect = targetElement.getBoundingClientRect();
                    canvas.width = targetRect.width;
                    canvas.height = targetRect.height;
                    const ctx = canvas.getContext('2d');
                    const imgRatio = newImg.naturalWidth / newImg.naturalHeight;
                    const canvasRatio = canvas.width / canvas.height;
                    let sx = 0, sy = 0, sWidth = newImg.naturalWidth, sHeight = newImg.naturalHeight;
                    if (imgRatio > canvasRatio) { sWidth = newImg.naturalHeight * canvasRatio; sx = (newImg.naturalWidth - sWidth) / 2; } 
                    else { sHeight = newImg.naturalWidth / canvasRatio; sy = (newImg.naturalHeight - sHeight) / 2; }
                    ctx.drawImage(newImg, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
                    if (targetElement.parentNode) targetElement.parentNode.replaceChild(canvas, targetElement);
                    cleanup();
                    URL.revokeObjectURL(newSrc);
                };
                newImg.src = newSrc;
            } else if (file.type.startsWith('video/') && targetElement.matches('video')) {
                targetElement.src = newSrc;
                targetElement.load();
                targetElement.play();
                cleanup();
            }
        };

        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', (e) => e.preventDefault());
        dropZone.addEventListener('drop', (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); });
        fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
    }

    // Initial call to start the tool
    activate();

})();