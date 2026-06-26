
import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import * as authService from '../services/authService';

const AuthContext = createContext(undefined);

const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Axios instance with authentication interceptors.
 * Automatically attaches Bearer token and handles 401 refresh.
 */
export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const accessTokenRef = useRef(accessToken);
  accessTokenRef.current = accessToken;

  const isAuthenticated = !!user && !!accessToken;

    const refreshAccessToken = useCallback(async () => {
    try {
      const data = await authService.refreshToken();
      const newToken = data.accessToken || data.token;
      setAccessToken(newToken);
      return newToken;
    } catch {
      
      setUser(null);
      setAccessToken(null);
      return null;
    }
  }, []);

    const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    setAccessToken(data.accessToken || data.token);
    return data;
  }, []);

    const signup = useCallback(async (formData) => {
    const data = await authService.signup(formData);
    setUser(data.user);
    setAccessToken(data.accessToken || data.token);
    return data;
  }, []);

    const googleLogin = useCallback(async (googleData) => {
    const data = await authService.googleAuth(googleData);
    setUser(data.user);
    setAccessToken(data.accessToken || data.token);
    return data;
  }, []);

    const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      
    }
    setUser(null);
    setAccessToken(null);
    sessionStorage.removeItem('ai_insights');
  }, []);

    useEffect(() => {
    
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = accessTokenRef.current;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    let isRefreshing = false;
    let failedQueue = [];

    const processQueue = (error, token = null) => {
      failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
          reject(error);
        } else {
          resolve(token);
        }
      });
      failedQueue = [];
    };

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status !== 401 ||
          originalRequest._retry ||
          originalRequest.url?.includes('/auth/refresh-token')
        ) {
          return Promise.reject(error);
        }

        if (isRefreshing) {
          
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          } else {
            processQueue(new Error('Refresh failed'));
            return Promise.reject(error);
          }
        } catch (refreshError) {
          processQueue(refreshError);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [refreshAccessToken]);

    useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const data = await authService.refreshToken();
        if (cancelled) return;

        const token = data.accessToken || data.token;
        setAccessToken(token);

        try {
          const meResponse = await authService.getMe(token);
          if (!cancelled) {
            setUser(meResponse.user || meResponse);
          }
        } catch {
          
          if (!cancelled && data.user) {
            setUser(data.user);
          }
        }
      } catch {
        
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

    const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated,
      isLoading,
      login,
      signup,
      googleLogin,
      logout,
      refreshAccessToken,
    }),
    [user, accessToken, isAuthenticated, isLoading, login, signup, googleLogin, logout, refreshAccessToken]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
