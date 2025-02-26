export class JWTUtil {
    static base64UrlToBase64(str) {
        let output = str.replace(/-/g, '+').replace(/_/g, '/');
        switch (output.length % 4) {
            case 0:
                break;
            case 2:
                output += '==';
                break;
            case 3:
                output += '=';
                break;
            default:
                throw new Error('Invalid base64url string length');
        }
        return output;
    }

    static parseJWT(token) {
        try {
            if (!token) return null;
            if (typeof token !== 'string') return null;

            const parts = token.split('.');
            if (parts.length !== 3) return null;

            const base64Url = parts[1];
            const base64 = this.base64UrlToBase64(base64Url);
            
            try {
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                return JSON.parse(jsonPayload);
            } catch (e) {
                console.error('Base64 decode error:', e);
                return null;
            }
        } catch (error) {
            console.error('JWT parse error:', error);
            return null;
        }
    }

    static validateToken(token) {
        if (!token) return false;
        
        // Basic structure validation
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        
        try {
            // Try to parse the payload to check expiration
            const payload = JSON.parse(atob(this.base64UrlToBase64(parts[1])));
            
            // Check if token is expired
            if (payload.exp && Date.now() >= payload.exp * 1000) {
                console.log('Token expired');
                return false;
            }
            
            return true;
        } catch (e) {
            console.error('Token validation error:', e);
            return false;
        }
    }

    static getToken() {
        return localStorage.getItem('jwt');
    }
    
    static setToken(token) {
        if (token) {
            localStorage.setItem('jwt', token);
            console.log('Token stored in localStorage');
        } else {
            localStorage.removeItem('jwt');
            console.log('Token removed from localStorage');
        }
    }
    
    static clearToken() {
        localStorage.removeItem('jwt');
    }
}
