const API_BASE_URL = import.meta.env.VITE_API_URL;

// Auth API functions
export const authApi = {
  async login(credentials: { username: string; password: string }) {
    credentials.username = credentials.username.trim();
    try {
      const response = await fetch(`${API_BASE_URL}/authenticate`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || `HTTP ${response.status}` };
      }

      return { data };
    } catch (error) {
      console.error('Login failed:', error);
      return { error: 'Network error. Please check your connection.' };
    }
  },

  async register(userData: {
    username: string;
    email: string;
    password: string;
  }) {
    userData.username = userData.username.trim();
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || `HTTP ${response.status}` };
      }

      return { data };
    } catch (error) {
      console.error('Registration failed:', error);
      return { error: 'Network error. Please check your connection.' };
    }
  },

  async logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || `HTTP ${response.status}` };
      }

      return { data };
    } catch (error) {
      console.error('Logout failed:', error);
      return { error: 'Network error. Please check your connection.' };
    }
  },

  async getSession() {
    try {
      const response = await fetch(`${API_BASE_URL}/session`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || `HTTP ${response.status}` };
      }

      return { data };
    } catch (error) {
      console.error('Session check failed:', error);
      return { error: 'Network error. Please check your connection.' };
    }
  },

  async getCurrentUser() {
    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || `HTTP ${response.status}` };
      }

      return { data };
    } catch (error) {
      console.error('Get current user failed:', error);
      return { error: 'Network error. Please check your connection.' };
    }
  },
};

export const infoApi = {
  async getUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || `HTTP ${response.status}` };
      }

      return { data };
    } catch (error) {
      console.error('Get users failed:', error);
      return { error: 'Network error. Please check your connection.' };
    }
  },
};

export interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
}

export interface SessionResponse {
  authenticated: boolean;
  user?: User;
}
