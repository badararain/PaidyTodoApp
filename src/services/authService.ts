import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Linking, Platform } from 'react-native';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();



/**
 * Authentication service with secure storage
 * Handles authentication state and secure session management
 */
export class AuthService {
  private static readonly SESSION_KEY = 'secure_session';
  private static readonly AUTH_KEY = 'auth_state';
  private static readonly BIOMETRIC_KEY = 'biometric_state';
  private static readonly MAX_ATTEMPTS = 3;
  private static readonly LOCKOUT_DURATION = 300000; // 5 minutes
  private static readonly SESSION_TIMEOUT = 900000; // 15 minutes
  
  private static failedAttempts = 0;
  private static lockoutUntil: number | null = null;
  private static sessionExpiry: number | null = null;

  /**
   * Check if user has authenticated before (persistent key)
   */
  static async hasAuthenticatedBefore(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(this.AUTH_KEY);
      return value === 'authenticated';
    } catch (error) {
      console.error('Error checking auth history:', error);
      return false;
    }
  }

  /**
   * Set persistent authentication key
   */
  private static async setAuthenticatedKey(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.AUTH_KEY, 'authenticated');
    } catch (error) {
      console.error('Error setting auth key:', error);
    }
  }



  /**
   * Check if current session is valid
   */
  static async isSessionValid(): Promise<boolean> {
    try {
      const sessionStr = await AsyncStorage.getItem(this.SESSION_KEY);
      if (!sessionStr) return false;
      
      let session;
      try {
        session = JSON.parse(sessionStr);
      } catch (parseError) {
        // Clean up corrupted session data
        await AsyncStorage.removeItem(this.SESSION_KEY);
        return false;
      }
      
      const now = Date.now();
      if (session.expiry && now < session.expiry) {
        await this.extendSession();
        return true;
      }
      await AsyncStorage.removeItem(this.SESSION_KEY);
      return false;
    } catch (error) {
      console.error('Error checking session:', error);
      return false;
    }
  }

  /**
   * Extend current session timeout
   */
  private static async extendSession(): Promise<void> {
    try {
      const expiry = Date.now() + this.SESSION_TIMEOUT;
      const sessionData = JSON.stringify({ expiry, timestamp: Date.now() });
      await AsyncStorage.setItem(this.SESSION_KEY, sessionData);
      this.sessionExpiry = expiry;
    } catch (error) {
      console.error('Error extending session:', error);
    }
  }

  /**
   * Create new authenticated session
   */
  private static async createSession(): Promise<void> {
    try {
      const expiry = Date.now() + this.SESSION_TIMEOUT;
      const sessionData = JSON.stringify({ expiry, timestamp: Date.now() });
      await Promise.all([
        AsyncStorage.setItem(this.SESSION_KEY, sessionData),
        this.setAuthenticatedKey()
      ]);
      this.sessionExpiry = expiry;
      this.failedAttempts = 0;
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create secure session');
    }
  }

  /**
   * Check if device is currently locked out due to failed attempts
   */
  static isLockedOut(): boolean {
    if (!this.lockoutUntil) return false;
    
    const now = Date.now();
    if (now < this.lockoutUntil) {
      return true;
    }
    
    // Reset expired lockout
    this.lockoutUntil = null;
    this.failedAttempts = 0;
    return false;
  }

  /**
   * Handle failed authentication attempt
   */
  private static handleFailedAttempt(): void {
    this.failedAttempts++;
    
    if (this.failedAttempts >= this.MAX_ATTEMPTS) {
      this.lockoutUntil = Date.now() + this.LOCKOUT_DURATION;
      Alert.alert(
        'Too Many Failed Attempts',
        `Access locked for ${this.LOCKOUT_DURATION / 60000} minutes due to security.`,
        [{ text: 'OK' }]
      );
    }
  }



  /**
   * Logout and clear all authentication data
   */
  static async logout(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(this.SESSION_KEY),
        AsyncStorage.removeItem(this.AUTH_KEY),
        AsyncStorage.removeItem(this.BIOMETRIC_KEY)
      ]);
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always reset in-memory state
      this.sessionExpiry = null;
      this.failedAttempts = 0;
      this.lockoutUntil = null;
    }
  }

  /**
   * Get remaining session time in minutes
   */
  static getRemainingSessionTime(): number {
    if (!this.sessionExpiry) return 0;
    const remaining = this.sessionExpiry - Date.now();
    return Math.max(0, Math.ceil(remaining / 60000));
  }

  /**
   * Check if biometric authentication is supported
   */
  static async isBiometricSupported(): Promise<boolean> {
    try {
      const { available } = await rnBiometrics.isSensorAvailable();
      return available;
    } catch {
      return false;
    }
  }

  /**
   * Check if biometrics are enrolled (set up)
   */
  static async isBiometricEnrolled(): Promise<boolean> {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      return available && biometryType !== undefined;
    } catch {
      return false;
    }
  }

  /**
   * Open device settings for biometric setup
   */
  static async openBiometricSettings(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        try {
          await Linking.openURL('App-prefs:PASSCODE');
        } catch {
          await Linking.openURL('prefs:root=PASSCODE');
        }
      } else {
        await Linking.sendIntent('android.settings.SECURITY_SETTINGS');
      }
    } catch (error) {
      console.error('Error opening settings:', error);
      await Linking.openSettings();
    }
  }



  /**
   * Get biometric display name for UI
   */
  static async getBiometricDisplayName(): Promise<string> {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      if (!available) return 'Device Authentication';
      
      if (Platform.OS === 'ios') {
        if (biometryType === BiometryTypes.FaceID) return 'Face ID';
        if (biometryType === BiometryTypes.TouchID) return 'Touch ID';
      } else {
        if (biometryType === BiometryTypes.Biometrics) return 'Biometric Authentication';
      }
      return 'Device Authentication';
    } catch {
      return 'Device Authentication';
    }
  }



  /**
   * Authenticate using native biometric popup (shows all available options)
   */
  static async authenticate(): Promise<boolean> {
    try {
      if (this.isLockedOut()) {
        const remainingTime = Math.ceil((this.lockoutUntil! - Date.now()) / 60000);
        Alert.alert(
          'Access Locked',
          `Please wait ${remainingTime} more minutes before trying again.`,
          [{ text: 'OK' }]
        );
        return false;
      }

      if (await this.isSessionValid()) {
        return true;
      }

      const { available, } = await rnBiometrics.isSensorAvailable();
      
      if (!available) {
        Alert.alert(
          'Authentication Required',
          'Please set up biometric authentication in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => this.openBiometricSettings() }
          ]
        );
        return false;
      }

      // Use native popup - it automatically shows all available biometric options
      const authPromise = rnBiometrics.simplePrompt({
        promptMessage: 'Authenticate to access your TODOs',
        fallbackPromptMessage: 'Use Passcode'
      });
      
      const timeoutPromise = new Promise<{success: boolean, error: string}>((_, reject) => {
        setTimeout(() => reject(new Error('Authentication timeout')), 30000);
      });
      
      const { success, error } = await Promise.race([authPromise, timeoutPromise]);
        
      if (success) {
        await AsyncStorage.setItem(this.BIOMETRIC_KEY, 'authenticated');
        await this.createSession();
        return true;
      } else {
        if (error === 'User cancellation' || error === 'User fallback') {
          return false;
        } else {
          this.handleFailedAttempt();
          return false;
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      const errorMessage = error instanceof Error && error.message === 'Authentication timeout'
        ? 'Authentication timed out. Please try again.'
        : 'An unexpected error occurred. Please try again.';
      
      Alert.alert(
        'Authentication Error',
        errorMessage,
        [{ text: 'OK' }]
      );
      return false;
    }
  }
}