import { Auth } from './api/auth.js'
import { Login } from './components/Login.js'
import { Profile } from './components/Profile.js'

const BASE_PATH = location.pathname.includes('/graphql') ? '/graphql/' : '/';

export class App {
    constructor() {
        this.container = document.getElementById('app')
        this.auth = new Auth()
    }

    init() {
        try {
            if (this.auth.isAuthenticated()) {
                console.log('User is authenticated, showing profile')
                const profile = new Profile(this.container)
                profile.render()
            } else {
                console.log('User is not authenticated, showing login')
                const login = new Login(this.container)
                login.render()
            }
        } catch (error) {
            console.error('App initialization error:', error)
            // If there's any error, show login
            const login = new Login(this.container)
            login.render()
        }
    }

    showError(message) {
        this.container.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <button onclick="window.location.reload()">Retry</button>
            </div>
        `
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new App()
    try {
        app.init()
    } catch (error) {
        console.error('Failed to initialize app:', error)
        app.showError('Failed to initialize application. Please try again.')
    }
}) 