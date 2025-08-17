import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo } from '../types';

const TODOS_KEY = 'secure_todos';

/**
 * Storage service for persisting TODO data
 * Uses AsyncStorage for local data persistence
 */
export class StorageService {
  /**
   * Load todos from AsyncStorage
   */
  static async loadTodos(): Promise<Todo[]> {
    try {
      const todosJson = await AsyncStorage.getItem(TODOS_KEY);
      if (!todosJson) return [];
      
      const todos = JSON.parse(todosJson);
      // Convert date strings back to Date objects
      return todos.map((todo: Todo) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt),
      }));
    } catch (error) {
      console.error('Error loading todos:', error);
      throw new Error('Failed to load todos');
    }
  }

  /**
   * Save todos to AsyncStorage
   */
  static async saveTodos(todos: Todo[]): Promise<void> {
    try {
      await AsyncStorage.setItem(TODOS_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error('Error saving todos:', error);
      throw error;
    }
  }
}