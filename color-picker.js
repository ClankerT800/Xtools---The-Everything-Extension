(function() {
    const STATE_KEY = '__colorPickerState';
    if (window[STATE_KEY]) {
        window[STATE_KEY].deactivate();
        return;
    }

    const state = {
        isActive: false,
        uiHost: null,
        shadowRoot: null,
        topBar: null,
        zoomer: null,
        imageCanvas: null,
        imageCtx: null,
        zoomCanvas: null,
        zoomCtx: null,
        colorHistory: [],
        throttledMouseMove: null,
        lastMouseX: 0,
        lastMouseY: 0,
        pixelChangeObserver: null,
        lastImageData: null,
        captureInProgress: false,
        pendingCapture: false,
        overlayEl: null,
        colorPreviewEl: null,
        hexEl: null,
        historyBarEl: null,
        refreshBtnEl: null,
        closeBtnEl: null,
        topBarOverlayEl: null,
        zoomerOverlayEl: null,
    };

    window[STATE_KEY] = { deactivate };

    function createUI() {
        state.uiHost = document.createElement('div');
        state.uiHost.id = 'xtools-color-picker-host';
        document.body.appendChild(state.uiHost);
        state.shadowRoot = state.uiHost.attachShadow({ mode: 'open' });

        const styles = document.createElement('style');
        styles.textContent = `:host {
    all: initial;
}

.xtools-color-picker-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 2147483646;
    cursor: none;
}

.xtools-color-picker-top-bar {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(25, 25, 25, 0.8);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    z-index: 2147483647;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    color: #f0f0f0;
    font-size: 14px;
    box-shadow: 0 5px 25px rgba(0,0,0,0.5);
    pointer-events: auto;
    overflow: hidden;
}

.xtools-color-picker-main-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
}

.xtools-color-picker-color-preview {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    flex-shrink: 0;
}

.xtools-color-picker-hex-code {
    font-weight: 600;
    font-size: 18px;
    font-family: 'monospace';
}

.xtools-color-picker-refresh-btn {
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    padding: 4px;
    margin-left: 8px;
    display: flex;
    align-items: center;
    border-radius: 50%;
    transition: background-color 0.2s ease, color 0.2s ease;
}

.xtools-color-picker-refresh-btn:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
}

.xtools-color-picker-history-bar {
    display: none;
    padding: 8px 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    background-color: rgba(0,0,0,0.2);
}

.xtools-history-color-chip {
    width: 22px;
    height: 22px;
    border-radius: 5px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: transform 0.1s ease;
}

.xtools-history-color-chip:hover {
    transform: scale(1.1);
}

.xtools-color-picker-close-btn {
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    padding: 4px;
    margin-left: 8px;
    display: flex;
    align-items: center;
    border-radius: 50%;
    transition: background-color 0.2s ease, color 0.2s ease;
}

.xtools-color-picker-close-btn:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
}

.xtools-color-picker-zoomer {
    position: fixed;
    width: 140px;
    height: 140px;
    border-radius: 50%;
    border: 4px solid white;
    overflow: hidden;
    z-index: 2147483647;
    pointer-events: none;
    box-shadow: 0 5px 15px rgba(0,0,0,0.5);
    background: #fff;
    display: none;
    transform: translate(-50%, -50%);
}

.xtools-color-picker-zoomer-canvas {
    width: 100%;
    height: 100%;
    image-rendering: pixelated;
}

.xtools-color-picker-zoomer::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 10px;
    height: 10px;
    border: 1px solid white;
    outline: 1px solid black;
    box-sizing: border-box;
}

.xtools-copy-notification {
    position: fixed;
    bottom: 40px;
    left: 50%;
    transform: translate(-50%, 20px);
    background-color: #2ecc71;
    color: white;
    padding: 14px 28px;
    border-radius: 10px;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    font-size: 18px;
    font-weight: 600;
    box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    opacity: 0;
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.xtools-copy-notification.show {
    opacity: 1;
    transform: translate(-50%, 0);
}

.xtools-loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    display: none;
}

.xtools-loader {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;
        state.shadowRoot.appendChild(styles);

        const overlay = document.createElement('div');
        overlay.className = 'xtools-color-picker-overlay';
        state.shadowRoot.appendChild(overlay);
        state.overlayEl = overlay;

        state.topBar = document.createElement('div');
        state.topBar.className = 'xtools-color-picker-top-bar';
        state.topBar.innerHTML = `
            <div class="xtools-color-picker-main-bar">
                <div class="xtools-color-picker-color-preview"></div>
                <span class="xtools-color-picker-hex-code">#...</span>
                <button class="xtools-color-picker-refresh-btn" title="Refresh Screenshot">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                </button>
                <button class="xtools-color-picker-close-btn" title="Close Color Picker (Esc)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div class="xtools-color-picker-history-bar"></div>
        `;
        
        const topBarLoadingOverlay = document.createElement('div');
        topBarLoadingOverlay.className = 'xtools-loading-overlay';
        topBarLoadingOverlay.innerHTML = '<div class="xtools-loader"></div>';
        state.topBar.appendChild(topBarLoadingOverlay);
        state.topBarOverlayEl = topBarLoadingOverlay;

        state.shadowRoot.appendChild(state.topBar);
        state.colorPreviewEl = state.topBar.querySelector('.xtools-color-picker-color-preview');
        state.hexEl = state.topBar.querySelector('.xtools-color-picker-hex-code');
        state.historyBarEl = state.topBar.querySelector('.xtools-color-picker-history-bar');
        state.refreshBtnEl = state.topBar.querySelector('.xtools-color-picker-refresh-btn');
        state.closeBtnEl = state.topBar.querySelector('.xtools-color-picker-close-btn');

        state.zoomer = document.createElement('div');
        state.zoomer.className = 'xtools-color-picker-zoomer';
        state.zoomer.innerHTML = `<canvas class="xtools-color-picker-zoomer-canvas"></canvas>`;
        
        const zoomerLoadingOverlay = document.createElement('div');
        zoomerLoadingOverlay.className = 'xtools-loading-overlay';
        zoomerLoadingOverlay.innerHTML = '<div class="xtools-loader"></div>';
        state.zoomer.appendChild(zoomerLoadingOverlay);
        state.zoomerOverlayEl = zoomerLoadingOverlay;

        state.shadowRoot.appendChild(state.zoomer);
        state.zoomCanvas = state.zoomer.querySelector('canvas');
        state.zoomCtx = state.zoomCanvas.getContext('2d');
    }

    function activate() {
        if (state.isActive) return;
        state.isActive = true;

        captureAndCreateUI();
    }

    function captureAndCreateUI() {
        if (state.captureInProgress) {
            state.pendingCapture = true;
            return;
        }

        state.captureInProgress = true;
        state.pendingCapture = false;

        if (state.uiHost) {
            const zoomerOverlay = state.zoomerOverlayEl;
            const topBarOverlay = state.topBarOverlayEl;
            if (zoomerOverlay) zoomerOverlay.style.display = 'flex';
            if (topBarOverlay) topBarOverlay.style.display = 'flex';
        }

        const captureWithPreciseTiming = () => {
            chrome.runtime.sendMessage({ 
                action: 'captureVisibleTab'
            }, (response) => {
                if (state.uiHost) {
                    const zoomerOverlay = state.zoomerOverlayEl;
                    const topBarOverlay = state.topBarOverlayEl;
                    if (zoomerOverlay) zoomerOverlay.style.display = 'none';
                    if (topBarOverlay) topBarOverlay.style.display = 'none';
                }

                if (response && response.dataUrl) {
                    const img = new Image();
                    img.onload = () => {
                        if (!state.imageCanvas) {
                            state.imageCanvas = document.createElement('canvas');
                            state.imageCtx = state.imageCanvas.getContext('2d');
                            createUI();
                            attachEventListeners();
                            setupPixelChangeDetection();
                        }
                        state.imageCanvas.width = img.width;
                        state.imageCanvas.height = img.height;
                        state.imageCtx.drawImage(img, 0, 0);
                        state.lastImageData = state.imageCtx.getImageData(0, 0, img.width, img.height);
                    };
                    img.src = response.dataUrl;
                } else {
                    console.error('Xtools Color Picker: Failed to capture visible tab.');
                }
                
                state.captureInProgress = false;
                if (state.pendingCapture) {
                    setTimeout(captureAndCreateUI, 10);
                }
            });
        };

        if (state.uiHost) {
            captureWithPreciseTiming();
        } else {
            chrome.runtime.sendMessage({ action: 'captureVisibleTab' }, (response) => {
                if (response && response.dataUrl) {
                    const img = new Image();
                    img.onload = () => {
                        if (!state.imageCanvas) {
                            state.imageCanvas = document.createElement('canvas');
                            state.imageCtx = state.imageCanvas.getContext('2d');
                            createUI();
                            attachEventListeners();
                            setupPixelChangeDetection();
                        }
                        state.imageCanvas.width = img.width;
                        state.imageCanvas.height = img.height;
                        state.imageCtx.drawImage(img, 0, 0);
                        state.lastImageData = state.imageCtx.getImageData(0, 0, img.width, img.height);
                    };
                    img.src = response.dataUrl;
                }
                state.captureInProgress = false;
            });
        }
    }

    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    const debouncedCapture = debounce(captureAndCreateUI, 50);

    function setupPixelChangeDetection() {
        if (state.pixelChangeObserver) {
            state.pixelChangeObserver.disconnect();
        }

        let isDetecting = false;
        let lastDetectionTime = 0;
        const DETECTION_THROTTLE = 50;

        const detectPixelChanges = () => {
            const now = Date.now();
            if (isDetecting || !state.imageCtx || !state.lastImageData || (now - lastDetectionTime) < DETECTION_THROTTLE) {
                return;
            }
            
            isDetecting = true;
            lastDetectionTime = now;

            requestAnimationFrame(() => {
                try {
                    const currentImageData = state.imageCtx.getImageData(0, 0, state.imageCanvas.width, state.imageCanvas.height);
                    const lastData = state.lastImageData.data;
                    const currentData = currentImageData.data;

                    if (lastData.length !== currentData.length) {
                        isDetecting = false;
                        captureAndCreateUI();
                        return;
                    }

                    for (let i = 0; i < currentData.length; i += 4) {
                        if (lastData[i] !== currentData[i] || 
                            lastData[i + 1] !== currentData[i + 1] || 
                            lastData[i + 2] !== currentData[i + 2] || 
                            lastData[i + 3] !== currentData[i + 3]) {
                            isDetecting = false;
                            captureAndCreateUI();
                            return;
                        }
                    }
                    isDetecting = false;
                } catch (error) {
                    isDetecting = false;
                }
            });
        };

        state.pixelChangeObserver = new MutationObserver((mutations) => {
            const hasRelevantChanges = mutations.some(mutation => {
                if (mutation.type === 'childList') return true;
                if (mutation.type === 'attributes') {
                    const attrName = mutation.attributeName;
                    return ['style', 'class', 'src', 'data-src', 'background-image'].includes(attrName);
                }
                return false;
            });
            
            if (hasRelevantChanges) {
                detectPixelChanges();
            }
        });

        state.pixelChangeObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class', 'src', 'data-src', 'background-image']
        });

        const events = [
            'mousemove', 'scroll', 'resize', 'input', 'change', 'animationstart', 
            'animationend', 'transitionstart', 'transitionend', 'load', 'DOMContentLoaded',
            'focus', 'blur', 'keydown', 'keyup', 'click', 'mousedown', 'mouseup'
        ];
        
        events.forEach(event => {
            document.addEventListener(event, detectPixelChanges, { passive: true, capture: true });
        });

        const videoElements = document.querySelectorAll('video, canvas, iframe');
        videoElements.forEach(element => {
            if (element.tagName === 'VIDEO') {
                ['play', 'pause', 'seeked', 'timeupdate'].forEach(event => {
                    element.addEventListener(event, detectPixelChanges, { passive: true });
                });
            }
        });

        const intervalId = setInterval(() => {
            if (state.imageCtx && state.lastImageData) {
                detectPixelChanges();
            }
        }, 50);

        state.pixelChangeObserver._intervalId = intervalId;
    }

    function deactivate() {
        if (!state.isActive) return;
        state.isActive = false;
        if (state.uiHost) {
            document.body.removeChild(state.uiHost);
        }
        if (state.throttledMouseMove) {
            document.removeEventListener('mousemove', state.throttledMouseMove, true);
        }
        if (state.pixelChangeObserver) {
            state.pixelChangeObserver.disconnect();
            if (state.pixelChangeObserver._intervalId) {
                clearInterval(state.pixelChangeObserver._intervalId);
            }
        }
        document.removeEventListener('click', handlePageClick, true);
        document.removeEventListener('keydown', handleKeyEvent);
        window.removeEventListener('scroll', debouncedCapture);
        window[STATE_KEY] = null;
    }

    function attachEventListeners() {
        state.throttledMouseMove = throttle(handleMouseMove, 16);
        document.addEventListener('mousemove', state.throttledMouseMove, true);
        document.addEventListener('click', handlePageClick, true);
        document.addEventListener('keydown', handleKeyEvent);
        window.addEventListener('scroll', debouncedCapture);
        state.closeBtnEl.addEventListener('click', deactivate);
        state.refreshBtnEl.addEventListener('click', captureAndCreateUI);
        state.topBar.addEventListener('mouseenter', () => {
            state.overlayEl.style.cursor = 'default';
            if (state.zoomer) {
                state.zoomer.style.display = 'none';
            }
        });
        state.topBar.addEventListener('mouseleave', () => {
            state.overlayEl.style.cursor = 'none';
            if (state.zoomer) {
                state.zoomer.style.display = 'block';
                state.zoomer.style.left = `${state.lastMouseX}px`;
                state.zoomer.style.top = `${state.lastMouseY}px`;
            }
        });
    }

    function handleKeyEvent(event) {
        if (event.key === 'Escape') {
            deactivate();
        }
    }

    function handleMouseMove(event) {
        state.lastMouseX = event.clientX;
        state.lastMouseY = event.clientY;
        if (!state.isActive || !state.imageCtx) return;

        const { clientX: x, clientY: y } = event;

        const overlay = state.overlayEl;
        if (overlay.style.cursor === 'default') {
            return;
        }

        state.zoomer.style.display = 'block';
        state.zoomer.style.left = `${x}px`;
        state.zoomer.style.top = `${y}px`;

        const dpr = window.devicePixelRatio;
        const ix = Math.round(x * dpr);
        const iy = Math.round(y * dpr);

        const pixel = state.imageCtx.getImageData(ix, iy, 1, 1).data;
        const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);

        state.colorPreviewEl.style.backgroundColor = hex;
        state.hexEl.textContent = hex;

        const zoomFactor = 15;
        state.zoomCtx.imageSmoothingEnabled = false;
        state.zoomCtx.drawImage(
            state.imageCanvas, 
            ix - zoomFactor, 
            iy - zoomFactor, 
            zoomFactor * 2, 
            zoomFactor * 2, 
            0, 0, 
            state.zoomCanvas.width, 
            state.zoomCanvas.height
        );
    }

    function handlePageClick(event) {
        if (!state.isActive) return;

        if (event.composedPath().includes(state.topBar)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const hex = state.hexEl.textContent;
        navigator.clipboard.writeText(hex).then(() => {
            showCopyNotification(hex);
            addToHistory(hex);
        });
    }

    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    function showCopyNotification(hex) {
        const notification = document.createElement('div');
        notification.className = 'xtools-copy-notification';
        notification.textContent = `Copied ${hex}`;
        state.shadowRoot.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 1500);
    }

    function addToHistory(hex) {
        if (state.colorHistory.includes(hex)) return;
        state.colorHistory.unshift(hex);
        if (state.colorHistory.length > 5) {
            state.colorHistory.pop();
        }
        renderHistory();
    }

    function renderHistory() {
        const historyBar = state.historyBarEl;
        if (state.colorHistory.length > 0) historyBar.style.display = 'flex';
        historyBar.innerHTML = '';
        state.colorHistory.forEach(hex => {
            const colorChip = document.createElement('div');
            colorChip.className = 'xtools-history-color-chip';
            colorChip.style.backgroundColor = hex;
            colorChip.addEventListener('click', (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(hex).then(() => {
                    showCopyNotification(hex);
                });
            });
            historyBar.appendChild(colorChip);
        });
    }

    activate();
})();