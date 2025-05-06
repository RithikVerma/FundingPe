import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface HeroBannerProps {
  imageSource: any;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ imageSource }) => {
  return (
    <View style={styles.container}>
      <Image source={imageSource} style={styles.image} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: 180,
    backgroundColor: '#6b5ce7',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default HeroBanner; 