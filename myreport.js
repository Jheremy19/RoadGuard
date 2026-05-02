// Global variables
let currentUser = null;
let allHazards = [];

// Load current user from localStorage
function loadCurrentUser() {
    console.log('Loading current user from localStorage');
    const storedUser = localStorage.getItem('roadguard_current_user');
    
    if (!storedUser) {
        console.log('No user found, redirecting to login');
        window.location.href = 'login.html';
        return null;
    }
    
    currentUser = JSON.parse(storedUser);
    console.log('Current user loaded:', currentUser.username);
    return currentUser;
}

// Load all hazards from localStorage
function loadAllHazards() {
    console.log('Loading all hazards from localStorage');
    const stored = localStorage.getItem('roadguard_hazards');
    
    if (stored) {
        allHazards = JSON.parse(stored);
        console.log('Hazards loaded:', allHazards.length);
    } else {
        console.log('No hazards found, creating demo data');
        allHazards = [
            {
                id: "h1_" + Date.now(),
                type: "Pothole",
                description: "Deep pothole along Colon Street near McDo. About 2 feet wide, dangerous for motorcycles.",
                latitude: 10.2969,
                longitude: 123.8975,
                imageData: null,
                status: "Pending",
                userId: currentUser?.username || "demo",
                createdAt: new Date().toISOString(),
                reporterName: currentUser?.fullname || "Juan Dela Cruz",
                reporterAvatar: (currentUser?.fullname || "Juan Dela Cruz").charAt(0)
            },
            {
                id: "h2_" + Date.now(),
                type: "Fallen Tree",
                description: "Large acacia tree blocking the right lane in Banilad after the storm.",
                latitude: 10.3385,
                longitude: 123.9098,
                imageData: null,
                status: "In Progress",
                userId: currentUser?.username || "demo",
                createdAt: new Date().toISOString(),
                reporterName: currentUser?.fullname || "Maria Santos",
                reporterAvatar: (currentUser?.fullname || "Maria Santos").charAt(0)
            },
            {
                id: "h3_" + Date.now(),
                type: "Flooding",
                description: "Street flooding knee-deep near SM City Cebu after 30 mins of rain.",
                latitude: 10.3106,
                longitude: 123.9153,
                imageData: null,
                status: "Pending",
                userId: currentUser?.username || "demo",
                createdAt: new Date().toISOString(),
                reporterName: currentUser?.fullname || "Rey Fernandez",
                reporterAvatar: (currentUser?.fullname || "Rey Fernandez").charAt(0)
            }
        ];
        saveAllHazards();
    }
}

// Save all hazards to localStorage
function saveAllHazards() {
    localStorage.setItem('roadguard_hazards', JSON.stringify(allHazards));
    console.log('Hazards saved to localStorage');
}

// Get user's reports
function getUserReports() {
    if (!currentUser) {
        console.log('No current user');
        return [];
    }
    
    console.log('Filtering reports for user:', currentUser.username);
    const userReports = allHazards.filter(hazard => hazard.userId === currentUser.username);
    console.log('Found reports:', userReports.length);
    
    return userReports;
}

// Show bottom sheet with full details
function showReportDetails(hazard) {
    // Create bottom sheet if it doesn't exist
    let bottomSheet = document.getElementById('reportDetailSheet');
    let overlay = document.getElementById('reportDetailOverlay');
    
    if (!bottomSheet) {
        // Create bottom sheet elements dynamically
        const sheetHTML = `
            <div id="reportDetailOverlay" class="bottom-sheet-overlay"></div>
            <div id="reportDetailSheet" class="bottom-sheet">
                <div class="bottom-sheet-header">
                    <div class="sheet-handle"></div>
                    <button id="closeDetailSheet" class="close-sheet-btn"><i class="fas fa-times"></i></button>
                </div>
                <div class="bottom-sheet-content">
                    <div id="detailImageContainer" class="sheet-image-container"></div>
                    <div class="sheet-title-row">
                        <h3 id="detailHazardType">Hazard Type</h3>
                        <span id="detailStatus" class="sheet-status-badge status-pending">Pending</span>
                    </div>
                    <div class="sheet-reporter-info">
                        <div class="reporter-avatar" id="detailReporterInitials">JD</div>
                        <div class="reporter-details">
                            <strong id="detailReporterName">Reporter Name</strong>
                            <span class="reporter-label">Reported by you</span>
                        </div>
                        <div class="report-date">
                            <i class="fas fa-calendar-alt"></i>
                            <span id="detailReportDate"></span>
                        </div>
                    </div>
                    <div class="sheet-section">
                        <h4><i class="fas fa-align-left"></i> Description</h4>
                        <p id="detailDescription"></p>
                    </div>
                    <div class="sheet-section">
                        <h4><i class="fas fa-map-marker-alt"></i> Location</h4>
                        <p id="detailLocation"></p>
                        <button id="viewOnMapBtn" class="view-on-map-btn">📍 View on Map</button>
                    </div>
                    <div id="detailAdminActions" class="sheet-admin-actions" style="display: none;">
                        <h4><i class="fas fa-tasks"></i> Admin Actions</h4>
                        <div class="admin-action-buttons">
                            <button id="detailUpdatePending" class="admin-btn pending-btn">⏳ Pending</button>
                            <button id="detailUpdateProgress" class="admin-btn progress-btn">⚙️ In Progress</button>
                            <button id="detailUpdateResolved" class="admin-btn resolved-btn">✅ Resolved</button>
                            <button id="detailDelete" class="admin-btn delete-btn">🗑️ Delete</button>
                        </div>
                        <div id="detailUpdateMsg" class="update-msg"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', sheetHTML);
        
        bottomSheet = document.getElementById('reportDetailSheet');
        overlay = document.getElementById('reportDetailOverlay');
        
        // Add event listeners for close buttons
        document.getElementById('closeDetailSheet').addEventListener('click', closeDetailSheet);
        overlay.addEventListener('click', closeDetailSheet);
    }
    
    // Populate the bottom sheet with hazard data
    document.getElementById('detailHazardType').textContent = hazard.type;
    document.getElementById('detailReporterInitials').textContent = hazard.reporterAvatar || hazard.reporterName.charAt(0);
    document.getElementById('detailReporterName').textContent = hazard.reporterName || 'Anonymous';
    document.getElementById('detailReportDate').textContent = new Date(hazard.createdAt).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('detailDescription').textContent = hazard.description;
    document.getElementById('detailLocation').textContent = `${hazard.latitude?.toFixed(6)}, ${hazard.longitude?.toFixed(6)}`;
    
    // Set status badge
    const statusBadge = document.getElementById('detailStatus');
    statusBadge.textContent = hazard.status;
    statusBadge.className = 'sheet-status-badge';
    if (hazard.status === 'Resolved') statusBadge.classList.add('status-resolved');
    else if (hazard.status === 'In Progress') statusBadge.classList.add('status-in-progress');
    else statusBadge.classList.add('status-pending');
    
    // Handle image
    const imageContainer = document.getElementById('detailImageContainer');
    if (hazard.imageData) {
        imageContainer.innerHTML = `<img src="${hazard.imageData}" class="sheet-image" alt="Hazard photo">`;
    } else {
        imageContainer.innerHTML = `<div class="no-image-placeholder"><i class="fas fa-camera"></i><p>No photo uploaded</p></div>`;
    }
    
    // Store hazard id for actions
    bottomSheet.setAttribute('data-current-hazard', hazard.id);
    
    // Show/hide admin actions based on user role
    const isAdmin = currentUser.role === 'admin';
    const adminActions = document.getElementById('detailAdminActions');
    if (adminActions) {
        adminActions.style.display = isAdmin ? 'block' : 'none';
    }
    
    // Setup view on map button
    const viewOnMapBtn = document.getElementById('viewOnMapBtn');
    if (viewOnMapBtn) {
        // Remove old listener to avoid duplicates
        const newBtn = viewOnMapBtn.cloneNode(true);
        viewOnMapBtn.parentNode.replaceChild(newBtn, viewOnMapBtn);
        newBtn.addEventListener('click', () => {
            // Store the location to view on homepage map
            localStorage.setItem('view_hazard_location', JSON.stringify({
                lat: hazard.latitude,
                lng: hazard.longitude,
                type: hazard.type
            }));
            closeDetailSheet();
            window.location.href = 'homepage.html';
        });
    }
    
    // Setup admin action buttons
    if (isAdmin) {
        const updatePending = document.getElementById('detailUpdatePending');
        const updateProgress = document.getElementById('detailUpdateProgress');
        const updateResolved = document.getElementById('detailUpdateResolved');
        const deleteBtn = document.getElementById('detailDelete');
        
        // Remove old listeners and add new ones
        const newPending = updatePending.cloneNode(true);
        const newProgress = updateProgress.cloneNode(true);
        const newResolved = updateResolved.cloneNode(true);
        const newDelete = deleteBtn.cloneNode(true);
        
        updatePending.parentNode.replaceChild(newPending, updatePending);
        updateProgress.parentNode.replaceChild(newProgress, updateProgress);
        updateResolved.parentNode.replaceChild(newResolved, updateResolved);
        deleteBtn.parentNode.replaceChild(newDelete, deleteBtn);
        
        newPending.addEventListener('click', () => updateHazardStatus(hazard.id, 'Pending'));
        newProgress.addEventListener('click', () => updateHazardStatus(hazard.id, 'In Progress'));
        newResolved.addEventListener('click', () => updateHazardStatus(hazard.id, 'Resolved'));
        newDelete.addEventListener('click', () => deleteHazard(hazard.id));
    }
    
    // Show the bottom sheet
    bottomSheet.classList.add('open');
    overlay.classList.add('open');
}

function closeDetailSheet() {
    const bottomSheet = document.getElementById('reportDetailSheet');
    const overlay = document.getElementById('reportDetailOverlay');
    if (bottomSheet) bottomSheet.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
}

function updateHazardStatus(hazardId, newStatus) {
    const hazard = allHazards.find(h => h.id === hazardId);
    if (hazard) {
        hazard.status = newStatus;
        saveAllHazards();
        
        // Update the status badge in the bottom sheet
        const statusBadge = document.getElementById('detailStatus');
        statusBadge.textContent = newStatus;
        statusBadge.className = 'sheet-status-badge';
        if (newStatus === 'Resolved') statusBadge.classList.add('status-resolved');
        else if (newStatus === 'In Progress') statusBadge.classList.add('status-in-progress');
        else statusBadge.classList.add('status-pending');
        
        // Show success message
        const msg = document.getElementById('detailUpdateMsg');
        if (msg) {
            msg.textContent = `✅ Status updated to ${newStatus}!`;
            msg.style.display = 'block';
            setTimeout(() => msg.style.display = 'none', 2000);
        }
        
        // Refresh the reports list
        renderReports();
    }
}

function deleteHazard(hazardId) {
    if (confirm('⚠️ Are you sure you want to delete this hazard report? This action cannot be undone.')) {
        allHazards = allHazards.filter(h => h.id !== hazardId);
        saveAllHazards();
        closeDetailSheet();
        renderReports();
        alert('🗑️ Hazard report deleted successfully.');
    }
}

// Render the reports list
function renderReports() {
    const container = document.getElementById('myReportsList');
    if (!container) {
        console.error('Container myReportsList not found!');
        return;
    }
    
    const userReports = getUserReports();
    console.log('Rendering reports, count:', userReports.length);
    
    if (userReports.length === 0) {
        container.innerHTML = `
            <div class="loading-message" style="text-align: center; padding: 40px;">
                <i class="fas fa-info-circle" style="font-size: 3rem; color: #5CFF5C; margin-bottom: 15px; display: block;"></i>
                <p style="font-size: 1.1rem; margin-bottom: 10px;">You haven't reported any hazards yet.</p>
                <a href="report.html" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background: #5CFF5C; color: #0a2e1f; text-decoration: none; border-radius: 30px; font-weight: bold;">➕ Report your first hazard</a>
            </div>
        `;
        return;
    }
    
    let html = '';
    userReports.slice().reverse().forEach(hazard => {
        let statusClass = '';
        if (hazard.status === 'Resolved') statusClass = 'status-resolved';
        else if (hazard.status === 'In Progress') statusClass = 'status-in-progress';
        else statusClass = 'status-pending';
        
        // Format date
        let formattedDate = 'Unknown date';
        try {
            if (hazard.createdAt) {
                formattedDate = new Date(hazard.createdAt).toLocaleDateString('en-PH', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            }
        } catch(e) {
            formattedDate = 'Invalid date';
        }
        
        // Truncate description
        let descriptionText = hazard.description || 'No description';
        if (descriptionText.length > 80) {
            descriptionText = descriptionText.substring(0, 80) + '...';
        }
        
        // Status icon
        let statusIcon = '';
        if (hazard.status === 'Resolved') statusIcon = '✅';
        else if (hazard.status === 'In Progress') statusIcon = '⚙️';
        else statusIcon = '⏳';
        
        html += `
            <div class="report-card" data-id="${hazard.id}" style="cursor: pointer; transition: transform 0.2s;">
                <h4>
                    <span><i class="fas fa-exclamation-triangle"></i> ${escapeHtml(hazard.type || 'Unknown')}</span>
                    <span class="status-badge ${statusClass}">${statusIcon} ${hazard.status || 'Pending'}</span>
                </h4>
                <p>${escapeHtml(descriptionText)}</p>
                <div style="display: flex; justify-content: space-between; margin-top: 8px;">
                    <small><i class="fas fa-calendar"></i> ${formattedDate}</small>
                    <small><i class="fas fa-chevron-right"></i> Tap to expand</small>
                </div>
                ${hazard.imageData ? `<div><img src="${hazard.imageData}" class="image-preview" alt="Hazard photo" style="margin-top: 8px; max-width: 100%; border-radius: 12px; max-height: 100px; object-fit: cover;"></div>` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Add click handlers to report cards
    document.querySelectorAll('.report-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') return;
            const hazardId = card.getAttribute('data-id');
            const hazard = allHazards.find(h => h.id === hazardId);
            if (hazard) {
                showReportDetails(hazard);
            }
        });
    });
}

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Refresh function
function refresh() {
    console.log('Manual refresh triggered');
    loadAllHazards();
    renderReports();
}

// Initialize the page
function init() {
    console.log('=== INITIALIZING MY REPORTS PAGE ===');
    
    // Check if we have a user
    if (!loadCurrentUser()) {
        return;
    }
    
    // Load hazards
    loadAllHazards();
    
    // Render reports
    renderReports();
    
    // Setup event listeners
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'homepage.html';
        });
    }
    
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refresh);
    }
    
    console.log('=== INITIALIZATION COMPLETE ===');
}

// Wait for DOM to load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}