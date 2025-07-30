import React, { useEffect } from 'react';
import { StatusBar, SafeAreaView, LogBox } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeAdMob } from './src/utils/adMobConfig';

// Ignore specific warnings related to AdMob
LogBox.ignoreLogs([
  'RCTBridge required dispatch_sync to load RNAdMobNativeRewardedAd',
  'RCTBridge required dispatch_sync to load RCTDevLoadingView'
]);

const App = () => {
  // Initialize AdMob when the app starts
  useEffect(() => {
    try {
      initializeAdMob();
    } catch (error) {
      console.error('Failed to initialize AdMob:', error);
    }
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor="#7B2AC2" barStyle="light-content" />
      <AppNavigator />
    </SafeAreaView>
  );
};

export default App;
