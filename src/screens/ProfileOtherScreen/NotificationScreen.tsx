import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Linking } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, getToken, onMessage, AuthorizationStatus } from '@react-native-firebase/messaging';
import { fetchNotifications, Notification } from '../../utils/api';

// URL detection regex pattern
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

// Extend the Notification type to include optional data
interface NotificationData {
  screen?: string;
  params?: Record<string, any>;
}

interface ExtendedNotification extends Notification {
  data?: NotificationData;
}

// Define the navigation type
type RootStackParamList = {
  [key: string]: object | undefined;
};

const NotificationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [_fcmToken, setFcmToken] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<ExtendedNotification[]>([]);
  
  // Function to handle navigation based on notification data
  const handleNotificationNavigation = React.useCallback((notificationData: any) => {
    if (!notificationData) return;

    const { screen, params } = notificationData.data || {};
    
    if (screen) {
      // Navigate to the specified screen with optional params
      navigation.navigate(screen, params);
    }
  }, [navigation]);

  // Function to fetch notifications from API
  const fetchNotificationsFromApi = async () => {
    setLoading(true);
    try {
      const notificationsData = await fetchNotifications();
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Request permission for notifications
    const requestUserPermission = async () => {
      const app = getApp();
      const messagingInstance = getMessaging(app);
      const authStatus = await messagingInstance.requestPermission();
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        getFcmToken();
      } else {
        console.log('Notification permission denied');
        setLoading(false);
      }
    };

    // Get FCM token
    const getFcmToken = async () => {
      try {
        const app = getApp();
        const messagingInstance = getMessaging(app);
        const token = await getToken(messagingInstance);
        if (token) {
          console.log('FCM Token:', token);
          setFcmToken(token);
        }
      } catch (error) {
        console.log('Error getting FCM token:', error);
      } finally {
        // After getting token, fetch notifications
        fetchNotificationsFromApi();
      }
    };

    // Initialize messaging
    const app = getApp();
    const messagingInstance = getMessaging(app);

    // Handle foreground messages
    const unsubscribe = onMessage(messagingInstance, async remoteMessage => {
      console.log('Notification received in foreground:', remoteMessage);
      handleNotificationNavigation(remoteMessage);
      fetchNotificationsFromApi();
    });

    // Handle notification opened when app is in background
    messagingInstance.onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened from background state:', remoteMessage);
      handleNotificationNavigation(remoteMessage);
      fetchNotificationsFromApi();
    });

    // Check if app was opened from a notification
    messagingInstance
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Notification opened app from quit state:', remoteMessage);
          handleNotificationNavigation(remoteMessage);
          fetchNotificationsFromApi();
        }
      });

    // Call request permission
    requestUserPermission();

    // Cleanup subscription
    return unsubscribe;
  }, [navigation, handleNotificationNavigation]);

  // Format the time for display (e.g., "10:30 AM", "Yesterday", "Monday", etc.)
  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const notifDate = new Date(timestamp);
    const diffDays = Math.floor((now.getTime() - notifDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Format time as HH:MM AM/PM
    const timeString = notifDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    
    if (diffDays === 0) {
      // Today - show time
      return timeString;
    } else if (diffDays === 1) {
      // Yesterday
      return 'Yesterday';
    } else if (diffDays < 7) {
      // Within a week - show day name
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[notifDate.getDay()];
    } else {
      // More than a week - show date
      return notifDate.toLocaleDateString();
    }
  };

  // Function to detect and format URLs in text
  const renderMessageWithLinks = (message: string) => {
    if (!message) return null;

    const parts = message.split(URL_REGEX);
    return (
      <Text style={styles.message} numberOfLines={2}>
        {parts.map((part, index) => {
          if (part.match(URL_REGEX)) {
            return (
              <Text
                key={index}
                style={styles.link}
                onPress={() => Linking.openURL(part)}
              >
                {part}
              </Text>
            );
          }
          return <Text key={index}>{part}</Text>;
        })}
      </Text>
    );
  };

  // Function to handle notification item press
  const handleNotificationPress = (notification: ExtendedNotification) => {
    if (notification.data) {
      handleNotificationNavigation(notification);
    }
  };

  const renderItem = ({ item }: { item: ExtendedNotification }) => (
    <TouchableOpacity 
      style={styles.notificationItem}
      onPress={() => handleNotificationPress(item)}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.profileImage} />
      ) : (
        <Image 
          source={require('../../assets/icons/logo2.jpg')} 
          style={styles.profileImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>{item.name || item.title}</Text>
        </View>
        {renderMessageWithLinks(item.message)}
      </View>
      <Text style={styles.time}>{formatTime(item.created_at)}</Text>
    </TouchableOpacity>
  );

  const EmptyNotificationList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="notifications-none" size={80} color="#d3d3d3" />
      <Text style={styles.emptyText}>No notifications yet</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8A2BE2" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={EmptyNotificationList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8A2BE2',
    padding: 16,
    paddingTop: 20,
    height: 60,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8A2BE2',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 400,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
  },
  listContainer: {
    padding: 10,
    flexGrow: 1,
  },
  notificationItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingRight: 57,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
    lineHeight: 22,
  },
  time: {
    fontSize: 12,
    color: '#888',
    position: 'absolute',
    top: 19,
    right: 10,
  },
  message: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  link: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
});

export default NotificationScreen;