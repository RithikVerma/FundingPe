import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

// Import screens
import TransactionScreen from '../screens/ProfileOtherScreen/TransactionScreen';
import FavoriteScreen from '../screens/FavoriteScreen';
import InformationScreen from '../screens/ProfileOtherScreen/InformationScreen';
import HomeStack from './HomeStack';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  // Function to check if we should hide the tab bar
  const getTabBarVisibility = (route: any) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'MainHome';

    // List of screens where we want to hide the tab bar
    const hideTabBarScreens = [
      'MasjidPay',
      'MadarsaPay',
      'OlliAuliaPay',
      'SamajikWorkPay',
      'KnowledgeCityPay',
      'RepairGadgetPay',
      'Payment',
      'QRCodeScreen',
      'ConfirmationForm',
      'ComityDescription',
      'TermsConditions',
      'AboutUs',
      'HelpSupport',
      'AllSangathan',
      'SangathanDescription',
      'RewardGift',
      'RewardGiftDescription',
      'PaymentReceiveForm',
      'Notification',
      'EditProfile'
    ];

    return !hideTabBarScreens.includes(routeName);
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#8A2BE2',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          height: 60,
          paddingBottom: 5,
          display: getTabBarVisibility(route) ? 'flex' : 'none'
        },
        // Prevent screens from unmounting when switching tabs
        unmountOnBlur: false,
      })}
      // Use history back behavior instead of initial route
      backBehavior="history"
      // Keep screens mounted in the background
      detachInactiveScreens={false}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={({ route }) => ({
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
          tabBarStyle: {
            height: 60,
            paddingBottom: 5,
            display: getTabBarVisibility(route) ? 'flex' : 'none'
          }
        })}
      />
      <Tab.Screen
        name="Transaction"
        component={TransactionScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="receipt" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Center"
        component={FavoriteScreen}
        options={{
          tabBarIcon: () => (
            <View style={{
              width: 50,
              height: 50,
              backgroundColor: '#8A2BE2',
              borderRadius: 25,
              marginBottom: -15,
              justifyContent: 'center',
              alignItems: 'center',
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}>
              <MaterialIcons name="person" color="#FFFFFF" size={28} />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="Information"
        component={InformationScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="info" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator; 