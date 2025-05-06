import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const TermsConditionsScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#8A2BE2" barStyle="light-content" />
      
      {/* Header */}
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
        <View style={styles.contentCard}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.contentText}>
            By accessing or using FundingPe, you agree to be bound by these Terms and Conditions. 
            If you do not agree to all of these terms, you should not use our services.
          </Text>
          
          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.contentText}>
            FundingPe provides a platform for users to make charitable donations and payments 
            to various organizations and causes. We do not guarantee that the organizations 
            featured on our platform will use the funds in any particular manner.
          </Text>
          
          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.contentText}>
            To use certain features of our service, you may be required to create an account. 
            You are responsible for maintaining the confidentiality of your account credentials 
            and for all activities that occur under your account.
          </Text>
          
          <Text style={styles.sectionTitle}>4. Payment Processing</Text>
          <Text style={styles.contentText}>
            When you make a payment through FundingPe, you agree to provide accurate and complete 
            payment information. We work with third-party payment processors and do not store your 
            payment information. All transactions are subject to the terms and conditions of our 
            payment processors.
          </Text>
          
          <Text style={styles.sectionTitle}>5. Refund Policy</Text>
          <Text style={styles.contentText}>
            All donations made through FundingPe are final and non-refundable. If you believe 
            that your account was charged in error, please contact our support team immediately.
          </Text>
          
          <Text style={styles.sectionTitle}>6. User Conduct</Text>
          <Text style={styles.contentText}>
            You agree not to use FundingPe for any illegal or unauthorized purpose. You agree to 
            comply with all laws, rules, and regulations applicable to your use of the service.
          </Text>
          
          <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
          <Text style={styles.contentText}>
            FundingPe is provided "as is" without any warranties. We do not guarantee that the 
            service will be uninterrupted or error-free. In no event shall FundingPe be liable 
            for any indirect, incidental, special, consequential, or punitive damages.
          </Text>
          
          <Text style={styles.sectionTitle}>8. Changes to Terms</Text>
          <Text style={styles.contentText}>
            We reserve the right to modify these Terms and Conditions at any time. Your continued 
            use of FundingPe after such modifications constitutes your acceptance of the new terms.
          </Text>
          
          <Text style={styles.sectionTitle}>9. Governing Law</Text>
          <Text style={styles.contentText}>
            These Terms and Conditions shall be governed by and construed in accordance with the 
            laws of India, without regard to its conflict of law provisions.
          </Text>
          
          <Text style={styles.contentText}>
            Last Updated: June 18, 2023
          </Text>
        </View>
      </ScrollView>
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
  contentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7925ff',
    marginTop: 16,
    marginBottom: 8,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
    marginBottom: 12,
  },
});

export default TermsConditionsScreen; 