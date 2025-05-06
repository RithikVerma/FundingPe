import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  TextInput,
  Modal,
  StatusBar,
  Linking,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { fetchSangathanList } from '../utils/api';

// Define navigation type
type RootStackParamList = {
  ComityDescription: {
    name: string;
    address: string;
    image: any;
    id: string;
    description?: string;
    fromScreen: string;
  };
  SangathanDescription: {
    id: string;
    name: string;
    address: string;
    logo: any;
    description?: string;
  };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

// Define sangathan data type
interface SangathanItem {
  id: string;
  name: string;
  address: string;  // This will store the address
  image: any;
  url: string;  // URL for the Visit button
  description?: string; // For storing the description separate from the address
}

// Add this before the styles definition
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375; // 375 is standard iPhone width
const normalize = (size: number) => Math.round(size * scale);

const AllSangathanScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [favorites, setFavorites] = useState<{[key: string]: boolean}>({});
  const [searchText, setSearchText] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchBy, setSearchBy] = useState('Name'); // Default search by name
  const [sangathanList, setSangathanList] = useState<SangathanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch sangathan data from API
  useEffect(() => {
    const loadSangathanData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use searchText based on searchBy option
        let searchParam;
        if (searchText.trim()) {
          searchParam = searchText;
        }
        
        const data = await fetchSangathanList(searchParam);
        
        if (data.length === 0) {
          setError('No sangathan data available. Please try again later.');
          return;
        }
        
        // Transform API data to match our SangathanItem interface
        const transformedData = data.map(item => ({
          id: item.id.toString(),
          name: item.name,
          // Use address directly from the API - it will be 'N/A' if not available
          address: item.address || 'N/A',
          // If the image is a URL, use it directly, otherwise use placeholder
          image: item.image && item.image.startsWith('http') 
            ? { uri: item.image } 
            : require('../assets/icons/allsangathan1.jpg'),
          url: item.link || 'https://www.google.com', // Use the link field from the API
          description: item.description || '' // Store description separately
        }));
        
        setSangathanList(transformedData);
      } catch (err) {
        console.error('Failed to fetch sangathan data:', err);
        setError('Failed to load data. Please check your internet connection or try again later.');
        setSangathanList([]);
      } finally {
        setLoading(false);
      }
    };

    // Add debounce for search
    const delaySearch = setTimeout(() => {
      loadSangathanData();
    }, 500); // Debounce search for 500ms

    return () => clearTimeout(delaySearch);
  }, [searchText, searchBy]);

  // Filter sangathan items based on search criteria for local filtering when needed
  const filteredSangathanList = useMemo(() => {
    // If API search doesn't support searchBy filters, we can filter locally
    if (!searchText.trim() || searchBy === 'Name') {
      // API already filtered by name or no filter needed
      return sangathanList;
    }
    
    // For other search types, apply local filtering
    const searchLower = searchText.toLowerCase();
    return sangathanList.filter(item => {
      if (searchBy === 'State' || searchBy === 'District' || searchBy === 'Village') {
        return item.address.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }, [searchText, searchBy, sangathanList]);

  // Handle toggle favorite
  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Handle donate button click (Visit button)
  const handleDonate = async (url: string) => {
    try {
      if (url) {
        await Linking.openURL(url);
      } else {
        // Fallback to Google if no URL is provided
        await Linking.openURL('https://www.google.com');
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  // Handle Comety Description button click
  const handleViewDescription = (item: SangathanItem) => {
    navigation.navigate('SangathanDescription', {
      id: item.id,
      name: item.name,
      address: item.address,
      logo: item.image,
      description: item.description || '',
    });
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

  // Render sangathan item
  const renderSangathanItem = ({ item }: { item: SangathanItem }) => (
    <View style={styles.sangathanCard}>
      <View style={styles.sangathanTopSection}>
        <View style={styles.sangathanImageContainer}>
          <Image source={item.image} style={styles.sangathanImage} />
        </View>
        <View style={styles.sangathanInfo}>
          <Text style={styles.sangathanName}>{item.name}</Text>
          <Text style={styles.sangathanLocation}>{item.address}</Text>
        </View>
        <TouchableOpacity 
          style={styles.bookmarkButton}
          onPress={() => handleToggleFavorite(item.id)}
        >
          <MaterialIcons 
            name="person-add" 
            size={24} 
            color={favorites[item.id] ? "#FF5252" : "#8A2BE2"} 
          />
        </TouchableOpacity>
      </View>
      <View style={styles.actionContainer}>
        <View style={styles.bottomActions}>
          <TouchableOpacity 
            style={styles.payNowButton} 
            onPress={() => handleDonate(item.url)}
          >
            <Text style={styles.payNowButtonText}>Visit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.descriptionButton}
            onPress={() => handleViewDescription(item)}
          >
            <Text style={styles.descriptionText}>Comety Description</Text>
            <MaterialIcons name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#8A2BE2" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#8A2BE2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Sangathan</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={22} color="#777" />
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
            <MaterialIcons 
              name="tune" 
              size={22} 
              color={showSearchModal ? "#8A2BE2" : "#777"} 
            />
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

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8A2BE2" />
          <Text style={styles.loadingText}>Loading Sangathan data...</Text>
        </View>
      )}

      {/* Error Message */}
      {error && !loading && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#FF5252" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setSearchText('');
              setError(null);
              setLoading(true);
              // Trigger a refresh by simulating a state change
              setTimeout(() => {
                setLoading(false);
              }, 100);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Sangathan List */}
      {!loading && !error && (
        <FlatList
          data={filteredSangathanList}
          keyExtractor={(item) => item.id}
          renderItem={renderSangathanItem}
          numColumns={1}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="search-off" size={48} color="#8A2BE2" />
              <Text style={styles.emptyText}>No Sangathan found</Text>
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
  sangathanCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 2,
    width: '100%',
  },
  sangathanTopSection: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    position: 'relative',
  },
  sangathanImageContainer: {
    width: 65,
    height: 65,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sangathanImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  sangathanInfo: {
    flex: 1,
    paddingHorizontal: 12,
    paddingRight: 48,
    justifyContent: 'center',
  },
  sangathanName: {
    fontSize: normalize(14),
    fontWeight: 'bold',
    color: '#333',
  },
  sangathanLocation: {
    fontSize: normalize(12),
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
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: normalize(16),
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: normalize(16),
    color: '#FF5252',
    textAlign: 'center',
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
    fontSize: normalize(14),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: normalize(16),
    color: '#666',
    textAlign: 'center',
  },
});

export default AllSangathanScreen; 