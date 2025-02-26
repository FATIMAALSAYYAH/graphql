import { graphqlInstance } from './graphqlInstance.js'
import { JWTUtil } from '../utils/jwt.js'
import config from '../config.js'

export class Auth {
    constructor() {
        this.baseURL = config.authEndpoint
        this.graphql = graphqlInstance
        
        // Check for existing token with validation
        const token = JWTUtil.getToken()
        if (token) {
            this.token = token
            this.graphql.setToken(token)
        }

        // Clear existing token
        localStorage.removeItem('jwt')
        this.token = null
        this.graphql.setToken(null)
    }

            async login({ username, password }) {
                try {
                    // Clear existing token
                    localStorage.removeItem('jwt')
                    this.token = null
                    this.graphql.setToken(null)

                    // Clear local storage before logging in
                    localStorage.clear()
            
                    // Create credentials
                    const credentials = btoa(`${username.trim()}:${password}`)
            
                    const response = await fetch(this.baseURL, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Basic ${credentials}`
                        }
                    })

                    if (!response.ok) {
                        throw new Error('Invalid username or password')
                    }

                    // Get token and inspect it thoroughly
                    let token = await response.text()
            
                    // Log the raw token with character codes to detect any invisible characters
                    console.log('Raw token from server:', token)
                    console.log('Token length:', token.length)
                    console.log('First 20 characters:', token.substring(0, 20))
                    console.log('Character codes:', Array.from(token.substring(0, 20)).map(c => c.charCodeAt(0)))
            
                    // Remove any whitespace, quotes or newlines that might be wrapping the token
                    token = token.trim().replace(/^["']|["']$/g, '').replace(/\r?\n|\r/g, '')
            
                    console.log('Cleaned token:', token)
                    console.log('Cleaned token length:', token.length)
            
                    // Try to parse the token parts
                    const parts = token.split('.')
                    console.log('Token parts:', parts.length)
            
                    if (parts.length === 3) {
                        // Verify each part can be decoded as base64url
                        try {
                            parts.forEach((part, index) => {
                                try {
                                    const base64 = JWTUtil.base64UrlToBase64(part)
                                    console.log(`Part ${index} converts to base64:`, base64)
                                    // For header and payload, we can try to decode
                                    if (index < 2) {
                                        const decoded = atob(base64)
                                        console.log(`Part ${index} decoded:`, decoded)
                                    }
                                } catch (e) {
                                    console.error(`Failed to convert part ${index}:`, e)
                                }
                            })
                        } catch (e) {
                            console.error('Token part conversion error:', e)
                        }
                    }

                    // Now verify token
                    if (!token || !JWTUtil.validateToken(token)) {
                        console.error('Token validation failed')
                        throw new Error('Invalid token received')
                    }

                    // Store token
                    localStorage.setItem('jwt', token)
                    this.token = token
                    this.graphql.setToken(token)

                    return token
                } catch (error) {
                    console.error('Login error:', error)
                    throw error
                }
            }    isAuthenticated() {
        return !!this.token && JWTUtil.validateToken(this.token)
    }

    logout() {
        localStorage.removeItem('jwt')
        this.token = null
        this.graphql.setToken(null)
        window.location.reload()
    }
}
