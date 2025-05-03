// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
  
    // Initialize particles background
    initParticlesBackground();
  
    // Initialize college logos
    initCollegeLogos();
  
    // Initialize form handling
    initFormHandling();
  
    // Initialize animations
    initAnimations();
  
    // Mark the page as loaded to trigger fade-in
    document.body.classList.add('page-loaded');
  });
  
  // Initialize particles.js background with interactive particles
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
            }
          },
          "opacity": {
            "value": 0.5,
            "random": false
          },
          "size": {
            "value": 3,
            "random": true
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
            "bounce": false
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
            "push": {
              "particles_nb": 4
            }
          }
        },
        "retina_detect": true
      });
    } else {
      console.error("Particles.js library not found");
    }
  }
  
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
  
  // Form handling and validation
  function initFormHandling() {
    const registrationForm = document.getElementById('registration-form');
    const formSteps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const nextButtons = document.querySelectorAll('.next-button');
    const prevButtons = document.querySelectorAll('.prev-button');
    const successMessage = document.getElementById('success-message');
    const infoBox = document.getElementById('infoBox');
  
    // Password toggle functionality
   
    // Password validation function
    function validatePasswords() {
      if (password.value !== confirmPassword.value) {
        passwordError.style.display = 'block';
        return false;
      }
      passwordError.style.display = 'none';
      return true;
    }
  
    // Real-time validation after first attempt
    let validationAttempted = false;
    [password, confirmPassword].forEach(field => {
      field.addEventListener('input', function() {
        if (validationAttempted) {
          validatePasswords();
        }
      });
    });
  
    // Handle next button clicks
    nextButtons.forEach(button => {
      button.addEventListener('click', function() {
        const currentStep = this.closest('.form-step');
        const currentStepNum = parseInt(currentStep.dataset.step);
        
        // Special validation for step 1 passwords
        if (currentStepNum === 1) {
          validationAttempted = true;
          if (!validatePasswords()) {
            return false;
          }
        }
  
        const nextStepNum = currentStepNum + 1;
        const nextStep = document.querySelector(`.form-step[data-step="${nextStepNum}"]`);
  
        // Validate current step before proceeding
        if (validateStep(currentStep)) {
          // Update steps
          currentStep.classList.remove('active');
          nextStep.classList.add('active');
  
          // Update progress indicators
          progressSteps.forEach(step => {
            if (parseInt(step.dataset.step) === currentStepNum) {
              step.classList.add('completed');
            } else if (parseInt(step.dataset.step) === nextStepNum) {
              step.classList.add('active');
            }
          });
  
          // Scroll to top
          scrollToTop();
  
          // Add fade-in animation to the next step
          nextStep.style.animation = 'none';
          nextStep.offsetHeight; // Trigger reflow
          nextStep.style.animation = 'fadeIn 0.5s ease-out';
        }
      });
    });
  
    // Handle previous button clicks
    prevButtons.forEach(button => {
      button.addEventListener('click', function() {
        const currentStep = this.closest('.form-step');
        const currentStepNum = parseInt(currentStep.dataset.step);
        const prevStepNum = currentStepNum - 1;
        const prevStep = document.querySelector(`.form-step[data-step="${prevStepNum}"]`);
  
        // Update steps
        currentStep.classList.remove('active');
        prevStep.classList.add('active');
  
        // Update progress indicators
        progressSteps.forEach(step => {
          if (parseInt(step.dataset.step) === currentStepNum) {
            step.classList.remove('active');
          } else if (parseInt(step.dataset.step) === prevStepNum) {
            step.classList.remove('completed');
            step.classList.add('active');
          }
        });
  
        // Scroll to top of form
        scrollToTop();
  
        // Add fade-in animation to the previous step
        prevStep.style.animation = 'none';
        prevStep.offsetHeight; // Trigger reflow
        prevStep.style.animation = 'fadeIn 0.5s ease-out';
      });
    });
  
    // Form submission handler
    if (registrationForm) {
      registrationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
  
        // Validate last step before submitting
        const lastStep = document.querySelector('.form-step:last-child');
        if (!validateStep(lastStep)) {
          return;
        }
  
        // Get form data
        const formData = new FormData(registrationForm);
        const body = {};
        formData.forEach((v, k) => { if (v) body[k] = v });
  
        // Basic email validation
        if (!validateEmail(body.email)) {
          showError(document.querySelector('#email'), "❌ Invalid email format.");
          return;
        }
  
        if (!body.team_code && !body.team_name) {
          showError(document.querySelector('#team_code'), "❌ Please enter a team code or create a team.");
          return;
        }
  
        if (body.team_code && body.team_name) {
          showError(document.querySelector('#team_code'), "❌ Please choose only one: team code or team name.");
          return;
        }
  
        try {
          // Show loading state
          const submitBtn = document.querySelector('.submit-button');
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  
          // Mock successful response for demo
          const res = await fetch("http://localhost:5050/api/auth/register", {
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
          
          // Show success message and hide form
          registrationForm.style.display = 'none';
          successMessage.style.display = 'block';
          
          // Show team info
          infoBox.style.display = "block";
          infoBox.innerHTML = '';
          
          if (data.team_code) {
            infoBox.innerHTML += `<p><b>Your Team Code:</b> ${data.team_code}</p>`;
          }
          if (data.team_leader) {
            infoBox.innerHTML += `<p><b>Team Leader:</b> ${data.team_leader}</p>`;
          }
          if (data.members) {
            infoBox.innerHTML += `<p><b>Team Members:</b><ul>${data.members.map(m => `<li>${m.name}</li>`).join('')}</ul></p>`;
          }
          if(data.team_name){
            infoBox.innerHTML += `<p><b>Team Name:</b> ${data.team_name}</p>`;
          }
          // Animate success message
          successMessage.querySelector('i')?.classList.add('animated');
  
        } catch (err) {
          showError(document.querySelector('.submit-button'), "❌ Failed to connect to server.");
          const submitBtn = document.querySelector('.submit-button');
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Submit Registration';
        }
      });
    }
  
    // Floating label animation for inputs
    const formInputs = document.querySelectorAll('input, select');
    formInputs.forEach(input => {
      // Set placeholder to empty string for floating label effect
      if (input.type !== 'checkbox') {
        input.placeholder = '';
      }
  
      // Add focused class when input is focused
      input.addEventListener('focus', function() {
        this.parentNode.classList.add('focused');
      });
  
      // Remove focused class when input loses focus
      input.addEventListener('blur', function() {
        this.parentNode.classList.remove('focused');
  
        // Validate the field on blur
        if (this.required) {
          validateField(this);
        }
      });
  
      // For input elements, validate on input
      if (input.tagName === 'INPUT' && input.type !== 'checkbox') {
        input.addEventListener('input', function() {
          if (this.required) {
            validateField(this);
          }
        });
      }
    });
  }
  
  // Helper function to display error messages
  function showError(field, message) {
    // Remove any existing error messages
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
  
    // Add error class to input
    field.classList.add('error');
  
    // Create and append error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
  
    if (field.type === 'checkbox') {
      field.parentNode.appendChild(errorDiv);
    } else {
      field.parentNode.appendChild(errorDiv);
    }
  
    // Add shake animation
    field.classList.add('shake');
    setTimeout(() => field.classList.remove('shake'), 500);
  
    return false;
  }
  
  // Validate each field
  function validateField(field) {
    // Reset error state
    field.classList.remove('error');
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
      errorMessage.remove();
    }
  
    // Validate based on input type
    if (field.value.trim() === '' && field.required) {
      showError(field, 'This field is required');
      return false;
    } else if (field.type === 'email' && !validateEmail(field.value)) {
      showError(field, 'Please enter a valid email address');
      return false;
    } else if (field.id === 'roll_number' && field.value.length < 5) {
      showError(field, 'Roll number must be at least 5 characters');
      return false;
    }
  
    return true;
  }
  
  // Validate an entire step
  function validateStep(step) {
    let isValid = true;
    const inputs = step.querySelectorAll('input[required], select[required]');
  
    inputs.forEach(input => {
      if (!validateField(input)) {
        isValid = false;
      }
    });
  
    // Check terms checkbox on final step
    if (step.dataset.step === '3') {
      const termsCheckbox = step.querySelector('#terms');
      if (termsCheckbox && !termsCheckbox.checked) {
        showError(termsCheckbox, 'You must agree to the terms and conditions');
        isValid = false;
      }
    }
  
    return isValid;
  }
  
  // Email validation function
  function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
  

  function scrollToTop() {
    window.scrollTo({
      top: document.querySelector('.registration-container').offsetTop,
      behavior: 'smooth'
    });
  }
  
  
  function initAnimations() {
    
    addAnimationStyles();
  
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px)';
        this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
      });
  
      button.addEventListener('mouseleave', function() {
        this.style.transform = '';
        this.style.boxShadow = '';
      });
  
      button.addEventListener('click', function() {
        this.classList.add('button-click');
        setTimeout(() => {
          this.classList.remove('button-click');
        }, 300);
      });
    });
  
    document.addEventListener('mousemove', function(e) {
      const logos = document.querySelectorAll('.logo');
      const mouseX = e.clientX / window.innerWidth - 0.5;
      const mouseY = e.clientY / window.innerHeight - 0.5;
  
      logos.forEach(logo => {
        logo.style.transform = `translate(${mouseX * 10}px, ${mouseY * 10}px)`;
      });
    });
  }
  
  
  function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes button-click {
        0% { transform: scale(1); }
        50% { transform: scale(0.95); }
        100% { transform: scale(1); }
      }
  
      .button-click {
        animation: button-click 0.3s ease-out;
      }
  
      .success-message i.animated {
        animation: success-pulse 1.5s infinite;
      }
  
      @keyframes success-pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
  
      /* Add smooth input highlighting */
      .form-group.focused {
        transform: translateY(-5px);
        transition: transform 0.3s ease;
      }
  
      /* Error styles */
      .error-message {
        color: #ff6b6b;
        font-size: 0.8rem;
        margin-top: 5px;
      }
  
      .error {
        border-color: #ff6b6b !important;
      }
  
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-5px); }
        40%, 80% { transform: translateX(5px); }
      }
  
      .shake {
        animation: shake 0.5s ease-in-out;
      }
  
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }
