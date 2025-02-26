import { Auth } from '../api/auth.js'
import config from '../config.js'

export class Login {
    constructor(container) {
        this.container = container
        this.auth = new Auth()
    }

    render() {
        console.log('Rendering login form...')
        this.container.innerHTML = `
            <div class="login-container">
                <h2>Login to GraphQL Profile</h2>
                <form id="loginForm" class="login-form">
                    <div class="form-group">
                        <input 
                            type="text" 
                            id="username" 
                            name="username"
                            placeholder="Username" 
                            required
                            autocomplete="username"
                        >
                    </div>
                    <div class="form-group">
                        <input 
                            type="password" 
                            id="password" 
                            name="password"
                            placeholder="Password" 
                            required
                            autocomplete="current-password"
                        >
                    </div>
                    <button type="submit">Login</button>
                    <p id="error-message" class="error"></p>
                </form>
            </div>
        `

        this.attachEventListeners()
    }

    attachEventListeners() {
        const form = document.getElementById('loginForm')
        const errorMessage = document.getElementById('error-message')

        form.addEventListener('submit', async (e) => {
            e.preventDefault()
            
            errorMessage.textContent = ''
            const submitButton = form.querySelector('button[type="submit"]')
            submitButton.disabled = true
            submitButton.textContent = 'Logging in...'

            try {
                const username = document.getElementById('username').value
                const password = document.getElementById('password').value

                await this.handleSubmit(e)
            } catch (error) {
                submitButton.disabled = false
                submitButton.textContent = 'Login'
                errorMessage.textContent = error.message
            } finally {
                submitButton.disabled = false
                submitButton.textContent = 'Login'
            }
        })
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        try {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Clear any previous error
            this.clearError();
            // Show loading state
            this.setLoading(true);
            
            // Login attempt
            await this.auth.login({ username, password });
            
            // If we get here, login was successful
            console.log('Login successful, redirecting to profile');
            
            // Force a hard reload to ensure the auth state is picked up
            window.location.href = config.baseUrl;
        } catch (error) {
            console.error('Login error:', error);
            this.showError(error.message || 'Failed to login. Please check your credentials.');
        } finally {
            this.setLoading(false);
        }
    }

    clearError() {
        const errorMessage = document.getElementById('error-message')
        errorMessage.textContent = ''
    }

    setLoading(isLoading) {
        const submitButton = document.querySelector('button[type="submit"]')
        submitButton.disabled = isLoading
        submitButton.textContent = isLoading ? 'Logging in...' : 'Login'
    }

    showError(message) {
        const errorMessage = document.getElementById('error-message')
        errorMessage.textContent = message
    }
} 