import React, { useEffect, useState, useMemo } from 'react';
import { ScrollView, StyleSheet, View, Text, Image, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import SliderComponent from '../components/ImprovedSlider';
import { fetchBanners, fetchCategories, Category } from '../utils/api';
import NativeAdComponent from '../components/NativeAdComponent';
import ErrorBoundary from '../components/ErrorBoundary';

// Define the navigation type
type RootStackParamList = {
  MasjidPay: undefined;
  MadarsaPay: undefined;
  OlliAuliaPay: undefined;
  SamajikWorkPay: undefined;
  KnowledgeCityPay: undefined;
  RepairGadgetPay: undefined;
  AllSangathan: undefined;
  RewardGift: undefined;
  Notification: undefined;
  [key: string]: undefined; // Allow dynamic navigation
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [banners, setBanners] = useState<{id: string, image: any, url?: string}[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Local slider images as fallback using useMemo
  const sliderImages = useMemo(() => [
    {
      id: '1',
      image: require('../assets/images/Slider04.jpg'),
      url: ''
    },
    {
      id: '2',
      image: require('../assets/images/Slider02.jpg'),
      url: ''
    },
    {
      id: '3',
      image: require('../assets/images/Slider03.jpg'),
      url: ''
    },
    {
      id: '4',
      image: require('../assets/images/Slider04.jpg'),
      url: ''
    },
    {
      id: '5',
      image: require('../assets/images/Slider02.jpg'),
      url: ''
    }
  ], []);

  // Fallback category items
  const fallbackCategoryItems = useMemo(() => [
    {
      id: '1',
      title: 'Masjid Pay',
      icon: require('../assets/icons/a1.png'),
      onPress: () => navigation.navigate('MasjidPay'),
    },
    {
      id: '2',
      title: 'Madarsa Pay',
      icon: require('../assets/icons/a2.png'),
      onPress: () => navigation.navigate('MadarsaPay'),
    },
    {
      id: '3',
      title: 'Olli Aulia Pay',
      icon: require('../assets/icons/a3.png'),
      onPress: () => navigation.navigate('OlliAuliaPay'),
    },
    {
      id: '4',
      title: 'Samajik Work Pay',
      icon: require('../assets/icons/a4.png'),
      onPress: () => navigation.navigate('SamajikWorkPay'),
    },
    {
      id: '5',
      title: 'Knowledge City Pay',
      icon: require('../assets/icons/a5.png'),
      onPress: () => navigation.navigate('KnowledgeCityPay'),
    },
    {
      id: '6',
      title: 'Repair and Gadget Pay',
      icon: require('../assets/icons/a6.png'),
      onPress: () => navigation.navigate('RepairGadgetPay'),
    },
  ], [navigation]);

  // Fetch banners from API
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const apiBanners = await fetchBanners();
        if (apiBanners && apiBanners.length > 0) {
          // Transform API banners to the format expected by SliderComponent
          const formattedBanners = apiBanners.map(banner => ({
            id: String(banner.id),
            image: { uri: banner.image },
            url: banner.url  // Include the URL field
          }));
          console.log('Formatted banners with URLs:', formattedBanners);
          setBanners(formattedBanners);
        } else {
          // Fallback to local images if API returns no banners
          setBanners(sliderImages);
        }
      } catch (error) {
        console.error('Error loading banners:', error);
        // Fallback to local images on error
        setBanners(sliderImages);
      } finally {
        setIsLoading(false);
      }
    };

    loadBanners();
  }, [sliderImages]);

  // Fetch categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const apiCategories = await fetchCategories();
        if (apiCategories && apiCategories.length > 0) {
          setCategories(apiCategories);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Create formatted category items for display
  const categoryItems = useMemo(() => {
    // Screen name mapping for special cases
    const screenNameMapping: { [key: string]: string } = {
      'Madrasa Pay': 'MadarsaPay',
      'Oli Aulia Pay': 'OlliAuliaPay'
    };

    if (categories.length === 0) {
      console.log('Using fallback categories - no categories from API');
      return fallbackCategoryItems;
    }

    console.log('Mapping API categories to display items:', categories);
    return categories.map(category => {
      console.log('Processing category:', category);
      return {
        id: String(category.id),
        title: category.title || 'Unknown',
        icon: category.image ? { uri: category.image } : require('../assets/icons/a1.png'),
        onPress: () => {
          try {
            // Use mapping if available, otherwise use the default transformation
            const screenName = screenNameMapping[category.title] || category.title.replace(/\s+/g, '');
            navigation.navigate(screenName as never);
          } catch (error) {
            console.warn('Navigation failed for category:', category.title);
            navigation.navigate('AllSangathan');
          }
        },
      };
    });
  }, [categories, fallbackCategoryItems, navigation]);

  // Others section items
  const otherItems = [
    {
      id: '1',
      title: 'All sangathan',
      icon: require('../assets/icons/o1.png'),
      onPress: () => navigation.navigate('AllSangathan'),
    },
    {
      id: '2',
      title: 'Reward Gift',
      icon: require('../assets/icons/o2.png'),
      onPress: () => navigation.navigate('RewardGift'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="transparent" translucent barStyle="dark-content" />
      <View style={styles.container}>
        <AppHeader onNotificationPress={() => navigation.navigate('Notification')} />
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sliderContainer}>
            {isLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#7B2AC2" />
              </View>
            ) : (
              <SliderComponent 
                images={banners.length > 0 ? banners : sliderImages} 
                height={180}
                dotStyle="dots" 
                autoPlayInterval={3000}
              />
            )}
          </View>
          
          {/* All Category Section */}
          <View style={styles.outerBox}>
            <Text style={styles.sectionTitle}>All Category</Text>
            {categoriesLoading ? (
              <View style={styles.categoryLoader}>
                <ActivityIndicator size="small" color="#7B2AC2" />
              </View>
            ) : (
              <View style={styles.cardGrid}>
                {categoryItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.cardWrapper}
                    onPress={item.onPress}
                  >
                    <View style={styles.card}>
                      <Image source={item.icon} style={styles.cardImage} />
                    </View>
                    <Text style={styles.cardText}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          
          {/* Google Ads Section */}
          <View style={styles.adsSection}>
            <Text style={styles.sectionTitle}>Google Ads</Text>
            <ErrorBoundary
              fallback={
                <View style={styles.adFallback}>
                  <Text style={styles.adFallbackText}>Advertisement</Text>
                </View>
              }
            >
              <NativeAdComponent />
            </ErrorBoundary>
          </View>
          
          {/* Others Section */}
          <View style={styles.outerBox}>
            <Text style={styles.sectionTitle}>Others</Text>
            <View style={styles.othercardGrid}>
              {otherItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.cardWrapper}
                  onPress={item.onPress}
                >
                  <View style={styles.card}>
                    <Image source={item.icon} style={styles.cardImage} />
                  </View>
                  <Text style={styles.cardText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
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
    backgroundColor: '#f2f4fe',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  sliderContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 10,
    overflow: 'hidden',
    height: 180,
  },
  loaderContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  categoryLoader: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  outerBox: { 
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 0,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: { 
    fontSize: 15, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    textAlign: 'left', 
    color: 'black', 
    width: '100%', 
  },
  cardGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    width: '100%' 
  },
  cardWrapper: { 
    alignItems: 'center', 
    width: '30%', 
    marginBottom: 20 
  },
  card: { 
    width: '55%', 
    aspectRatio: 1, 
    backgroundColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 8, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 4, 
    elevation: 6 
  },
  cardImage: { 
    width: '100%', 
    height: '100%', 
    borderRadius: 8, 
    resizeMode: 'cover' 
  },
  cardText: { 
    marginTop: 5, 
    fontSize: 13, 
    color: 'black', 
    textAlign: 'center' 
  },
  adsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 0,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  adFallback: {
    height: 80,
    backgroundColor: '#f2f4fe',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  adFallbackText: {
    color: '#777',
  },
  othercardGrid: { 
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
    gap: 10,
    marginTop: 10,
  },
});

export default HomeScreen; 