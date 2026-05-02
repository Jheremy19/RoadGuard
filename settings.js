let currentUser = null;

// Load user settings from localStorage
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('roadguard_settings')) || {
        theme: 'light',
        language: 'en',
        pushNotif: true,
        emailUpdates: true,
        publicReports: true,
        locationVisibility: true
    };
    return settings;
}

function saveSettings(settings) {
    localStorage.setItem('roadguard_settings', JSON.stringify(settings));
    applyTheme(settings.theme);
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

function loadCurrentUser() {
    const storedUser = localStorage.getItem('roadguard_current_user');
    if (!storedUser) {
        window.location.href = 'login.html';
        return null;
    }
    currentUser = JSON.parse(storedUser);
    return currentUser;
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('open');
    document.body.style.overflow = '';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('open');
    });
    document.body.style.overflow = '';
}

// Edit Profile
function openEditProfile() {
    document.getElementById('editFullname').value = currentUser.fullname || '';
    document.getElementById('editEmail').value = currentUser.email || '';
    document.getElementById('editBio').value = currentUser.bio || '';
    openModal('editProfileModal');
}

function saveProfile() {
    const newFullname = document.getElementById('editFullname').value.trim();
    const newEmail = document.getElementById('editEmail').value.trim();
    const newBio = document.getElementById('editBio').value.trim();
    
    if (!newFullname || !newEmail) {
        alert('Please fill in all required fields');
        return;
    }
    
    currentUser.fullname = newFullname;
    currentUser.email = newEmail;
    currentUser.bio = newBio;
    
    // Update in users array
    let users = JSON.parse(localStorage.getItem('roadguard_users')) || [];
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('roadguard_users', JSON.stringify(users));
    }
    
    localStorage.setItem('roadguard_current_user', JSON.stringify(currentUser));
    alert('Profile updated successfully!');
    closeModal('editProfileModal');
}

// Change Password
function openChangePassword() {
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
    openModal('changePasswordModal');
}

function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    if (currentPassword !== currentUser.password) {
        alert('Current password is incorrect');
        return;
    }
    
    if (newPassword.length < 4) {
        alert('New password must be at least 4 characters');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('New passwords do not match');
        return;
    }
    
    currentUser.password = newPassword;
    
    // Update in users array
    let users = JSON.parse(localStorage.getItem('roadguard_users')) || [];
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('roadguard_users', JSON.stringify(users));
    }
    
    localStorage.setItem('roadguard_current_user', JSON.stringify(currentUser));
    alert('Password changed successfully!');
    closeModal('changePasswordModal');
}

// Theme selection
function openThemeSelector() {
    const settings = loadSettings();
    document.querySelectorAll('.theme-option').forEach(option => {
        if (option.getAttribute('data-theme') === settings.theme) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
    openModal('themeModal');
}

function selectTheme(theme) {
    const settings = loadSettings();
    settings.theme = theme;
    saveSettings(settings);
    document.getElementById('themeValue').textContent = theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'Auto (System)';
    closeModal('themeModal');
}

// Language selection
function openLanguageSelector() {
    const settings = loadSettings();
    document.querySelectorAll('.language-option').forEach(option => {
        if (option.getAttribute('data-lang') === settings.language) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
    openModal('languageModal');
}

function selectLanguage(lang) {
    const settings = loadSettings();
    settings.language = lang;
    saveSettings(settings);
    const languageNames = { en: 'English', fil: 'Filipino (Tagalog)', ceb: 'Cebuano' };
    document.getElementById('languageValue').textContent = languageNames[lang];
    closeModal('languageModal');
}

// Toggle handlers
function initToggles() {
    const settings = loadSettings();
    
    document.getElementById('pushNotifToggle').checked = settings.pushNotif;
    document.getElementById('emailUpdatesToggle').checked = settings.emailUpdates;
    document.getElementById('publicReportsToggle').checked = settings.publicReports;
    document.getElementById('locationVisibilityToggle').checked = settings.locationVisibility;
    
    document.getElementById('pushNotifToggle').addEventListener('change', (e) => {
        settings.pushNotif = e.target.checked;
        saveSettings(settings);
    });
    
    document.getElementById('emailUpdatesToggle').addEventListener('change', (e) => {
        settings.emailUpdates = e.target.checked;
        saveSettings(settings);
    });
    
    document.getElementById('publicReportsToggle').addEventListener('change', (e) => {
        settings.publicReports = e.target.checked;
        saveSettings(settings);
        alert(e.target.checked ? 'Your reports are now public' : 'Your reports are now private');
    });
    
    document.getElementById('locationVisibilityToggle').addEventListener('change', (e) => {
        settings.locationVisibility = e.target.checked;
        saveSettings(settings);
        alert(e.target.checked ? 'Location visibility enabled' : 'Location visibility disabled');
    });
}

function init() {
    if (!loadCurrentUser()) return;
    
    // Load and display current settings
    const settings = loadSettings();
    document.getElementById('themeValue').textContent = settings.theme === 'light' ? 'Light' : settings.theme === 'dark' ? 'Dark' : 'Auto (System)';
    const languageNames = { en: 'English', fil: 'Filipino (Tagalog)', ceb: 'Cebuano' };
    document.getElementById('languageValue').textContent = languageNames[settings.language] || 'English';
    
    initToggles();
    applyTheme(settings.theme);
    
    // Back button
    document.getElementById('backBtn').addEventListener('click', () => {
        window.location.href = 'profile.html';
    });
    
    // Settings item clicks
    document.getElementById('editProfileBtn').addEventListener('click', openEditProfile);
    document.getElementById('changePasswordBtn').addEventListener('click', openChangePassword);
    document.getElementById('appearanceThemeBtn').addEventListener('click', openThemeSelector);
    document.getElementById('languageBtn').addEventListener('click', openLanguageSelector);
    
    // Modal close buttons
    document.querySelectorAll('.close-modal, .modal-cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => closeAllModals());
    });
    
    // Modal save buttons
    document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);
    document.getElementById('savePasswordBtn').addEventListener('click', changePassword);
    
    // Theme options
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', () => selectTheme(option.getAttribute('data-theme')));
    });
    
    // Language options
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', () => selectLanguage(option.getAttribute('data-lang')));
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
}

init();