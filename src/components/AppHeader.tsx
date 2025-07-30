import React from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface HeaderProps {
  onNotificationPress?: () => void;
}

const AppHeader: React.FC<HeaderProps> = ({ onNotificationPress }) => {
  return (
    <>
      <StatusBar backgroundColor="#8A2BE2" barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Image 
            source={require('../assets/icons/Homelogo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
          <MaterialIcons name="notifications" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#8A2BE2',
    height: 60,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: -25,
  },
  logo: {
    width: 150,
    height: 35,
  },
  iconButton: {
    padding: 5,
    marginLeft: 10,
  },
});

export default AppHeader; 