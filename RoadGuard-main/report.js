let currentUser = null;
let miniMap = null;
let mapMarker = null;

function loadCurrentUser() {
    const storedUser = localStorage.getItem('roadguard_current_user');
    if (!storedUser) {
        window.location.href = 'login.html';
        return null;
    }
    currentUser = JSON.parse(storedUser);
    console.log('Current user:', currentUser.username);
    return currentUser;
}

function initMiniMap() {
    const mapContainer = document.getElementById('miniMap');
    if (!mapContainer) {
        console.error('MiniMap container not found');
        return;
    }
    
    // Remove existing map if any
    if (miniMap) {
        miniMap.remove();
        miniMap = null;
    }
    
    // Center on Cebu City
    const cebuCenter = [10.3157, 123.8854];
    
    // Initialize map
    miniMap = L.map('miniMap').setView(cebuCenter, 13);
    
    // Add OpenStreetMap tiles (reliable)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        maxZoom: 19,
        minZoom: 10
    }).addTo(miniMap);
    
    // Add click handler to set location
    miniMap.on('click', function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        
        document.getElementById('latInput').value = lat.toFixed(6);
        document.getElementById('lngInput').value = lng.toFixed(6);
        
        // Update marker on map
        if (mapMarker) {
            miniMap.removeLayer(mapMarker);
        }
        
        mapMarker = L.marker([lat, lng]).addTo(miniMap);
        
        // Show popup with coordinates
        mapMarker.bindPopup(`Selected location:<br>${lat.toFixed(6)}, ${lng.toFixed(6)}`).openPopup();
    });
    
    // Force map to render correctly
    setTimeout(() => {
        if (miniMap) {
            miniMap.invalidateSize();
        }
    }, 100);
    
    // Also invalidate on window resize
    window.addEventListener('resize', () => {
        if (miniMap) {
            setTimeout(() => miniMap.invalidateSize(), 100);
        }
    });
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        const btn = document.getElementById('getLocationBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Getting location...';
        btn.disabled = true;
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                document.getElementById('latInput').value = lat.toFixed(6);
                document.getElementById('lngInput').value = lng.toFixed(6);
                
                // Center map on user location
                if (miniMap) {
                    miniMap.setView([lat, lng], 16);
                    
                    // Update marker
                    if (mapMarker) {
                        miniMap.removeLayer(mapMarker);
                    }
                    mapMarker = L.marker([lat, lng]).addTo(miniMap);
                    mapMarker.bindPopup(`Your current location:<br>${lat.toFixed(6)}, ${lng.toFixed(6)}`).openPopup();
                }
                
                btn.innerHTML = originalText;
                btn.disabled = false;
                alert('Location detected successfully!');
            },
            (err) => {
                btn.innerHTML = originalText;
                btn.disabled = false;
                
                let errorMsg = "Location error: ";
                switch(err.code) {
                    case err.PERMISSION_DENIED:
                        errorMsg += "Please allow location access. You can also click on the map to set location.";
                        break;
                    case err.POSITION_UNAVAILABLE:
                        errorMsg += "Location unavailable. Please click on the map to set location manually.";
                        break;
                    default:
                        errorMsg += err.message;
                }
                alert(errorMsg);
            }
        );
    } else {
        alert("Geolocation is not supported by your browser. Please click on the map to set location.");
    }
}

function loadHazards() {
    const stored = localStorage.getItem("roadguard_hazards");
    if (stored) {
        return JSON.parse(stored);
    }
    return [];
}

function saveHazards(hazards) {
    localStorage.setItem("roadguard_hazards", JSON.stringify(hazards));
}

function setupReportForm() {
    const form = document.getElementById('hazardReportForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const type = document.getElementById('hazardType').value;
        const description = document.getElementById('description').value || "No description";
        let lat = document.getElementById('latInput').value;
        let lng = document.getElementById('lngInput').value;
        
        if (!lat || !lng) {
            alert("Please select a location on the map or use 'Get Current Location'.");
            return;
        }
        
        lat = parseFloat(lat);
        lng = parseFloat(lng);
        const imageFile = document.getElementById('hazardImage').files[0];
        
        const hazards = loadHazards();
        let nextId = hazards.reduce((max, h) => {
            const idNum = parseInt(h.id.substring(1)) || 0;
            return Math.max(max, idNum);
        }, 0) + 1;
        
        const processReport = (imgData) => {
            const newHazard = {
                id: "h" + nextId,
                type: type,
                description: description,
                latitude: lat,
                longitude: lng,
                imageData: imgData,
                status: "Pending",
                userId: currentUser.username,
                createdAt: new Date().toISOString(),
                reporterName: currentUser.fullname || currentUser.username,
                reporterAvatar: (currentUser.fullname || currentUser.username).charAt(0).toUpperCase()
            };
            hazards.push(newHazard);
            saveHazards(hazards);
            alert("✅ Hazard reported successfully! Thank you for helping keep Cebu roads safe.");
            window.location.href = 'homepage.html';
        };
        
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (ev) => processReport(ev.target.result);
            reader.readAsDataURL(imageFile);
        } else {
            processReport(null);
        }
    });
    
    document.getElementById('getLocationBtn').addEventListener('click', getCurrentLocation);
    
    document.getElementById('hazardImage').addEventListener('change', (e) => {
        const file = e.target.files[0];
        const previewDiv = document.getElementById('imagePreviewContainer');
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => previewDiv.innerHTML = `<img src="${ev.target.result}" class="image-preview" alt="preview">`;
            reader.readAsDataURL(file);
        } else previewDiv.innerHTML = '';
    });
}

function init() {
    console.log('Initializing report page...');
    
    if (!loadCurrentUser()) return;
    
    // Initialize map
    initMiniMap();
    
    // Setup form
    setupReportForm();
    
    // Back button
    document.getElementById('backBtn').addEventListener('click', () => {
        window.location.href = 'homepage.html';
    });
}

// Wait for DOM to load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}