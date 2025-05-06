import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, 
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AppNavigator';
import Icon from 'react-native-vector-icons/Ionicons';
import { saveAuthToken } from '../../utils/tokenStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, getToken } from '@react-native-firebase/messaging';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [fcmToken, setFcmToken] = useState('');

  // Fetch FCM token using the new modular API
  useEffect(() => {
    const getFcmToken = async () => {
      try {
        // First try to get from AsyncStorage
        let token = await AsyncStorage.getItem('fcmToken');
        
        // If no token in storage, get from Firebase
        if (!token) {
          const app = getApp();
          const messaging = getMessaging(app);
          token = await getToken(messaging);
          
          if (token) {
            // Store in AsyncStorage for future use
            await AsyncStorage.setItem('fcmToken', token);
            console.log('New FCM Token stored:', token);
          }
        }
        
        if (token) {
          console.log('FCM Token retrieved:', token);
          setFcmToken(token);
        }
      } catch (error) {
        console.error('Error retrieving/storing FCM token:', error);
      }
    };
    
    // Get saved user email or phone if exists
    const getSavedUserEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('user_email');
        if (savedEmail) {
          setEmailOrPhone(savedEmail);
          console.log('Saved email/phone loaded:', savedEmail);
        }
      } catch (error) {
        console.error('Error retrieving saved email/phone:', error);
      }
    };
    
    getFcmToken();
    getSavedUserEmail();
  }, []);

  const handleLogin = async () => {
    if (!emailOrPhone || !password) {
      Alert.alert('Error', 'Please enter both email/phone and password');
      return;
    }
  
    try {
      setIsLoading(true);
  
      const payload = {
        email: emailOrPhone,
        password: password,
        device_token: fcmToken,
      };
  
      console.log('📤 Login payload:', payload);
      
      // Store email/phone and FCM token in AsyncStorage
      await AsyncStorage.setItem('user_email', emailOrPhone);
      await AsyncStorage.setItem('fcmToken', fcmToken);
  
      const response = await fetch('http://fund.swarojgar.org/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
  
      console.log('📥 Raw fetch response:', response);
      console.log('📦 Parsed Login API response:', data);
  
      if (response.ok) {
        let foundToken = null;
  
        if (data.token) foundToken = data.token;
        else if (data.access_token) foundToken = data.access_token;
        else if (data.data?.token) foundToken = data.data.token;
        else if (data.data?.access_token) foundToken = data.data.access_token;
        else if (data.auth?.token) foundToken = data.auth.token;
        else if (typeof data === 'string') foundToken = data;
  
        console.log('🔑 Token extracted:', foundToken);
  
        if (foundToken) {
          await saveAuthToken(foundToken);
          const storedToken = await AsyncStorage.getItem('auth_token');
          console.log('✅ Auth token stored in AsyncStorage:', storedToken);
        }
  
        navigation.reset({
          index: 0,
          routes: [{ name: 'AuthMain' }],
        });
      } else {
        console.warn('❌ Login failed with status:', response.status);
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('❗ Login error:', error);
      Alert.alert('Error', 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  
  // Rest of the component remains the same
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <StatusBar backgroundColor="white" barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.title}>Login</Text>
        </View>
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Email or Phone Number"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            autoComplete="off"
            textContentType="none"
            underlineColorAndroid="transparent"
          />
          
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter Password"
              placeholderTextColor="#aaa"
              secureTextEntry={secureTextEntry}
              value={password}
              onChangeText={setPassword}
              autoComplete="off"
            />
            <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
              <Icon name={secureTextEntry ? "eye-off-outline" : "eye-outline"} size={20} color="#aaa" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.disabledButton]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.forgotPassword} 
            onPress={() => navigation.navigate('ForgotPassword' as never)}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup' as never)}>
          <Text style={styles.footerLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7925ff',
    marginTop: 5,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    backgroundColor: '#f5f8ff',
    color: 'black',
    borderRadius: 50,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 50,
    backgroundColor: '#f5f8ff',
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    color: 'black',
  },
  loginButton: {
    backgroundColor: '#7525ff',
    width: '60%',
    alignSelf: 'center',
    borderRadius: 50,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 10,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#7525ff',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 16,
    color: 'black',
  },
  footerLink: {
    fontSize: 16,
    color: '#7525ff',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#a082d1',
  },
});

export default LoginScreen; 