import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const SignupScreen: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [city, setCity] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [address, setAddress] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigation = useNavigation();

//Api Integration
  const handleSignup = async () => {
    // Validate input fields
    if (!fullName || !phoneNumber || !email || !password || !confirmPassword || !city || !pinCode || !address) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Phone number validation
    if (phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Sending signup request with data:', {
        name: fullName,
        phone: phoneNumber,
        email: email,
        password: password,
        password_confirmation: confirmPassword,
        city: city,
        pincode: pinCode,
        address: address,
      });

      const response = await fetch('http://fund.swarojgar.org/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: fullName,
          phone: phoneNumber,
          email: email,
          password: password,
          password_confirmation: confirmPassword,
          city: city,
          pincode: pinCode,
          address: address,
        }),
      });

      const data = await response.json();
      console.log('API Response:', data);
      
      if (response.ok) {
        // Registration successful
        Alert.alert('Success', 'Registration successful', [
          { text: 'OK', onPress: () => navigation.navigate('Login' as never) }
        ]);
      } else {
        // Registration failed
        let errorMessage = 'Registration failed. Please check your information.';
        
        if (data.errors) {
          // Handle Laravel validation errors
          const errorArray = Object.values(data.errors).flat();
          errorMessage = errorArray.join('\n');
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        Alert.alert('Registration Failed', errorMessage);
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Sign Up</Text>
        </View>
        
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#aaa"
            value={fullName}
            onChangeText={setFullName}
            underlineColorAndroid="transparent"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#aaa"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            underlineColorAndroid="transparent"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            underlineColorAndroid="transparent"
          />
          
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Set Password"
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
              placeholder="Confirm Password"
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

          <TextInput
            style={[styles.input, styles.formContainer]}
            placeholder="Full Address"
            placeholderTextColor="#aaa"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            underlineColorAndroid="transparent"
          />
          
          <TextInput
            style={styles.input}
            placeholder="City / Town / Village"
            placeholderTextColor="#aaa"
            value={city}
            onChangeText={setCity}
            underlineColorAndroid="transparent"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Pin Code"
            placeholderTextColor="#aaa"
            value={pinCode}
            onChangeText={setPinCode}
            keyboardType="numeric"
            underlineColorAndroid="transparent"
          />
          
          <TouchableOpacity 
            style={[styles.signupButton, isLoading && styles.disabledButton]} 
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.signupButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
          <Text style={styles.footerLink}>Login</Text>
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
    marginTop: 50,
  },
  formContainer: {
    paddingBottom: 20,
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
  signupButton: {
    backgroundColor: '#7525ff',
    width: '60%',
    alignSelf: 'center',
    borderRadius: 50,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  signupButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
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

export default SignupScreen; 