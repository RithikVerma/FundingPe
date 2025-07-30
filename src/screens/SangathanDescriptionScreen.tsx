import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchSangathanList } from '../utils/api';

const SangathanDescriptionScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id, name, address, image } = route.params as any;

  const [loading, setLoading] = useState(true);
  const [sangathanDetails, setSangathanDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSangathanDetails = useCallback(async () => {
    try {
      setLoading(true);
      const details = await fetchSangathanList(id);
      setSangathanDetails(details);
      setError(null);
    } catch (err) {
      console.error('Error loading sangathan details:', err);
      setError('Failed to load sangathan details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSangathanDetails();
  }, [loadSangathanDetails]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#8A2BE2" barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sangathan Details</Text>
          <View style={styles.headerRight} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8A2BE2" />
            <Text style={styles.loadingText}>Loading sangathan details...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={48} color="#FF5252" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={loadSangathanDetails}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Image 
              source={typeof image === 'string' ? { uri: image } : image}
              style={styles.sangathanImage}
              resizeMode="cover"
            />

            <View style={styles.infoSection}>
              <Text style={styles.sangathanName}>{name}</Text>
              <View style={styles.addressContainer}>
                <Icon name="location-on" size={20} color="#8A2BE2" />
                <Text style={styles.addressText}>{address}</Text>
              </View>
            </View>

            {sangathanDetails && (
              <>
                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>About</Text>
                  <Text style={styles.descriptionText}>
                    {sangathanDetails.description || 'No description available'}
                  </Text>
                </View>

                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>Contact Information</Text>
                  <View style={styles.contactItem}>
                    <Icon name="phone" size={20} color="#8A2BE2" />
                    <Text style={styles.contactText}>
                      {sangathanDetails.phone || 'Not available'}
                    </Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Icon name="email" size={20} color="#8A2BE2" />
                    <Text style={styles.contactText}>
                      {sangathanDetails.email || 'Not available'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>Additional Information</Text>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Established:</Text>
                    <Text style={styles.infoValue}>
                      {sangathanDetails.established || 'Not specified'}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Members:</Text>
                    <Text style={styles.infoValue}>
                      {sangathanDetails.members || 'Not specified'}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Registration:</Text>
                    <Text style={styles.infoValue}>
                      {sangathanDetails.registration || 'Not specified'}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#8A2BE2',
    height: 50,
  },
  backButton: {
    padding: 4,
    width: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sangathanImage: {
    width: '100%',
    height: 200,
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    elevation: 2,
  },
  sangathanName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  detailsSection: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#8A2BE2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SangathanDescriptionScreen; 