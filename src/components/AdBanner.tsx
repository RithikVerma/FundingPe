import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AdBannerProps {
  title: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ title }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
     backgroundColor: '#E8E8E8',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
  },
  title: {
    fontSize: 16,
    color: '#333',
  },
});

export default AdBanner; 