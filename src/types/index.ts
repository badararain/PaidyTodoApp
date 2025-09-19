export interface Todo {
  id: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricSupported: boolean;
  hasAuthenticatedBefore: boolean;
  biometricDisplayName: string;
  authenticate: () => Promise<boolean>;
  logout: () => Promise<void>;
  checkBiometricSupport: () => Promise<boolean>;
}

export interface TodoContextType {
  todos: Todo[];
  addTodo: (text: string) => Promise<void>;
  updateTodo: (id: string, text: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  loading: boolean;
}