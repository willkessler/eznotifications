const TOKEN_KEY = 'auth_token';

const AuthService = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  async loginWithOAuth(oauthProvider) {
    // Implement OAuth login logic here
    // Redirect user to OAuth provider's login page, then handle the response
    // For simplicity, this is just a placeholder
  },

  async logout() {
    this.removeToken();
    // Additional logout logic if needed
  },

  // Add more methods as needed
};

export default AuthService;
