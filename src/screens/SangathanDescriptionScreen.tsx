import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Define route params
type SangathanDescriptionParams = {
  SangathanDescription: {
    id: string;
    name: string;
    address: string;
    logo: any;
    description?: string;
  };
};

const SangathanDescriptionScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<SangathanDescriptionParams, 'SangathanDescription'>>();
  
  // Use the description from the API if available, otherwise use a default message
  const description = route.params?.description || 
    'The Comety Foundation is dedicated to providing essential support to underprivileged communities. Our mission is to bring hope and positive change through education, healthcare, and social initiatives. Join us in making a difference today.';
  
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#8A2BE2" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Description</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Sangathan Info */}
        <View style={styles.infoCard}>
          {/* Top section with image and name */}
          <View style={styles.topSection}>
            <Image 
              source={route.params?.logo} 
              style={styles.logo}
              resizeMode="cover"
            />
            <View style={styles.nameAddressContainer}>
              <Text style={styles.sangathanName}>{route.params?.name || 'Jama allsangathan'}</Text>
              <Text style={styles.sangathanAddress}>{route.params?.address || '123 Charity Street, Kindness City'}</Text>
            </View>
          </View>
          
          {/* Description Text */}
          <Text style={styles.descriptionText}>{description}</Text>
          
          {/* Repeated description text as shown in the image */}
          {/* <Text style={styles.descriptionText}>{description}</Text> */}
          
          {/* Extra space at bottom for scrolling past the follow button */}
          <View style={{ height: 60 }} />
        </View>
      </ScrollView>
      
      {/* Follow Button */}
      {/* <View style={styles.followButtonContainer}>
        <TouchableOpacity style={styles.followButton}>
          <Text style={styles.followButtonText}>Follow</Text>
          <MaterialIcons name="person-add" size={22} color="#fff" style={styles.followIcon} />
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#8A2BE2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
  },
  topSection: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingTop: 8,
  },
  logo: {
    width: 102,
    height: 102,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#f0f0f0',
  },
  nameAddressContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  sangathanName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sangathanAddress: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
    textAlign: 'justify',
  },
  followButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
  },
  followButton: {
    backgroundColor: '#8A2BE2',
    borderRadius: 25,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
  followIcon: {
    marginLeft: 2,
  },
});

export default SangathanDescriptionScreen; 