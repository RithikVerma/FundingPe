import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  StatusBar,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Clipboard from '@react-native-clipboard/clipboard';

// Import UPI app icons
const phonepeIcon = require('../assets/icons/phonepe.png');
const gpayIcon = require('../assets/icons/gpay1.png');
const paytmIcon = require('../assets/icons/paytm.jpg');
const bhimIcon = require('../assets/icons/bhimupi.webp');

// Define the navigation param list
type RootStackParamList = {
  QRCodeScreen: { name: string; upiId: string; qrImage?: string | null };
  ConfirmationForm: undefined;
  PaymentReceiveForm: {
    whatsappNumber?: string;
    productName?: string;
    selectedProduct?: {
      id: string | number;
      name: string;
      Whatsapp?: string | null;
      Mobile?: string | null;
    };
  };
  // Add other screens as needed
};

// Define navigation prop type
type PaymentScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'PaymentReceiveForm'
>;

type PaymentDetailsScreenProps = {
  id?: string | number;
  title?: string;
  name?: string;
  address?: string;
  paymentType?: string;
  mobile?: string;
  upiId?: string;
  qrImage?: string | null;
  whatsapp?: string;
  onBack?: () => void;
};

const PaymentDetailsScreen: React.FC<PaymentDetailsScreenProps> = ({
  id = "0",
  name = "Masjid AI-Noor",
  address = "123 Islamic Street, City, Country",
  mobile = "",
  upiId = "",
  qrImage = null,
  whatsapp = "",
  onBack
}) => {
  const navigation = useNavigation<PaymentScreenNavigationProp>();
  
  // State variables
  const [upiCopied, setUpiCopied] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    Clipboard.setString(text);
    
    if (type === 'UPI') {
      setUpiCopied(true);
      setPhoneCopied(false); // Ensure phone copied state is reset
      // Reset the copied state after 1 minute
      setTimeout(() => {
        setUpiCopied(false);
      }, 60000);
    } else if (type === 'PHONE') {
      setPhoneCopied(true);
      setUpiCopied(false); // Ensure UPI copied state is reset
      // Reset the copied state after 1 minute
      setTimeout(() => {
        setPhoneCopied(false);
      }, 60000);
    }
  };

  // Function to open default UPI intent that shows all installed UPI apps
  const openDefaultUpiIntent = async () => {
    // Copy UPI ID to clipboard first
    Clipboard.setString(upiId);
    
    try {
      // This creates a generic UPI intent that will show all installed UPI apps
      const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&mc=0000&tr=UPI-Payment&tn=${encodeURIComponent('Donation')}`;
      
      const canOpen = await Linking.canOpenURL(upiUrl);
      
      if (canOpen) {
        await Linking.openURL(upiUrl);
      }
    } catch (error) {
      console.error('Error opening UPI intent:', error);
    }
  };

  // Function to open a specific UPI app
  const openUpiApp = async (app: 'phonepe' | 'gpay' | 'paytm' | 'bhim' | 'any') => {
    // Check if user has copied UPI ID or phone number
    if (!upiCopied && !phoneCopied) {
      Alert.alert(
        'Copy Required',
        'Please first copy the UPI ID or phone number by clicking the COPY button.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Get the appropriate value from clipboard based on what was copied
    const paymentIdentifier = upiCopied ? upiId : mobile;
    Clipboard.setString(paymentIdentifier);
    
    // For "any UPI", use the default UPI intent that shows all apps
    if (app === 'any') {
      return openDefaultUpiIntent();
    }
    
    // Define app package names and URLs
    const appData = {
      phonepe: {
        package: 'com.phonepe.app',
        url: 'phonepe://pay',
        fallbackUrls: ['phonepe://']
      },
      gpay: {
        package: 'com.google.android.apps.nbu.paisa.user',
        url: 'android-app://com.google.android.apps.nbu.paisa.user',
        fallbackUrls: [
          'tez://upi/',
          'tez://pay?pa=dummy@upi&pn=Test&tr=Test123',
          'https://pay.google.com'
        ]
      },
      paytm: {
        package: 'net.one97.paytm',
        url: 'paytmmp://pay',
        fallbackUrls: ['paytmmp://', 'paytm://']
      },
      bhim: {
        package: 'in.org.npci.upiapp',
        url: 'bhim://upi/pay',
        fallbackUrls: ['bhim://', 'upi://']
      }
    };
    
    try {
      // First check if the app is installed
      const isAppInstalled = await Linking.canOpenURL(appData[app].url);
      
      if (isAppInstalled) {
        // If app is installed, try to open it
        await Linking.openURL(appData[app].url);
      } else {
        // If app is not installed, open Play Store
        await Linking.openURL(`market://details?id=${appData[app].package}`);
      }
    } catch (error) {
      console.error(`Error opening ${app}:`, error);
      
      // If opening the app fails, try fallback URLs
      let opened = false;
      for (const fallbackUrl of appData[app].fallbackUrls) {
        try {
          const canOpenFallback = await Linking.canOpenURL(fallbackUrl);
          if (canOpenFallback) {
            await Linking.openURL(fallbackUrl);
            opened = true;
            break;
          }
        } catch (fallbackError) {
          console.error(`Fallback URL ${fallbackUrl} failed:`, fallbackError);
        }
      }
      
      // If all fallback URLs fail, open Play Store
      if (!opened) {
        try {
          await Linking.openURL(`market://details?id=${appData[app].package}`);
        } catch (storeError) {
          console.error('Error opening Play Store:', storeError);
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#8A2BE2" barStyle="light-content" />
      
      {/* Back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#8A2BE2" />
      </TouchableOpacity>
          </View>
          
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Organization details */}
        <View style={styles.organizationContainer}>
          <Image 
            source={require('../assets/icons/logo2.jpg')} 
            style={styles.orgLogo} 
            resizeMode="contain"
          />
          <Text style={styles.orgName}>{name}</Text>
          <Text style={styles.orgLocation}>{address}</Text>
        </View>

        <View style={styles.paymentOptionsContainer}>
          <View style={styles.paymentFieldsContainer}>
            {/* UPI ID */}
            <View style={styles.paymentInfoRow}>
              <Image 
                source={require('../assets/icons/upi.jpg')} 
                style={styles.methodIcon} 
                resizeMode="contain"
              />
              <Text style={styles.paymentInfoText}>{upiId}</Text>
              <TouchableOpacity
                style={[styles.copyButton, upiCopied && styles.copiedButton]}
                onPress={() => copyToClipboard(upiId, 'UPI')}
              >
                <Text style={styles.copyButtonText}>
                  {upiCopied ? 'COPIED' : 'COPY ID'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Phone Number */}
            <View style={styles.paymentInfoRow}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="person" size={24} color="#333" />
              </View>
              <Text style={styles.paymentInfoText}>{mobile}</Text>
              <TouchableOpacity 
                style={[styles.copyButton, phoneCopied && styles.copiedButton]}
                onPress={() => copyToClipboard(mobile, 'PHONE')}
              >
                <Text style={styles.copyButtonText}>
                  {phoneCopied ? 'COPIED' : 'COPY NO'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* QR Code Button */}
            {qrImage && (
              <TouchableOpacity 
                style={styles.qrCodeButton}
                onPress={() => navigation.navigate('QRCodeScreen', {
                  name,
                  upiId,
                  qrImage
                })}
              >
                <View style={styles.qrCodeButtonContent}>
                  <Image 
                    source={require('../assets/icons/Scanner.png')} 
                    style={styles.qrCodeIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.qrCodeButtonText}>Scan QR Code</Text>
                </View>
                <Icon name="arrow-forward" size={24} color="#666" />
              </TouchableOpacity>
            )}
            
            {/* Pay Button */}
            <TouchableOpacity 
              style={styles.mainButton}
              onPress={() => {
                console.log('Navigating to PaymentReceiveForm with product details:');
                console.log('Product name:', name);
                console.log('WhatsApp number:', whatsapp);
                console.log('Mobile number:', mobile);
                
                navigation.navigate('PaymentReceiveForm', { 
                  selectedProduct: {
                    id: id,
                    name: name,
                    Whatsapp: whatsapp,
                    Mobile: mobile
                  },
                  productName: name
                });
              }}
            >
              <Text style={styles.mainButtonText}>Payment Confirmation</Text>
            </TouchableOpacity>
          </View>
          
          {/* Quick UPI */}
          <View style={styles.quickUpiContainer}>
            <Text style={styles.quickUpiTitle}>Quick UPI</Text>
            <View style={styles.quickUpiOuterContainer}>
              <View style={styles.quickUpiOptions}>
                <TouchableOpacity 
                  style={styles.upiOption}
                  onPress={() => openUpiApp('bhim')}
                >
                  <View style={styles.upiOptionIcon}>
                    <Image 
                      source={bhimIcon} 
                      style={styles.upiIconImage} 
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.upiOptionText}>BHIM UPI</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.upiOption}
                  onPress={() => openUpiApp('gpay')}
                >
                  <View style={styles.upiOptionIcon}>
                    <Image 
                      source={gpayIcon}
                      style={styles.upiIconImage} 
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.upiOptionText}>Google Pay</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.upiOption}
                  onPress={() => openUpiApp('phonepe')}
                >
                  <View style={styles.upiOptionIcon}>
                    <Image 
                      source={phonepeIcon}
                      style={styles.upiIconImage} 
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.upiOptionText}>PhonePe</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.upiOption}
                  onPress={() => openUpiApp('paytm')}
                >
                  <View style={styles.upiOptionIcon}>
                    <Image 
                      source={paytmIcon}
                      style={styles.upiIconImage} 
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.upiOptionText}>Paytm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4fe',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  organizationContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f2f4fe',
  },
  orgLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    backgroundColor: '#8A2BE2',
  },
  orgName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  orgLocation: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  paymentOptionsContainer: {
    padding: 16,
  },
  paymentFieldsContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  paymentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  methodIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentInfoText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
  copyButton: {
    backgroundColor: '#8A2BE2',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    elevation: 1,
    minWidth: 70,
    alignItems: 'center',
  },
  copiedButton: {
    backgroundColor: '#6200EA',
  },
  copyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  qrCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginVertical: 8,
  },
  qrCodeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrCodeIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  qrCodeButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  mainButton: {
    backgroundColor: '#0D9E63',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 28,
    alignItems: 'center',
    marginVertical: 24,
    width: '70%',
    alignSelf: 'center',
    elevation: 2,
  },
  mainButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quickUpiContainer: {
    marginTop: 16,
  },
  quickUpiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  quickUpiOuterContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quickUpiOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  upiOption: {
    width: '22%',
    alignItems: 'center',
    marginHorizontal: 3,
  },
  upiOptionIcon: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  upiIconImage: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
  upiOptionText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default PaymentDetailsScreen; 