import AsyncStorage from '@react-native-async-storage/async-storage';

// Token keys
const AUTH_TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

// Save the authentication token with expiry
export const saveAuthToken = async (token: string, expiresIn: number = 30 * 24 * 60 * 60 * 1000): Promise<void> => {
  try {
    const expiryTime = Date.now() + expiresIn;
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  } catch (error) {
    console.error('Error saving auth token:', error);
    throw error;
  }
};

// Get the saved authentication token
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    const expiryTime = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!token || !expiryTime) {
      return null;
    }

    const expiry = parseInt(expiryTime, 10);
    if (Date.now() > expiry) {
      // Token expired, remove it
      await removeAuthToken();
      return null;
    }

    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Remove the authentication token (for logout)
export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(TOKEN_EXPIRY_KEY);
  } catch (error) {
    console.error('Error removing auth token:', error);
    throw error;
  }
}; 