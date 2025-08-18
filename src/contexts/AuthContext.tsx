import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType } from '../types';
import { AuthService } from '../services/authService';
import { AppState, AppStateStatus } from 'react-native';

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [hasAuthenticatedBefore, setHasAuthenticatedBefore] = useState(false);
  const [biometricDisplayName, setBiometricDisplayName] = useState<string>('Device Authentication');

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const sessionValid = await AuthService.isSessionValid();
        
        if (sessionValid) {
          setIsAuthenticated(true);
          setHasAuthenticatedBefore(true);
          setIsLoading(false);
          return;
        }
        
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

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isAuthenticated) {
        try {
          const sessionValid = await AuthService.isSessionValid();
          if (!sessionValid) setIsAuthenticated(false);
        } catch {
          setIsAuthenticated(false);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isAuthenticated]);

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

  const logout = async (): Promise<void> => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsAuthenticated(false);
      setHasAuthenticatedBefore(false);
    }
  };

  const checkBiometricSupport = async (): Promise<boolean> => {
    try {
      const supported = await AuthService.isBiometricSupported();
      setBiometricSupported(supported);
      return supported;
    } catch {
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


export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};