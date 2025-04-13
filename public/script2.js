
document.addEventListener('DOMContentLoaded', function() {

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
        "value": "#0055a4"
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
        "color": "#0055a4",
        "opacity": 0.4,
        "width": 1
      },
      "move": {
        "enable": true,
        "speed": 3,
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

  
  initTheme();

 
  initFormEvents();
});


function initTheme() {
  const themeSwitch = document.getElementById('theme-switch');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

 
  if (localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && prefersDarkScheme.matches)) {
    document.body.setAttribute('data-theme', 'dark');
    themeSwitch.checked = true;
    updateParticlesColor('#1976d2');
  } else {
    document.body.removeAttribute('data-theme');
    themeSwitch.checked = false;
    updateParticlesColor('#0055a4');
  }


themeSwitch.addEventListener('change', function() {
    if (this.checked) {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        updateParticlesColor('#1976d2');
    } else {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        updateParticlesColor('#0055a4');
    }
});


if (!localStorage.getItem('theme')) {
    document.body.removeAttribute('data-theme');
    themeSwitch.checked = false;
    updateParticlesColor('#0055a4');
}
  
}


function updateParticlesColor(color) {
  if (window.pJSDom && window.pJSDom[0]) {
    window.pJSDom[0].pJS.particles.color.value = color;
    window.pJSDom[0].pJS.particles.line_linked.color = color;
    window.pJSDom[0].pJS.fn.particlesRefresh();
  }
}

function initFormEvents() {
  const passwordInput = document.getElementById('password');
  const passwordToggle = document.querySelector('.password-toggle');
  const passwordStrength = document.querySelector('.password-strength');
  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.querySelector('.login-btn');
  const msg = document.getElementById('msg');

  // Toggle password visibility
  passwordToggle.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    // Toggle icon
    const icon = this.querySelector('i');
    icon.classList.toggle('fa-eye-slash');
    icon.classList.toggle('fa-eye');
  });

  // Password strength indicator
  passwordInput.addEventListener('input', function() {
    const strength = calculatePasswordStrength(this.value);
    passwordStrength.style.width = strength + '%';
  });

  
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    msg.textContent = "";
    msg.className = "message";

    
    loginBtn.classList.add('loading');

    const email = this.email.value;
    const password = this.password.value;

    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate server response
      const response = await mockServerCall(email, password);

      // Remove loading state
      loginBtn.classList.remove('loading');

      if (!response.ok) {
        msg.textContent = `❌ ${response.msg}`;
        msg.classList.add('error');
        // Shake animation on error
        loginBtn.classList.add('shake');
        setTimeout(() => loginBtn.classList.remove('shake'), 500);
        return;
      }

      // Success message
      msg.textContent = `✅ Logged in as ${response.user.name}`;
      msg.classList.add('success');

      // Store token & user
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Success animation
      loginBtn.innerHTML = '<i class="fas fa-check"></i>';
      loginBtn.classList.add('success');

      
      setTimeout(() => {
        if (response.user.role === 'admin') {
          window.location.href = 'admin.html';
        } else if (response.user.role === 'moderator') {
          window.location.href = 'moderator.html';
        } else {
          window.location.href = 'dashboard.html';
        }
      }, 1000);

    } catch (err) {
      loginBtn.classList.remove('loading');
      msg.textContent = '❌ Server error';
      msg.classList.add('error');
    }
  });

  // Add floating label animation for input fields
  const inputs = document.querySelectorAll('.input-field input');
  inputs.forEach(input => {
    // Check if input has a value on page load
    if (input.value) {
      input.classList.add('has-value');
    }

    // Add event listeners
    input.addEventListener('focus', () => {
      input.classList.add('focused');
    });

    input.addEventListener('blur', () => {
      input.classList.remove('focused');
      if (input.value) {
        input.classList.add('has-value');
      } else {
        input.classList.remove('has-value');
      }
    });
  });

  // Add ripple effect to buttons
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      const x = e.clientX - e.target.getBoundingClientRect().left;
      const y = e.clientY - e.target.getBoundingClientRect().top;

      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
}

// Calculate password strength
function calculatePasswordStrength(password) {
  if (!password) return 0;

  let strength = 0;

  
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;

 
  if (/[a-z]/.test(password)) strength += 10;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 20;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 20;

  return Math.min(strength, 100);
}



// Add custom CSS rules for animations
document.addEventListener('DOMContentLoaded', function() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }

    .shake {
      animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }

    .ripple {
      position: absolute;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    }

    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }

    .login-btn.success {
      background: var(--success-color) !important;
    }
  `;
  document.head.appendChild(style);
});
