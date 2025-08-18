import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo } from '../types';

const TODOS_KEY = 'secure_todos';

export class StorageService {
  static async loadTodos(): Promise<Todo[]> {
    try {
      const todosJson = await AsyncStorage.getItem(TODOS_KEY);
      if (!todosJson) return [];
      
      const todos = JSON.parse(todosJson);
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

  static async saveTodos(todos: Todo[]): Promise<void> {
    try {
      await AsyncStorage.setItem(TODOS_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error('Error saving todos:', error);
      throw error;
    }
  }
}