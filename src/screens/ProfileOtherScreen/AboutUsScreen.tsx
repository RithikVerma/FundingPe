import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { getAuthToken } from '../../utils/tokenStorage';
import { API_BASE_URL } from '../../utils/api';

interface AboutItem {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface AboutUsData {
  mission?: string;
  who_we_are?: string;
  what_we_do?: string;
  values?: string[];
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  version?: string;
  aboutItems?: AboutItem[];
}

const AboutUsScreen: React.FC = () => {
  const navigation = useNavigation();
  const logoIcon = require('../../assets/icons/logo2.jpg');
  const [loading, setLoading] = useState(true);
  const [aboutData, setAboutData] = useState<AboutUsData>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      console.log('Fetching about us data from API');
      
      // Get authentication token using the app's standard token utility
      const token = await getAuthToken();
      
      if (!token) {
        console.warn('No authentication token found for About API');
      } else {
        console.log('Token found for About API');
      }
      
      // Create headers with authentication
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Make the API request
      const url = `${API_BASE_URL}/About`;
      console.log(`Fetching from: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      
      console.log('About API response status:', response.status);
      
      if (!response.ok) {
        const responseText = await response.text();
        console.error('API error response:', responseText);
        throw new Error(`API error: ${response.status}`);
      }
      
      const responseText = await response.text();
      console.log('About API raw response:', responseText);
      
      // Parse the JSON response, handling empty responses
      const responseData = responseText ? JSON.parse(responseText) : {};
      console.log('About API parsed data:', responseData);
      
      // Check if the API response has the expected structure
      if (responseData.status === 'success' && responseData.data && Array.isArray(responseData.data)) {
        // Process the array data into our AboutUsData format
        const aboutData: AboutUsData = {
          aboutItems: responseData.data,
          version: '1.0.0' // Default version
        };
        
        console.log('Processed about data:', aboutData);
        setAboutData(aboutData);
        setLoading(false);
        setError(null);
      } else {
        console.error('Unexpected API response format:', responseData);
        throw new Error('Invalid response format from API');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error occurred';
      console.error('Error fetching about us data:', errorMessage);
      
      // Temporary fallback to hardcoded data for development
      setAboutData({
        version: '1.0.0',
        mission: 'At FundingPe, we strive to make charitable giving accessible, transparent, and easy for everyone. Our platform connects donors with organizations and causes that need support, facilitating meaningful contributions that help build stronger communities.',
        who_we_are: 'FundingPe was founded in 2023 with a vision to revolutionize how people donate to religious and charitable causes. Our team comprises tech professionals, social impact experts, and passionate individuals committed to creating a positive difference in society.',
        what_we_do: 'We provide a secure, user-friendly platform that enables seamless donations to various organizations including masjids, madarsas, and social work initiatives. Our UPI-based payment system ensures that contributing to causes you care about is just a few taps away.',
        values: [
          'Transparency: We believe in complete transparency in all our operations and transactions.',
          'Integrity: We maintain the highest ethical standards and ensure that all donations reach their intended recipients.',
          'Inclusivity: We welcome donors and organizations from all backgrounds and beliefs.',
          'Innovation: We continuously strive to improve our platform and services.'
        ],
        contact: {
          email: 'support@fundingpe.com',
          phone: '+91 1234567890',
          address: '123 Tech Park, Mumbai, Maharashtra, India'
        }
      });
      
      setError(`Unable to fetch about us data: ${errorMessage}. Using fallback content.`);
      setLoading(false);
      
      // Alert for developers only - remove in production
      if (__DEV__) {
        Alert.alert(
          'API Error',
          `Failed to fetch About Us data: ${errorMessage}. Please check authentication status.`,
          [{ text: 'OK' }]
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#8A2BE2" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>About Us</Text>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={logoIcon}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>FundingPe</Text>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8A2BE2" />
            <Text style={styles.loadingText}>Loading about us information...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={48} color="#FF6347" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchAboutData}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.contentCard}>
            <Text style={styles.versionText}>Version {aboutData.version || '1.0.0'}</Text>
            
            {aboutData.aboutItems && aboutData.aboutItems.length > 0 ? (
              // Display API data
              <>
                {aboutData.aboutItems.map((item, index) => (
                  <View key={index} style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>{item.title}</Text>
                    <Text style={styles.contentText}>{item.description}</Text>
                  </View>
                ))}
              </>
            ) : (
              // Display fallback data if aboutItems not available
              <>
                {aboutData.mission && (
                  <>
                    <Text style={styles.sectionTitle}>Our Mission</Text>
                    <Text style={styles.contentText}>{aboutData.mission}</Text>
                  </>
                )}
                
                {aboutData.who_we_are && (
                  <>
                    <Text style={styles.sectionTitle}>Who We Are</Text>
                    <Text style={styles.contentText}>{aboutData.who_we_are}</Text>
                  </>
                )}
                
                {aboutData.what_we_do && (
                  <>
                    <Text style={styles.sectionTitle}>What We Do</Text>
                    <Text style={styles.contentText}>{aboutData.what_we_do}</Text>
                  </>
                )}
                
                {aboutData.values && aboutData.values.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Our Values</Text>
                    {aboutData.values.map((value, index) => (
                      <Text key={index} style={styles.contentText}>
                        • {value}
                      </Text>
                    ))}
                  </>
                )}
                
                {aboutData.contact && (
                  <>
                    <Text style={styles.sectionTitle}>Contact Us</Text>
                    {aboutData.contact.email && (
                      <Text style={styles.contentText}>
                        Email: {aboutData.contact.email}
                      </Text>
                    )}
                    {aboutData.contact.phone && (
                      <Text style={styles.contentText}>
                        Phone: {aboutData.contact.phone}
                      </Text>
                    )}
                    {aboutData.contact.address && (
                      <Text style={styles.contentText}>
                        Address: {aboutData.contact.address}
                      </Text>
                    )}
                  </>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#8A2BE2',
    height: 60,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
     width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    backgroundColor: '#8A2BE2',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7925ff',
  },
  versionText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  contentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7925ff',
    marginTop: 16,
    marginBottom: 8,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
    marginBottom: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    height: 300,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    height: 300,
  },
  errorText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#8A2BE2',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginBottom: 16,
  },
});

export default AboutUsScreen; 