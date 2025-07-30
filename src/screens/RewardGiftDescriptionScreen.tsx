import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Define route params
type RewardGiftDescriptionParams = {
  RewardGiftDescription: {
    id: string;
    name: string;
    logo: any;
  };
};

const RewardGiftDescriptionScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RewardGiftDescriptionParams, 'RewardGiftDescription'>>();
  
  // Sample description and details (would come from API in real app)
  const description = 'This organization provides rewards and gifts to students and scholars for their achievements in various fields. The rewards are given to encourage excellence and support education.';
  
  const contactDetails = {
    phone: '+91 9876543210',
    email: 'contact@rewardgift.org',
    website: 'www.rewardgift.org',
  };

  const rewardCategories = [
    'Academic Excellence Awards',
    'Merit Scholarships',
    'Educational Support',
    'Special Recognition',
    'Community Service Awards',
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#8A2BE2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reward Gift Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Organization Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.logoContainer}>
            <Image 
              source={route.params?.logo} 
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.organizationName}>{route.params?.name || 'Organization'}</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.buttonText}>Apply for Reward</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton}>
              <MaterialIcons name="bookmark-outline" size={18} color="#8A2BE2" />
              <Text style={styles.secondaryButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton}>
              <MaterialIcons name="share" size={18} color="#8A2BE2" />
              <Text style={styles.secondaryButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>

        {/* Reward Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reward Categories</Text>
          {rewardCategories.map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <MaterialIcons name="star" size={18} color="#8A2BE2" />
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          ))}
        </View>

        {/* Contact Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactItem}>
            <MaterialIcons name="phone" size={18} color="#8A2BE2" />
            <Text style={styles.contactText}>{contactDetails.phone}</Text>
          </View>
          <View style={styles.contactItem}>
            <MaterialIcons name="email" size={18} color="#8A2BE2" />
            <Text style={styles.contactText}>{contactDetails.email}</Text>
          </View>
          <View style={styles.contactItem}>
            <MaterialIcons name="language" size={18} color="#8A2BE2" />
            <Text style={styles.contactText}>{contactDetails.website}</Text>
          </View>
        </View>

        {/* Eligibility Criteria */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eligibility Criteria</Text>
          <View style={styles.eligibilityItem}>
            <MaterialIcons name="check-circle" size={18} color="#8A2BE2" />
            <Text style={styles.eligibilityText}>Must be a registered student</Text>
          </View>
          <View style={styles.eligibilityItem}>
            <MaterialIcons name="check-circle" size={18} color="#8A2BE2" />
            <Text style={styles.eligibilityText}>Academic excellence with minimum 70% marks</Text>
          </View>
          <View style={styles.eligibilityItem}>
            <MaterialIcons name="check-circle" size={18} color="#8A2BE2" />
            <Text style={styles.eligibilityText}>Active participation in extracurricular activities</Text>
          </View>
          <View style={styles.eligibilityItem}>
            <MaterialIcons name="check-circle" size={18} color="#8A2BE2" />
            <Text style={styles.eligibilityText}>Financial need assessment</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8A2BE2',
  },
  scrollContainer: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
    marginBottom: 12,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  organizationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#8A2BE2',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  secondaryButtonText: {
    marginLeft: 4,
    color: '#8A2BE2',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#fff',
    margin: 12,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#444',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#444',
  },
  eligibilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eligibilityText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#444',
    flex: 1,
  },
});

export default RewardGiftDescriptionScreen; 