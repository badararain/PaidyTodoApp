import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { AuthService } from '../services/authService';


export const LoginScreen: React.FC = () => {
  const { 
    authenticate, 
    isLoading, 
    biometricSupported, 
    hasAuthenticatedBefore,
    biometricDisplayName
  } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);

  useEffect(() => {
    const checkEnrollment = async () => {
      try {
        const enrolled = await AuthService.isBiometricEnrolled();
        setIsEnrolled(enrolled);
      } catch {
        setIsEnrolled(false);
      }
    };
    checkEnrollment();
  }, []);

  const handleAuthenticate = async () => {
    if (!biometricSupported || !isEnrolled) {
      Alert.alert(
        'Setup Required',
        'Please set up biometric authentication in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => AuthService.openBiometricSettings() }
        ]
      );
      return;
    }
    await authenticate();
  };

  const isReady = biometricSupported && isEnrolled;
  const welcomeMessage = isReady
    ? hasAuthenticatedBefore
      ? `Welcome back! Use ${biometricDisplayName} to continue`
      : `Secure your TODOs with ${biometricDisplayName}`
    : 'Please set up biometric authentication first';
  
  const buttonText = isReady
    ? hasAuthenticatedBefore
      ? `🔓 Unlock with ${biometricDisplayName}`
      : `🔐 Setup ${biometricDisplayName}`
    : 'Setup Required';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>🔐</Text>
        <Text style={styles.title}>
          {hasAuthenticatedBefore ? 'Welcome Back!' : 'Secure TODO'}
        </Text>
        <Text style={styles.subtitle}>
          {welcomeMessage}
        </Text>
        
        {!isReady && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              {!biometricSupported 
                ? 'Biometric authentication is not available'
                : `${biometricDisplayName} is not set up`
              }
            </Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[
            styles.loginButton, 
            isLoading && styles.loginButtonDisabled
          ]} 
          onPress={handleAuthenticate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>
              {buttonText}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.securityNote}>
          Your data is encrypted and secured
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  icon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E5BFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  warningContainer: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#2E5BFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#2E5BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 250,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  securityNote: {
    marginTop: 20,
    fontSize: 14,
    color: '#28A745',
    textAlign: 'center',
    fontWeight: '500',
  },
});