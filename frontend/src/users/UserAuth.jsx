const API_BASE_URL = 'http://localhost:8000/api/users';

/**
 * Registers a new user.
 * @param {Object} userData - The user's registration data (full_name, email, password, password_confirm).
 * @returns {Promise<Object>} - A promise that resolves to the response data or rejects with an error object.
 */

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data };
    } else {
      // Return errors from the backend
      return { success: false, errors: data };
    }
  } catch (error) {
    console.error("Registration network error:", error);
    // Return a generic error for network issues
    return { success: false, errors: { non_field_errors: 'Network error. Please try again.' } };
  }
};

/**
 * Logs in a user using JWT authentication.
 * @param {Object} credentials - The user's login credentials (email, password).
 * @returns {Promise<Object>} - A promise that resolves to the response data (including tokens) or rejects with an error object.
 */
export const loginUser = async (credentials) => {
  try {
    // Prepare data for SimpleJWT (expects 'username' and 'password')
    const loginData = {
      username: credentials.email, // Map email to username for backend
      password: credentials.password,
    };

    const response = await fetch(`${API_BASE_URL}/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    const data = await response.json();

    if (response.ok) {
      // Store the access token upon successful login
      if (data.access) {
        localStorage.setItem('access_token', data.access);
        // Optionally store refresh token if needed later
        // localStorage.setItem('refresh_token', data.refresh);
      }
      return { success: true, data };
    } else {
      // Return login errors (e.g., invalid credentials)
      // SimpleJWT often returns { detail: "..." }
      return { success: false, errors: data };
    }
  } catch (error) {
    console.error("Login network error:", error);
    return { success: false, errors: { non_field_errors: 'Network error. Please try again.' } };
  }
};

/**
 * Logs out the user by clearing tokens.
 * (For JWT, this typically means removing the token from storage).
 * If using session auth, you might need to call a logout endpoint.
 */
export const logoutUser = () => {
  localStorage.removeItem('access_token');
  // localStorage.removeItem('refresh_token'); // If you stored it
  // Optionally, if using sessions, call your /api/auth/logout/ endpoint
};

/**
 * Checks if the user appears to be authenticated based on the presence of a token.
 * Note: This is a basic check. For robustness, you might want to verify the token's validity/expiry.
 * @returns {boolean} - True if an access token is present, false otherwise.
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  return !!token; // Returns true if token exists, false otherwise
  // Consider adding token expiry check here if needed
};

/**
 * Gets the stored access token.
 * @returns {string|null} - The access token or null if not found.
 */
export const getAccessToken = () => {
  return localStorage.getItem('access_token');
};

// You can add other utility functions here, like refreshing the token if needed later.
