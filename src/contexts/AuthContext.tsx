import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType } from '../types';
import { AuthService } from '../services/authService';
import { AppState, AppStateStatus } from 'react-native';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Context Provider
 * Manages authentication state, session handling, and app lifecycle
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [hasAuthenticatedBefore, setHasAuthenticatedBefore] = useState(false);
  const [biometricDisplayName, setBiometricDisplayName] = useState<string>('Device Authentication');

  /**
   * Check initial authentication state
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Quick session check
        const sessionValid = await AuthService.isSessionValid();
        
        if (sessionValid) {
          setIsAuthenticated(true);
          setHasAuthenticatedBefore(true);
          setIsLoading(false);
          return;
        }
        
        // Get basic auth info
        const [supported, hasAuthBefore, displayName] = await Promise.all([
          AuthService.isBiometricSupported(),
          AuthService.hasAuthenticatedBefore(),
          AuthService.getBiometricDisplayName()
        ]);
        
        setBiometricSupported(supported);
        setHasAuthenticatedBefore(hasAuthBefore);
        setIsAuthenticated(false);
        setBiometricDisplayName(displayName);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsAuthenticated(false);
        setHasAuthenticatedBefore(false);
        setBiometricSupported(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Handle app state changes for security
   * Require re-authentication when app comes from background
   */
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isAuthenticated) {
        try {
          // Check if session is still valid when app becomes active
          const sessionValid = await AuthService.isSessionValid();
          if (!sessionValid) {
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error checking session validity:', error);
          setIsAuthenticated(false);
        }
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Optional: Immediately lock app when going to background
        // Uncomment the line below for maximum security
        // setIsAuthenticated(false);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isAuthenticated]);

  /**
   * Authenticate user and update state
   */
  const authenticate = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = await AuthService.authenticate();
      if (success) {
        setIsAuthenticated(true);
        setHasAuthenticatedBefore(true);
      }
      return success;
    } catch (error) {
      console.error('Authentication failed:', error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };



  /**
   * Logout user and clear all authentication data
   */
  const logout = async (): Promise<void> => {
    try {
      await AuthService.logout();
      setIsAuthenticated(false);
      setHasAuthenticatedBefore(false);
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if there's an error
      setIsAuthenticated(false);
      setHasAuthenticatedBefore(false);
    }
  };

  /**
   * Check if biometric authentication is available
   */
  const checkBiometricSupport = async (): Promise<boolean> => {
    try {
      const supported = await AuthService.isBiometricSupported();
      setBiometricSupported(supported);
      return supported;
    } catch (error) {
      console.error('Error checking biometric support:', error);
      setBiometricSupported(false);
      return false;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        isLoading,
        biometricSupported,
        hasAuthenticatedBefore,
        biometricDisplayName,
        authenticate,
        logout,
        checkBiometricSupport
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use Auth Context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};