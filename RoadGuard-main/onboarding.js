const onboardingSteps = [
    {
        title: "Welcome to RoadGuard",
        description: "Your community-driven platform for reporting road hazards quickly and efficiently.",
        icon: "fas fa-road",
        imagePlaceholder: "🚦"
    },
    {
        title: "Spot a Problem?",
        description: "See a pothole, fallen tree, or broken streetlight? Report it instantly with photo & GPS location.",
        icon: "fas fa-eye",
        imagePlaceholder: "⚠️"
    },
    {
        title: "Track Every Step",
        description: "Follow your report in real-time. Get updates when authorities address the hazard.",
        icon: "fas fa-chart-line",
        imagePlaceholder: "📍"
    },
    {
        title: "Make a Difference Together",
        description: "Join thousands of citizens improving road safety and helping local agencies respond faster.",
        icon: "fas fa-handshake",
        imagePlaceholder: "🤝"
    }
];

let currentStep = 0;

function renderOnboarding() {
    const root = document.getElementById('onboardingRoot');
    const step = onboardingSteps[currentStep];
    const isFirst = currentStep === 0;
    const isLast = currentStep === onboardingSteps.length - 1;
    
    root.innerHTML = `
        <div class="onboarding-card">
            <div class="onboarding-header">
                <button class="back-btn" id="onboardingBack" ${isFirst ? 'style="visibility:hidden"' : ''}>
                    <i class="fas fa-arrow-left"></i> Back
                </button>
                <button class="skip-btn" id="onboardingSkip">
                    Skip <i class="fas fa-arrow-right"></i>
                </button>
            </div>
            
            <div class="onboarding-image">
                <div class="placeholder-img">
                    <i class="${step.icon}" style="font-size: 5rem; color: #0f3b2c;"></i>
                    <div style="position: absolute; font-size: 3rem;">${step.imagePlaceholder}</div>
                </div>
            </div>
            
            <h2 class="onboarding-title">${step.title}</h2>
            <p class="onboarding-desc">${step.description}</p>
            
            <div class="dot-indicators">
                ${onboardingSteps.map((_, idx) => `<div class="dot ${idx === currentStep ? 'active' : ''}"></div>`).join('')}
            </div>
            
            ${!isLast ? 
                `<button class="next-btn" id="onboardingNext">Next <i class="fas fa-chevron-right"></i></button>` : 
                `<button class="get-started-btn" id="onboardingGetStarted">🚀 Get Started</button>`
            }
        </div>
    `;
    
    document.getElementById('onboardingBack')?.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            renderOnboarding();
        }
    });
    
    document.getElementById('onboardingSkip')?.addEventListener('click', () => {
        window.location.href = 'login.html';
    });
    
    const nextBtn = document.getElementById('onboardingNext');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentStep < onboardingSteps.length - 1) {
                currentStep++;
                renderOnboarding();
            }
        });
    }
    
    const getStartedBtn = document.getElementById('onboardingGetStarted');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }
}

renderOnboarding();