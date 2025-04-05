// Ensure the DOM is fully loaded before running scripts
document.addEventListener('DOMContentLoaded', function() {
    // Create wheat stalks dynamically
    createWheatField();
    
    // Get the login form
    const loginForm = document.getElementById('loginForm');
    
    // Add a subtle hover animation for the form container
    const loginContainer = document.querySelector('.login-container');
    loginContainer.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.boxShadow = '0 15px 30px rgba(0,0,0,0.2)';
    });
    
    loginContainer.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
    });
    
    // Form submission animation
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent actual form submission
        
        // Get form values
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Simple validation
        if (username.trim() === '' || password.trim() === '') {
            showError('Please fill in all fields');
            return;
        }
        
        // Add animation class to button
        document.querySelector('.login-btn').classList.add('submitting');
        
        // Simulate form processing
        setTimeout(function() {
            // Success message or redirect would go here
            alert('Login successful!');
            // window.location.href = 'dashboard.html'; // Uncomment to redirect
        }, 1500);
    });
    
    // Function to show error messages
    function showError(message) {
        // Remove any existing error messages
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // Insert error before the form
        const form = document.querySelector('.login-form');
        form.parentNode.insertBefore(errorDiv, form);
        
        // Remove error after 3 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
    
    // Function to create wheat field animation
    function createWheatField() {
        const wheatField = document.getElementById('wheat-field');
        const fieldWidth = window.innerWidth;
        const wheatCount = Math.floor(fieldWidth / 15); // Space wheat stalks about 15px apart
        
        for (let i = 0; i < wheatCount; i++) {
            const wheat = document.createElement('div');
            wheat.className = 'wheat';
            
            // Randomize wheat properties
            const height = 50 + Math.random() * 40; // Height between 50-90px
            const left = i * 15 + Math.random() * 10; // Position with slight randomness
            const duration = 2 + Math.random() * 2; // Animation duration 2-4s
            const delay = Math.random() * 2; // Random delay 0-2s
            
            wheat.style.height = `${height}px`;
            wheat.style.left = `${left}px`;
            wheat.style.animation = `wheat-sway ${duration}s ease-in-out infinite`;
            wheat.style.animationDelay = `${delay}s`;
            
            wheatField.appendChild(wheat);
        }
    }
    
    // Handle window resize to adjust wheat field
    window.addEventListener('resize', function() {
        const wheatField = document.getElementById('wheat-field');
        wheatField.innerHTML = ''; // Clear existing wheat
        createWheatField(); // Recreate wheat field
    });
});




// Ensure the DOM is fully loaded before running scripts
document.addEventListener('DOMContentLoaded', function() {
    // Create wheat stalks dynamically
    createWheatField();
    
    // Get the login form
    const loginForm = document.getElementById('loginForm');
    
    // Password toggle functionality
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    togglePassword.addEventListener('click', function() {
        // Toggle the password visibility
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle the eye icon
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });
    
    // Add a subtle hover animation for the form container
    const loginContainer = document.querySelector('.login-container');
    loginContainer.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.boxShadow = '0 15px 30px rgba(0,0,0,0.2)';
    });
    
    loginContainer.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
    });
    
    // Form submission animation
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent actual form submission
        
        // Get form values
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Simple validation
        if (username.trim() === '' || password.trim() === '') {
            showError('Please fill in all fields');
            return;
        }
        
        // Add animation class to button
        document.querySelector('.login-btn').classList.add('submitting');
        
        // Simulate form processing
        setTimeout(function() {
            // Success message or redirect would go here
            alert('Login successful!');
            // window.location.href = 'dashboard.html'; // Uncomment to redirect
        }, 1500);
    });
    
    // Function to show error messages
    function showError(message) {
        // Remove any existing error messages
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // Insert error before the form
        const form = document.querySelector('.login-form');
        form.parentNode.insertBefore(errorDiv, form);
        
        // Remove error after 3 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
    
    // Function to create wheat field animation
    function createWheatField() {
        const wheatField = document.getElementById('wheat-field');
        const fieldWidth = window.innerWidth;
        const wheatCount = Math.floor(fieldWidth / 15); // Space wheat stalks about 15px apart
        
        for (let i = 0; i < wheatCount; i++) {
            const wheat = document.createElement('div');
            wheat.className = 'wheat';
            
            // Randomize wheat properties
            const height = 50 + Math.random() * 40; // Height between 50-90px
            const left = i * 15 + Math.random() * 10; // Position with slight randomness
            const duration = 2 + Math.random() * 2; // Animation duration 2-4s
            const delay = Math.random() * 2; // Random delay 0-2s
            
            wheat.style.height = `${height}px`;
            wheat.style.left = `${left}px`;
            wheat.style.animation = `wheat-sway ${duration}s ease-in-out infinite`;
            wheat.style.animationDelay = `${delay}s`;
            
            wheatField.appendChild(wheat);
        }
    }
    
    // Handle window resize to adjust wheat field
    window.addEventListener('resize', function() {
        const wheatField = document.getElementById('wheat-field');
        wheatField.innerHTML = ''; // Clear existing wheat
        createWheatField(); // Recreate wheat field
    });
});