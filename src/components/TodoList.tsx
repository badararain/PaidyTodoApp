import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTodos } from '../contexts/TodoContext';
import { useAuth } from '../contexts/AuthContext';
import { TodoItem } from './TodoItem';
import { AddTodo } from './AddTodo';
import { Todo } from '../types';
import { AuthService } from '../services/authService';

/**
 * Todo List Component
 * Main component displaying the todo list with secure header and logout
 */
export const TodoList: React.FC = () => {
  const { todos, loading } = useTodos();
  const { logout } = useAuth();
  const [sessionTime, setSessionTime] = useState<number>(0);

  /**
   * Update session time every minute
   */
  useEffect(() => {
    const updateSessionTime = () => {
      try {
        const remaining = AuthService.getRemainingSessionTime();
        setSessionTime(remaining);
      } catch (error) {
        console.error('Error getting session time:', error);
        setSessionTime(0);
      }
    };

    updateSessionTime();
    const interval = setInterval(updateSessionTime, 60000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Handle logout with confirmation
   */
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? You will need to authenticate again to access your TODOs.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  /**
   * Render individual todo item
   */
  const renderTodo = useCallback(({ item }: { item: Todo }) => <TodoItem todo={item} />, []);



  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E5BFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
          {/* Header with logout */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>TODO:</Text>
                {sessionTime > 0 && (
                  <Text style={styles.sessionTime}>
                    🔒 Session: {sessionTime}m
                  </Text>
                )}
              </View>
              <TouchableOpacity 
                style={styles.logoutButton} 
                onPress={handleLogout}
                accessibilityLabel="Logout"
              >
                <Text style={styles.logoutText}>Exit</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Todo List */}
          <FlatList
            data={todos}
            renderItem={renderTodo}
            keyExtractor={item => item.id}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
          {/* Add/Update Todo Input */}
          <AddTodo />
        </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E5BFF',
  },
  sessionTime: {
    fontSize: 12,
    color: '#28A745',
    marginTop: 4,
    fontWeight: '500',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  logoutText: {
    fontSize: 16,
    color: '#666666',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
});
