setToken(token) {
  if (!token || typeof token !== 'string') {
    console.warn('No valid token provided, proceeding without authentication');
    this.token = null;
    return;
  }
  
  this.token = token;
} 