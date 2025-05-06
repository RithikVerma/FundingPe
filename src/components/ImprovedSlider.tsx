import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
  Text,
  Linking,
} from 'react-native';

const { width } = Dimensions.get('window');

interface SliderItem {
  id: string;
  image: any;
  title?: string;
  url?: string;  // URL to open when banner is clicked
}

interface ImprovedSliderProps {
  images: SliderItem[];
  autoPlayInterval?: number;
  dotStyle?: 'dots' | 'bars';
  height?: number;
  imageStyle?: object;
  onBannerPress?: (item: SliderItem) => void;  // Optional custom handler for banner press
}

const ImprovedSlider: React.FC<ImprovedSliderProps> = ({
  images,
  autoPlayInterval = 3000,
  dotStyle = 'dots',
  height = 180,
  imageStyle,
  onBannerPress,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  // Auto-scroll effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoPlayInterval > 0) {
      interval = setInterval(() => {
        if (activeIndex === images.length - 1) {
          flatListRef.current?.scrollToIndex({
            index: 0,
            animated: true,
          });
        } else {
          flatListRef.current?.scrollToIndex({
            index: activeIndex + 1,
            animated: true,
          });
        }
      }, autoPlayInterval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeIndex, images.length, autoPlayInterval]);
  
  // Handle scroll events
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
    
    Animated.event(
      [{ nativeEvent: { contentOffset: { x: scrollX } } }],
      { useNativeDriver: false }
    )(event);
  };

  // Handle banner press
  const handleBannerPress = (item: SliderItem) => {
    if (onBannerPress) {
      // Use custom handler if provided
      onBannerPress(item);
    } else if (item.url) {
      // Default behavior: open URL if available
      Linking.canOpenURL(item.url).then(supported => {
        if (supported) {
          Linking.openURL(item.url!);
        } else {
          console.log('Cannot open URL:', item.url);
        }
      });
    }
  };
  
  // Render slider item
  const renderItem = ({ item }: { item: SliderItem }) => {
    return (
      <TouchableOpacity 
        style={[styles.slide, { height }]}
        onPress={() => handleBannerPress(item)}
        activeOpacity={item.url ? 0.8 : 1}  // Only show active state if clickable
      >
        <Image source={item.image} style={[styles.image, imageStyle]} />
        {item.title && (
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{item.title}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  // Render indicator
  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {images.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              flatListRef.current?.scrollToIndex({
                index,
                animated: true,
              });
            }}
          >
            <View
              style={[
                dotStyle === 'dots' ? styles.dot : styles.bar,
                index === activeIndex && (dotStyle === 'dots' ? styles.activeDot : styles.activeBar),
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  return (
    <View style={[styles.container, { height }]}>
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(_, index) => index.toString()}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onScrollToIndexFailed={({ index }) => {
          // Fallback to scrollToOffset if scrollToIndex fails
          flatListRef.current?.scrollToOffset({
            offset: index * width,
            animated: true,
          });
        }}
      />
      
      {renderDots()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  slide: {
    width,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    margin: 4,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7B2AC2',
  },
  bar: {
    width: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    margin: 4,
  },
  activeBar: {
    width: 30,
    height: 4,
    backgroundColor: '#7B2AC2',
  },
  titleContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderRadius: 5,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ImprovedSlider; 