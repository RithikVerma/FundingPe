import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ConfirmationForm = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('John Doe');
  const [mobile, setMobile] = useState('9876543210');
  const [email, setEmail] = useState('johndoe@example.com');
  const [city, setCity] = useState('Mumbai');
  const [pinCode, setPinCode] = useState('400001');

  const handleSubmit = () => {
    // Handle form submission logic here
    navigation.goBack();
  };

  return (
    <ScrollView style={{ backgroundColor: 'white' }} showsVerticalScrollIndicator={false}>
      <StatusBar backgroundColor="#7925ff" barStyle="light-content" />
      
      <View style={styles.container}>
        <Text style={styles.header}>Shipping Address</Text>

        <View style={styles.formGroup}>
          <TextInput 
            style={styles.input} 
            placeholder="Full Name" 
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.formGroup}>
          <TextInput 
            style={styles.input} 
            placeholder="Mobile Number" 
            keyboardType="phone-pad" 
            value={mobile}
            onChangeText={setMobile}
          />
        </View>

        <View style={styles.formGroup}>
          <TextInput 
            style={styles.input} 
            placeholder="Email" 
            keyboardType="email-address" 
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.formGroup}>
          <TextInput 
            style={styles.input} 
            placeholder="City" 
            value={city}
            onChangeText={setCity}
          />
        </View>

        <View style={styles.formGroup}>
          <TextInput 
            style={styles.input} 
            placeholder="Pin Code" 
            keyboardType="numeric" 
            value={pinCode}
            onChangeText={setPinCode}
          />
        </View>

        <View style={{ marginBottom: 20 }}>
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Send Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    margin: 15,
    borderRadius: 15,
    elevation: 10
  },
  header: {
    fontSize: 18,
    color: '#7925ff',
    marginBottom: 15,
    textAlign: 'center'
  },
  formGroup: {
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    color: 'black',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#7925ff',
    borderRadius: 50,
    paddingVertical: 10,
    marginHorizontal: 60,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ConfirmationForm; 