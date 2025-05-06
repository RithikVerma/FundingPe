import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import TermsConditionsScreen from '../screens/ProfileOtherScreen/TermsConditionsScreen';
import AboutUsScreen from '../screens/ProfileOtherScreen/AboutUsScreen';
import HelpSupportScreen from '../screens/ProfileOtherScreen/HelpSupportScreen';
import NotificationScreen from '../screens/ProfileOtherScreen/NotificationScreen';

const Stack = createNativeStackNavigator();

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  TermsConditions: undefined;
  AboutUs: undefined;
  HelpSupport: undefined;
  Notification: undefined;
};

const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} />
      <Stack.Screen name="AboutUs" component={AboutUsScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStack; 