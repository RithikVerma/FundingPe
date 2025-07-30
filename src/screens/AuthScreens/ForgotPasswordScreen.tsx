import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, 
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneChange = (text: string) => {
    // Remove any non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // If the number starts with 91, keep it, otherwise add it
    let formattedNumber = cleaned;
    if (!cleaned.startsWith('91')) {
      formattedNumber = '91' + cleaned;
    }
    
    // Limit to 12 digits (91 + 10 digits)
    if (formattedNumber.length > 12) {
      formattedNumber = formattedNumber.slice(0, 12);
    }
    
    setPhone(formattedNumber);
  };

  const handleResetPassword = async () => {
    // Validate all fields
    if (!email || !phone || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Phone number validation (including country code)
    if (phone.length !== 12) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    // Password validation
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    // Password confirmation validation
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Sending forgot password request with data:', {
        email: email,
        phone: phone,
        password: password,
      });
      
      const response = await fetch('http://fund.swarojgar.org/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          phone: phone,
          password: password,
          password_confirmation: confirmPassword,
        }),
      });

      const data = await response.json();
      console.log('API Response:', data);
      
      if (response.ok) {
        Alert.alert(
          "Password Reset Successful",
          "Your password has been reset successfully.",
          [{ text: "OK", onPress: () => navigation.navigate('Login' as never) }]
        );
      } else {
        let errorMessage = "Failed to reset password. Please try again.";
        
        if (data.errors) {
          // Handle Laravel validation errors
          const errorArray = Object.values(data.errors).flat();
          errorMessage = errorArray.join('\n');
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        Alert.alert("Error", errorMessage);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert("Error", "Connection error. Please check your internet connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <StatusBar backgroundColor="white" barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Reset Password</Text>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.instructions}>
            Please enter your details to reset your password.
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoComplete="off"
            textContentType="none"
            underlineColorAndroid="transparent"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number (e.g., 91XXXXXXXXXX)"
            placeholderTextColor="#aaa"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={handlePhoneChange}
            autoComplete="off"
            textContentType="none"
            underlineColorAndroid="transparent"
            maxLength={12}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="New Password"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureTextEntry}
              autoComplete="off"
            />
            <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
              <Icon name={secureTextEntry ? "eye-off-outline" : "eye-outline"} size={20} color="#aaa" />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm New Password"
              placeholderTextColor="#aaa"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={secureConfirmTextEntry}
              autoComplete="off"
            />
            <TouchableOpacity onPress={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)}>
              <Icon name={secureConfirmTextEntry ? "eye-off-outline" : "eye-outline"} size={20} color="#aaa" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.resetButton, isLoading && styles.disabledButton]} 
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.resetButtonText}>Reset Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    marginBottom: 30,
    marginTop: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7925ff',
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 20,
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
  resetButton: {
    backgroundColor: '#7525ff',
    width: '60%',
    alignSelf: 'center',
    borderRadius: 50,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  resetButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#a082d1',
  },
});

export default ForgotPasswordScreen; 