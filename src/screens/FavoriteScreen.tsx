import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PaymentDetailsScreen from '../components/PaymentDetailsScreen';
import { fetchFavorites } from '../utils/api';

interface FavoriteItem {
  id: string;
  name: string;
  address?: string;
  location?: string;
  image?: string;
  description?: string;
}

const FavoriteScreen: React.FC = () => {
  const navigation = useNavigation();
  const [showPayment, setShowPayment] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FavoriteItem | null>(null);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Add a listener for when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('FavoriteScreen focused, reloading favorites');
      loadFavorites();
    });

    // Load favorites initially
    loadFavorites();

    // Clean up listener on unmount
    return unsubscribe;
  }, [navigation]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchFavorites();
      
      console.log('Raw favorites data from API:', data);
      
      if (Array.isArray(data) && data.length > 0) {
        // Log the first item to help diagnose the structure
        console.log('First favorite item structure:', JSON.stringify(data[0], null, 2));
        
        // Transform API data to match our interface
        const transformedData = data.map((item: any) => ({
          id: item.id?.toString() || item.product_id?.toString() || '',
          name: item.name || item.title || item.product_name || '',
          address: item.address || item.location || '',
          image: item.image ? `${item.image}` : undefined,
          description: item.description || '',
        }));
        
        console.log('Transformed favorites data:', transformedData);
        setFavorites(transformedData);
      } else {
        // If no favorites available or data is not an array, use empty array
        console.log('No favorites found or data is not an array');
        setFavorites([]);
      }
    } catch (err) {
      console.error("Failed to load favorites:", err);
      setError("Failed to load favorites. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (item: FavoriteItem) => {
    setSelectedItem(item);
    setShowPayment(true);
  };

  const renderItem = ({ item }: { item: FavoriteItem }) => {
    // Check if item has minimal required data
    if (!item.id || !item.name) {
      console.log('Skipping invalid favorite item:', item);
      return null;
    }
    
    return (
      <View style={styles.masjidCard}>
        <View style={styles.masjidTopSection}>
          <View style={styles.masjidImageContainer}>
            {item.image ? (
              <Image 
                source={{ uri: item.image }} 
                style={styles.masjidImage}
                defaultSource={require('../assets/icons/masjid1.jpg')}
              />
            ) : (
              <Image 
                source={require('../assets/icons/masjid1.jpg')} 
                style={styles.masjidImage}
              />
            )}
          </View>
          <View style={styles.masjidInfo}>
            <Text style={styles.masjidName}>{item.name}</Text>
            <Text style={styles.masjidLocation}>{item.address || 'No address available'}</Text>
          </View>
        </View>
        <View style={styles.actionContainer}>
          <View style={styles.bottomActions}>
            <TouchableOpacity 
              style={styles.visitButton} 
              onPress={() => handlePayNow(item)}
            >
              <Text style={styles.visitButtonText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (showPayment && selectedItem) {
    return (
      <PaymentDetailsScreen
        title="Favorite Item Payment"
        name={selectedItem.name}
        location={selectedItem.address || 'N/A'}
        paymentType="Donation"
        onBack={() => setShowPayment(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="transparent" translucent barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Favorites</Text>
        </View>
        
        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Loading indicator */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8A2BE2" />
            <Text style={styles.loadingText}>Loading favorites...</Text>
          </View>
        ) : (
          /* Favorites List */
          <FlatList
            data={favorites}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={1}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="person-add" size={80} color="#8A2BE2" />
                <Text style={styles.emptyText}>No favorites found</Text>
                <Text style={styles.emptySubText}>Add items to your favorites using the person-add button</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#8A2BE2', 
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8A2BE2',
    padding: 13,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    alignContent: 'center',
    marginLeft: 100,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#8A2BE2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
  },
  listContainer: {
    padding: 12,
  },
  masjidCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 2,
    width: '100%',
  },
  masjidTopSection: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    position: 'relative',
  },
  masjidImageContainer: {
    width: 65,
    height: 65,
    borderRadius: 8,
    overflow: 'hidden',
  },
  masjidImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  masjidInfo: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  masjidName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  masjidLocation: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  actionContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#f2f4fe',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f2f4fe',
  },
  visitButton: {
    backgroundColor: '#6E3ABA',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffeeee',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#cc0000',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default FavoriteScreen; 