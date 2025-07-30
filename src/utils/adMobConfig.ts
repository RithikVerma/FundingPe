import { AdManager } from 'react-native-admob-native-ads';
import { Platform } from 'react-native';

// Test Ad Unit IDs - Replace with your actual Ad Unit IDs in production
export const TEST_AD_UNIT_ID = Platform.select({
  ios: 'ca-app-pub-4971954097450727~1547078431',
  android: 'ca-app-pub-4971954097450727/1547078431',
  default: 'ca-app-pub-4971954097450727/1547078431',
});

// Initialize AdMob
export const initializeAdMob = () => {
  // For testing in emulators
  AdManager.setRequestConfiguration({
    testDeviceIds: ["EMULATOR"],
  });
  
  console.log('AdMob initialized');
};

// For when you're ready to use real ads in production
export const PRODUCTION_AD_UNIT_ID = Platform.select({
  ios: 'YOUR_IOS_NATIVE_AD_UNIT_ID', // Replace with your actual iOS Ad Unit ID
  android: 'YOUR_ANDROID_NATIVE_AD_UNIT_ID', // Replace with your actual Android Ad Unit ID
  default: '',
});

// Whether to use test ads or production ads
export const USE_TEST_ADS = true; // Set to false for production

// Get the appropriate ad unit ID based on configuration
export const getAdUnitId = () => {
  return USE_TEST_ADS ? TEST_AD_UNIT_ID : PRODUCTION_AD_UNIT_ID;
}; 