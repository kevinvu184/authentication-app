import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthContextType, SignUpRequest, SignInRequest, UpdateProfileRequest } from './types';
import { api } from './api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from local storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          // Verify token is still valid by fetching user profile
          const userData = await api.getProfile(storedToken);
          setToken(storedToken);
          setUser(userData);
          
          // Update stored user data if it has changed
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
        } else {
          // Clear any partial auth data
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear invalid auth data
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signUp = async (data: SignUpRequest): Promise<void> => {
    try {
      const response = await api.signUp(data);
      setToken(response.token);
      setUser(response.user);
      
      // Store in local storage
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    }
  };

  const signIn = async (data: SignInRequest): Promise<void> => {
    try {
      const response = await api.signIn(data);
      setToken(response.token);
      setUser(response.user);
      
      // Store in local storage
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  };

  const signOut = (): void => {
    setToken(null);
    setUser(null);
    
    // Clear local storage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const updateProfile = async (data: UpdateProfileRequest): Promise<void> => {
    if (!token) {
      throw new Error('No authentication token available');
    }

    try {
      const updatedUser = await api.updateProfile(token, data);
      setUser(updatedUser);
      
      // Update stored user data
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};