import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigationRef } from './NavigationService';

// Import screens
import LoginScreen from '../screens/AuthScreens/LoginScreen';
import SignupScreen from '../screens/AuthScreens/SignupScreen';
import SplashScreen from '../screens/SplashScreen';
import ForgotPasswordScreen from '../screens/AuthScreens/ForgotPasswordScreen';
import BottomTabNavigator from './BottomTabNavigator';
import { getAuthToken } from '../utils/tokenStorage';
import NotificationScreen from '../screens/ProfileOtherScreen/NotificationScreen';

const AuthStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

// Define navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Notification: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  AuthMain: undefined;
};

// Authentication stack navigator
const AuthStackNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="AuthMain" component={BottomTabNavigator} />
    </AuthStack.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getAuthToken();
        console.log('Auth token check result:', token ? 'Token exists' : 'No token');
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Show splash screen while loading
  if (isLoading) {
    return <SplashScreen onFinish={() => setIsLoading(false)} />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        {isAuthenticated ? (
          <>
            <RootStack.Screen name="Main" component={BottomTabNavigator} />
            <RootStack.Screen 
              name="Notification" 
              component={NotificationScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_right'
              }}
            />
          </>
        ) : (
          <RootStack.Screen name="Auth" component={AuthStackNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 