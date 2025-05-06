import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
  FlatList,
  Modal,
  ActivityIndicator,
  ToastAndroid,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import PaymentDetailsScreen from '../../components/PaymentDetailsScreen';
import { fetchProducts, toggleFavorite, getFavorites } from '../../utils/api';

// Add responsive scaling
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375; // 375 is standard iPhone width
const normalize = (size: number) => Math.round(size * scale);

type MasjidItem = {
  id: string | number;
  name: string;
  address: string;
  image: any;
  description?: string;
  price?: string;
  Mobile?: string | null;
  upi?: string | null;
  Whatsapp?: string | null;
  QR?: string | null;
  category?: {
    id: number;
    name: string;
  };
  created_at?: string;
  updated_at?: string;
};

type RootStackParamList = {
  ComityDescription: {
    name: string;
    address: string;
    image: any;
    id: string;
  };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const MasjidPayScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchText, setSearchText] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [selectedMasjid, setSelectedMasjid] = useState<MasjidItem | null>(null);
  const [favorites, setFavorites] = useState<{[key: string]: boolean}>({});
  const [toggleLoading, setToggleLoading] = useState<{[key: string]: boolean}>({});
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchBy, setSearchBy] = useState('Name'); // Default search by name
  const [masjidItems, setMasjidItems] = useState<MasjidItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNoFavoritesToast, setShowNoFavoritesToast] = useState(true);

  // Load favorites list
  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const favoritesResponse = await getFavorites();
      
      // getFavorites returns a map of {[key: string]: boolean} directly
      const newFavorites = favoritesResponse || {};
      
      console.log('Loaded favorites map:', newFavorites);
      console.log('Number of favorites:', Object.keys(newFavorites).length);
      
      setFavorites(newFavorites);
      
      // Only show toast for no favorites once during initial load
      if (Object.keys(newFavorites).length === 0 && showNoFavoritesToast) {
        //ToastAndroid.show('No favorites found. Add some masjids to your favorites', ToastAndroid.SHORT);
        setShowNoFavoritesToast(false);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
      ToastAndroid.show('Failed to load favorites', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  }, [showNoFavoritesToast]);

  useEffect(() => {
    const loadMasjidData = async () => {
      setLoading(true);
      setError(null);

      try {
        // This uses category_id=3, you can change this as needed
        const products = await fetchProducts(undefined, 3);
        
        // Transform product data to MasjidItem format
        const masjidData: MasjidItem[] = products.map(product => ({
          id: product.id.toString(),
          name: product.name,
          address: product.address || 'N/A',
          image: product.image ? { uri: product.image } : require('../../assets/icons/masjid1.jpg'),
          description: product.description,
          price: product.price,
          Mobile: product.Mobile,
          upi: product.upi,
          Whatsapp: product.Whatsapp,
          QR: product.QR ? product.QR : null,
          category: product.category,
          created_at: product.created_at,
          updated_at: product.updated_at,
        }));
        
        console.log('Transformed Masjid Data:', JSON.stringify(masjidData, null, 2));
        setMasjidItems(masjidData);
      } catch (err) {
        console.error('Failed to load masjid data:', err);
        setError('Failed to load masjid data. Please try again.');
        // Remove the fallback data
        setMasjidItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadMasjidData();
    loadFavorites();
  }, [loadFavorites]);

  // Handle search text change - with API integration
  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
    
    // If search is empty, loadMasjidData without filter
    if (!text.trim()) {
      loadMasjidData();
      return;
    }
    
    // Debounce search API call
    const timer = setTimeout(() => {
      // Only use API search for name searches
      // For address searches, load all data and filter on client side
      if (searchBy === 'Name') {
        searchMasjids(text);
      } else {
        // For address searches, load all data and let the useMemo filter handle it
        loadMasjidData();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  };
  
  // Search masjids from API
  const searchMasjids = async (query: string) => {
    setLoading(true);
    try {
      const products = await fetchProducts(query, 3);
      
      // Transform product data to MasjidItem format
      const masjidData: MasjidItem[] = products.map(product => ({
        id: product.id.toString(),
        name: product.name,
        address: product.address || 'N/A',
        image: product.image ? { uri: product.image } : require('../../assets/icons/masjid1.jpg'),
        description: product.description,
        price: product.price,
        Mobile: product.Mobile,
        upi: product.upi,
        Whatsapp: product.Whatsapp,
        QR: product.QR ? product.QR : null,
        category: product.category,
        created_at: product.created_at,
        updated_at: product.updated_at,
      }));
      
      setMasjidItems(masjidData);
    } catch (err) {
      console.error('Failed to search masjids:', err);
      setError('Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Load masjid data from API
  const loadMasjidData = async () => {
    setLoading(true);
    try {
      const products = await fetchProducts(undefined, 3);
      console.log('Fetched Masjid Products:', JSON.stringify(products, null, 2));
      
      // Transform product data to MasjidItem format
      const masjidData: MasjidItem[] = products.map(product => ({
        id: product.id.toString(),
        name: product.name,
        address: product.address || 'N/A',
        image: product.image ? { uri: product.image } : require('../../assets/icons/masjid1.jpg'),
        description: product.description,
        price: product.price,
        Mobile: product.Mobile,
        upi: product.upi,
        Whatsapp: product.Whatsapp,
        QR: product.QR ? product.QR : null,
        category: product.category,
        created_at: product.created_at,
        updated_at: product.updated_at,
      }));
      
      console.log('Transformed Masjid Data:', JSON.stringify(masjidData, null, 2));
      setMasjidItems(masjidData);
    } catch (err) {
      console.error('Failed to load masjid data:', err);
      setError('Failed to load masjid data. Please try again.');
      setMasjidItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter masjid items based on search text and searchBy
  const filteredMasjidItems = useMemo(() => {
    if (!searchText.trim()) return masjidItems;
    
    const searchLower = searchText.toLowerCase();
    return masjidItems.filter(item => {
      if (searchBy === 'Name') {
        return item.name.toLowerCase().includes(searchLower);
      } else if (searchBy === 'State' || searchBy === 'District' || searchBy === 'Village') {
        return item.address.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }, [searchText, searchBy, masjidItems]);

  const handleDonate = (masjid: MasjidItem) => {
    setSelectedMasjid(masjid);
    setShowPayment(true);
  };

  // Handle Comety Description button click
  const handleViewDescription = (item: MasjidItem) => {
    navigation.navigate('ComityDescription', {
      name: item.name,
      address: item.address,
      image: item.image,
      id: item.id.toString()
    });
  };

  // Handle toggle favorite
  const handleToggleFavorite = async (masjidId: string) => {
    try {
      // Start loading for this specific masjid
      setToggleLoading(prev => ({...prev, [masjidId]: true}));
      
      // Call API to toggle favorite status
      const response = await toggleFavorite(masjidId);
      
      if (response && response.success) {
        setFavorites(prev => {
          const updated = {...prev};
          // Toggle favorite status in local state
          if (updated[masjidId]) {
            delete updated[masjidId]; // Remove if it was a favorite
          } else {
            updated[masjidId] = true; // Add if it wasn't a favorite
          }
          return updated;
        });
        
        if (response.message) {
          ToastAndroid.show(response.message, ToastAndroid.SHORT);
        }
      } else {
        ToastAndroid.show('Failed to update favorite', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      ToastAndroid.show('Failed to update favorite', ToastAndroid.SHORT);
    } finally {
      // Stop loading for this specific masjid
      setToggleLoading(prev => ({...prev, [masjidId]: false}));
    }
  };

  // Handle filter button press
  const handleFilterPress = () => {
    setShowSearchModal(true);
  };

  // Handle search by option selection
  const handleSearchByOption = (option: string) => {
    setSearchBy(option);
    setShowSearchModal(false);
  };

  // Render masjid item for list view
  const renderMasjidItem = ({ item }: { item: MasjidItem }) => (
    <View style={styles.masjidCard}>
      <View style={styles.masjidTopSection}>
        <View style={styles.masjidImageContainer}>
          <Image 
            source={typeof item.image === 'string' ? { uri: item.image } : item.image} 
            style={styles.masjidImage}
            defaultSource={require('../../assets/icons/masjid1.jpg')}
          />
        </View>
        <View style={styles.masjidInfo}>
          <Text style={styles.masjidName}>{item.name}</Text>
          <Text style={styles.masjidLocation}>{item.address}</Text>
        </View>
        <TouchableOpacity 
          style={styles.bookmarkButton}
          onPress={() => handleToggleFavorite(item.id.toString())}
          disabled={toggleLoading[item.id.toString()] || loading}
        >
          {toggleLoading[item.id.toString()] ? (
            <ActivityIndicator size="small" color="#8A2BE2" />
          ) : (
            <Icon 
              name="person-add" 
              size={24} 
              color={favorites[item.id.toString()] ? "#FF5252" : "#8A2BE2"} 
            />
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.actionContainer}>
        <View style={styles.bottomActions}>
          <TouchableOpacity 
            style={styles.visitButton} 
            onPress={() => handleDonate(item)}
          >
            <Text style={styles.visitButtonText}>Pay Now</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.descriptionButton}
            onPress={() => handleViewDescription(item)}
          >
            <Text style={styles.descriptionText}>Comety Description</Text>
            <Icon name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (showPayment && selectedMasjid) {
    return (
      <PaymentDetailsScreen
        title="Masjid Donation"
        id={selectedMasjid.id}
        name={selectedMasjid.name}
        location={selectedMasjid.address}
        paymentType="Masjid Donation"
        mobile={selectedMasjid.Mobile || ''}
        upiId={selectedMasjid.upi || ''}
        qrImage={selectedMasjid.QR || null}
        whatsapp={selectedMasjid.Whatsapp || ''}
        onBack={() => setShowPayment(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#8A2BE2" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#8A2BE2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Masjid Pay</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={22} color="#777" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search by ${searchBy}...`}
            placeholderTextColor="#777"
            value={searchText}
            onChangeText={handleSearchTextChange}
          />
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={handleFilterPress}
          >
            <Icon name="tune" size={22} color={showSearchModal ? "#8A2BE2" : "#777"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search By Modal */}
      <Modal
        visible={showSearchModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.searchModal}>
            <Text style={styles.searchModalTitle}>Search By</Text>

            <TouchableOpacity
              style={[
                styles.searchOption,
                searchBy === 'Name' && styles.searchOptionSelected
              ]}
              onPress={() => handleSearchByOption('Name')}
            >
              <Text 
                style={[
                  styles.searchOptionText,
                  searchBy === 'Name' && styles.searchOptionTextSelected
                ]}
              >
                Name
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.searchOption,
                searchBy === 'State' && styles.searchOptionSelected
              ]}
              onPress={() => handleSearchByOption('State')}
            >
              <Text 
                style={[
                  styles.searchOptionText,
                  searchBy === 'State' && styles.searchOptionTextSelected
                ]}
              >
                State
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.searchOption,
                searchBy === 'District' && styles.searchOptionSelected
              ]}
              onPress={() => handleSearchByOption('District')}
            >
              <Text 
                style={[
                  styles.searchOptionText,
                  searchBy === 'District' && styles.searchOptionTextSelected
                ]}
              >
                District
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.searchOption,
                searchBy === 'Village' && styles.searchOptionSelected
              ]}
              onPress={() => handleSearchByOption('Village')}
            >
              <Text 
                style={[
                  styles.searchOptionText,
                  searchBy === 'Village' && styles.searchOptionTextSelected
                ]}
              >
                Village
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
          <Text style={styles.loadingText}>Loading masjids...</Text>
        </View>
      ) : (
        /* Masjid List */
        <FlatList
          data={filteredMasjidItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMasjidItem}
          numColumns={1}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No masjids found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: '#333',
    marginLeft: 16,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: normalize(15),
    color: '#333',
    paddingVertical: 6,
  },
  filterButton: {
    padding: 4,
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
    fontSize: normalize(14),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'left',
    width: '100%',
    paddingRight: 40,
  },
  masjidLocation: {
    fontSize: normalize(12),
    color: '#666',
  },
  actionContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#f2f4fe',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    fontSize: normalize(14),
  },
  descriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  descriptionText: {
    fontSize: normalize(14),
    color: '#666',
    marginRight: 4,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchModal: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  searchModalTitle: {
    fontSize: normalize(20),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  searchOption: {
    width: '100%',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  searchOptionSelected: {
    backgroundColor: '#8A2BE2',
  },
  searchOptionText: {
    fontSize: normalize(16),
    color: '#333',
  },
  searchOptionTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: normalize(14),
    color: '#666',
    marginTop: 8,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffeeee',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: normalize(16),
    color: '#FF5252',
    textAlign: 'center',
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: normalize(16),
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default MasjidPayScreen;
