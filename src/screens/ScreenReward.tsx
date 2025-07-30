import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  TextInput,
  Modal,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import PaymentDetailsScreen from '../components/PaymentDetailsScreen';

// Define navigation type
type RootStackParamList = {
  ComityDescription: {
    name: string;
    location: string;
    image: any;
    id: string;
  };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

// Define reward gift data type
interface RewardGiftItem {
  id: string;
  name: string;
  location: string;
  image: any;
}

const RewardGiftScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [favorites, setFavorites] = useState<{[key: string]: boolean}>({});
  const [searchText, setSearchText] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchBy, setSearchBy] = useState('Name'); // Default search by name
  const [showPayment, setShowPayment] = useState(false);
  const [selectedReward, setSelectedReward] = useState<RewardGiftItem | null>(null);

  // Sample reward gift data wrapped in useMemo
  const rewardGiftList = useMemo<RewardGiftItem[]>(() => [
    {
      id: '1',
      name: 'Darul Uloom Deoband',
      location: 'Deoband, Uttar Pradesh',
      image: require('../assets/icons/reward1.jpg'),
    },
    {
      id: '2',
      name: 'Jamia Millia Islamia',
      location: 'New Delhi, India',
      image: require('../assets/icons/reward2.jpg'),
    },
    {
      id: '3',
      name: 'Al-Ameen Reward',
      location: 'Bangalore, Karnataka',
      image: require('../assets/icons/reward3.jpg'),
    },
    {
      id: '4',
      name: 'Markazul Ma\'arif',
      location: 'Mumbai, Maharashtra',
      image: require('../assets/icons/reward4.jpg'),
    },
    {
      id: '5',
      name: 'Jamiat Ulama',
      location: 'Delhi, India',
      image: require('../assets/icons/reward5.jpg'),
    },
  ], []);

  // Filter reward gift items based on search text and search by option
  const filteredRewardGiftList = useMemo(() => {
    if (!searchText.trim()) return rewardGiftList;
    
    const searchLower = searchText.toLowerCase();
    return rewardGiftList.filter(item => {
      if (searchBy === 'Name') {
        return item.name.toLowerCase().includes(searchLower);
      } else if (searchBy === 'State' || searchBy === 'District' || searchBy === 'Village') {
        return item.location.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }, [searchText, searchBy, rewardGiftList]);

  // Handle toggle favorite
  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Handle donate button click (Pay Now)
  const handleDonate = (reward: RewardGiftItem) => {
    setSelectedReward(reward);
    setShowPayment(true);
  };

  // Handle Comety Description button click
  const handleViewDescription = (item: RewardGiftItem) => {
    navigation.navigate('ComityDescription', {
      name: item.name,
      location: item.location,
      image: item.image,
      id: item.id
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

  // Render reward gift item
  const renderRewardGiftItem = ({ item }: { item: RewardGiftItem }) => (
    <View style={styles.rewardGiftCard}>
      <View style={styles.rewardGiftTopSection}>
        <View style={styles.rewardGiftImageContainer}>
          <Image source={item.image} style={styles.rewardGiftImage} />
        </View>
        <View style={styles.rewardInfo}>
          <Text style={styles.rewardName}>{item.name}</Text>
          <Text style={styles.rewardLocation}>{item.location}</Text>
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
            onPress={() => handleDonate(item)}
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

  if (showPayment && selectedReward) {
    return (
      <PaymentDetailsScreen
        title="Reward Gift Donation"
        name={selectedReward.name}
        location={selectedReward.location}
        paymentType="Reward Gift Donation"
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
          <MaterialIcons name="arrow-back" size={24} color="#8A2BE2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reward Gift</Text>
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

      {/* Reward Gift List */}
      <FlatList
        data={filteredRewardGiftList}
        keyExtractor={(item) => item.id}
        renderItem={renderRewardGiftItem}
        numColumns={1}
        contentContainerStyle={styles.listContainer}
      />
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
    fontSize: 18,
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
    fontSize: 15,
    color: '#333',
    paddingVertical: 6,
  },
  filterButton: {
    padding: 4,
  },
  listContainer: {
    padding: 12,
  },
  rewardGiftCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 2,
    width: '100%',
  },
  rewardGiftTopSection: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    position: 'relative',
  },
  rewardGiftImageContainer: {
    width: 65,
    height: 65,
    borderRadius: 8,
    overflow: 'hidden',
  },
  rewardGiftImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  rewardInfo: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
    width: '100%',
  },
  rewardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'left',
    width: '100%',
    paddingRight: 40,
  },
  rewardLocation: {
    fontSize: 14,
    color: '#777',
    marginBottom: 8,
    textAlign: 'left',
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
    fontSize: 14,
  },
  descriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  descriptionText: {
    fontSize: 14,
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
    fontSize: 20,
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
    fontSize: 16,
    color: '#333',
  },
  searchOptionTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default RewardGiftScreen; 