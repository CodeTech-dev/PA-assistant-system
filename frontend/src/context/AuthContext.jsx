import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { 
    fetchWithAuth, 
    clearAuthTokens as baseClearAuthTokens, 
    loginUser as baseLoginUser // <-- This is new
} from '../users/UserAuth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // This function will fetch the user's data
    const loadUser = useCallback(async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (token) {
                const response = await fetchWithAuth('http://localhost:8000/api/users/me/');
                
                if (response.ok) {
                    const userData = await response.json();
                    // 2. FIX: Your 'me/' endpoint returns { is_authenticated: true, user: {...} }
                    setUser(userData.user); // <-- We must get the 'user' object from the response
                    return true;
                } else {
                    baseClearAuthTokens();
                    setUser(null);
                }
            }
        } catch (error) {
            console.error("Error loading user", error);
            baseClearAuthTokens();
            setUser(null);
        }
        return false;
    }, []);

    // Load user on initial app mount
    useEffect(() => {
        loadUser().finally(() => setIsLoading(false));
    }, [loadUser]);

    // 3. THIS IS THE NEW LOGIN FUNCTION
    // It calls your 'loginUser' function from UserAuth.js
    const login = async (email, password) => {
        try {
            const credentials = { email, password };
            const { success, data, errors } = await baseLoginUser(credentials);
            
            if (success) {
                // After tokens are saved, load the user's data
                await loadUser(); 
                return { success: true }; // <-- This returns 'success' to Login.js
            } else {
                return { success: false, errors };
            }
        } catch (error) {
            return { success: false, errors: { non_field_errors: 'Login failed.' } };
        }
    };

    // 4. THIS IS THE NEW LOGOUT FUNCTION
    const logout = () => {
        baseClearAuthTokens();
        setUser(null);
        window.location.href = '/login';
    };

    if (isLoading) {
        return <div>Loading...</div>; // Or a nice loading spinner
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

// This hook stays the same
export const useAuth = () => {
    return useContext(AuthContext);
};