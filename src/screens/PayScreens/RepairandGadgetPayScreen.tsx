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
import { fetchRepairGadgetList, toggleFavorite, getFavorites } from '../../utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';

// Add responsive scaling
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375; // 375 is standard iPhone width
const normalize = (size: number) => Math.round(size * scale);

type RepairGadgetItem = {
  id: string | number;
  name: string;
  address: string;
  image: any;
  description?: string;
  price?: string;
  Mobile?: string;
  upi?: string;
  Whatsapp?: string;
  QR?: string | null;
  location?: string;
  category?: {
    id: number;
    name: string;
  } | null;
  location?: string;
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

const RepairGadgetPayScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchText, setSearchText] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<RepairGadgetItem | null>(null);
  const [favorites, setFavorites] = useState<{[key: string]: boolean}>({});
  const [toggleLoading, setToggleLoading] = useState<{[key: string]: boolean}>({});
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchBy, setSearchBy] = useState('Name'); // Default search by name
  const [repairItems, setRepairItems] = useState<RepairGadgetItem[]>([]);
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
        // Removed the toast message for no favorites
        setShowNoFavoritesToast(false);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
      ToastAndroid.show('Failed to load favorites', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  }, [showNoFavoritesToast]);

  // Fetch Repair & Gadget data from API
  useEffect(() => {
    const loadRepairGadgetData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Only use searchText for API call when searching by name
        const searchQuery = searchText.trim() && searchBy === 'Name' ? searchText : undefined;
        const data = await fetchRepairGadgetList(searchQuery);
        
        // Transform API data to match RepairGadgetItem type
        const repairGadgetData = data.map(item => ({
          id: item.id.toString(),
          name: item.name,
          address: item.address || item.location || 'N/A',
          image: item.image ? { uri: item.image } : require('../../assets/icons/repair1.jpg'),
          description: item.description || '',
          price: item.price || '',
          Mobile: item.Mobile || null,
          upi: item.upi || null,
          Whatsapp: item.Whatsapp || null,
          QR: item.QR || null,
          category: item.category,
          location: item.location,
        })) as RepairGadgetItem[];
        
        setRepairItems(repairGadgetData);
      } catch (err) {
        console.error('Failed to load Repair & Gadget data:', err);
        setError('Failed to load Repair & Gadget data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadRepairGadgetData();
    loadFavorites();
  }, [searchText, searchBy, loadFavorites]);

  // Filter repair items based on search text and searchBy
  const filteredRepairItems = useMemo(() => {
    if (!searchText.trim()) return repairItems;
    
    const searchLower = searchText.toLowerCase();
    return repairItems.filter(item => {
      if (searchBy === 'Name') {
        return item.name.toLowerCase().includes(searchLower);
      } else if (searchBy === 'State' || searchBy === 'District' || searchBy === 'Village') {
        return item.address.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }, [searchText, searchBy, repairItems]);

  // Handle Pay Now button click
  const handlePayNow = (item: RepairGadgetItem) => {
    console.log('Selected Repair & Gadget for payment:', item.name);
    console.log('Repair & Gadget details:', {
      id: item.id,
      name: item.name,
      Mobile: item.Mobile,
      Whatsapp: item.Whatsapp,
      upi: item.upi
    });
    
    setSelectedRepair(item);
    setShowPayment(true);
  };

  // Handle Comety Description button click
  const handleViewDescription = (item: RepairGadgetItem) => {
    navigation.navigate('ComityDescription', {
      name: item.name,
      address: item.address,
      image: item.image,
      id: item.id.toString()
    });
  };

  // Handle toggle favorite
  const handleToggleFavorite = async (repairId: string) => {
    try {
      // Start loading for this specific item
      setToggleLoading(prev => ({...prev, [repairId]: true}));
      
      // Call API to toggle favorite status
      const response = await toggleFavorite(repairId);
      
      if (response && response.success) {
        setFavorites(prev => {
          const updated = {...prev};
          // Toggle favorite status in local state
          if (updated[repairId]) {
            delete updated[repairId]; // Remove if it was a favorite
          } else {
            updated[repairId] = true; // Add if it wasn't a favorite
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
      setToggleLoading(prev => ({...prev, [repairId]: false}));
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

  // Render repair item for list view
  const renderRepairItem = ({ item }: { item: RepairGadgetItem }) => {
    // Generate fundraising data using real price
    const getFundData = (id: string | number, price?: string) => {
      // If price is available from API, use it
      if (price && price !== '') {
        const numericPrice = parseFloat(price.replace(/[^\d.]/g, ''));
        if (!isNaN(numericPrice)) {
          // Calculate percentage based on price ranges up to 3 crore
          let percentValue = 0;
          
          if (numericPrice <= 100000) { // 0-1 lakh
            percentValue = Math.floor((numericPrice / 100000) * 10); // 0-10%
          } else if (numericPrice <= 500000) { // 1-5 lakh
            percentValue = 10 + Math.floor(((numericPrice - 100000) / 400000) * 10); // 10-20%
          } else if (numericPrice <= 1000000) { // 5-10 lakh
            percentValue = 20 + Math.floor(((numericPrice - 500000) / 500000) * 10); // 20-30%
          } else if (numericPrice <= 5000000) { // 10-50 lakh
            percentValue = 30 + Math.floor(((numericPrice - 1000000) / 4000000) * 20); // 30-50%
          } else if (numericPrice <= 10000000) { // 50 lakh - 1 crore
            percentValue = 50 + Math.floor(((numericPrice - 5000000) / 5000000) * 20); // 50-70%
          } else if (numericPrice <= 20000000) { // 1-2 crore
            percentValue = 70 + Math.floor(((numericPrice - 10000000) / 10000000) * 20); // 70-90%
          } else { // 2-3 crore
            percentValue = 90 + Math.floor(((numericPrice - 20000000) / 10000000) * 10); // 90-100%
          }
          
          return { 
            raised: `₹${numericPrice.toLocaleString()}`,
            percent: `${percentValue}%`,
            percentValue
          };
        }
      }
      
      // Fallback to random data if price is not available
      const idStr = id.toString();
      const hash = idStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const percentValue = hash % 101; // Between 0% and 100%
      const raised = `₹${Math.floor(percentValue * 300000)}`; // Adjusted for the new scale
      return { 
        raised, 
        percent: `${percentValue}%`,
        percentValue 
      };
    };
    
    // Get the fundraising data for this item
    const itemFundData = getFundData(item.id, item.price);
    
    // Helper function to get the appropriate progress style based on percentage
    const getProgressStyle = (percent: number) => {
      if (percent === 0) return styles.progress0;
      if (percent <= 10) return styles.progress10;
      if (percent <= 20) return styles.progress20;
      if (percent <= 30) return styles.progress30;
      if (percent <= 40) return styles.progress40;
      if (percent <= 50) return styles.progress50;
      if (percent <= 60) return styles.progress60;
      if (percent <= 70) return styles.progress70;
      if (percent <= 80) return styles.progress80;
      if (percent <= 90) return styles.progress90;
      return styles.progress100;
    };
    
    return (
      <View style={styles.repairCard}>
        <View style={styles.repairTopSection}>
          <View style={styles.repairImageContainer}>
            {typeof item.image === 'object' && item.image !== null ? (
              <Image 
                source={item.image} 
                style={styles.repairImage}
                defaultSource={require('../../assets/icons/repair1.jpg')} 
              />
            ) : (
              <Image 
                source={require('../../assets/icons/repair1.jpg')} 
                style={styles.repairImage} 
              />
            )}
          </View>
          <View style={styles.repairInfo}>
            <Text style={styles.repairName}>{item.name}</Text>
            <Text style={styles.repairLocation}>{item.address}</Text>
            <View style={styles.fundingRow}>
              <Text style={styles.raisedAmount}>{itemFundData.raised} Give</Text>
              <Text style={styles.percentComplete}>{itemFundData.percent}</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  getProgressStyle(itemFundData.percentValue)
                ]} 
              />
            </View>
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
              style={styles.payNowButton} 
              onPress={() => handlePayNow(item)}
            >
              <Text style={styles.payNowButtonText}>Pay Now</Text>
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
  };

  // If payment screen is showing, render PaymentDetailsScreen
  if (showPayment && selectedRepair) {
    return (
      <PaymentDetailsScreen
        id={selectedRepair.id}
        title="Repair & Gadget Donation"
        name={selectedRepair.name}
        address={selectedRepair.address}
        paymentType="Repair & Gadget Donation"
        mobile={selectedRepair.Mobile || ''}
        upiId={selectedRepair.upi || ''}
        whatsapp={selectedRepair.Whatsapp || ''}
        qrImage={selectedRepair.QR ? selectedRepair.QR.toString() : null}
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
          <Text style={styles.headerTitle}>Repair & Gadget Pay</Text>
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
            <Text style={styles.loadingText}>Loading Repair & Gadget data...</Text>
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

        {/* Repair Items List */}
        {!loading && !error && (
          <FlatList
            data={filteredRepairItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRepairItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="search-off" size={52} color="#8A2BE2" />
                <Text style={styles.emptyText}>No Repair & Gadget items found</Text>
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
  repairCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 2,
    width: '100%',
  },
  repairTopSection: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    position: 'relative',
    alignItems: 'center',
  },
  repairImageContainer: {
    width: 96,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 4,
  },
  repairImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  repairInfo: {
    flex: 1,
    paddingHorizontal: 12,
    //paddingRight: 35,
    justifyContent: 'center',
    width: '100%',
  },
  repairName: {
    fontSize: normalize(14),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'left',
    width: '100%',
    paddingRight: 15,
  },
  repairLocation: {
    fontSize: normalize(12),
    color: '#666',
  },
  fundingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  raisedAmount: {
    fontSize: normalize(12),
    color: '#555',
    fontWeight: '500',
  },
  percentComplete: {
    fontSize: normalize(12),
    color: '#555',
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8A2BE2',
    borderRadius: 4,
  },
  progress0: {
    width: '0%',
  },
  progress10: {
    width: '10%',
  },
  progress20: {
    width: '20%',
  },
  progress30: {
    width: '30%',
  },
  progress40: {
    width: '40%',
  },
  progress50: {
    width: '50%',
  },
  progress60: {
    width: '60%',
  },
  progress70: {
    width: '70%',
  },
  progress80: {
    width: '80%',
  },
  progress90: {
    width: '90%',
  },
  progress100: {
    width: '100%',
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
  payNowButton: {
    backgroundColor: '#6E3ABA',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payNowButtonText: {
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
});

export default RepairGadgetPayScreen; 