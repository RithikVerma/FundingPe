import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Linking,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAuthToken, removeAuthToken } from '../utils/tokenStorage';
import { ProfileStackParamList } from '../navigation/ProfileStack';
import { NavigationService } from '../navigation/NavigationService';

// Define root navigation types
type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Transaction: undefined;
  Center: undefined;
  Information: undefined;
  ProfileTab: undefined;
};

// Combine navigation types
type NavigationProp = NativeStackNavigationProp<ProfileStackParamList & RootStackParamList>;

interface ProfileOption {
  id: string;
  title: string;
  icon: string;
  onPress: () => void;
}

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
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
          setProfile({
            name: profileData.data.name || '',
            email: profileData.data.email || '',
            phone: profileData.data.phone || '',
            address: profileData.data.address || '',
            city: profileData.data.city || '',
            pincode: profileData.data.pincode || '',
          });
          
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
          setProfile({
            name: profileData.name || '',
            email: profileData.email || '',
            phone: profileData.phone || '',
            address: profileData.address || '',
            city: profileData.city || '',
            pincode: profileData.pincode || '',
          });
          
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
  
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              setIsLoading(true);
              await removeAuthToken();
              NavigationService.reset();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Profile options linked to existing screens
  const profileOptions: ProfileOption[] = [
    {
      id: '1',
      title: 'List Your Organization',
      icon: 'add-circle-outline',
      onPress: () => {
        Linking.openURL('https://www.fundingpe.in').catch(err => console.error('Error opening URL:', err));
      },
    },
    {
      id: '2',
      title: 'History',
      icon: 'history',
      onPress: () => navigation.navigate('Transaction'),
    },
    {
      id: '3',
      title: 'Favorites',
      icon: 'person',
      onPress: () => navigation.navigate('Center'),
    },
    {
      id: '4',
      title: 'Information',
      icon: 'info',
      onPress: () => navigation.navigate('Information'),
    },
    {
      id: '5',
      title: 'Notifications',
      icon: 'notifications',
      onPress: () => navigation.navigate('Notification'),
    },
    {
      id: '6',
      title: 'About Us',
      icon: 'info-outline',
      onPress: () => navigation.navigate('AboutUs'),
    },
    {
      id: '7',
      title: 'Terms & Conditions',
      icon: 'gavel',
      onPress: () => navigation.navigate('TermsConditions'),
    },
    {
      id: '8',
      title: 'Help & Support',
      icon: 'help-outline',
      onPress: () => navigation.navigate('HelpSupport'),
    },
  ];

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const renderProfileOption = (option: ProfileOption) => (
    <TouchableOpacity key={option.id} style={styles.optionItem} onPress={option.onPress}>
      <View style={styles.optionIconContainer}>
        <MaterialIcons name={option.icon} size={26} color="#8A2BE2" />
      </View>
      <Text style={styles.optionTitle}>{option.title}</Text>
      <MaterialIcons name="chevron-right" size={24} color="#CCCCCC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="transparent" translucent barStyle="dark-content" />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#8A2BE2" />
          </TouchableOpacity>
          {isLoading && (
            <ActivityIndicator size="small" color="#8A2BE2" style={styles.loader} />
          )}
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {profileImage ? (
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
          </View>
          {profileLoading ? (
            <ActivityIndicator size="small" color="#8A2BE2" />
          ) : (
            <>
              <Text style={styles.userName}>{profile.name || 'User'}</Text>
              <Text style={styles.userEmail}>{profile.email || 'No email'}</Text>
              {profile.phone && <Text style={styles.userPhone}>{profile.phone}</Text>}
            </>
          )}
        </View>

        <View style={styles.optionsContainer}>
          {profileOptions.map(renderProfileOption)}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={20} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <MaterialIcons name="edit" size={20} color="#fff" />
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#fff',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#e1e1e1',
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#777',
    marginBottom: 6,
  },
  userPhone: {
    fontSize: 14,
    color: '#777',
    marginBottom: 6,
  },
  optionsContainer: {
    padding: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f4fe',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  optionIconContainer: {
    marginRight: 16,
  },
  optionTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginVertical: 24,
  },
  logoutButton: {
    backgroundColor: '#ff5252',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flex: 1,
    marginRight: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  editButton: {
    backgroundColor: '#8A2BE2',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flex: 1,
    marginLeft: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  editText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  loader: {
    position: 'absolute',
    right: 16,
  },
});

export default ProfileScreen;