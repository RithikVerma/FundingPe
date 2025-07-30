// NativeAdComponent.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import NativeAdView, {
  CallToActionView,
  HeadlineView,
  IconView,
  TaglineView,
  AdvertiserView,
  AdBadge,
  NativeMediaView,
} from 'react-native-admob-native-ads';

interface NativeAdComponentProps {
  containerStyle?: Object;
  adStyle?: Object;
}

const NativeAdComponent: React.FC<NativeAdComponentProps> = ({
  containerStyle,
  adStyle,
}) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [adInfo, setAdInfo] = useState<any>(null);
  const adRef = useRef<any>(null);

  const AD_UNIT_ID = Platform.select({
    ios: 'ca-app-pub-3940256099942544/3986624511', // Test ad unit ID for iOS
    android: 'ca-app-pub-3940256099942544/2247696110', // Official test ad unit ID for Android native ads
  });

  useEffect(() => {
    console.log('[AdMob] Component mounted');
    console.log('[AdMob] Platform:', Platform.OS);
    console.log('[AdMob] Using Ad Unit ID:', AD_UNIT_ID);

    // Auto-retry if ad fails initially
    const retryTimeout = setTimeout(() => {
      if (!adLoaded && adRef.current) {
        console.log('[AdMob] Retrying ad load after timeout...');
        adRef.current?.loadAd();
      }
    }, 5000);

    return () => {
      console.log('[AdMob] Component unmounted');
      clearTimeout(retryTimeout);
    };
  }, [adLoaded, AD_UNIT_ID]);

  const onAdFailedToLoad = (error: Error) => {
    console.error('[AdMob] Ad failed to load:', error);
    setAdError(`Failed to load ad: ${error?.message || 'Unknown error'}`);
    setAdLoaded(false);
    setAdInfo(null);
  };

  const onAdLoaded = () => {
    console.log('[AdMob] Ad successfully loaded');
    setAdLoaded(true);
    setAdError(null);
  };

  const onNativeAdLoaded = (event: { nativeEvent: any }) => {
    console.log('[AdMob] Native ad loaded:', JSON.stringify(event.nativeEvent, null, 2));
    setAdInfo(event.nativeEvent);
  };

  const renderFallback = () => (
    <View style={styles.adPlaceholder}>
      {adError ? (
        <>
          <Text style={styles.adText}>Ad not available</Text>
          <Text style={styles.adErrorText}>{adError}</Text>
        </>
      ) : (
        <>
          <ActivityIndicator size="small" color="#7B2AC2" />
          <Text style={styles.adText}>Loading Ad...</Text>
        </>
      )}
    </View>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <NativeAdView
        ref={adRef}
        style={[styles.nativeAdView, adStyle]}
        adUnitID={AD_UNIT_ID || ''}
        onAdFailedToLoad={onAdFailedToLoad}
        onAdLoaded={onAdLoaded}
        onAdClicked={() => console.log('[AdMob] Ad clicked')}
        onAdImpression={() => console.log('[AdMob] Ad impression recorded')}
        onAdClosed={() => console.log('[AdMob] Ad closed')}
        onAdOpened={() => console.log('[AdMob] Ad opened')}
        onAdLeftApplication={() => console.log('[AdMob] Ad left application')}
        onNativeAdLoaded={onNativeAdLoaded}
        refreshInterval={60000}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
          keywords: ['fashion', 'gaming', 'shopping'],
        }}
        videoOptions={{
          customControlsRequested: true,
        }}
        mediationOptions={{
          nativeBanner: true,
        }}
      >
        {!adLoaded ? (
          renderFallback()
        ) : (
          <View style={styles.adContainer}>
            <AdBadge style={styles.adBadge} />
            <View style={styles.adContent}>
              <View style={styles.adHeader}>
                <IconView style={styles.icon} />
                <View style={styles.adTitles}>
                  <HeadlineView style={styles.headline} numberOfLines={1} />
                  <TaglineView style={styles.tagline} numberOfLines={2} />
                  <AdvertiserView style={styles.advertiser} numberOfLines={1} />
                </View>
              </View>
              <NativeMediaView 
                style={styles.mediaView}
                onVideoStart={() => console.log('[AdMob] Video started')}
                onVideoEnd={() => console.log('[AdMob] Video ended')}
                onVideoPause={() => console.log('[AdMob] Video paused')}
              />
              <CallToActionView
                style={styles.callToAction}
                allCaps
                textStyle={styles.callToActionText}
              />
            </View>
            {adInfo && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugText}>Headline: {adInfo.headline}</Text>
              </View>
            )}
          </View>
        )}
      </NativeAdView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 5,
  },
  nativeAdView: {
    width: '90%',
    minHeight: 80,
  },
  adPlaceholder: {
    width: '100%',
    height: 80,
    backgroundColor: '#f2f4fe',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  adText: {
    color: '#777',
    marginTop: 8,
    fontSize: 12,
  },
  adErrorText: {
    color: '#ff0000',
    fontSize: 10,
    marginTop: 4,
  },
  adContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  adBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  adContent: {
    padding: 6,
  },
  adHeader: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 4,
    marginRight: 6,
  },
  adTitles: {
    flex: 1,
    justifyContent: 'center',
  },
  headline: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 1,
  },
  tagline: {
    fontSize: 10,
    color: '#555',
    marginBottom: 1,
  },
  advertiser: {
    fontSize: 9,
    color: '#777',
  },
  mediaView: {
    width: '100%',
    height: 100,
    backgroundColor: '#f0f0f0',
    marginBottom: 4,
  },
  callToAction: {
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    backgroundColor: '#7B2AC2',
  },
  callToActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  debugInfo: {
    backgroundColor: '#f0f0f0',
    padding: 5,
    marginTop: 5,
  },
  debugText: {
    fontSize: 10,
    color: '#333',
  },
});

export default NativeAdComponent;
