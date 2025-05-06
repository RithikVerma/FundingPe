import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

// Get device dimensions for responsive sizing
const { width } = Dimensions.get('window');
const imageSize = width * 0.15;
const qrCodeSize = width * 0.65; // QR code is 65% of screen width

// Import logo
const logoIcon = require('../assets/icons/logo2.jpg');

type QRCodeScreenProps = {
  route?: {
    params: {
      name: string;
      upiId: string;
      qrImage?: string | null;
    };
  };
};

const QRCodeScreen: React.FC<QRCodeScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const name = route?.params?.name || 'Organization Name';
  const qrImage = route?.params?.qrImage;
  
  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#8A2BE2" barStyle="light-content" />
      
      {/* Header with back button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={handleBack}
      >
        <Icon name="arrow-back" size={22} color="#8A2BE2" />
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        {/* App Logo and Name */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBg}>
            <Image source={logoIcon} style={styles.logoImage} resizeMode="cover" />
          </View>
          <Text style={styles.appName}>FundingPe</Text>
        </View>

        {/* Instruction Text */}
        <Text style={styles.instructionText}>Scan to Pay with Any UPI App</Text>
        
        {/* QR Code Image */}
        <View style={styles.qrCodeContainer}>
          {qrImage ? (
            <Image 
              source={{ uri: qrImage }}
              style={styles.qrCodeImage}
              resizeMode="contain"
            />
          ) : (
            <Image 
              source={require('../assets/icons/Scanner.png')}
              style={styles.qrCodeImage}
              resizeMode="contain"
            />
          )}
        </View>
        
        {/* Organization Name */}
        <Text style={styles.organizationName}>{name}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBg: {
    width: imageSize,
    height: imageSize,
    borderRadius: imageSize / 2,
    backgroundColor: '#8A2BE2',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoText: {
    fontSize: imageSize * 0.42,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8A2BE2',
    marginLeft: 10,
  },
  instructionText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  qrCodeContainer: {
    width: qrCodeSize,
    height: qrCodeSize,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    padding: 0,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  qrCodeImage: {
    width: '100%',
    height: '100%',
  },
  organizationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  upiIdText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
});

export default QRCodeScreen; 