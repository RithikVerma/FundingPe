/**
 * @format
 */

// Silence the deprecation warnings until the APIs stabilize
global.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import {NavigationService} from './src/navigation/NavigationService';

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  // Navigate to notification screen when app is opened from background
  NavigationService.navigate('Notification');
});

// Handle foreground messages and notification taps
messaging().onMessage(async remoteMessage => {
  console.log('Received foreground message:', remoteMessage);
});

messaging().onNotificationOpenedApp(async remoteMessage => {
  console.log('Notification opened app from background state:', remoteMessage);
  NavigationService.navigate('Notification');
});

messaging().getInitialNotification().then(remoteMessage => {
  if (remoteMessage) {
    console.log('Notification opened app from quit state:', remoteMessage);
    // We need to wait for navigation to be ready before navigating
    setTimeout(() => {
      NavigationService.navigate('Notification');
    }, 1000);
  }
});

// Firebase Messaging automatically registers the necessary headless task
// No need for AppRegistry.registerHeadlessTask

AppRegistry.registerComponent(appName, () => App);
