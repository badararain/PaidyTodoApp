/**
 * Paidy TODO App
 * Secured TODO list with biometric authentication
 *
 * @format
 */

import React from 'react';
import { StatusBar, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { TodoProvider } from './src/contexts/TodoContext';
import { TodoList } from './src/components/TodoList';
import { LoginScreen } from './src/components/LoginScreen';

/**
 * Main App Content - Shows login or TODO list based on auth state
 */
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingIcon}>🔒</Text>
          <Text style={styles.loadingText}>Initializing Security...</Text>
          <ActivityIndicator 
            size="small" 
            color="#2E5BFF" 
            style={{ marginTop: 20 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isAuthenticated ? (
        <TodoProvider>
          <TodoList />
        </TodoProvider>
      ) : (
        <LoginScreen />
      )}
    </SafeAreaView>
  );
};

/**
 * Main App Component
 * Provides authentication context and handles auth flow
 */
function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#666666',
    fontWeight: '500',
  },
});

export default App;
