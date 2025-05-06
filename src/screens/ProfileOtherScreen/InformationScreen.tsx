import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { fetchInformation } from '../../utils/api';

interface InfoItem {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  date: string;
  hasReadMore?: boolean;
}

const InformationScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedItem, setSelectedItem] = useState<InfoItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [infoItems, setInfoItems] = useState<InfoItem[]>([]);

  useEffect(() => {
    const loadInformation = async () => {
      try {
        const data = await fetchInformation();
        setInfoItems(data);
      } catch (err) {
        console.error('Failed to load information:', err);
        // Fallback to mock data if API fails
        setInfoItems([
          {
            id: '1',
            title: 'Donation Safety',
            description: 'All donations are processed securely using end-to-end encryption.',
            fullDescription: 'All donations are processed securely using end-to-end encryption. We use industry-standard security measures to protect your financial information. Our payment processing is PCI compliant and we never store your credit card details on our servers.',
            date: '10 Mar 2024',
            hasReadMore: true,
          },
          {
            id: '2',
            title: 'Tax Benefits',
            description: 'Donations made to registered organizations are eligible for tax exempt Donations...',
            fullDescription: 'Donations made to registered organizations are eligible for tax exempt status. You can claim tax deductions for your charitable contributions. Keep your donation receipts for tax filing purposes. Our system automatically generates and stores donation receipts for your convenience.',
            date: '12 Mar 2024',
            hasReadMore: true,
          },
          {
            id: '3',
            title: 'Transparency',
            description: 'We ensure complete transparency regarding fund usage and allocation. Donations m...',
            fullDescription: 'We ensure complete transparency regarding fund usage and allocation. Donations made through our platform are tracked and reported. You can view detailed reports of how your donations are being used. We provide regular updates on project progress and fund utilization.',
            date: '15 Mar 2024',
            hasReadMore: true,
          },
          {
            id: '4',
            title: 'Refund Policy',
            description: 'Donations cannot be refunded once processed.',
            fullDescription: 'Donations cannot be refunded once processed. Please ensure you review your donation details carefully before confirming. In case of any technical issues during processing, please contact our support team immediately.',
            date: '18 Mar 2024',
            hasReadMore: true,
          },
          {
            id: '5',
            title: 'Support',
            description: 'For any queries, reach out to us at support@example.com',
            fullDescription: 'For any queries, reach out to us at support@example.com. Our support team is available 24/7 to assist you with any questions or concerns. You can also reach us through our in-app chat support or call our helpline at +1-800-123-4567.',
            date: '20 Mar 2024',
            hasReadMore: true,
          },
          {
            id: '6',
            title: 'Privacy Policy',
            description: 'We do not share your personal information with third parties.',
            fullDescription: 'We do not share your personal information with third parties. Your data is protected under strict privacy policies. We collect only necessary information required for processing donations and maintaining your account. You can review and update your privacy settings at any time.',
            date: '22 Mar 2024',
            hasReadMore: true,
          },
        ]);
      }
    };

    loadInformation();
  }, []);

  const handleReadMore = (item: InfoItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const renderInfoItem = (item: InfoItem) => (
    <View key={item.id} style={styles.infoCard}>
      <Text style={styles.infoTitle}>{item.title}</Text>
      <Text style={styles.infoDescription}>{item.description}</Text>
      
      <View style={styles.cardFooter}>
        <View style={styles.dateContainer}>
          <MaterialIcons name="event" size={14} color="#e74c3c" />
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        
        {item.hasReadMore && (
          <TouchableOpacity onPress={() => handleReadMore(item)}>
            <Text style={styles.readMoreText}>Read More</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Information</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {infoItems.map(renderInfoItem)}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedItem?.title}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <MaterialIcons name="close" size={24} color="#8A2BE2" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalDescription}>{selectedItem?.fullDescription}</Text>
              <View style={styles.modalDateContainer}>
                <MaterialIcons name="event" size={14} color="#e74c3c" />
                <Text style={styles.modalDateText}>{selectedItem?.date}</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8A2BE2',
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 85,
  },
  scrollContent: {
    padding: 10,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#8A2BE2',
  },
  infoDescription: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8A2BE2',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8A2BE2',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 16,
  },
  modalDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  modalDateText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});

export default InformationScreen; 