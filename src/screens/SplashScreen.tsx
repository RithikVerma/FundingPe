import React, { useRef, useEffect } from 'react';
import { View, Image, StatusBar, Animated, Easing, StyleSheet } from 'react-native';
import { getAuthToken } from '../utils/tokenStorage';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const checkAuthAndAnimate = async () => {
      try {
        // Start animations
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          })
        ]).start();

        // Check authentication
        await getAuthToken();

        // After delay, fade out and trigger onFinish
        const timer = setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.in(Easing.ease),
          }).start(() => {
            onFinish();
          });
        }, 2500);

        return () => clearTimeout(timer);
      } catch (error) {
        console.error('Error during splash screen:', error);
        onFinish();
      }
    };

    checkAuthAndAnimate();
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <Animated.View 
        style={[
          styles.content,
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Image 
          source={require('../assets/icons/logo1.png')} 
          style={styles.logoImage} 
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  content: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  logoImage: {
    width: 200,
    height: 200,
  },
});

export default SplashScreen; 