const API_BASE_URL = 'http://localhost:8000/api/users';

// --- Token Utility Functions ---

/**
 * Saves both access and refresh tokens to localStorage.
 * @param {Object} tokens - An object containing 'access' and 'refresh' tokens.
 */

export const setAuthTokens = (tokens) => {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
};

/**
 * Retrieves the access token from localStorage.
 * @returns {string|null} The access token.
 */
export const getAccessToken = () => {
    return localStorage.getItem('access_token');
};

/**
 * Retrieves the refresh token from localStorage.
 * @returns {string|null} The refresh token.
 */
const getRefreshToken = () => {
    return localStorage.getItem('refresh_token');
};

/**
 * Clears all auth tokens from localStorage.
 */
export const clearAuthTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

/**
 * Checks if the user appears to be authenticated based on the presence of a token.
 * @returns {boolean} - True if an access token is present, false otherwise.
 */
export const isAuthenticated = () => {
    const token = getAccessToken();
    return !!token; // Returns true if token exists
};

// --- Primary Auth Functions ---

/**
 * Registers a new user. (No changes needed here)
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
            return { success: false, errors: data };
        }
    } catch (error) {
        console.error("Registration network error:", error);
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
            // *** MODIFICATION ***
            // Use setAuthTokens to save BOTH tokens
            if (data.access && data.refresh) {
                setAuthTokens(data);
            }
            return { success: true, data };
        } else {
            return { success: false, errors: data };
        }
    } catch (error) {
        console.error("Login network error:", error);
        return { success: false, errors: { non_field_errors: 'Network error. Please try again.' } };
    }
};

/**
 * Logs out the user by clearing tokens.
 */
export const logoutUser = () => {
    // *** MODIFICATION ***
    // Use clearAuthTokens to remove BOTH tokens
    clearAuthTokens();
    // Redirect to login (handled by AuthContext or component)
};

// --- Smart Fetch Wrapper ---

let refreshPromise = null;

/**
 * A wrapper for 'fetch' that automatically handles
 * token refreshing and authentication headers.
 * @param {string} url - The URL to fetch.
 * @param {Object} options - The fetch options (method, body, etc.)
 * @returns {Promise<Response>} - The fetch Response object.
 */

export const fetchWithAuth = async (url, options = {}) => {
    
    // 1. Get the current access token and set headers
    let token = getAccessToken();
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Automatically stringify body if it's an object
    if (options.body && typeof options.body === 'object' && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
        options.body = JSON.stringify(options.body);
    }

    options.headers = headers;

    // 3. Make the first request
    let response = await fetch(url, options);

    // 4. Check if the token was expired (401 Unauthorized)
    if (response.status === 401) {
        if (!refreshPromise) {
            // This is the first request to fail.
            // Create a new promise to get the token.
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                // No refresh token, just log out
                clearAuthTokens(); 
                throw new Error("Not authenticated. Please log in.");
            }

            refreshPromise = new Promise(async (resolve, reject) => {
                try {
                    // 5. Try to get a new access token
                    const refreshResponse = await fetch(`${API_BASE_URL}/token/refresh/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refresh: refreshToken })
                    });

                    if (!refreshResponse.ok) {
                        throw new Error('Refresh token was invalid');
                    }

                    const newTokens = await refreshResponse.json();
                    
                    // --- FIX FOR BUG 2 ---
                    // Save BOTH new tokens, not just the access token
                    setAuthTokens(newTokens);
                    
                    // Resolve the promise with the new access token
                    resolve(newTokens.access);
                } catch (err) {
                    // 8. If refresh fails, log the user out
                    console.error("Failed to refresh token", err);
                    clearAuthTokens(); 
                    reject(new Error("Session expired. Please log in again."));
                } finally {
                    // Reset the promise so new 401s can trigger a new refresh
                    refreshPromise = null;
                }
            });
        }

        // --- FIX FOR BUG 1 ---
        // All 401 requests (the first one and all others) 
        // will wait here for the refreshPromise to finish.
        try {
            const newAccessToken = await refreshPromise;

            // 7. Retry the original request with the new token
            options.headers.set('Authorization', `Bearer ${newAccessToken}`);
            response = await fetch(url, options); // This is the second call

        } catch (err) {
            // This happens if the refresh promise itself was rejected
            throw err;
        }
    }

    return response;
};


// export const fetchWithAuth = async (url, options = {}) => {
    
//     // 1. Get the current access token
//     let token = getAccessToken();

//     // 2. Set headers (This version correctly handles plain objects)
//     const headers = new Headers(options.headers || {});

//     if (token) {
//         headers.set('Authorization', `Bearer ${token}`);
//     }
    
//     // Automatically stringify body if it's an object
//     if (options.body && typeof options.body === 'object' && !headers.has('Content-Type')) {
//         headers.set('Content-Type', 'application/json');
//         options.body = JSON.stringify(options.body);
//     }

//     // Put the new, guaranteed Headers object back into options
//     options.headers = headers;


//     let response = await fetch(url, options); // <-- Was 'fetchWithAuth'

//     // 4. Check if the token was expired (401 Unauthorized)
//     if (response.status === 401 && !isRefreshing) {
//         isRefreshing = true;
//         const refreshToken = getRefreshToken();

//         if (refreshToken) {
//             try {
//                 // 5. Try to get a new access token
//                 const refreshResponse = await fetch(`${API_BASE_URL}/token/refresh/`, {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({ refresh: refreshToken })
//                 });

//                 if (!refreshResponse.ok) {
//                     throw new Error('Refresh token was invalid');
//                 }

//                 const newTokens = await refreshResponse.json();
                
//                 // 6. Save the new access token
//                 localStorage.setItem('access_token', newTokens.access);
//                 isRefreshing = false;

//                 // 7. Retry the original request with the new token
//                 options.headers.set('Authorization', `Bearer ${newTokens.access}`);
//                 response = await fetch(url, options); // <-- This is the second call

//             } catch (err) {
//                 // 8. If refresh fails, log the user out
//                 isRefreshing = false;
//                 console.error("Failed to refresh token", err);
//                 clearAuthTokens(); 
//                 throw new Error("Session expired. Please log in again.");
//             }
//         } else {
//             // No refresh token, just log out
//             clearAuthTokens();
//             throw new Error("Not authenticated. Please log in.");
//         }
//     }

//     return response;
// };