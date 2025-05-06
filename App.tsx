import React from 'react';
import { StatusBar, SafeAreaView } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor="#7B2AC2" barStyle="light-content" />
      <AppNavigator />
    </SafeAreaView>
  );
};

export default App;
