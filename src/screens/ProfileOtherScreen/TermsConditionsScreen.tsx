import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TermsConditionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing and using FundingPe, you agree to be bound by these Terms and Conditions. If you do not agree to all of these terms, you should not use our services.'
    },
    {
      title: '2. User Accounts',
      content: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.'
    },
    {
      title: '3. Donations and Payments',
      content: 'All donations made through FundingPe are final and non-refundable. We use secure payment gateways for processing donations. The actual processing of payments is handled by third-party payment processors.'
    },
    {
      title: '4. Privacy Policy',
      content: 'Your privacy is important to us. We collect and process your personal information in accordance with our Privacy Policy. By using our services, you consent to such processing and you warrant that all data provided by you is accurate.'
    },
    {
      title: '5. User Conduct',
      content: 'You agree to use our services only for lawful purposes and in accordance with these Terms. You agree not to use our services in any way that could damage, disable, overburden, or impair our servers or networks.'
    },
    {
      title: '6. Intellectual Property',
      content: 'The content, organization, graphics, design, and other matters related to FundingPe are protected under applicable copyrights and other proprietary laws. The copying, redistribution, use, or publication by you of any such content is strictly prohibited.'
    },
    {
      title: '7. Limitation of Liability',
      content: 'FundingPe shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.'
    },
    {
      title: '8. Changes to Terms',
      content: 'We reserve the right to modify these terms at any time. We will notify users of any material changes to these terms. Your continued use of FundingPe after such modifications constitutes your acceptance of the modified terms.'
    }
  ];

  const toggleSection = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

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
          <Text style={styles.title}>Terms & Conditions</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.lastUpdated}>Last Updated: March 20, 2024</Text>
          
          {sections.map((section, index) => (
            <View key={index} style={styles.section}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection(index)}
              >
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Icon 
                  name={expandedSection === index ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
                  size={24} 
                  color="#7925ff" 
                />
              </TouchableOpacity>
              
              {expandedSection === index && (
                <View style={styles.sectionContent}>
                  <Text style={styles.sectionText}>{section.content}</Text>
                </View>
              )}
            </View>
          ))}

          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Questions or Concerns?</Text>
            <Text style={styles.contactText}>
              If you have any questions about these Terms & Conditions, please contact us at:
            </Text>
            <Text style={styles.contactEmail}>help@fundingpe.in</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#8A2BE2',
    height: 60,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  sectionContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  contactInfo: {
    marginTop: 24,
    marginBottom: 32,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  contactEmail: {
    fontSize: 14,
    color: '#7925ff',
    fontWeight: '500',
  },
});

export default TermsConditionsScreen; 