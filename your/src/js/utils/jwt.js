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
        if (!token || typeof token !== 'string') {
            console.error('Token is empty or not a string');
            return false;
        }
        
        // Check if token has three parts
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.error('Token does not have three parts:', parts.length);
            return false;
        }

        // Additional validation: check if each part is valid base64url
        try {
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                // Simple check: base64url should only contain these characters
                if (!/^[A-Za-z0-9_-]*$/.test(part)) {
                    console.error(`Token part ${i} contains invalid characters`);
                    return false;
                }
                
                // Try to convert to base64
                try {
                    this.base64UrlToBase64(part);
                } catch (e) {
                    console.error(`Failed to convert token part ${i} to base64:`, e);
                    return false;
                }
            }
            return true;
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    }

    static getToken() {
        const token = localStorage.getItem('jwt');
        if (!token || !this.validateToken(token)) {
            localStorage.removeItem('jwt');
            return null;
        }
        return token;
    }
}
