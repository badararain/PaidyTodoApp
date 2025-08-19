# Paidy TODO App

A secure TODO list application built with React Native featuring biometric authentication for enhanced security.

## 📱 Overview

This is a React Native TODO application that implements biometric authentication (Face ID/Touch ID/Fingerprint) to secure user data. The app provides a clean, intuitive interface for managing personal tasks while ensuring data privacy through device-level security.

## 🎯 Features

- **Biometric Authentication**: Secure login using Face ID, Touch ID, or Android Biometric authentication
- **Secure Data Storage**: Encrypted local storage for TODO items
- **Clean UI/UX**: Modern, intuitive interface with smooth animations
- **Session Management**: Automatic session validation and timeout handling
- **Cross-Platform**: Works on both iOS and Android devices
- **Offline First**: All data stored locally on device for privacy and performance

## 🏗️ Architecture

The application follows a clean architecture pattern with:

- **Context-based State Management**: React Context for global state
- **Service Layer**: Separated business logic for authentication and storage
- **Component-based UI**: Reusable React components
- **TypeScript**: Full type safety throughout the application

### Project Structure

```
src/
├── components/          # React components
│   ├── AddTodo.tsx     # Add new TODO component
│   ├── LoginScreen.tsx # Authentication screen
│   ├── TodoItem.tsx    # Individual TODO item
│   └── TodoList.tsx    # Main TODO list view
├── contexts/           # React Context providers
│   ├── AuthContext.tsx # Authentication state management
│   └── TodoContext.tsx # TODO state management
├── services/           # Business logic services
│   ├── authService.ts  # Biometric authentication service
│   └── storageService.ts # Local data storage service
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared interfaces and types
└── __tests__/          # Unit and integration tests
    └── UserAcceptance.test.ts # User acceptance tests
```

## 🔧 Technical Implementation

### Authentication Service

- **Biometric Detection**: Automatically detects available biometric methods
- **Security Lockout**: Implements failed attempt limits with temporary lockout
- **Session Management**: Secure session tokens with validation
- **Fallback Handling**: Graceful degradation when biometrics unavailable

### Storage Service

- **Encrypted Storage**: Uses AsyncStorage with secure key management
- **Data Persistence**: Reliable TODO data storage and retrieval
- **Error Handling**: Robust error handling for storage operations

### State Management

- **AuthContext**: Manages authentication state, biometric support, and user sessions
- **TodoContext**: Handles TODO operations (add, delete, load) and loading states

## 📦 Dependencies

### Core Dependencies

- **React Native 0.81.0**: Latest stable React Native framework
- **React 19.1.0**: Latest React version
- **react-native-biometrics**: Biometric authentication (equivalent to Expo LocalAuthentication)
- **@react-native-async-storage/async-storage**: Secure local storage
- **react-native-safe-area-context**: Safe area handling

### Development Dependencies

- **TypeScript**: Full type safety
- **Jest**: Testing framework
- **@testing-library/react-native**: Component testing utilities
- **ESLint**: Code linting
- **Prettier**: Code formatting

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- React Native development environment set up
- iOS Simulator or Android Emulator
- Physical device with biometric authentication (recommended for testing)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd PaidyTodoApp
   ```

2. **Install dependencies**

   ```bash
   yarn install
   # or
   npm install
   ```

3. **iOS Setup** (iOS only)
   ```bash
   cd ios
   Pod install
   cd ..
   ```

### Running the Application

1. **Start Metro bundler**

   ```bash
   yarn start
   # or
   npm start
   ```

2. **Run on iOS**

   ```bash
   yarn ios
   # or
   npm run ios
   ```

3. **Run on Android**
   ```bash
   yarn android
   # or
   npm run android
   ```

### Testing

Run the test suite:

```bash
yarn test
# or
npm test
```

### Clean Build (if needed)

```bash
yarn cleanBuild
```

## ⚠️ Important Notes

### Expo Module Integration Issue

Due to integration challenges with the latest Expo LocalAuthentication module within the project timeline, this implementation uses **react-native-biometrics** package instead. This package provides equivalent functionality to Expo's LocalAuthentication module and offers:

- Same biometric authentication capabilities
- Cross-platform support (iOS/Android)
- Similar API surface for authentication
- Reliable biometric detection and enrollment checking

The **react-native-biometrics** package is a mature, well-maintained alternative that provides the same security features and user experience as the Expo module.

### Main Branch

The main development branch for this project is **`main`**. All features and updates are committed to this branch.

## 🔄 Development Workflow

### Code Quality

- **ESLint**: Enforces coding standards
- **Prettier**: Maintains consistent code formatting
- **TypeScript**: Provides compile-time type checking
- **Jest**: Ensures code reliability through testing

## 🐛 Troubleshooting

### Common Issues

1. **Biometric Authentication Not Working**

   - Ensure device has biometric authentication set up
   - Check device settings for app permissions
   - Verify biometric enrollment in device settings

## 🤝 Contributing

This is a take-home assignment project. The implementation demonstrates:
