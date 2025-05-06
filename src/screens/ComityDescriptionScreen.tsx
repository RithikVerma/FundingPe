import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { fetchProductById, toggleFavorite, getFavorites } from '../utils/api';

// Get screen width for responsive sizing
const screenWidth = Dimensions.get('window').width;

type RouteParams = {
  name: string;
  address: string;
  image: any;
  id: string;
  description?: string;
};

const ComityDescriptionScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute();
  const params = route.params as RouteParams;
  
  // State for product data
  const [productData, setProductData] = useState<{
    name: string;
    address: string;
    image: any;
    description: string;
    price?: string;
    Mobile?: string;
    upi?: string;
    Whatsapp?: string;
    QR?: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [followLoading, setFollowLoading] = useState<boolean>(false);

  // Fetch comity description from API
  useEffect(() => {
    const fetchComityData = async () => {
      if (!params?.id) {
        setLoading(false);
        setError('No ID provided to fetch comity details');
        return;
      }

      try {
        const data = await fetchProductById(params.id);
        
        if (data) {
          setProductData({
            name: data.name,
            address: data.address || params.address,
            image: data.image || params.image,
            description: data.description || params.description || 'No description available for this organization.',
            price: data.price,
            Mobile: data.Mobile || undefined,
            upi: data.upi || undefined,
            Whatsapp: data.Whatsapp || undefined,
            QR: data.QR || undefined,
          });
        } else {
          setError('Failed to load organization details');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching comity details:', err);
        setError('Failed to load organization details');
        setLoading(false);
      }
    };

    fetchComityData();
  }, [params?.id, params.address, params.image, params.description]);

  // Check if this organization is already in user's favorites
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!params?.id) return;
      
      try {
        const favorites = await getFavorites();
        if (favorites && favorites[params.id]) {
          setIsFavorite(true);
        }
      } catch (err) {
        console.error('Error checking favorite status:', err);
        // Don't set error state as this is not critical for UI
      }
    };
    
    checkFavoriteStatus();
  }, [params?.id]);

  const handlePayNow = () => {
    // Navigate back to the previous screen and trigger payment
    navigation.goBack();
  };

  const handleFollow = async () => {
    if (!params?.id) {
      ToastAndroid.show('Cannot follow: Missing ID', ToastAndroid.SHORT);
      return;
    }

    try {
      setFollowLoading(true);
      
      // Call API to toggle favorite status
      const response = await toggleFavorite(params.id);
      
      if (response && response.success) {
        // Toggle favorite status in local state
        setIsFavorite(prev => !prev);
        
        // Show success message
        ToastAndroid.show(
          isFavorite ? 'Removed from favorites' : 'Added to favorites', 
          ToastAndroid.SHORT
        );
      } else {
        ToastAndroid.show('Failed to update favorite status', ToastAndroid.SHORT);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      ToastAndroid.show('Failed to update favorite status', ToastAndroid.SHORT);
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#8A2BE2" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Description</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8A2BE2" />
            <Text style={styles.loadingText}>Loading details...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : productData && (
          <>
            {/* Compact Layout with Image and Organization Info Side by Side */}
            <View style={styles.topSection}>
              {/* Hero Image */}
              <Image 
                source={typeof productData.image === 'string' ? { uri: productData.image } : productData.image}
                style={styles.heroImage} 
                resizeMode="cover"
              />

              {/* Organization Details */}
              <View style={styles.basicDetailsContainer}>
                <Text style={styles.organizationName}>{productData.name}</Text>
                <Text style={styles.organizationLocation}>{productData.address}</Text>
                {productData.Mobile && (
                  <Text style={styles.contactInfo}>Mobile: {productData.Mobile}</Text>
                )}
              </View>
            </View>

            {/* Description Text */}
            <View style={styles.detailsContainer}>
              <Text style={styles.descriptionText}>
                {productData.description}
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.buttonContainer}>
        {/* {productData?.price && Number(productData.price) > 0 && (
          <TouchableOpacity style={styles.payButton} onPress={handlePayNow}>
            <Text style={styles.payButtonText}>Pay Now</Text>
          </TouchableOpacity>
        )} */}
        
        <TouchableOpacity 
          style={[
            styles.followButton,
            (!productData?.price || Number(productData.price) === 0) && styles.followButtonFullWidth
          ]} 
          onPress={handleFollow}
          disabled={followLoading}
        >
          {followLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text style={styles.followButtonText}>
                {isFavorite ? 'Following' : 'Follow'}
              </Text>
              <Icon 
                name={isFavorite ? "check" : "person-add"} 
                size={20} 
                color="white" 
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#8A2BE2',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  topSection: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  heroImage: {
    width: screenWidth * 0.3,
    height: screenWidth * 0.3,
    borderRadius: 8,
  },
  basicDetailsContainer: {
    flex: 1,
    paddingLeft: 16,
  },
  detailsContainer: {
    paddingHorizontal: 16,
  },
  organizationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  organizationLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
    textAlign: 'justify',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#d32f2f',
    textAlign: 'justify',
  },
  buttonContainer: {
    flexDirection: 'column',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  payButton: {
    backgroundColor: '#8A2BE2',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  followButton: {
    backgroundColor: '#8A2BE2',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  followButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  followButtonFullWidth: {
    marginBottom: 0,
  },
  contactInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  errorContainer: {
    padding: 16,
  },
});

export default ComityDescriptionScreen;
