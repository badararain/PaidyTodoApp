import { AuthService } from '../services/authService';
import { StorageService } from '../services/storageService';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('react-native-biometrics', () => {
  const BiometryTypes = {
    TouchID: 'TouchID',
    FaceID: 'FaceID',
    Biometrics: 'Biometrics'
  };
  
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      isSensorAvailable: jest.fn().mockResolvedValue({
        available: true,
        biometryType: BiometryTypes.FaceID
      }),
      simplePrompt: jest.fn().mockResolvedValue({
        success: true
      })
    })),
    BiometryTypes
  };
});

jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
  Platform: { OS: 'ios' },
  Linking: { openURL: jest.fn() }
}));

const mockAsyncStorage = require('@react-native-async-storage/async-storage');

describe('User Acceptance Tests - PaidyTodoApp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UAT-001: User checks if device supports biometrics', () => {
    it('should detect Face ID is available', async () => {
      const isSupported = await AuthService.isBiometricSupported();
      expect(isSupported).toBe(true);
    });

    it('should detect Face ID is enrolled', async () => {
      const isEnrolled = await AuthService.isBiometricEnrolled();
      expect(isEnrolled).toBe(true);
    });

    it('should get biometric display name', async () => {
      const displayName = await AuthService.getBiometricDisplayName();
      expect(displayName).toBe('Face ID');
    });

    it('should check if biometric is supported', async () => {
      const supported = await AuthService.isBiometricSupported();
      expect(supported).toBe(true);
    });
  });

  describe('UAT-002: User signs in with biometrics', () => {
    it('should authenticate successfully with Face ID', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      const result = await AuthService.authenticate();
      
      expect(result).toBe(true);
    });

    it('should authenticate with biometrics', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      const result = await AuthService.authenticate();
      
      expect(result).toBe(true);
    });

    it('should create secure session after login', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      await AuthService.authenticate();
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'secure_session',
        expect.stringContaining('expiry')
      );
    });

    it('should remember user has authenticated before', async () => {
      await AuthService.authenticate();
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('auth_state', 'authenticated');
    });
  });

  describe('UAT-003: User adds new todo item', () => {
    it('should save new todo to device storage', async () => {
      const newTodo = {
        id: '1',
        text: 'Buy groceries',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await StorageService.saveTodos([newTodo]);
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'secure_todos',
        expect.stringContaining('Buy groceries')
      );
    });

    it('should load saved todos when app starts', async () => {
      const savedTodos = [{
        id: '1',
        text: 'Buy groceries',
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
      }];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(savedTodos));
      
      const todos = await StorageService.loadTodos();
      
      expect(todos).toHaveLength(1);
      expect(todos[0].text).toBe('Buy groceries');
    });

    it('should handle multiple todos in list', async () => {
      const multipleTodos = [
        { id: '1', text: 'Buy groceries', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', text: 'Walk the dog', createdAt: new Date(), updatedAt: new Date() },
        { id: '3', text: 'Finish assignment', createdAt: new Date(), updatedAt: new Date() }
      ];
      
      await StorageService.saveTodos(multipleTodos);
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'secure_todos',
        expect.stringContaining('Buy groceries')
      );
    });
  });

  describe('UAT-004: User updates existing todo item', () => {
    it('should save updated todo text', async () => {
      const updatedTodo = {
        id: '1',
        text: 'Buy organic groceries',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date()
      };
      
      await StorageService.saveTodos([updatedTodo]);
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'secure_todos',
        expect.stringContaining('Buy organic groceries')
      );
    });

    it('should preserve todo ID when updating', async () => {
      const originalTodos = [{
        id: 'unique-123',
        text: 'Original text',
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
      }];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(originalTodos));
      
      const todos = await StorageService.loadTodos();
      
      expect(todos[0].id).toBe('unique-123');
    });
  });

  describe('UAT-005: User removes todo item', () => {
    it('should save list without deleted item', async () => {
      const remainingTodos = [
        { id: '2', text: 'Walk the dog', createdAt: new Date(), updatedAt: new Date() }
      ];
      
      await StorageService.saveTodos(remainingTodos);
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'secure_todos',
        expect.not.stringContaining('Buy groceries')
      );
    });

    it('should handle empty list after deleting all items', async () => {
      await StorageService.saveTodos([]);
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'secure_todos',
        '[]'
      );
    });
  });

  describe('UAT-009: User uses biometric authentication', () => {
    it('should get biometric display name', async () => {
      const displayName = await AuthService.getBiometricDisplayName();
      
      expect(displayName).toBe('Face ID');
    });

    it('should authenticate with biometrics', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      const result = await AuthService.authenticate();
      
      expect(result).toBe(true);
    });
  });

  describe('UAT-006: User logs out successfully', () => {
    it('should clear all authentication data', async () => {
      await AuthService.logout();
      
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('secure_session');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('auth_state');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('biometric_state');
    });

    it('should reset session timer to zero', () => {
      const sessionTime = AuthService.getRemainingSessionTime();
      expect(sessionTime).toBe(0);
    });

    it('should require authentication again after logout', async () => {
      await AuthService.logout();
      
      const sessionValid = await AuthService.isSessionValid();
      expect(sessionValid).toBe(false);
    });
  });

  describe('UAT-007: User session management', () => {
    it('should maintain session for 15 minutes', async () => {
      const validSession = JSON.stringify({
        expiry: Date.now() + 900000, // 15 minutes
        timestamp: Date.now()
      });
      mockAsyncStorage.getItem.mockResolvedValue(validSession);
      
      const isValid = await AuthService.isSessionValid();
      
      expect(isValid).toBe(true);
    });

    it('should expire session after 15 minutes', async () => {
      const expiredSession = JSON.stringify({
        expiry: Date.now() - 1000, // Expired 1 second ago
        timestamp: Date.now() - 900000
      });
      mockAsyncStorage.getItem.mockResolvedValue(expiredSession);
      
      const isValid = await AuthService.isSessionValid();
      
      expect(isValid).toBe(false);
    });
  });

  describe('UAT-008: Data persistence and recovery', () => {
    it('should handle corrupted data gracefully', async () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockAsyncStorage.getItem.mockResolvedValue('invalid-json');
      
      await expect(StorageService.loadTodos()).rejects.toThrow('Failed to load todos');
      
      consoleSpy.mockRestore();
    });

    it('should return empty list when no data exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      const todos = await StorageService.loadTodos();
      
      expect(todos).toEqual([]);
    });
  });
});