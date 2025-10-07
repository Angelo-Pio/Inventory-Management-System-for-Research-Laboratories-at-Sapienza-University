const API_BASE_URL = import.meta.env.REACT_APP_BACKEND_URL || 'http://localhost:9001';

export const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const text = await response.text();
        return { success: true, data: text };
      }
    } else {
      const errorText = await response.text();
      return { success: false, error: errorText || 'API call failed' };
    }
  } catch (error) {
    console.error('API call error:', error);
    return { success: false, error: 'Network error occurred' };
  }
};