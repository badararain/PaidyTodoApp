import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Todo } from '../types';
import { useTodos } from '../contexts/TodoContext';

interface TodoItemProps {
  todo: Todo;
}


export const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const { updateTodo, deleteTodo } = useTodos();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editText.trim()) {
      Alert.alert('Error', 'Todo text cannot be empty');
      return;
    }
    try {
      await updateTodo(todo.id, editText);
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update todo');
    }
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

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
          {isEditing ? (
            <TextInput
              style={styles.editInput}
              value={editText}
              onChangeText={setEditText}
              autoFocus
              multiline
            />
          ) : (
            <Text style={styles.text}>{todo.text}</Text>
          )}
        </View>
        {isEditing ? (
          <View style={styles.editButtons}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>SAVE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editText}>EDIT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.removeButton} onPress={handleDelete}>
              <Text style={styles.removeText}>REMOVE</Text>
            </TouchableOpacity>
          </View>
        )}
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
  editInput: {
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#2E5BFF',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#F8F9FA',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 8,
  },
  editText: {
    fontSize: 14,
    color: '#2E5BFF',
    fontWeight: '500',
  },
  saveButton: {
    paddingHorizontal: 8,
  },
  saveText: {
    fontSize: 14,
    color: '#28A745',
    fontWeight: '500',
  },
  cancelButton: {
    paddingHorizontal: 8,
  },
  cancelText: {
    fontSize: 14,
    color: '#DC3545',
    fontWeight: '500',
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