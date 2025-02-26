import { JWTUtil } from '../utils/jwt.js';
import config from '../config.js';

export class GraphQLAPI {
    constructor() {
        // Use the configured GraphQL endpoint
        this.endpoint = config.apiEndpoint;
        this.token = null
    }

    setToken(token) {
        if (token && !JWTUtil.validateToken(token)) {
            throw new Error('Invalid token format');
        }
        this.token = token;
    }

    async query(queryStr, variables = {}) {
        if (!this.token) {
            throw new Error('Authentication required');
        }
        
        if (!JWTUtil.validateToken(this.token)) {
            console.error('Invalid token format detected in GraphQL query:', this.token);
            throw new Error('Valid authentication required');
        }

        try {
            console.log('Using token for GraphQL request:', this.token.substring(0, 10) + '...');
            
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    query: queryStr,
                    variables: variables
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Request failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            if (data.errors) {
                throw new Error(data.errors[0].message);
            }

            return data;
        } catch (error) {
            console.error('GraphQL query error:', error);
            if (error.message.includes('Authentication') || error.message.includes('JWT')) {
                localStorage.removeItem('jwt');
            }
            throw error;
        }
    }} 