const AUTH_BASE_URL = import.meta.env.REACT_APP_AUTH_URL || 'http://localhost:9002';

// Login function
export const login = async (email, password) => {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ email, password }),
      credentials: 'include' // Important for cookies
    });
    
    if (response.ok) {
      const result = await response.text();
      return { success: true, message: result };
    } else {
      const errorText = await response.text();
      return { success: false, error: errorText || 'Login failed' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error occurred' };
  }
};

// Logout function
export const logout = async () => {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: 'Logout failed' };
    }
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Network error occurred' };
  }
};


// Get user role from cookies
export const getUserRole = () => {
  const cookies = document.cookie.split(';');
  const roleCookie = cookies.find(cookie => cookie.trim().startsWith('role='));
  return roleCookie ? roleCookie.split('=')[1] : null;
};

// Get user ID from cookies
export const getUserId = () => {
  const cookies = document.cookie.split(';');
  const userIdCookie = cookies.find(cookie => cookie.trim().startsWith('userId='));
  return userIdCookie ? userIdCookie.split('=')[1] : null;
};

const authService = {
  login,
  logout,
  getUserRole,
  getUserId
};

export default authService;