import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTodos } from '../contexts/TodoContext';


export const AddTodo: React.FC = () => {
  const { addTodo } = useTodos();
  const [text, setText] = useState('');

  const handleSubmit = async () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please enter a todo item');
      return;
    }
    try {
      await addTodo(text);
      setText('');
    } catch (error) {
      Alert.alert('Error', 'Failed to add todo');
    }
  };

  return (
    <View style={styles.container}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Enter here"
          placeholderTextColor="#999999"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
          <Text style={styles.addButtonText}>ADD</Text>
        </TouchableOpacity>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 16,
  },
  addButton: {
    backgroundColor: '#2E5BFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});