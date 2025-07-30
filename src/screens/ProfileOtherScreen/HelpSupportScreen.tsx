import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HelpSupportScreen: React.FC = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqItems = [
    {
      question: 'How do I make a donation?',
      answer: 'You can make a donation by selecting the organization you want to donate to, then choosing your payment method. We currently support UPI payments via apps like Google Pay, PhonePe, Paytm, and BHIM UPI.'
    },
    {
      question: 'Is my payment information secure?',
      answer: 'Yes, we take security seriously. We do not store your payment information directly. All payments are processed through secure third-party payment processors with encryption.'
    },
    {
      question: 'Can I get a receipt for my donation?',
      answer: 'Yes, you will receive a confirmation on the app after your donation is successful. You can also view your donation history in the Transactions section.'
    },
    {
      question: 'How can I update my account information?',
      answer: 'You can update your account information by going to the Profile tab and selecting Edit Profile. From there, you can update your personal details and preferences.'
    },
    {
      question: 'Can I set up recurring donations?',
      answer: 'Currently, we do not support recurring donations, but this feature is on our roadmap and will be available in a future update.'
    },
  ];

  const toggleFaq = (index: number) => {
    if (expandedFaq === index) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(index);
    }
  };

  const handleSubmit = () => {
    if (!name || !email || !message) {
      Alert.alert('Missing Information', 'Please fill all the fields before submitting.');
      return;
    }

    // Compose email content
    const subject = encodeURIComponent(`Support Request from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage: ${message}`);
    const mailtoURI = `mailto:help@fundingpe.in?subject=${subject}&body=${body}`;

    // Open email client
    Linking.openURL(mailtoURI).catch(err => {
      Alert.alert('Error', 'Could not open email client. Please try again later.');
      console.error('Failed to open email client:', err);
    });

    // Show confirmation alert
    Alert.alert(
      'Support Request Received',
      'Thank you for contacting us. We will get back to you soon.',
      [{ text: 'OK', onPress: () => {
        setName('');
        setEmail('');
        setMessage('');
      }}]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#8A2BE2" barStyle="light-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Help & Support</Text>
        </View>
        
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Contact Form Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.sectionDescription}>
              Have a question or need assistance? Fill out the form below and we'll get back to you as soon as possible.
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Your Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.messageInput}
              placeholder="Your Message"
              placeholderTextColor="#999"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>

          {/* FAQ Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            
            {faqItems.map((item, index) => (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFaq(index)}
                >
                  <Text style={styles.faqQuestionText}>{item.question}</Text>
                  <Icon 
                    name={expandedFaq === index ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
                    size={24} 
                    color="#7925ff" 
                  />
                </TouchableOpacity>
                
                {expandedFaq === index && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Direct Contact Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Direct Support</Text>
            
            <View style={styles.directContactItem}>
              <Icon name="email" size={24} color="#7925ff" />
              <Text style={styles.directContactText}>help@fundingpe.in</Text>
            </View>
            
            <View style={styles.directContactItem}>
              <Icon name="phone" size={24} color="#7925ff" />
              <Text style={styles.directContactText}>+919932945073</Text>
            </View>
            
            <View style={styles.directContactItem}>
              <Icon name="access-time" size={24} color="#7925ff" />
              <Text style={styles.directContactText}>Available: Monday to Friday, 9 AM - 6 PM</Text>
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
  sectionCard: {
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7925ff',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginBottom: 16,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 14,
    color: '#333',
  },
  messageInput: {
    height: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#7925ff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  faqItem: {
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  faqAnswer: {
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  directContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  directContactText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
});

export default HelpSupportScreen; 