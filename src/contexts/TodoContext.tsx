import React, { createContext, useContext, useState, useEffect } from 'react';
import { Todo, TodoContextType } from '../types';
import { StorageService } from '../services/storageService';

const TodoContext = createContext<TodoContextType | undefined>(undefined);

/**
 * Todo Context Provider
 * Manages TODO state and provides CRUD operations
 */
export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const loadedTodos = await StorageService.loadTodos();
      setTodos(loadedTodos);
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTodos = async (newTodos: Todo[]) => {
    await StorageService.saveTodos(newTodos);
    setTodos(newTodos);
  };

  const addTodo = async (text: string): Promise<void> => {
    if (!text.trim()) return;
    
    const newTodo: Todo = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: text.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newTodos = [newTodo, ...todos];
    await saveTodos(newTodos);
  };

  const deleteTodo = async (id: string): Promise<void> => {
    const newTodos = todos.filter(todo => todo.id !== id);
    await saveTodos(newTodos);
  };

  return (
    <TodoContext.Provider value={{
      todos,
      addTodo,
      deleteTodo,
      loading,
    }}>
      {children}
    </TodoContext.Provider>
  );
};

/**
 * Hook to use Todo Context
 */
export const useTodos = (): TodoContextType => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within TodoProvider');
  }
  return context;
};