// ==========================================
// STICKER HALL OF FAME - Main Application
// ==========================================

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyC2es1X51laIQ66WNilOxtXOA2g9GoB-FU",
    authDomain: "sticker-hall-of-fame.firebaseapp.com",
    databaseURL: "https://sticker-hall-of-fame-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "sticker-hall-of-fame",
    storageBucket: "sticker-hall-of-fame.firebasestorage.app",
    messagingSenderId: "1024452902044",
    appId: "1:1024452902044:web:79cd143ad8be30ebd30159"
};

// Initialize Firebase
let db;
let stickersRef;

function initFirebase() {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        stickersRef = db.ref('stickers');
        console.log('Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('Firebase initialization failed:', error);
        return false;
    }
}

// ==========================================
// App State
// ==========================================
const state = {
    stickers: [],
    filteredStickers: [],
    currentFilter: 'all',
    searchQuery: '',
    userLikes: JSON.parse(localStorage.getItem('stickerLikes') || '{}'),
    isFirebaseConnected: false,
    uploadMethod: 'upload', // 'upload' or 'url'
    selectedFile: null,
    selectedFileBase64: null
};

// ==========================================
// DOM Elements
// ==========================================
const elements = {
    toggleAddForm: document.getElementById('toggleAddForm'),
    addForm: document.getElementById('addForm'),
    stickerUrl: document.getElementById('stickerUrl'),
    stickerName: document.getElementById('stickerName'),
    stickerCategory: document.getElementById('stickerCategory'),
    stickerTags: document.getElementById('stickerTags'),
    addSticker: document.getElementById('addSticker'),
    cancelAdd: document.getElementById('cancelAdd'),
    categoryFilters: document.getElementById('categoryFilters'),
    searchInput: document.getElementById('searchInput'),
    stickerGrid: document.getElementById('stickerGrid'),
    emptyState: document.getElementById('emptyState'),
    loading: document.getElementById('loading'),
    modal: document.getElementById('stickerModal'),
    modalClose: document.getElementById('modalClose'),
    modalImage: document.getElementById('modalImage'),
    modalName: document.getElementById('modalName'),
    modalCategory: document.getElementById('modalCategory'),
    modalTags: document.getElementById('modalTags'),
    modalLikes: document.getElementById('modalLikes'),
    modalRank: document.getElementById('modalRank'),
    toast: document.getElementById('toast'),
    // Upload elements
    toggleUpload: document.getElementById('toggleUpload'),
    toggleUrl: document.getElementById('toggleUrl'),
    uploadGroup: document.getElementById('uploadGroup'),
    urlGroup: document.getElementById('urlGroup'),
    uploadArea: document.getElementById('uploadArea'),
    stickerFile: document.getElementById('stickerFile'),
    uploadPlaceholder: document.getElementById('uploadPlaceholder'),
    uploadPreview: document.getElementById('uploadPreview'),
    previewImage: document.getElementById('previewImage'),
    removePreview: document.getElementById('removePreview')
};

// ==========================================
// Initialize Application
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    showLoading(true);
    
    // Check if Firebase config is set
    if (firebaseConfig.apiKey === "YOUR_API_KEY") {
        console.warn('Firebase not configured. Using demo mode with local storage.');
        initDemoMode();
    } else {
        state.isFirebaseConnected = initFirebase();
        if (state.isFirebaseConnected) {
            setupRealtimeSync();
        } else {
            initDemoMode();
        }
    }
    
    setupEventListeners();
});

// ==========================================
// Demo Mode (Local Storage fallback)
// ==========================================
function initDemoMode() {
    console.log('Running in demo mode (local storage)');
    
    // Load stickers from local storage
    const savedStickers = localStorage.getItem('demoStickers');
    if (savedStickers) {
        state.stickers = JSON.parse(savedStickers);
    } else {
        // Add some sample stickers
        state.stickers = getSampleStickers();
        saveDemoStickers();
    }
    
    updateUI();
    showLoading(false);
}

function saveDemoStickers() {
    localStorage.setItem('demoStickers', JSON.stringify(state.stickers));
}

function getSampleStickers() {
    return [
        {
            id: 'sample1',
            url: 'https://em-content.zobj.net/source/telegram/386/smiling-face-with-hearts_1f970.webp',
            name: 'Smiling with Hearts',
            category: 'love',
            tags: ['smile', 'hearts', 'cute'],
            likes: 42,
            rank: 1,
            createdAt: Date.now()
        },
        {
            id: 'sample2',
            url: 'https://em-content.zobj.net/source/telegram/386/cat-with-wry-smile_1f63c.webp',
            name: 'Smirking Cat',
            category: 'funny',
            tags: ['cat', 'smirk', 'funny'],
            likes: 38,
            rank: 2,
            createdAt: Date.now() - 1000
        },
        {
            id: 'sample3',
            url: 'https://em-content.zobj.net/source/telegram/386/waving-hand_1f44b.webp',
            name: 'Waving Hello',
            category: 'greeting',
            tags: ['wave', 'hello', 'hi'],
            likes: 25,
            rank: 3,
            createdAt: Date.now() - 2000
        }
    ];
}

// ==========================================
// Firebase Realtime Sync
// ==========================================
function setupRealtimeSync() {
    stickersRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            state.stickers = Object.entries(data).map(([id, sticker]) => ({
                id,
                ...sticker
            }));
            // Sort by rank
            state.stickers.sort((a, b) => (a.rank || 999) - (b.rank || 999));
        } else {
            state.stickers = [];
        }
        updateUI();
        showLoading(false);
    }, (error) => {
        console.error('Firebase read error:', error);
        showToast('Error loading stickers', 'error');
        showLoading(false);
    });
}

// ==========================================
// Event Listeners
// ==========================================
function setupEventListeners() {
    // Toggle add form
    elements.toggleAddForm.addEventListener('click', () => {
        elements.addForm.classList.toggle('active');
        if (elements.addForm.classList.contains('active')) {
            elements.toggleAddForm.textContent = '- Close Form';
        } else {
            elements.toggleAddForm.textContent = '+ Add New Sticker';
        }
    });
    
    // Cancel add
    elements.cancelAdd.addEventListener('click', () => {
        elements.addForm.classList.remove('active');
        elements.toggleAddForm.textContent = '+ Add New Sticker';
        clearForm();
    });
    
    // Add sticker
    elements.addSticker.addEventListener('click', handleAddSticker);
    
    // Category filters
    elements.categoryFilters.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            // Update active state
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            
            state.currentFilter = e.target.dataset.category;
            updateUI();
        }
    });
    
    // Search
    elements.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase();
        updateUI();
    });
    
    // Modal close
    elements.modalClose.addEventListener('click', closeModal);
    elements.modal.addEventListener('click', (e) => {
        if (e.target === elements.modal) closeModal();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
    
    // Upload method toggle
    elements.toggleUpload.addEventListener('click', () => {
        state.uploadMethod = 'upload';
        elements.toggleUpload.classList.add('active');
        elements.toggleUrl.classList.remove('active');
        elements.uploadGroup.style.display = 'block';
        elements.urlGroup.style.display = 'none';
    });
    
    elements.toggleUrl.addEventListener('click', () => {
        state.uploadMethod = 'url';
        elements.toggleUrl.classList.add('active');
        elements.toggleUpload.classList.remove('active');
        elements.urlGroup.style.display = 'block';
        elements.uploadGroup.style.display = 'none';
    });
    
    // File upload handling
    elements.uploadArea.addEventListener('click', () => {
        elements.stickerFile.click();
    });
    
    elements.stickerFile.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    elements.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.add('dragover');
    });
    
    elements.uploadArea.addEventListener('dragleave', () => {
        elements.uploadArea.classList.remove('dragover');
    });
    
    elements.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect({ target: { files: files } });
        }
    });
    
    // Remove preview
    elements.removePreview.addEventListener('click', (e) => {
        e.stopPropagation();
        clearFilePreview();
    });
}

// ==========================================
// File Upload Handling
// ==========================================
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
    }
    
    // Validate file size (max 500KB for Base64 storage)
    if (file.size > 500 * 1024) {
        showToast('File size must be under 500KB', 'error');
        return;
    }
    
    state.selectedFile = file;
    
    // Show preview and store Base64
    const reader = new FileReader();
    reader.onload = (e) => {
        state.selectedFileBase64 = e.target.result;
        elements.previewImage.src = e.target.result;
        elements.uploadPlaceholder.style.display = 'none';
        elements.uploadPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function clearFilePreview() {
    state.selectedFile = null;
    state.selectedFileBase64 = null;
    elements.stickerFile.value = '';
    elements.previewImage.src = '';
    elements.uploadPlaceholder.style.display = 'flex';
    elements.uploadPreview.style.display = 'none';
}

// ==========================================
// Sticker CRUD Operations
// ==========================================
function handleAddSticker() {
    const name = elements.stickerName.value.trim();
    const category = elements.stickerCategory.value;
    const tagsInput = elements.stickerTags.value.trim();
    
    // Validation
    if (!name) {
        showToast('Please enter a sticker name', 'error');
        return;
    }
    
    // Check if we have an image (file or URL)
    if (state.uploadMethod === 'upload') {
        if (!state.selectedFile) {
            showToast('Please select an image file', 'error');
            return;
        }
        // Handle file upload
        handleFileUploadAndSave(name, category, tagsInput);
    } else {
        const url = elements.stickerUrl.value.trim();
        if (!url) {
            showToast('Please enter a sticker URL', 'error');
            return;
        }
        // Handle URL-based sticker
        saveSticker(url, name, category, tagsInput);
    }
}

async function handleFileUploadAndSave(name, category, tagsInput) {
    // Use Base64 directly - no Firebase Storage needed!
    if (!state.selectedFileBase64) {
        showToast('Please select an image file', 'error');
        return;
    }
    
    // Check Base64 size (Firebase has ~10MB limit per node, but keep it small)
    const base64Size = state.selectedFileBase64.length;
    console.log('Base64 size:', base64Size, 'characters');
    
    if (base64Size > 1000000) { // ~750KB image
        showToast('Image too large. Please use a smaller image.', 'error');
        return;
    }
    
    // Show loading state
    elements.addSticker.disabled = true;
    elements.addSticker.textContent = 'Adding...';
    
    try {
        // Store the Base64 image directly as the URL
        await saveSticker(state.selectedFileBase64, name, category, tagsInput);
    } catch (error) {
        console.error('Error saving sticker:', error);
        showToast('Error: ' + error.message, 'error');
    } finally {
        elements.addSticker.disabled = false;
        elements.addSticker.textContent = 'Add Sticker';
    }
}

function saveSticker(url, name, category, tagsInput) {
    // Parse tags
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
    
    const newSticker = {
        url,
        name,
        category,
        tags,
        likes: 0,
        rank: state.stickers.length + 1,
        createdAt: Date.now()
    };
    
    if (state.isFirebaseConnected) {
        // Add to Firebase
        const newRef = stickersRef.push();
        return newRef.set(newSticker)
            .then(() => {
                showToast('Sticker added successfully!', 'success');
                clearForm();
                elements.addForm.classList.remove('active');
                elements.toggleAddForm.textContent = '+ Add New Sticker';
            })
            .catch((error) => {
                console.error('Error adding sticker:', error);
                showToast('Error: ' + error.message, 'error');
            });
    } else {
        // Demo mode - local storage
        newSticker.id = 'sticker_' + Date.now();
        state.stickers.push(newSticker);
        saveDemoStickers();
        updateUI();
        showToast('Sticker added successfully!', 'success');
        clearForm();
        elements.addForm.classList.remove('active');
        elements.toggleAddForm.textContent = '+ Add New Sticker';
        return Promise.resolve();
    }
}

function deleteSticker(stickerId) {
    if (!confirm('Are you sure you want to delete this sticker?')) return;
    
    if (state.isFirebaseConnected) {
        stickersRef.child(stickerId).remove()
            .then(() => {
                showToast('Sticker deleted', 'success');
                updateRanks();
            })
            .catch((error) => {
                console.error('Error deleting sticker:', error);
                showToast('Error deleting sticker', 'error');
            });
    } else {
        state.stickers = state.stickers.filter(s => s.id !== stickerId);
        saveDemoStickers();
        updateUI();
        showToast('Sticker deleted', 'success');
    }
}

function toggleLike(stickerId) {
    const isLiked = state.userLikes[stickerId];
    const sticker = state.stickers.find(s => s.id === stickerId);
    
    if (!sticker) return;
    
    const newLikes = isLiked ? Math.max(0, sticker.likes - 1) : sticker.likes + 1;
    
    if (state.isFirebaseConnected) {
        stickersRef.child(stickerId).update({ likes: newLikes })
            .then(() => {
                state.userLikes[stickerId] = !isLiked;
                localStorage.setItem('stickerLikes', JSON.stringify(state.userLikes));
            })
            .catch((error) => {
                console.error('Error updating likes:', error);
            });
    } else {
        sticker.likes = newLikes;
        state.userLikes[stickerId] = !isLiked;
        localStorage.setItem('stickerLikes', JSON.stringify(state.userLikes));
        saveDemoStickers();
        updateUI();
    }
}

function updateRanks() {
    // Sort by likes and update ranks
    const sorted = [...state.stickers].sort((a, b) => b.likes - a.likes);
    
    const updates = {};
    sorted.forEach((sticker, index) => {
        updates[`${sticker.id}/rank`] = index + 1;
    });
    
    if (state.isFirebaseConnected) {
        stickersRef.update(updates);
    } else {
        sorted.forEach((sticker, index) => {
            const s = state.stickers.find(st => st.id === sticker.id);
            if (s) s.rank = index + 1;
        });
        saveDemoStickers();
    }
}

// ==========================================
// Drag and Drop Reordering
// ==========================================
let sortable;

function initSortable() {
    if (sortable) sortable.destroy();
    
    sortable = new Sortable(elements.stickerGrid, {
        animation: 300,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'dragging',
        handle: '.sticker-card',
        onEnd: handleDragEnd
    });
}

function handleDragEnd(evt) {
    const { oldIndex, newIndex } = evt;
    
    if (oldIndex === newIndex) return;
    
    // Reorder in state
    const movedSticker = state.filteredStickers[oldIndex];
    const allStickers = [...state.stickers];
    
    // Find and move in full array
    const oldFullIndex = allStickers.findIndex(s => s.id === movedSticker.id);
    allStickers.splice(oldFullIndex, 1);
    
    // Calculate new position in full array
    let newFullIndex;
    if (newIndex === 0) {
        newFullIndex = 0;
    } else if (newIndex >= state.filteredStickers.length - 1) {
        newFullIndex = allStickers.length;
    } else {
        const targetSticker = state.filteredStickers[newIndex];
        newFullIndex = allStickers.findIndex(s => s.id === targetSticker.id);
        if (oldFullIndex < newFullIndex) newFullIndex++;
    }
    
    allStickers.splice(newFullIndex, 0, movedSticker);
    
    // Update ranks
    const updates = {};
    allStickers.forEach((sticker, index) => {
        sticker.rank = index + 1;
        if (state.isFirebaseConnected) {
            updates[`${sticker.id}/rank`] = index + 1;
        }
    });
    
    state.stickers = allStickers;
    
    if (state.isFirebaseConnected) {
        stickersRef.update(updates)
            .then(() => showToast('Order updated!', 'success'))
            .catch((error) => {
                console.error('Error updating order:', error);
                showToast('Error updating order', 'error');
            });
    } else {
        saveDemoStickers();
        showToast('Order updated!', 'success');
    }
    
    updateUI();
}

// ==========================================
// UI Rendering
// ==========================================
function updateUI() {
    // Filter stickers
    state.filteredStickers = state.stickers.filter(sticker => {
        // Category filter
        const categoryMatch = state.currentFilter === 'all' || sticker.category === state.currentFilter;
        
        // Search filter (handle missing tags)
        const tags = sticker.tags || [];
        const searchMatch = !state.searchQuery || 
            sticker.name.toLowerCase().includes(state.searchQuery) ||
            sticker.category.toLowerCase().includes(state.searchQuery) ||
            tags.some(tag => tag.toLowerCase().includes(state.searchQuery));
        
        return categoryMatch && searchMatch;
    });
    
    // Sort by rank
    state.filteredStickers.sort((a, b) => (a.rank || 999) - (b.rank || 999));
    
    // Show/hide empty state
    if (state.filteredStickers.length === 0) {
        elements.emptyState.classList.add('active');
        elements.stickerGrid.innerHTML = '';
    } else {
        elements.emptyState.classList.remove('active');
        renderStickers();
    }
}

function renderStickers() {
    elements.stickerGrid.innerHTML = state.filteredStickers.map((sticker, index) => {
        const isLiked = state.userLikes[sticker.id];
        const rankClass = index < 3 ? 'top-3' : '';
        const tags = sticker.tags || [];
        const tagsHtml = tags.map(tag => `<span class="sticker-tag">#${tag}</span>`).join('');
        
        return `
            <div class="sticker-card" data-id="${sticker.id}">
                <span class="rank-badge ${rankClass}">#${index + 1}</span>
                <button class="delete-btn" onclick="deleteSticker('${sticker.id}')" title="Delete sticker">×</button>
                <img src="${sticker.url}" alt="${sticker.name}" class="sticker-image" onerror="this.src='https://via.placeholder.com/200?text=Image+Error'">
                <div class="sticker-info">
                    <h3 class="sticker-name">${escapeHtml(sticker.name)}</h3>
                    <span class="sticker-category">${capitalizeFirst(sticker.category)}</span>
                    <div class="sticker-tags">${tagsHtml}</div>
                    <div class="sticker-actions">
                        <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${sticker.id}')">
                            <span class="heart">${isLiked ? '❤️' : '🤍'}</span>
                            <span class="count">${sticker.likes || 0}</span>
                        </button>
                        <button class="view-btn" onclick="openModal('${sticker.id}')">View</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Re-initialize sortable
    initSortable();
}

// ==========================================
// Modal
// ==========================================
function openModal(stickerId) {
    const sticker = state.stickers.find(s => s.id === stickerId);
    if (!sticker) return;
    
    elements.modalImage.src = sticker.url;
    elements.modalImage.alt = sticker.name;
    elements.modalName.textContent = sticker.name;
    elements.modalCategory.textContent = capitalizeFirst(sticker.category);
    elements.modalTags.innerHTML = sticker.tags.map(tag => `<span class="sticker-tag">#${tag}</span>`).join('');
    elements.modalLikes.textContent = `${sticker.likes || 0} likes`;
    elements.modalRank.textContent = `Rank #${sticker.rank || '?'}`;
    
    elements.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    elements.modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ==========================================
// Utility Functions
// ==========================================
function clearForm() {
    elements.stickerUrl.value = '';
    elements.stickerName.value = '';
    elements.stickerCategory.value = 'cute';
    elements.stickerTags.value = '';
    clearFilePreview();
}

function showLoading(show) {
    if (show) {
        elements.loading.classList.add('active');
    } else {
        elements.loading.classList.remove('active');
    }
}

function showToast(message, type = 'success') {
    elements.toast.textContent = message;
    elements.toast.className = `toast active ${type}`;
    
    setTimeout(() => {
        elements.toast.classList.remove('active');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Make functions globally available
window.deleteSticker = deleteSticker;
window.toggleLike = toggleLike;
window.openModal = openModal;
