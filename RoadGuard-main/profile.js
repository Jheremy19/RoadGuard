let currentUser = null;
let hazards = [];

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
    }
}

function loadProfile() {
    document.getElementById('profileFullname').textContent = currentUser.fullname || currentUser.username;
    document.getElementById('profileUsername').textContent = '@' + currentUser.username;
    document.getElementById('profileEmail').textContent = currentUser.email || 'No email provided';
    
    const userReports = hazards.filter(h => h.userId === currentUser.username);
    const activeReports = userReports.filter(h => h.status !== 'Resolved');
    document.getElementById('totalReportsCount').textContent = userReports.length;
    document.getElementById('activeReportsCount').textContent = activeReports.length;
}

function logout() {
    localStorage.removeItem('roadguard_current_user');
    window.location.href = 'login.html';
}

function init() {
    if (!loadCurrentUser()) return;
    loadHazards();
    loadProfile();
    
    document.getElementById('backBtn').addEventListener('click', () => {
        window.location.href = 'homepage.html';
    });
    
    document.getElementById('settingsBtn').addEventListener('click', () => {
        window.location.href = 'settings.html';
    });
    
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    document.getElementById('toggleRoleBtn').addEventListener('click', () => {
        if (currentUser.username === 'demo') {
            currentUser.role = currentUser.role === 'citizen' ? 'admin' : 'citizen';
            localStorage.setItem('roadguard_current_user', JSON.stringify(currentUser));
            alert(`Switched to ${currentUser.role.toUpperCase()} mode`);
            loadProfile();
        } else {
            alert("Admin mode toggle is only available for demo account.");
        }
    });
}

init();