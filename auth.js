let users = JSON.parse(localStorage.getItem('roadguard_users')) || [
    { username: "demo", password: "demo123", fullname: "Demo User", email: "demo@roadguard.com", role: "citizen" }
];
let tempSignupData = {};

function saveUsers() {
    localStorage.setItem('roadguard_users', JSON.stringify(users));
}

// Tab switching
const loginTab = document.getElementById('loginTabBtn');
const signupTab = document.getElementById('signupTabBtn');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const signupPasswordForm = document.getElementById('signupPasswordForm');

loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
    signupPasswordForm.style.display = 'none';
    signupForm.style.display = 'block';
});

signupTab.addEventListener('click', () => {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    loginForm.classList.remove('active');
    signupForm.classList.add('active');
    signupForm.style.display = 'block';
    signupPasswordForm.style.display = 'none';
});

// Login
document.getElementById('signinBtn').addEventListener('click', () => {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        alert("Please enter both username and password");
        return;
    }
    
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        localStorage.setItem('roadguard_current_user', JSON.stringify(user));
        window.location.href = 'homepage.html';
    } else {
        alert("Invalid username or password. Try 'demo' / 'demo123'");
    }
});

// Signup Step 1
document.getElementById('signupNextBtn').addEventListener('click', () => {
    const fullname = document.getElementById('signupFullname').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    
    if (!fullname || !email) {
        alert("Please enter both full name and email");
        return;
    }
    
    if (!email.includes('@')) {
        alert("Please enter a valid email address");
        return;
    }
    
    tempSignupData = { fullname, email };
    signupForm.style.display = 'none';
    signupPasswordForm.style.display = 'block';
});

// Signup Step 2 - Back
document.getElementById('signupBackBtn').addEventListener('click', () => {
    signupPasswordForm.style.display = 'none';
    signupForm.style.display = 'block';
});

// Signup Complete
document.getElementById('signupCompleteBtn').addEventListener('click', () => {
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    if (!password || !confirmPassword) {
        alert("Please enter and confirm your password");
        return;
    }
    
    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }
    
    if (password.length < 4) {
        alert("Password must be at least 4 characters");
        return;
    }
    
    let username = tempSignupData.email.split('@')[0];
    let counter = 1;
    while (users.some(u => u.username === username)) {
        username = tempSignupData.email.split('@')[0] + counter;
        counter++;
    }
    
    const newUser = {
        username: username,
        password: password,
        fullname: tempSignupData.fullname,
        email: tempSignupData.email,
        role: "citizen"
    };
    
    users.push(newUser);
    saveUsers();
    localStorage.setItem('roadguard_current_user', JSON.stringify(newUser));
    
    alert(`Account created successfully! Your username is: ${username}`);
    window.location.href = 'homepage.html';
});

// Social login demo
document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        alert(`Demo: ${btn.classList.contains('google') ? 'Google' : btn.classList.contains('apple') ? 'Apple' : 'Facebook'} login would work here in production. For demo, please use regular login.`);
    });
});