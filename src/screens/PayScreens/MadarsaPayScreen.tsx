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
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import PaymentDetailsScreen from '../../components/PaymentDetailsScreen';
import { fetchMadarsaList, toggleFavorite, getFavorites } from '../../utils/api';

type MadarsaItem = {
  id: string | number;
  name: string;
  address: string;
  image: any;
  description?: string;
  Mobile?: string | null;
  upi?: string | null;
  Whatsapp?: string | null;
  QR?: string | null;
  category?: {
    id: number;
    name: string;
  } | null;
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
  QRCodeScreen: {
    name: string;
    upiId: string;
    qrImage?: string | null;
  };
  PaymentReceiveForm: {
    selectedProduct?: {
      id: string | number;
      name: string;
      Whatsapp?: string | null;
      Mobile?: string | null;
    };
    productName?: string;
  };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

// Add responsive scaling
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375; // 375 is standard iPhone width
const normalize = (size: number) => Math.round(size * scale);

const MadarsaPayScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchText, setSearchText] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [selectedMadarsa, setSelectedMadarsa] = useState<MadarsaItem | null>(null);
  const [favorites, setFavorites] = useState<{[key: string]: boolean}>({});
  const [toggleLoading, setToggleLoading] = useState<{[key: string]: boolean}>({});
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchBy, setSearchBy] = useState('Name'); // Default search by name
  const [madarsaItems, setMadarsaItems] = useState<MadarsaItem[]>([]);
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
        //ToastAndroid.show('No favorites found. Add some madarsa to your favorites', ToastAndroid.SHORT);
        setShowNoFavoritesToast(false);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
      ToastAndroid.show('Failed to load favorites', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  }, [showNoFavoritesToast]);

  // Fetch madarsa data from API
  useEffect(() => {
    const loadMadarsaData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Only use searchText for API call when searching by name
        const searchQuery = searchText.trim() && searchBy === 'Name' ? searchText : undefined;
        const data = await fetchMadarsaList(searchQuery);
        
        // Transform API data to match MadarsaItem type
        const madarsaData = data.map(item => ({
          id: item.id.toString(),
          name: item.name,
          address: item.address || 'N/A',
          image: item.image ? { uri: item.image } : require('../../assets/icons/madarsa1.jpg'),
          description: item.description || '',
          Mobile: item.Mobile || null,
          upi: item.upi || null,
          Whatsapp: item.Whatsapp || null,
          QR: item.QR || null,
          category: item.category,
          created_at: item.created_at,
          updated_at: item.updated_at,
        }));
        
        setMadarsaItems(madarsaData);
      } catch (err) {
        console.error('Failed to load madarsa data:', err);
        setError('Failed to load madarsa data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadMadarsaData();
    loadFavorites();
  }, [searchText, searchBy, loadFavorites]);

  // Filter madarsa items based on search text and searchBy
  const filteredMadarsaItems = useMemo(() => {
    if (!searchText.trim()) return madarsaItems;
    
    const searchLower = searchText.toLowerCase();
    return madarsaItems.filter(item => {
      if (searchBy === 'Name') {
        return item.name.toLowerCase().includes(searchLower);
      } else if (searchBy === 'State' || searchBy === 'District' || searchBy === 'Village') {
        return item.address.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }, [searchText, searchBy, madarsaItems]);

  const handleDonate = (madarsa: MadarsaItem) => {
    console.log('Selected Madarsa for donation:', madarsa.name);
    console.log('Madarsa details:', {
      id: madarsa.id,
      name: madarsa.name,
      Mobile: madarsa.Mobile,
      Whatsapp: madarsa.Whatsapp,
      upi: madarsa.upi
    });
    
    setSelectedMadarsa(madarsa);
    setShowPayment(true);
  };

  // Handle Comety Description button click
  const handleViewDescription = (item: MadarsaItem) => {
    navigation.navigate('ComityDescription', {
      name: item.name,
      address: item.address,
      image: item.image,
      id: item.id.toString()
    });
  };

  // Handle toggle favorite
  const handleToggleFavorite = async (madarsaId: string) => {
    try {
      // Start loading for this specific madarsa
      setToggleLoading(prev => ({...prev, [madarsaId]: true}));
      
      // Call API to toggle favorite status
      const response = await toggleFavorite(madarsaId);
      
      if (response && response.success) {
        setFavorites(prev => {
          const updated = {...prev};
          // Toggle favorite status in local state
          if (updated[madarsaId]) {
            delete updated[madarsaId]; // Remove if it was a favorite
          } else {
            updated[madarsaId] = true; // Add if it wasn't a favorite
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
      // Stop loading for this specific madarsa
      setToggleLoading(prev => ({...prev, [madarsaId]: false}));
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

  // Render madarsa item
  const renderMadarsaItem = ({ item }: { item: MadarsaItem }) => (
    <View style={styles.madarsaCard}>
      <View style={styles.madarsaTopSection}>
        <View style={styles.madarsaImageContainer}>
          {typeof item.image === 'object' && item.image !== null ? (
            <Image 
              source={item.image} 
              style={styles.madarsaImage}
              defaultSource={require('../../assets/icons/madarsa1.jpg')} 
            />
          ) : (
            <Image 
              source={require('../../assets/icons/madarsa1.jpg')} 
              style={styles.madarsaImage} 
            />
          )}
        </View>
        <View style={styles.madarsaInfo}>
          <Text style={styles.madarsaName}>{item.name}</Text>
          <Text style={styles.madarsaLocation}>{item.address}</Text>
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
            style={styles.donateButton} 
            onPress={() => handleDonate(item)}
          >
            <Text style={styles.donateButtonText}>Pay Now</Text>
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

  // Render the payment details screen when a madarsa is selected
  if (showPayment && selectedMadarsa) {
    return (
      <PaymentDetailsScreen
        id={selectedMadarsa.id}
        title="Madarsa Donation"
        name={selectedMadarsa.name}
        address={selectedMadarsa.address}
        paymentType="Madarsa Donation"
        mobile={selectedMadarsa.Mobile || ''}
        upiId={selectedMadarsa.upi || ''}
        whatsapp={selectedMadarsa.Whatsapp || ''}
        qrImage={selectedMadarsa.QR ? selectedMadarsa.QR.toString() : null}
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
            <Icon name="arrow-back" size={24} color="#8A2BE2" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Madarsa Pay</Text>
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
              onChangeText={setSearchText}
            />
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={handleFilterPress}
            >
              <Icon name="tune" size={22} color={showSearchModal ? "#8A2BE2" : "#777"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading and Error States */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8A2BE2" />
            <Text style={styles.loadingText}>Loading madarsa data...</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={42} color="#FF5252" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setSearchText('');
                setError(null);
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Madarsa List */}
        {!loading && !error && (
          <FlatList
            data={filteredMadarsaItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMadarsaItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="search-off" size={52} color="#8A2BE2" />
                <Text style={styles.emptyText}>No madarsa found</Text>
              </View>
            }
          />
        )}

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
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: '#8A2BE2',
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
  madarsaCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 2,
    width: '100%',
  },
  madarsaTopSection: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    position: 'relative',
  },
  madarsaImageContainer: {
    width: 65,
    height: 65,
    borderRadius: 8,
    overflow: 'hidden',
  },
  madarsaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  madarsaInfo: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  madarsaName: {
    fontSize: normalize(14),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'left',
    width: '100%',
    paddingRight: 40,
  },
  madarsaLocation: {
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
  donateButton: {
    backgroundColor: '#6E3ABA',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donateButtonText: {
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
    marginTop: 12,
    fontSize: normalize(16),
    color: '#8A2BE2',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: normalize(16),
    color: '#333',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#8A2BE2',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: normalize(16),
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: normalize(18),
    color: '#666',
  },
});

export default MadarsaPayScreen; 