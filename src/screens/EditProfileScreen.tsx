import React, { useState, useEffect, useCallback } from 'react';
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
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getAuthToken } from '../utils/tokenStorage';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Profile data
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [newProfileImage, setNewProfileImage] = useState<{ uri: string, name: string, type: string } | null>(null);

  // Helper function to format image URL if needed
  const formatImageUrl = (url: string): string => {
    // If URL is already a full URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it's a relative path, prepend the API base URL
    if (url.startsWith('/')) {
      return `http://fund.swarojgar.org${url}`;
    }
    
    // Otherwise, assume it's a partial path and construct the full URL
    return `http://fund.swarojgar.org/${url}`;
  };

  // Fetch profile data from API
  const fetchProfileData = useCallback(async () => {
    try {
      setProfileLoading(true);
      const token = await getAuthToken();
      
      if (!token) {
        console.warn('No token found for profile data fetch');
        setProfileLoading(false);
        return;
      }

      console.log('Using token for profile API:', token);
      
      // Try different authorization formats
      let profileData = null;
      let errorMessage = '';
      
      // Try Bearer token format first
      try {
        const response = await fetch('http://fund.swarojgar.org/api/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        
        const responseText = await response.text();
        console.log('Profile API response text:', responseText);
        
        if (response.ok && responseText) {
          try {
            const data = JSON.parse(responseText);
            console.log('Profile API response parsed:', data);
            profileData = data;
          } catch (parseError) {
            console.error('Error parsing profile response:', parseError);
            errorMessage = 'Invalid response format';
          }
        } else {
          console.log('Bearer token format failed, status:', response.status);
          errorMessage = `API error: ${response.status}`;
        }
      } catch (error: any) {
        console.error('Error with Bearer format for profile API:', error);
        errorMessage = error.message || 'Network error';
      }
      
      // If Bearer format failed, try token directly
      if (!profileData) {
        try {
          const response = await fetch('http://fund.swarojgar.org/api/profile', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': token
            },
          });

          const responseText = await response.text();
          console.log('Profile API direct token response text:', responseText);
          
          if (response.ok && responseText) {
            try {
              const data = JSON.parse(responseText);
              console.log('Profile API direct token response parsed:', data);
              profileData = data;
            } catch (parseError) {
              console.error('Error parsing profile direct token response:', parseError);
            }
          }
        } catch (error: any) {
          console.error('Error with direct token format for profile API:', error);
        }
      }
      
      // Update profile from data if we got it
      if (profileData) {
        // Update profile state based on API response structure
        if (profileData.data) {
          setFullName(profileData.data.name || '');
          setEmail(profileData.data.email || '');
          setPhoneNumber(profileData.data.phone || '');
          setAddress(profileData.data.address || '');
          setCity(profileData.data.city || '');
          setPincode(profileData.data.pincode || '');
          setBio(profileData.data.bio || '');
          
          // Check multiple possible image fields
          let imageUrl = null;
          if (profileData.data.profile_image) {
            imageUrl = profileData.data.profile_image;
          } else if (profileData.data.image) {
            imageUrl = profileData.data.image;
          } else if (profileData.data.avatar) {
            imageUrl = profileData.data.avatar;
          }
          
          if (imageUrl) {
            console.log('Found profile image URL:', imageUrl);
            const formattedUrl = formatImageUrl(imageUrl);
            console.log('Formatted profile image URL:', formattedUrl);
            setProfileImage(formattedUrl);
          } else {
            console.log('No profile image found in response data');
            setProfileImage(null);
          }
        } else {
          // Alternative structure
          setFullName(profileData.name || '');
          setEmail(profileData.email || '');
          setPhoneNumber(profileData.phone || '');
          setAddress(profileData.address || '');
          setCity(profileData.city || '');
          setPincode(profileData.pincode || '');
          setBio(profileData.bio || '');
          
          // Check multiple possible image fields
          let imageUrl = null;
          if (profileData.profile_image) {
            imageUrl = profileData.profile_image;
          } else if (profileData.image) {
            imageUrl = profileData.image;
          } else if (profileData.avatar) {
            imageUrl = profileData.avatar;
          }
          
          if (imageUrl) {
            console.log('Found profile image URL:', imageUrl);
            const formattedUrl = formatImageUrl(imageUrl);
            console.log('Formatted profile image URL:', formattedUrl);
            setProfileImage(formattedUrl);
          } else {
            console.log('No profile image found in response data');
            setProfileImage(null);
          }
        }
        
        // Reset newProfileImage since we've loaded from server
        setNewProfileImage(null);
      } else {
        console.error('Failed to fetch profile data:', errorMessage);
      }
    } catch (error: any) {
      console.error('Error fetching profile data:', error);
    } finally {
      setProfileLoading(false);
    }
  }, []);
  
  // Load data on initial render
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);
  
  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('EditProfileScreen focused - refreshing data from API');
      fetchProfileData();
      return () => {};
    }, [fetchProfileData])
  );

  // Function to handle profile image selection
  const handleSelectImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 800,
      maxWidth: 800,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', 'There was an error selecting the image.');
      } else if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0];
        if (selectedImage.uri) {
          // Create a file object for the form data
          setNewProfileImage({
            uri: selectedImage.uri,
            name: selectedImage.fileName || 'profile.jpg',
            type: selectedImage.type || 'image/jpeg',
          });
        }
      }
    });
  };

  const handleSaveProfile = async () => {
    // Validate inputs
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      
      // Get auth token
      const token = await getAuthToken();
      
      if (!token) {
        Alert.alert('Error', 'Authentication failed. Please login again.');
        setIsLoading(false);
        return;
      }
      
      let formData: FormData | null = null;
      let response;
      
      // Check if we have a new profile image to upload
      if (newProfileImage) {
        // Use FormData to upload the image along with profile data
        formData = new FormData();
        formData.append('name', fullName);
        formData.append('email', email);
        formData.append('phone', phoneNumber);
        formData.append('address', address);
        formData.append('city', city);
        formData.append('pincode', pincode);
        formData.append('bio', bio);
        
        // Append the profile image
        // Try both 'profile_image' and 'image' fields to ensure compatibility
        formData.append('profile_image', {
          uri: newProfileImage.uri,
          name: newProfileImage.name,
          type: newProfileImage.type,
        } as any);
        
        // Also include the image field, which might be used in the database
        formData.append('image', {
          uri: newProfileImage.uri,
          name: newProfileImage.name,
          type: newProfileImage.type,
        } as any);
        
        console.log('Updating profile with image data:', formData);
        
        // API call with multipart/form-data
        response = await fetch('http://fund.swarojgar.org/api/update-Profile', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });
      } else {
        // Regular JSON payload if no new image
        const profileData = {
          name: fullName,
          email: email,
          phone: phoneNumber,
          address: address,
          city: city,
          pincode: pincode,
          bio: bio,
        };
        
        console.log('Updating profile with data:', profileData);
        
        // JSON API call
        response = await fetch('http://fund.swarojgar.org/api/update-Profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(profileData),
        });
      }
      
      console.log('Update profile response status:', response.status);
      
      const responseText = await response.text();
      console.log('Update profile response text:', responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.log('Response is not JSON:', e);
        responseData = { message: 'Profile updated' };
      }
      
      if (response.ok) {
        // Wait a moment before refreshing to ensure server has processed the image
        setTimeout(async () => {
          // Refresh profile data immediately to show updated image
          await fetchProfileData();
        }, 1000);
        
    Alert.alert(
      'Success',
          responseData.message || 'Profile updated successfully',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        }
      ]
    );
      } else {
        let errorMessage = 'Failed to update profile. Please try again.';
        
        if (responseData.errors) {
          // Handle Laravel validation errors
          const errorArray = Object.values(responseData.errors).flat();
          errorMessage = errorArray.join('\n');
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }
        
        Alert.alert('Error', errorMessage);
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Connection error. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar backgroundColor="#8A2BE2" barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {profileLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8A2BE2" />
          <Text style={styles.loadingText}>Loading profile data...</Text>
        </View>
      ) : (
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.profileImageSection}>
          <View style={styles.avatarContainer}>
              {newProfileImage ? (
                <Image
                  source={{ uri: newProfileImage.uri }}
                  style={styles.avatar}
                />
              ) : profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.avatar}
                  onError={(e) => {
                    console.log('Error loading profile image:', e.nativeEvent.error, profileImage);
                    setProfileImage(null); // Fallback to default image on error
                  }}
                />
              ) : (
            <Image
              source={require('../assets/icons/Profile.jpg')}
              style={styles.avatar}
            />
              )}
              <TouchableOpacity style={styles.editImageButton} onPress={handleSelectImage}>
                <MaterialIcons name="photo-camera" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
            <Text style={styles.changePhotoText}>Tap icon to change profile photo</Text>
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              placeholderTextColor="#999"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your address"
                placeholderTextColor="#999"
                value={address}
                onChangeText={setAddress}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your city"
              placeholderTextColor="#999"
              value={city}
              onChangeText={setCity}
            />
          </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pincode</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your pincode"
                placeholderTextColor="#999"
                value={pincode}
                onChangeText={setPincode}
                keyboardType="number-pad"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Tell us about yourself"
              placeholderTextColor="#999"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>
      )}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.disabledButton]} 
          onPress={handleSaveProfile}
          disabled={isLoading || profileLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4fe',
  },
  header: {
    backgroundColor: '#8A2BE2',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    padding: 6,
  },
  scrollContainer: {
    flex: 1,
  },
  profileImageSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e1e1e1',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(138, 43, 226, 0.9)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  changePhotoText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  saveButton: {
    backgroundColor: '#8A2BE2',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#b794e3',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#555',
    fontSize: 16,
  },
});

export default EditProfileScreen; 