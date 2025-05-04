// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initParticlesBackground();
    initCollegeLogos();
    initFormHandling();
    initAnimations();
    
    // Mark page as loaded
    document.body.classList.add('page-loaded');
});

// Initialize particles.js background
function initParticlesBackground() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 80,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#ffffff"
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                    "polygon": {
                        "nb_sides": 5
                    }
                },
                "opacity": {
                    "value": 0.5,
                    "random": false,
                    "anim": {
                        "enable": false,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": false,
                        "speed": 40,
                        "size_min": 0.1,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#ffffff",
                    "opacity": 0.4,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 2,
                    "direction": "none",
                    "random": false,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": false,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "grab"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 1
                        }
                    },
                    "bubble": {
                        "distance": 400,
                        "size": 40,
                        "duration": 2,
                        "opacity": 8,
                        "speed": 3
                    },
                    "repulse": {
                        "distance": 200,
                        "duration": 0.4
                    },
                    "push": {
                        "particles_nb": 4
                    },
                    "remove": {
                        "particles_nb": 2
                    }
                }
            },
            "retina_detect": true
        });
    } else {
        console.error("Particles.js library not found");
    }
}

// Initialize college logos
function initCollegeLogos() {
    const logos = document.querySelectorAll('.logo');
    logos.forEach(logo => {
        logo.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        logo.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

// Main form handling function
function initFormHandling() {
    const registrationForm = document.getElementById('registration-form');
    const formSteps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const nextButtons = document.querySelectorAll('.next-button');
    const prevButtons = document.querySelectorAll('.prev-button');
    const successMessage = document.getElementById('success-message');
    const infoBox = document.getElementById('infoBox');
    const password = document.querySelector('#password');
    const confirmPassword = document.querySelector('#confirm_password');
    const passwordError = document.getElementById('password-error');
    const togglePassword = document.querySelector('#togglePassword');
    const toggleConfirmPassword = document.querySelector('#toggleConfirmPassword');
    const collegeMcet = document.querySelector('#college_mcet');
    const collegeOther = document.querySelector('#college_other');
    const otherCollegeInput = document.querySelector('#other_college_name');
    const termsContainer = document.querySelector('#terms-container');
    const termsCheckbox = document.querySelector('#terms');

    // Password toggle functionality
    if (togglePassword && password) {
        togglePassword.addEventListener('click', function() {
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            password.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        });
    }

    if (toggleConfirmPassword && confirmPassword) {
        toggleConfirmPassword.addEventListener('click', function() {
            const type = confirmPassword.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPassword.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        });
    }

    // College selection logic
    function handleCollegeSelection() {
        if (collegeOther.checked) {
            otherCollegeInput.style.display = 'block';
            termsContainer.style.display = 'block';
            if (termsCheckbox) termsCheckbox.required = true;
        } else {
            otherCollegeInput.style.display = 'none';
            termsContainer.style.display = 'none';
            if (termsCheckbox) termsCheckbox.required = false;
        }
    }

    // Password validation
    function validatePasswords() {
        if (password.value !== confirmPassword.value) {
            passwordError.style.display = 'block';
            return false;
        }
        passwordError.style.display = 'none';
        return true;
    }

    // Navigation functions
    function goToNextStep(currentStep, nextStepNum) {
        const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        const nextStepEl = document.querySelector(`.form-step[data-step="${nextStepNum}"]`);
        
        if (currentStepEl && nextStepEl) {
            currentStepEl.classList.remove('active');
            nextStepEl.classList.add('active');
            
            document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.remove('active');
            document.querySelector(`.progress-step[data-step="${nextStepNum}"]`).classList.add('active');
        }
    }

    // Next button handlers
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = this.closest('.form-step');
            const currentStepNum = parseInt(currentStep.dataset.step);
            
            if (currentStepNum === 1 && !validatePasswords()) {
                return false;
            }

            if (validateStep(currentStep)) {
                goToNextStep(currentStepNum, currentStepNum + 1);
            }
        });
    });

    // Previous button handlers
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = this.closest('.form-step');
            const currentStepNum = parseInt(currentStep.dataset.step);
            goToNextStep(currentStepNum, currentStepNum - 1);
        });
    });

    // Form submission handler
    if (registrationForm) {
        registrationForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Validate last step
            const lastStep = document.querySelector('.form-step:last-child');
            if (!validateStep(lastStep)) {
                return;
            }

            // Get form data
            const formData = new FormData(registrationForm);
            const body = {};
            formData.forEach((v, k) => { if (v) body[k] = v });

            // Basic validations
            if (!validateEmail(body.email)) {
                showError(document.querySelector('#email'), "❌ Invalid email format.");
                return;
            }

            if (!body.team_code && !body.team_name) {
                showError(document.querySelector('#team_code'), "❌ Please enter a team code or create a team.");
                return;
            }

            try {
                // Show loading state
                const submitBtn = document.querySelector('.submit-button');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

<<<<<<< Updated upstream
                // Send to backend
                const res = await fetch("http://localhost:5500/api/auth/register", {
=======
                // Send request to backend
                const res = await fetch("http://localhost:5050/api/auth/register", {
>>>>>>> Stashed changes
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                });
                
                const data = await res.json();
                
                if (!res.ok) {
                    showError(document.querySelector('.submit-button'), "❌ " + (data.msg || data.error || 'Registration failed.'));
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Submit Registration';
                    return;
                }
                
                // Show success message
                registrationForm.style.display = 'none';
                successMessage.style.display = 'block';
                
                // Display team info
                infoBox.style.display = "block";
                infoBox.innerHTML = '';
                
                if (data.team_code) {
                    infoBox.innerHTML += `<p><b>Your Team Code:</b> ${data.team_code}</p>`;
                }
                if (data.team_name) {
                    infoBox.innerHTML += `<p><b>Team Name:</b> ${data.team_name}</p>`;
                }
                if (data.team_leader) {
                    infoBox.innerHTML += `<p><b>Team Leader:</b> ${data.team_leader}</p>`;
                }
                if (data.members) {
                    infoBox.innerHTML += `<p><b>Team Members:</b><ul>${data.members.map(m => `<li>${m.name}</li>`).join('')}</ul></p>`;
                }
                
                // Animate success icon
                successMessage.querySelector('i')?.classList.add('animated');

            } catch (err) {
                showError(document.querySelector('.submit-button'), "❌ Failed to connect to server.");
                const submitBtn = document.querySelector('.submit-button');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Submit Registration';
            }
        });
    }

    // Helper functions
    function showError(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
        field.classList.add('error', 'shake');
        setTimeout(() => field.classList.remove('shake'), 500);
    }

    function validateField(field) {
        field.classList.remove('error');
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) errorMessage.remove();

        if (field.value.trim() === '' && field.required) {
            showError(field, 'This field is required');
            return false;
        }
        return true;
    }

    function validateStep(step) {
        let isValid = true;
        step.querySelectorAll('[required]').forEach(field => {
            if (!validateField(field)) isValid = false;
        });
        return isValid;
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function scrollToTop() {
        window.scrollTo({
            top: document.querySelector('.registration-container').offsetTop,
            behavior: 'smooth'
        });
    }

    // Initialize college selection
    if (collegeMcet && collegeOther) {
        collegeMcet.addEventListener('change', handleCollegeSelection);
        collegeOther.addEventListener('change', handleCollegeSelection);
        handleCollegeSelection();
    }
}

// Initialize animations
function initAnimations() {
    // Button animations
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-3px)';
            button.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
            button.style.boxShadow = '';
        });
    });

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .shake { animation: shake 0.5s; }
        @keyframes shake {
            0%,100% { transform: translateX(0); }
            20%,60% { transform: translateX(-5px); }
            40%,80% { transform: translateX(5px); }
        }
        .success-message i.animated {
            animation: success-pulse 1.5s infinite;
        }
        @keyframes success-pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
}
