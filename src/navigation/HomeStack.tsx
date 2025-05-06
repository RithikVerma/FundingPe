import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import MasjidPayScreen from '../screens/PayScreens/MasjidPayScreen';
import MadarsaPayScreen from '../screens/PayScreens/MadarsaPayScreen';
import OlliAuliaPayScreen from '../screens/PayScreens/OlliAuliaPayScreen';
import SamajikWorkPayScreen from '../screens/PayScreens/SamajikWorkPayScreen';
import KnowledgeCityPayScreen from '../screens/PayScreens/KnowledgeCityPayScreen';
import RepairandGadgetPay from '../screens/PayScreens/RepairandGadgetPayScreen';
// import PaymentScreen from '../screens/PaymentScreen';
import QRCodeScreen from '../components/QRCodeScreen';
import ConfirmationForm from '../components/ConfirmationForm';
import ComityDescriptionScreen from '../screens/ComityDescriptionScreen';
import AllSangathanScreen from '../screens/AllSangathanScreen';
import SangathanDescriptionScreen from '../screens/SangathanDescriptionScreen';
import RewardGiftScreen from '../screens/RewardGiftScreen';
import RewardGiftDescriptionScreen from '../screens/RewardGiftDescriptionScreen';
import PaymentReceiveForm from '../components/PaymentReceiveForm';
import NotificationScreen from '../screens/ProfileOtherScreen/NotificationScreen';

const Stack = createNativeStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainHome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen 
        name="MainHome" 
        component={HomeScreen} 
      />
      <Stack.Screen 
        name="MasjidPay" 
        component={MasjidPayScreen} 
      />
      <Stack.Screen 
        name="MadarsaPay" 
        component={MadarsaPayScreen} 
      />
      <Stack.Screen 
        name="OlliAuliaPay" 
        component={OlliAuliaPayScreen} 
      />
      <Stack.Screen 
        name="SamajikWorkPay" 
        component={SamajikWorkPayScreen} 
      />
      <Stack.Screen 
        name="KnowledgeCityPay" 
        component={KnowledgeCityPayScreen} 
      />
       <Stack.Screen 
        name="RepairandGadgetPay" 
        component={RepairandGadgetPay} 
      /> 
      {/* <Stack.Screen 
        name="Payment" 
        component={PaymentScreen} 
      /> */}
      <Stack.Screen 
        name="PaymentReceiveForm" 
        component={PaymentReceiveForm} 
      />
      <Stack.Screen 
        name="QRCodeScreen" 
        component={QRCodeScreen} 
      />
      <Stack.Screen 
        name="ConfirmationForm" 
        component={ConfirmationForm} 
      />
      <Stack.Screen 
        name="ComityDescription" 
        component={ComityDescriptionScreen} 
      />
      <Stack.Screen 
        name="AllSangathan" 
        component={AllSangathanScreen} 
      />
      <Stack.Screen 
        name="SangathanDescription" 
        component={SangathanDescriptionScreen} 
      />
      <Stack.Screen 
        name="RewardGift" 
        component={RewardGiftScreen} 
      />
      <Stack.Screen 
        name="RewardGiftDescription" 
        component={RewardGiftDescriptionScreen} 
      />
      <Stack.Screen 
        name="Notification" 
        component={NotificationScreen} 
      />
    </Stack.Navigator>
  );
};

export default HomeStack; 