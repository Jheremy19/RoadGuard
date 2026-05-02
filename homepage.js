let hazards = [];
let currentUser = null;
let mapInstance = null;
let mapMarkers = [];
let nextId = 1;

const CEBU_CITY_CENTER = [10.3157, 123.8854];
const CEBU_ZOOM = 13;

function loadCurrentUser() {
    const storedUser = localStorage.getItem('roadguard_current_user');
    if (!storedUser) {
        window.location.href = 'login.html';
        return null;
    }
    currentUser = JSON.parse(storedUser);
    return currentUser;
}

function loadHazards() {
    const stored = localStorage.getItem("roadguard_hazards");
    if (stored) {
        hazards = JSON.parse(stored);
        nextId = hazards.reduce((max, h) => {
            const idNum = parseInt(h.id.substring(1)) || 0;
            return Math.max(max, idNum);
        }, 0) + 1;
    } else {
        hazards = [
            {
                id: "h1", type: "Pothole", description: "Deep pothole along Colon Street near McDo",
                latitude: 10.2969, longitude: 123.8975, imageData: null,
                status: "Pending", userId: "demo", createdAt: new Date().toISOString(), 
                reporterName: "Juan Dela Cruz", reporterAvatar: "JD"
            },
            {
                id: "h2", type: "Fallen Tree", description: "Large acacia tree blocking the right lane in Banilad",
                latitude: 10.3385, longitude: 123.9098, imageData: null,
                status: "In Progress", userId: "demo", createdAt: new Date().toISOString(), 
                reporterName: "Maria Santos", reporterAvatar: "MS"
            },
            {
                id: "h3", type: "Flooding", description: "Street flooding knee-deep near SM City Cebu",
                latitude: 10.3106, longitude: 123.9153, imageData: null,
                status: "Pending", userId: "demo", createdAt: new Date().toISOString(), 
                reporterName: "Rey Fernandez", reporterAvatar: "RF"
            }
        ];
        nextId = 4;
        saveHazards();
    }
}

function saveHazards() {
    localStorage.setItem("roadguard_hazards", JSON.stringify(hazards));
}

function initMap() {
    const mapContainer = document.getElementById('homepageMap');
    if (!mapContainer) {
        console.error('Map container not found!');
        return;
    }
    
    // Remove existing map instance if it exists
    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
    }
    
    // Create new map
    mapInstance = L.map('homepageMap', {
        center: CEBU_CITY_CENTER,
        zoom: CEBU_ZOOM,
        zoomControl: true,
        fadeAnimation: true,
        zoomAnimation: true,
        markerZoomAnimation: true
    });
    
    // Use OpenStreetMap tiles (more reliable)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 10
    }).addTo(mapInstance);
    
    // Force map to recalculate its size
    setTimeout(() => {
        if (mapInstance) {
            mapInstance.invalidateSize();
        }
    }, 100);
    
    // Also invalidate on window resize
    window.addEventListener('resize', () => {
        if (mapInstance) {
            setTimeout(() => mapInstance.invalidateSize(), 100);
        }
    });
    
    // Invalidate size when coming back from other pages
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && mapInstance) {
            setTimeout(() => mapInstance.invalidateSize(), 100);
        }
    });
    
    updateMapMarkers();
}

function updateMapMarkers() {
    if (!mapInstance) {
        console.log('Map not initialized yet');
        return;
    }
    
    // Clear existing markers
    if (mapMarkers.length > 0) {
        mapMarkers.forEach(marker => {
            if (mapInstance && marker) {
                mapInstance.removeLayer(marker);
            }
        });
        mapMarkers = [];
    }
    
    // Add markers for each hazard
    hazards.forEach(hazard => {
        if (hazard.latitude && hazard.longitude) {
            // Create custom icon based on status
            const iconColor = hazard.status === 'Resolved' ? '#5CFF5C' : (hazard.status === 'In Progress' ? '#f9c74f' : '#f9844a');
            
            const customIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="background-color: ${iconColor}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);"><i class="fas fa-exclamation-triangle" style="font-size: 10px; color: white;"></i></div>`,
                iconSize: [24, 24],
                popupAnchor: [0, -12]
            });
            
            const marker = L.marker([hazard.latitude, hazard.longitude], { icon: customIcon });
            
            // Create popup content
            const popupContent = `
                <div style="min-width: 180px; padding: 5px;">
                    <strong style="color: #0d4a2e; font-size: 14px;">${hazard.type}</strong><br>
                    <p style="font-size: 12px; margin: 5px 0;">${hazard.description.substring(0, 80)}${hazard.description.length > 80 ? '...' : ''}</p>
                    <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; margin-top: 5px; background: ${iconColor}; color: ${hazard.status === 'Pending' ? 'white' : '#1e2a3e'};">${hazard.status}</span>
                    <br><small style="font-size: 10px;">Reported by: ${hazard.reporterName || 'Citizen'}</small>
                </div>
            `;
            marker.bindPopup(popupContent);
            
            // Add click handler for bottom sheet
            marker.on('click', () => {
                showBottomSheet(hazard);
            });
            
            marker.addTo(mapInstance);
            mapMarkers.push(marker);
        }
    });
}

function showBottomSheet(hazard) {
    const bottomSheet = document.getElementById('bottomSheet');
    const overlay = document.getElementById('bottomSheetOverlay');
    
    if (!bottomSheet || !overlay) return;
    
    document.getElementById('sheetHazardType').textContent = hazard.type;
    document.getElementById('sheetReporterInitials').textContent = hazard.reporterAvatar || hazard.reporterName.charAt(0);
    document.getElementById('sheetReporterName').textContent = hazard.reporterName || 'Anonymous';
    document.getElementById('sheetReportDate').textContent = new Date(hazard.createdAt).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('sheetDescription').textContent = hazard.description;
    document.getElementById('sheetLocation').textContent = `${hazard.latitude.toFixed(4)}, ${hazard.longitude.toFixed(4)}`;
    
    const statusBadge = document.getElementById('sheetStatus');
    statusBadge.textContent = hazard.status;
    statusBadge.className = 'sheet-status-badge';
    if (hazard.status === 'Resolved') statusBadge.classList.add('status-resolved');
    else if (hazard.status === 'In Progress') statusBadge.classList.add('status-in-progress');
    else statusBadge.classList.add('status-pending');
    
    const imageContainer = document.getElementById('sheetImageContainer');
    if (hazard.imageData) {
        imageContainer.innerHTML = `<img src="${hazard.imageData}" class="sheet-image" alt="Hazard photo">`;
    } else {
        imageContainer.innerHTML = `<div class="no-image-placeholder"><i class="fas fa-camera"></i><p>No photo uploaded</p></div>`;
    }
    
    bottomSheet.setAttribute('data-current-hazard', hazard.id);
    bottomSheet.classList.add('open');
    overlay.classList.add('open');
    
    const isAdmin = currentUser.role === 'admin';
    const adminActions = document.getElementById('sheetAdminActions');
    if (adminActions) {
        adminActions.style.display = isAdmin ? 'block' : 'none';
    }
}

function closeBottomSheet() {
    const bottomSheet = document.getElementById('bottomSheet');
    const overlay = document.getElementById('bottomSheetOverlay');
    if (bottomSheet) bottomSheet.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
}

function updateHazardFromSheet(status) {
    const hazardId = document.getElementById('bottomSheet').getAttribute('data-current-hazard');
    const hazard = hazards.find(h => h.id === hazardId);
    if (hazard) {
        hazard.status = status;
        saveHazards();
        updateMapMarkers();
        const statusBadge = document.getElementById('sheetStatus');
        statusBadge.textContent = status;
        statusBadge.className = 'sheet-status-badge';
        if (status === 'Resolved') statusBadge.classList.add('status-resolved');
        else if (status === 'In Progress') statusBadge.classList.add('status-in-progress');
        else statusBadge.classList.add('status-pending');
        
        const msg = document.getElementById('sheetUpdateMsg');
        if (msg) {
            msg.textContent = `Status updated to ${status}!`;
            msg.style.display = 'block';
            setTimeout(() => msg.style.display = 'none', 2000);
        }
    }
}

function deleteHazardFromSheet() {
    const hazardId = document.getElementById('bottomSheet').getAttribute('data-current-hazard');
    if (confirm('Are you sure you want to delete this hazard report?')) {
        hazards = hazards.filter(h => h.id !== hazardId);
        saveHazards();
        updateMapMarkers();
        closeBottomSheet();
        alert('Hazard report deleted successfully.');
    }
}

function searchLocation() {
    const query = document.getElementById('searchLocation').value.trim();
    if (!query) return;
    
    const searchBtn = document.getElementById('searchBtn');
    const originalText = searchBtn.innerHTML;
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i>';
    
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Cebu, Philippines")}&limit=5`)
        .then(response => response.json())
        .then(data => {
            searchBtn.innerHTML = originalText;
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                mapInstance.setView([lat, lon], 15);
            } else {
                alert(`Location "${query}" not found. Try specific areas like Colon, IT Park, or Banilad.`);
            }
        })
        .catch(() => {
            searchBtn.innerHTML = originalText;
            alert("Error searching location");
        });
}

window.showBottomSheetFromMyReports = function(hazardId) {
    const hazard = hazards.find(h => h.id === hazardId);
    if (hazard) {
        showBottomSheet(hazard);
    }
};

function init() {
    console.log('Initializing homepage...');
    
    if (!loadCurrentUser()) {
        return;
    }
    
    loadHazards();
    
    // Initialize map after a short delay to ensure DOM is ready
    setTimeout(() => {
        initMap();
    }, 200);
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const nav = item.getAttribute('data-nav');
            if (nav === 'home') return;
            if (nav === 'report') window.location.href = 'report.html';
            if (nav === 'myreports') window.location.href = 'myreports.html';
            if (nav === 'profile') window.location.href = 'profile.html';
        });
    });
    
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) searchBtn.addEventListener('click', searchLocation);
    
    const searchInput = document.getElementById('searchLocation');
    if (searchInput) searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchLocation();
    });
    
    const closeSheetBtn = document.getElementById('closeBottomSheet');
    if (closeSheetBtn) closeSheetBtn.addEventListener('click', closeBottomSheet);
    
    const overlay = document.getElementById('bottomSheetOverlay');
    if (overlay) overlay.addEventListener('click', closeBottomSheet);
    
    const updatePending = document.getElementById('sheetUpdatePending');
    if (updatePending) updatePending.addEventListener('click', () => updateHazardFromSheet('Pending'));
    
    const updateProgress = document.getElementById('sheetUpdateProgress');
    if (updateProgress) updateProgress.addEventListener('click', () => updateHazardFromSheet('In Progress'));
    
    const updateResolved = document.getElementById('sheetUpdateResolved');
    if (updateResolved) updateResolved.addEventListener('click', () => updateHazardFromSheet('Resolved'));
    
    const deleteBtn = document.getElementById('sheetDelete');
    if (deleteBtn) deleteBtn.addEventListener('click', deleteHazardFromSheet);
}

// Start the app
init();

// Check if there's a hazard to view from my reports
const viewHazard = localStorage.getItem('view_hazard_location');
if (viewHazard) {
    const hazard = JSON.parse(viewHazard);
    setTimeout(() => {
        if (mapInstance) {
            mapInstance.setView([hazard.lat, hazard.lng], 16);
            // Add a temporary marker
            const tempMarker = L.marker([hazard.lat, hazard.lng]).addTo(mapInstance);
            tempMarker.bindPopup(`<strong>${hazard.type}</strong><br>Your reported hazard`).openPopup();
            setTimeout(() => {
                mapInstance.removeLayer(tempMarker);
            }, 5000);
        }
    }, 500);
    localStorage.removeItem('view_hazard_location');
}