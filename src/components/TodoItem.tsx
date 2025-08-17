import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Todo } from '../types';
import { useTodos } from '../contexts/TodoContext';

interface TodoItemProps {
  todo: Todo;
}

/**
 * Todo Item Component
 * Displays individual todo with select/delete functionality
 */
export const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const { deleteTodo } = useTodos();

  const handleDelete = () => {
    Alert.alert(
      'Delete Todo',
      `Are you sure you want to delete "${todo.text}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteTodo(todo.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete todo');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.indicator} />
        <View style={styles.textContainer}>
          <Text style={styles.text}>{todo.text}</Text>
        </View>
        <TouchableOpacity style={styles.removeButton} onPress={handleDelete}>
          <Text style={styles.removeText}>REMOVE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  indicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2E5BFF',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    color: '#333333',
  },

  removeButton: {
    paddingHorizontal: 8,
  },
  removeText: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '500',
  },
});