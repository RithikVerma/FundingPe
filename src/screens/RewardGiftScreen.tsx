import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const RewardGiftScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="transparent" translucent barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#8A2BE2" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reward Gift</Text>
        </View>

        {/* Coming Soon Content */}
        <View style={styles.comingSoonContainer}>
          <Image
            source={require('../assets/icons/Homelogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.comingSoonTitle}>Coming Soon!</Text>
          <Text style={styles.comingSoonText}>
            We're working hard to bring you an amazing Reward Gift feature.
            Please check back later.
          </Text>
          <View style={styles.decorativeLine} />
          <Text style={styles.stayTunedText}>Stay tuned for updates!</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8A2BE2',
    marginLeft: 16,
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 60,
    marginBottom: 30,
  },
  comingSoonTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8A2BE2',
    marginBottom: 16,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  decorativeLine: {
    width: '40%',
    height: 2,
    backgroundColor: '#8A2BE2',
    marginVertical: 20,
  },
  stayTunedText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#8A2BE2',
    marginTop: 10,
  }
});

export default RewardGiftScreen; 