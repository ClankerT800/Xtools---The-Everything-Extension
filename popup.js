document.addEventListener('DOMContentLoaded', () => {
    const ALL_TOOLS = {
        'color-picker': { name: 'Color Picker', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z"></path></svg>', category: 'utility' },
        'screenshot': { name: 'Screenshot', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r=".5"/><path d="M8 13l3-3 4 4 5-5"/></svg>', category: 'media' },
        'notes': { name: 'Notes', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 2H6.5A2.5 2.5 0 0 0 4 4.5v15A2.5 2.5 0 0 0 6.5 22h11a2.5 2.5 0 0 0 2.5-2.5V9.5L13.5 2z"/><polyline points="13 2 13 9 20 9"/></svg>', category: 'utility' },
        'calculator': { name: 'Calculator', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/></svg>', category: 'utility' },
        'pip': { name: 'Picture-in-Picture', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 18.5h-4.5a.5.5 0 0 1-.5-.5v-4.5a.5.5 0 0 1 .5-.5H22a.5.5 0 0 1 .5.5V18a.5.5 0 0 1-.5.5z"/><path d="M2 3h20v18H2z"/></svg>', category: 'media' },
        'recorder': { name: 'Screen Recorder', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>', category: 'media' },
        'volume': { name: 'Volume Booster', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>', category: 'media' },
        'image-converter': { name: 'Image Converter', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 16l-2-2 5-5"/><path d="M17 10l-5 5"/></svg>', category: 'media' },
        'video-converter': { name: 'Video Converter', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2C1 8.12 1 12 1 12s0 3.88.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2C23 15.88 23 12 23 12s0-3.88-.46-5.58z"/><path d="M10 15l5-3-5-3z"/></svg>', category: 'media' },
        'image-compressor': { name: 'Image Compressor', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12H3m9-9l-3 3 3 3m0 12l-3-3 3-3M9 3l3 3-3 3m0 12l3-3-3 3"/></svg>', category: 'media' },
        'video-compressor': { name: 'Video Compressor', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18H9m6-12H9"/><path d="M21 12H3"/><path d="M12 21V3"/></svg>', category: 'media' },
        'qr-code': { name: 'QR Generator', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>', category: 'developer' },
        'json-formatter': { name: 'JSON Formatter', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 10c0-1.657 1.343-3 3-3s3 1.343 3 3v0c0 1.657-1.343 3-3 3s-3-1.343-3-3V10z"/><path d="M10 17c0-1.657 1.343-3 3-3s3 1.343 3 3v0c0 1.657-1.343 3-3 3s-3-1.343-3-3V17z"/><path d="M14 7V4"/><path d="M14 20v-3"/><path d="M7 10H4"/><path d="M20 10h-3"/><path d="M7 17H4"/><path d="M20 17h-3"/></svg>', category: 'developer' },
        'password-gen': { name: 'Password Gen', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>', category: 'developer' },
        'tweet-sharer': { name: 'Tweet Sharer', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>', category: 'social' },
        'unit-converter': { name: 'Unit Converter', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.17 12H2.83"/><path d="M10.59 5.59L14.17 2"/><path d="M10.59 18.41L14.17 22"/><path d="M3.83 7l-3 5 3 5"/><path d="M20.17 7l3 5-3 5"/></svg>', category: 'utility' },
        'timer': { name: 'Timer', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', category: 'utility' },
    };

    const toolsGrid = document.getElementById('tools-grid');
    const modalToolsGrid = document.getElementById('modal-tools-grid');
    const addToolBtn = document.getElementById('add-tool-btn');
    const addToolModal = document.getElementById('add-tool-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const imageDownloaderToggle = document.getElementById('image-downloader-toggle');

    let activeTools = [];

    const createToolCard = (toolId, isAdded) => {
        const tool = ALL_TOOLS[toolId];
        const card = document.createElement('div');
        card.className = 'tool-card';
        card.dataset.toolId = toolId;

        const actionSymbol = isAdded ? '−' : '+';
        const actionClass = isAdded ? 'remove' : 'add';

        card.innerHTML = `
            <button class="action-btn ${actionClass}-btn">${actionSymbol}</button>
            <div class="tool-card-icon">${tool.icon}</div>
            <span class="tool-card-name">${tool.name}</span>
        `;

        card.querySelector('.action-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (isAdded) {
                activeTools = activeTools.filter(id => id !== toolId);
            } else {
                if(activeTools.length < 12) {
                    activeTools.push(toolId);
                } else {
                    alert('You can add a maximum of 12 tools.');
                }
            }
            saveAndRender();
        });

        if (isAdded) {
            card.addEventListener('click', () => {});
        }

        return card;
    };

    const render = (category = 'all') => {
        toolsGrid.innerHTML = '';

        if (activeTools.length === 0) {
            toolsGrid.classList.add('is-empty');
            const noToolsMessage = document.createElement('div');
            noToolsMessage.className = 'no-tools-message';
            noToolsMessage.textContent = 'No tools added. Click \'Add Tool\' to get started!';
            toolsGrid.appendChild(noToolsMessage);
        } else {
            toolsGrid.classList.remove('is-empty');
            activeTools.forEach(toolId => toolsGrid.appendChild(createToolCard(toolId, true)));
        }

        modalToolsGrid.innerHTML = '';
        Object.keys(ALL_TOOLS).forEach(toolId => {
            if (!activeTools.includes(toolId) && (category === 'all' || ALL_TOOLS[toolId].category === category)) {
                modalToolsGrid.appendChild(createToolCard(toolId, false));
            }
        });
    };

    const saveAndRender = () => {
        const currentCategory = document.querySelector('.modal-nav-btn.active').dataset.category;
        chrome.storage.local.set({ activeTools }, () => render(currentCategory));
    };

    const loadAndRender = () => {
        chrome.storage.local.get('activeTools', (data) => {
            activeTools = data.activeTools || ['color-picker', 'screenshot', 'notes', 'calculator', 'pip', 'recorder'];
            render();
        });
    };

    addToolBtn.addEventListener('click', () => addToolModal.style.display = 'flex');
    modalCloseBtn.addEventListener('click', () => addToolModal.style.display = 'none');
    addToolModal.addEventListener('click', (e) => {
        if (e.target === addToolModal) {
            addToolModal.style.display = 'none';
        }
    });

    document.querySelectorAll('.modal-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.modal-nav-btn.active').classList.remove('active');
            btn.classList.add('active');
            render(btn.dataset.category);
        });
    });

    chrome.storage.sync.get(['imageDownloaderEnabled'], (result) => {
        imageDownloaderToggle.checked = result.imageDownloaderEnabled !== false;
    });

    imageDownloaderToggle.addEventListener('change', function() {
        chrome.storage.sync.set({ imageDownloaderEnabled: this.checked });
    });

    loadAndRender();
});