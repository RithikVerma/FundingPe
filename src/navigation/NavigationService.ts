import { NavigationContainerRef, StackActions, CommonActions } from '@react-navigation/native';
import { createRef } from 'react';

export const navigationRef = createRef<NavigationContainerRef<any>>();

export const NavigationService = {
  navigate(name: string, params?: any) {
    if (navigationRef.current) {
      navigationRef.current.navigate(name, params);
    }
  },
  
  push(name: string, params?: any) {
    if (navigationRef.current) {
      navigationRef.current.dispatch(StackActions.push(name, params));
    }
  },

  goBack() {
    if (navigationRef.current) {
      navigationRef.current.goBack();
    }
  },

  reset() {
    if (navigationRef.current) {
      navigationRef.current.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        })
      );
    }
  }
}; 