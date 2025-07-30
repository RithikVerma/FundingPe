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
import { fetchOlliAuliaList, toggleFavorite, getFavorites } from '../../utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';

// Add responsive scaling
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375; // 375 is standard iPhone width
const normalize = (size: number) => Math.round(size * scale);

type OlliAuliaItem = {
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

const OlliAuliaPayScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchText, setSearchText] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [selectedOlliAulia, setSelectedOlliAulia] = useState<OlliAuliaItem | null>(null);
  const [favorites, setFavorites] = useState<{[key: string]: boolean}>({});
  const [toggleLoading, setToggleLoading] = useState<{[key: string]: boolean}>({});
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchBy, setSearchBy] = useState('Name'); // Default search by name
  const [olliAuliaItems, setOlliAuliaItems] = useState<OlliAuliaItem[]>([]);
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
        setShowNoFavoritesToast(false);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
      ToastAndroid.show('Failed to load favorites', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  }, [showNoFavoritesToast]);

  // Fetch Olli Aulia data from API
  useEffect(() => {
    const loadOlliAuliaData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Only use searchText for API call when searching by name
        const searchQuery = searchText.trim() && searchBy === 'Name' ? searchText : undefined;
        const data = await fetchOlliAuliaList(searchQuery);
        
        // Transform API data to match OlliAuliaItem type
        const olliAuliaData = data.map(item => ({
          id: item.id.toString(),
          name: item.name,
          address: item.address || item.location || '',
          image: item.image ? { uri: item.image } : require('../../assets/icons/olli1.jpg'),
          description: item.description || '',
          Mobile: item.Mobile || null,
          upi: item.upi || null,
          Whatsapp: item.Whatsapp || null,
          QR: item.QR || null,
          category: item.category || null,
          created_at: item.created_at,
          updated_at: item.updated_at,
        })) as OlliAuliaItem[];
        
        setOlliAuliaItems(olliAuliaData);
      } catch (err) {
        console.error('Failed to load Olli Aulia data:', err);
        setError('Failed to load Olli Aulia data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadOlliAuliaData();
    loadFavorites();
  }, [searchText, searchBy, loadFavorites]);

  // Filter olli aulia items based on search text and searchBy
  const filteredOlliAuliaItems = useMemo(() => {
    if (!searchText.trim()) return olliAuliaItems;
    
    const searchLower = searchText.toLowerCase();
    return olliAuliaItems.filter(item => {
      if (searchBy === 'Name') {
        return item.name.toLowerCase().includes(searchLower);
      } else if (searchBy === 'State' || searchBy === 'District' || searchBy === 'Village') {
        return item.address.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }, [searchText, searchBy, olliAuliaItems]);

  const handleDonate = (olliAulia: OlliAuliaItem) => {
    console.log('Selected Olli Aulia for donation:', olliAulia.name);
    console.log('Olli Aulia details:', {
      id: olliAulia.id,
      name: olliAulia.name,
      Mobile: olliAulia.Mobile,
      Whatsapp: olliAulia.Whatsapp,
      upi: olliAulia.upi
    });
    
    setSelectedOlliAulia(olliAulia);
    setShowPayment(true);
  };

  // Handle Comety Description button click
  const handleViewDescription = (item: OlliAuliaItem) => {
    navigation.navigate('ComityDescription', {
      name: item.name,
      address: item.address,
      image: item.image,
      id: item.id.toString()
    });
  };

  // Handle toggle favorite
  const handleToggleFavorite = async (olliId: string) => {
    try {
      // Start loading for this specific item
      setToggleLoading(prev => ({...prev, [olliId]: true}));
      
      // Call API to toggle favorite status
      const response = await toggleFavorite(olliId);
      
      if (response && response.success) {
        setFavorites(prev => {
          const updated = {...prev};
          // Toggle favorite status in local state
          if (updated[olliId]) {
            delete updated[olliId]; // Remove if it was a favorite
          } else {
            updated[olliId] = true; // Add if it wasn't a favorite
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
      // Stop loading for this specific item
      setToggleLoading(prev => ({...prev, [olliId]: false}));
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

  // Render olli aulia item
  const renderOlliAuliaItem = ({ item }: { item: OlliAuliaItem }) => (
    <View style={styles.olliAuliaCard}>
      <View style={styles.olliAuliaTopSection}>
        <View style={styles.olliAuliaImageContainer}>
          {typeof item.image === 'object' && item.image !== null ? (
            <Image 
              source={item.image} 
              style={styles.olliAuliaImage}
              defaultSource={require('../../assets/icons/olli1.jpg')} 
            />
          ) : (
            <Image 
              source={require('../../assets/icons/olli1.jpg')} 
              style={styles.olliAuliaImage} 
            />
          )}
        </View>
        <View style={styles.olliAuliaInfo}>
          <Text style={styles.olliAuliaName}>{item.name}</Text>
          <Text style={styles.olliAuliaLocation}>{item.address}</Text>
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

  if (showPayment && selectedOlliAulia) {
    return (
      <PaymentDetailsScreen
        id={selectedOlliAulia.id}
        title="Olli Aulia Donation"
        name={selectedOlliAulia.name}
        address={selectedOlliAulia.address}
        paymentType="Olli Aulia Donation"
        mobile={selectedOlliAulia.Mobile || ''}
        upiId={selectedOlliAulia.upi || ''}
        whatsapp={selectedOlliAulia.Whatsapp || ''}
        qrImage={selectedOlliAulia.QR ? selectedOlliAulia.QR.toString() : null}
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
          <Text style={styles.headerTitle}>Olli Aulia Pay</Text>
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
            <Text style={styles.loadingText}>Loading Olli Aulia data...</Text>
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

        {/* Olli Aulia List */}
        {!loading && !error && (
          <FlatList
            data={filteredOlliAuliaItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderOlliAuliaItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="search-off" size={52} color="#8A2BE2" />
                <Text style={styles.emptyText}>No Olli Aulia found</Text>
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
  olliAuliaCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 2,
    width: '100%',
  },
  olliAuliaTopSection: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    position: 'relative',
  },
  olliAuliaImageContainer: {
    width: 65,
    height: 65,
    borderRadius: 8,
    overflow: 'hidden',
  },
  olliAuliaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  olliAuliaInfo: {
    flex: 1,
    paddingHorizontal: 12,
    // paddingRight: 48,
    justifyContent: 'center',
    width: '100%',
  },
  olliAuliaName: {
    fontSize: normalize(14),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'left',
    width: '100%',
    paddingRight: 40,
  },
  olliAuliaLocation: {
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
    right: 16,
    padding: 6,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: normalize(16),
    color: '#FF5252',
    textAlign: 'center',
    marginTop: 10,
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
    fontSize: normalize(16),
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default OlliAuliaPayScreen; 