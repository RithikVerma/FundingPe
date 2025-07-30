import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ImageSourcePropType,
  PermissionsAndroid,
  Modal,
  ActivityIndicator
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
// Add these imports for using document picker
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
// Import needed for file sharing
import Share, { Social } from 'react-native-share';
// Import for authentication
import { getAuthToken } from '../utils/tokenStorage';
import { Linking } from 'react-native';

// Define the route param types
type PaymentReceiveFormParams = {
  whatsappNumber?: string;
  productName?: string;
  productId?: string;
  selectedProduct?: {
    id: string | number;
    name: string;
    Whatsapp?: string | null;
    Mobile?: string | null;
  };
};

type PaymentReceiveRouteProp = RouteProp<
  { PaymentReceiveForm: PaymentReceiveFormParams },
  'PaymentReceiveForm'
>;

const PaymentReceiveForm = () => {
  const navigation = useNavigation();
  const route = useRoute<PaymentReceiveRouteProp>();
  
  // Get parameters from route if they exist
  const routeWhatsappNumber = route.params?.whatsappNumber;
  const routeProductName = route.params?.productName;
  const routeProductId = route.params?.productId;
  const selectedProduct = route.params?.selectedProduct;
  
  // Use selected product's WhatsApp number if available
  const productWhatsappNumber = selectedProduct?.Whatsapp || routeWhatsappNumber;
  
  // Log route parameters to debug the issue
  useEffect(() => {
    console.log('PaymentReceiveForm - Route Params:', JSON.stringify(route.params, null, 2));
    console.log('Selected Product:', selectedProduct);
    console.log('Product WhatsApp Number:', productWhatsappNumber);
    console.log('Route WhatsApp Number:', routeWhatsappNumber);
  }, [route.params, selectedProduct, productWhatsappNumber, routeWhatsappNumber]);
  
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [product_id, setProductId] = useState(routeProductId || '');
  const [receipt_image, setReceiptImage] = useState<ImageSourcePropType | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [filePath, setFilePath] = useState<string>('');
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [receiverName, _setReceiverName] = useState(routeProductName || selectedProduct?.name || '');
  const [showThankYouModal, setShowThankYouModal] = useState(false);

  // Function to request all permissions at once - using useCallback
  const requestAllPermissions = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        let storageGranted = false;
        if (Platform.Version as number >= 33) {
          const imagePermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            {
              title: "Files Permission",
              message: "App needs access to your files",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK"
            }
          );
          
          // On Android 13+ we also need to request storage permission for sharing files
          const storagePermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: "Storage Permission",
              message: "App needs access to your storage to share files",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK"
            }
          );
          
          storageGranted = 
            imagePermission === PermissionsAndroid.RESULTS.GRANTED || 
            storagePermission === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          const readPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: "Storage Permission",
              message: "App needs access to your storage to select files",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK"
            }
          );
          
          const writePermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: "Storage Permission",
              message: "App needs access to your storage to share files",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK"
            }
          );
          
          storageGranted = 
            readPermission === PermissionsAndroid.RESULTS.GRANTED || 
            writePermission === PermissionsAndroid.RESULTS.GRANTED;
        }
        
        console.log('Storage permissions granted:', storageGranted);
        setPermissionsGranted(storageGranted);
        
        return storageGranted;
      } catch (err) {
        console.warn('Error requesting permissions:', err);
        return false;
      }
    } else {
      // iOS doesn't need explicit permission
      setPermissionsGranted(true);
      return true;
    }
  }, []);

  // Request permissions on component mount
  useEffect(() => {
    const checkPermissions = async () => {
      await requestAllPermissions();
    };
    
    checkPermissions();
  }, [requestAllPermissions]);

  // Store file to app's documents directory
  const storeFile = async (fileUri: string, fileName: string) => {
    try {
      setIsUploading(true);
      
      const destinationDir = Platform.OS === 'ios' 
        ? `${RNFS.DocumentDirectoryPath}/receipts` 
        : `${RNFS.ExternalDirectoryPath}/receipts`;
      
      const dirExists = await RNFS.exists(destinationDir);
      if (!dirExists) {
        await RNFS.mkdir(destinationDir);
      }
      
      const timestamp = new Date().getTime();
      const fileNameWithoutSpaces = fileName.replace(/\s+/g, '_');
      const uniqueFileName = `${timestamp}_${fileNameWithoutSpaces}`;
      const destinationPath = `${destinationDir}/${uniqueFileName}`;
      
      await RNFS.copyFile(fileUri, destinationPath);
      console.log('File stored successfully at:', destinationPath);
      
      setFilePath(destinationPath);
      
      setIsUploading(false);
      return destinationPath;
    } catch (error) {
      setIsUploading(false);
      console.error('Error storing file:', error);
      Alert.alert('Error', 'Failed to store the file. Please try again.');
      return null;
    }
  };

  // Enhanced selectDocument function
  const selectDocument = async () => {
    try {
      const pickerResult = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.images,
          'image/jpeg',
          'image/png'
        ],
      });
      
      if (Array.isArray(pickerResult) && pickerResult.length > 0) {
        const file = pickerResult[0];
        // Check if file has a type property or mime property
        const fileType = file.type || (file as any).mime || '';
        
        if (isAllowedFileType(fileType)) {
          setReceiptImage({ uri: file.uri });
          const name = file.name || 'receipt.jpg';
          setFileName(name);
          
          await storeFile(file.uri, name);
        } else {
          Alert.alert(
            "Invalid File Type",
            "Please select a JPEG or PNG image only.",
            [{ text: "OK" }]
          );
        }
      } else if (pickerResult) {
        // This branch handles the case where pickerResult is not an array
        // Use type assertion to handle both array and single result cases
        const singleResult = pickerResult as any;
        const fileType = singleResult.type || singleResult.mime || '';
        
        if (isAllowedFileType(fileType)) {
          setReceiptImage({ uri: singleResult.uri });
          const name = singleResult.name || 'receipt.jpg';
          setFileName(name);
          
          await storeFile(singleResult.uri, name);
        } else {
          Alert.alert(
            "Invalid File Type",
            "Please select a JPEG or PNG image only.",
            [{ text: "OK" }]
          );
        }
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled document picker');
      } else {
        console.log('DocumentPicker Error:', err);
        // Check if this could be a permission error
        if (Platform.OS === 'android') {
          // On error, check if permissions are still granted
          const stillHasPermissions = await requestAllPermissions();
          if (!stillHasPermissions) {
            Alert.alert(
              "Permission Issue",
              "We couldn't access your files. Please check your device permissions and try again.",
              [
                { text: "OK" },
                { 
                  text: "Open Settings", 
                  onPress: () => Linking.openSettings() 
                }
              ]
            );
          } else {
            // Some other error
            Alert.alert(
              "Error",
              "There was a problem selecting the file. Please try again.",
              [{ text: "OK" }]
            );
          }
        } else {
         
          Alert.alert(
            "Error",
            "There was a problem selecting the file. Please try again.",
            [{ text: "OK" }]
          );
        }
      }
    }
  };
  
  // Helper function to check if file type is allowed
  const isAllowedFileType = (fileType: string): boolean => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    
    return allowedTypes.some(type => fileType.toLowerCase().includes(type));
  };

  const handleSelectImage = async () => {
    if (Platform.OS === 'android') {
      // For Android, explicitly request permissions first
      const granted = await requestAllPermissions();
      
      if (!granted) {
        // Show a more helpful message about permissions
        Alert.alert(
          "Permission Required",
          "We need storage access permission to upload images. Please grant this permission in your device settings to continue.",
          [
            { 
              text: "Cancel", 
              style: "cancel" 
            },
            { 
              text: "Open Settings", 
              onPress: () => {
                // Open app settings so user can grant permissions
                Linking.openSettings();
              } 
            }
          ]
        );
      return;
      }
    }
    
    // Proceed with document selection if permissions are granted
    await selectDocument();
  };

  const handleRemoveImage = async () => {
    if (filePath) {
      try {
        const fileExists = await RNFS.exists(filePath);
        if (fileExists) {
          await RNFS.unlink(filePath);
          console.log('File deleted successfully:', filePath);
        }
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
    
    setReceiptImage(null);
    setFileName('');
    setFilePath('');
  };

  // Function to share the form details via WhatsApp
  const shareFormDetails = async () => {
    if (!amount || !name || !phone || !address || !product_id) {
      Alert.alert('Error', 'Please fill all the required fields before sharing');
      return false;
    }

    try {
      // Check permissions first - especially important for Android
      if (Platform.OS === 'android' && !permissionsGranted) {
        await requestAllPermissions();
        if (!permissionsGranted) {
          Alert.alert('Error', 'Storage permissions are required for sharing files.');
          return false;
        }
      }
      
      // Get the category label for the selected option
      const selectedCategory = paymentOptions.find(opt => opt.id === product_id);
      const categoryLabel = selectedCategory ? selectedCategory.label : '';
      
      // Create a formatted message with all form details
      const formMessage = `*Payment Receipt*\n\n`
        + `*Amount:* ₹${amount}\n`
        + `*From:* ${name}\n`
        + `*Phone:* ${phone}\n`
        + `*Address:* ${address}\n`
        + `*Category:* ${categoryLabel}\n`
        + `*Donate To:* ${receiverName}\n`
        + `*Date:* ${new Date().toLocaleDateString()}\n`;
      
      // Use the selected product's WhatsApp number directly
      // If it doesn't exist, try to use the category's WhatsApp number as a fallback
      let whatsappNumber = '';
      
      // Try product WhatsApp number first
      if (productWhatsappNumber && productWhatsappNumber.trim() !== '') {
        whatsappNumber = productWhatsappNumber;
      }
      // Then try category WhatsApp number as fallback
      else if (selectedCategory?.whatsappNumber && selectedCategory.whatsappNumber.trim() !== '') {
        whatsappNumber = selectedCategory.whatsappNumber;
      }
      
      console.log('Using Product WhatsApp Number for sharing:', whatsappNumber);
      
      // Format the WhatsApp number correctly
      let formattedNumber = '';
      if (whatsappNumber && whatsappNumber.trim() !== '') {
        // Remove any non-digit characters and ensure it has country code
        formattedNumber = whatsappNumber.replace(/\D/g, '');
        
        // If the number doesn't start with a country code (like 91), add it
        if (!formattedNumber.startsWith('91') && formattedNumber.length === 10) {
          formattedNumber = '91' + formattedNumber;
        }
        
        console.log('Formatted WhatsApp number for sharing:', formattedNumber);
      }

      // Prepare file URI and mime type if we have an image
      let fileUri = '';
      let mimeType = '';
      
      if (filePath && fileName) {
        // Format file URI properly for the platform
        fileUri = Platform.OS === 'android' && !filePath.startsWith('file://') 
          ? `file://${filePath}` 
          : filePath;
          
        // Get file extension to determine mime type
        const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
        mimeType = ['jpg', 'jpeg'].includes(fileExtension) ? 'image/jpeg' : 'image/png';
        
        // Verify the file exists
        const fileExists = await RNFS.exists(filePath);
        if (!fileExists) {
          console.log('Image file not found, continuing with text-only share');
          fileUri = '';
        }
      }
      
      // Share to WhatsApp if we have a number and WhatsApp is installed
      if (formattedNumber) {
        const isWhatsAppInstalled = await Linking.canOpenURL('whatsapp://send');
        
        if (isWhatsAppInstalled) {
          console.log('WhatsApp is installed, sharing content');
          
          try {
            // 3. Try to use Share.shareSingle for WhatsApp
            console.log('Sharing directly to WhatsApp...', formattedNumber);
            
            if (Platform.OS === 'android') {
              // On Android, we need to use a different approach to share both text and image to a specific contact
              
              // First try to use shareSingle which works best for combined content
              try {
                // This should handle both text and image in one action
                await Share.shareSingle({
                  title: 'Share Payment Receipt',
                  message: formMessage,
                  url: fileUri || '',
                  type: fileUri ? mimeType : 'text/plain',
                  social: Social.Whatsapp,
                  whatsAppNumber: formattedNumber
                } as any);
                
                // Show Thank You message after successful sharing
                setTimeout(() => setShowThankYouModal(true), 500);
                return true;
              } catch (shareSingleError) {
                console.log('ShareSingle failed, trying alternative method:', shareSingleError);
                
                // If shareSingle fails, try using a Content Provider approach
                // This uses the general share dialog but will prefill WhatsApp if chosen
                if (fileUri) {
                  await Share.open({
                    title: 'Share via WhatsApp',
                    message: formMessage,
                    url: fileUri,
                    type: mimeType,
                    showAppsToView: true, // Shows all apps, but user can select WhatsApp
                    failOnCancel: false,
                  });
                  
                  // Show Thank You message after successful sharing
                  setTimeout(() => setShowThankYouModal(true), 500);
                  return true;
                } else {
                  // If no image, use WhatsApp direct intent
                  const whatsappUrl = `whatsapp://send?phone=${formattedNumber}&text=${encodeURIComponent(formMessage)}`;
                  await Linking.openURL(whatsappUrl);
                  
                  // Show Thank You message after successful sharing
                  setTimeout(() => setShowThankYouModal(true), 500);
                  return true;
                }
              }
            } else {
              
              await Share.shareSingle({
                title: 'Share Payment Receipt',
                message: formMessage,
                url: fileUri || '',
                type: fileUri ? mimeType : 'text/plain',
                social: Social.Whatsapp,
                whatsAppNumber: formattedNumber
              } as any);
              
              // Show Thank You message after successful sharing
              setTimeout(() => setShowThankYouModal(true), 500);
              return true;
            }
          } catch (error: any) {
            console.error('Error sharing form details:', error);
            
            // Don't show error when user cancels sharing
            if (error.message !== 'User did not share') {
              Alert.alert('Error', 'Failed to share the payment details. Please try again.');
            }
            
            return false;
          }
        } else {
          console.log('WhatsApp not installed, using standard share');
        }
      }
      
      // Fallback to standard sharing if WhatsApp isn't available or we don't have a specific number
      console.log('Using general share dialog');
      const shareOptions: any = {
        title: 'Share Payment Details',
        message: formMessage,
      };
      
      // Add image to share options if available
      if (fileUri) {
        shareOptions.url = fileUri;
        shareOptions.type = mimeType;
      }
      
      // Open standard share dialog with both text and image
      await Share.open(shareOptions);
      
      // Show Thank You message after successful sharing
      setTimeout(() => setShowThankYouModal(true), 500);
      return true;
    } catch (error: any) {
      console.error('Error sharing form details:', error);
      
      // Don't show error when user cancels sharing
      if (error.message !== 'User did not share') {
        Alert.alert('Error', 'Failed to share the payment details. Please try again.');
      }
      
      return false;
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!amount || !name || !phone || !address || !product_id) {
      Alert.alert('Error', 'Please fill all the required fields');
      return;
    }

    // Format phone number - remove any spaces or special characters
    const formattedPhone = phone.replace(/\D/g, '');
    
    // Validate phone number format
    if (formattedPhone.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setIsUploading(true);
      const token = await getAuthToken();
      
      if (!token) {
        Alert.alert('Error', 'Authentication required. Please login again.');
        navigation.navigate('Login' as never);
        return;
      }

      // Get the selected category label
      const selectedCategory = paymentOptions.find(opt => opt.id === product_id);
      const categoryLabel = selectedCategory ? selectedCategory.label : '';
      
      // Format WhatsApp number correctly for API and sharing
      let whatsapp = '';
      if (productWhatsappNumber && productWhatsappNumber.trim() !== '') {
        whatsapp = productWhatsappNumber.replace(/\D/g, '');
      } else if (selectedCategory?.whatsappNumber) {
        // Use category's WhatsApp number as fallback
        whatsapp = selectedCategory.whatsappNumber.replace(/\D/g, '');
      }
      
      console.log('Using WhatsApp number:', whatsapp);
      
      // Create form data with EXACT field names expected by the API
      const paymentData = {
        name: name.trim(),
        phone_number: formattedPhone,
        address: address.trim(),
        amount: amount.trim(),
        payment_category: categoryLabel,
        product: receiverName || null,
        product_id: selectedProduct?.id || routeProductId || null,
        whatsapp_number: whatsapp
      };
      
      console.log('Sending payment data:', JSON.stringify(paymentData, null, 2));
      
      let apiSuccess = false;
      let apiMessage = '';

      try {
        // Step 1: First attempt to upload the data to the API
        console.log('Step 1: Uploading data to API...');

        if (filePath && fileName) {
          console.log('Uploading data with receipt image');
          
          // Create FormData for multipart/form-data
          const formData = new FormData();
          
          // Add all fields with correct field names
          formData.append('name', name.trim());
          formData.append('phone_number', formattedPhone);
          formData.append('address', address.trim());
          formData.append('amount', amount.trim());
          formData.append('payment_category', categoryLabel);
          formData.append('product', receiverName || '');
          formData.append('product_id', String(selectedProduct?.id || routeProductId || ''));
          formData.append('whatsapp_number', whatsapp);
          
          // Add receipt image
          const fileUri = Platform.OS === 'android' ? `file://${filePath}` : filePath;
          const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
          let mimeType = 'image/jpeg';
          
          if (['jpg', 'jpeg'].includes(fileExtension)) {
            mimeType = 'image/jpeg';
          } else if (fileExtension === 'png') {
            mimeType = 'image/png';
          }

          formData.append('receipt_image', {
            uri: fileUri,
            type: mimeType,
            name: fileName
          } as any);
          
          // Send API request with image
          const multipartResponse = await fetch('http://fund.swarojgar.org/api/payment', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
              // NOTE: Do not set Content-Type for multipart/form-data with files
            },
            body: formData
          });
          
          const multipartResult = await multipartResponse.text();
          console.log('API response status:', multipartResponse.status);
          console.log('API response:', multipartResult);
          
          if (multipartResponse.ok) {
            apiSuccess = true;
            apiMessage = 'Payment request with receipt created successfully';
            console.log('API upload successful with image');
          } else {
            // Try to parse the error
            let errorMessage = 'Failed to create payment with receipt';
            try {
              const errorData = JSON.parse(multipartResult);
              if (errorData.message) {
                errorMessage = errorData.message;
              } else if (errorData.error) {
                errorMessage = errorData.error;
              }
            } catch (e) {
              // If we can't parse the JSON, just use the raw response text
              if (multipartResult && typeof multipartResult === 'string') {
                errorMessage = multipartResult;
              }
            }
            throw new Error(errorMessage);
          }
        } else {
          console.log('Uploading data without image');
          
          // Send API request without image
          const jsonResponse = await fetch('http://fund.swarojgar.org/api/payment', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(paymentData)
          });
          
          const jsonResult = await jsonResponse.text();
          console.log('API response status:', jsonResponse.status);
          console.log('API response:', jsonResult);
          
          if (jsonResponse.ok) {
            apiSuccess = true;
            apiMessage = 'Payment request created successfully';
            console.log('API upload successful without image');
          } else {
            // Extract error message
            let errorMessage = 'Failed to create payment';
          try {
            const errorData = JSON.parse(jsonResult);
              if (errorData.message) {
                errorMessage = errorData.message;
              } else if (errorData.error) {
                errorMessage = errorData.error;
              }
          } catch (e) {
              // If we can't parse the JSON, just use the raw response text
              if (jsonResult && typeof jsonResult === 'string') {
                errorMessage = jsonResult;
          }
            }
            throw new Error(errorMessage);
        }
        }
        
        // Step 2: If API call was successful, share the information via WhatsApp
        if (apiSuccess) {
          console.log('Step 2: Sharing via WhatsApp...');
          const shareResult = await shareFormDetails();
          
          if (shareResult) {
            // Both API upload and sharing were successful - we'll show the Thank You modal instead
            // of an Alert to provide a better experience
            return; // Let the Thank You modal handle the messaging
          } else {
            // API upload was successful but sharing failed
            Alert.alert(
              'Partial Success',
              `${apiMessage}, but there was an issue sharing it via WhatsApp. You can share it manually.`,
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
          }
        }
    } catch (error) {
        console.error('Error in API upload or sharing:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to submit payment. Please try again.'
      );
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Combined category options in a flat structure with default WhatsApp numbers
  // Note: In a real app, these would be fetched from your backend
  const paymentOptions = [
    // Mosjid options
    { id: 'mosjid_dan', label: 'Mosjid - Dan', category: 'Mosjid', whatsappNumber: '919876543210' },
    { id: 'mosjid_monthly', label: 'Mosjid - Monthly Payment', category: 'Mosjid', whatsappNumber: '919876543210' },  
    
    // Madrasa options
    { id: 'madrasa_dan', label: 'Madrasa - Dan', category: 'Madrasa', whatsappNumber: '919876543211' },
    { id: 'madrasa_monthly', label: 'Madrasa - Monthly Payments', category: 'Madrasa', whatsappNumber: '919876543211' },
    { id: 'madrasa_zakat', label: 'Madrasa - Zakat', category: 'Madrasa', whatsappNumber: '919876543211' },
    { id: 'madrasa_fitra', label: 'Madrasa - Fitra', category: 'Madrasa', whatsappNumber: '919876543211' },
    { id: 'madrasa_sadaqah', label: 'Madrasa - Sadaqah', category: 'Madrasa', whatsappNumber: '919876543211' },
    
    // Olli Aulia options
    { id: 'olli_repair', label: 'Olli Aulia - Repair and Gadget', category: 'Olli Aulia', whatsappNumber: '919876543212' },
    { id: 'olli_jalsa', label: 'Olli Aulia - Jalsa', category: 'Olli Aulia', whatsappNumber: '919876543212' },
    
    //All Dan
    { id: 'All_dan', label: 'Dan', category: 'All Dan', whatsappNumber: '919876543213' }
  ];

  // Get the selected option label
  const getSelectedOptionLabel = () => {
    // Remove the condition showing product name
    const option = paymentOptions.find(opt => opt.id === product_id);
    return option ? option.label : 'Select Category';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#8A2BE2" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {receiverName ? 'Payment to' : 'Payment Confirmation'}
          </Text>
          {receiverName && (
            <Text style={styles.headerProductName} numberOfLines={1} ellipsizeMode="tail">
              {receiverName}
            </Text>
          )}
        </View>
      </View>

      {/* Thank You Modal */}
      <Modal
        visible={showThankYouModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowThankYouModal(false);
          navigation.goBack();
        }}
      >
        <View style={styles.thankYouModalOverlay}>
          <View style={styles.thankYouModalContent}>
            <MaterialIcons name="check-circle" size={60} color="#4CAF50" style={styles.thankYouIcon} />
            <Text style={styles.thankYouTitle}>Thank You!</Text>
            <Text style={styles.thankYouMessage}>
              Your payment details have been submitted and shared successfully.
            </Text>
            {/* <Text style={styles.thankYouSubMessage}>
              JazakAllah Khair for your contribution.
            </Text> */}
            <TouchableOpacity 
              style={styles.thankYouButton}
              onPress={() => {
                setShowThankYouModal(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.thankYouButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView 
          style={styles.formContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Single Card for All Content */}
          <View style={styles.card}>
        {/* Payer Details Section */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="person" size={20} color="#8A2BE2" />
                <Text style={styles.sectionTitle}>Contributor Details</Text>
              </View>
              
              <View style={styles.inputField}>
                <Text style={styles.label}>Full Name *</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="person-outline" size={20} color="#8A2BE2" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter full name"
                    value={name}
                    onChangeText={setName}
              placeholderTextColor="#999"
            />
                </View>
          </View>

              <View style={styles.inputField}>
                <Text style={styles.label}>Phone Number *</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="phone" size={20} color="#8A2BE2" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
                    placeholder="Enter 10-digit phone number"
              keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    maxLength={10}
              placeholderTextColor="#999"
            />
                </View>
          </View>

              <View style={styles.inputField}>
                <Text style={styles.label}>Address *</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="location-on" size={20} color="#8A2BE2" style={[styles.inputIcon, {alignSelf: 'flex-start', marginTop: 12}]} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter complete address"
              multiline
              numberOfLines={3}
              value={address}
              onChangeText={setAddress}
              placeholderTextColor="#999"
            />
          </View>
        </View>
          </View>

            <View style={styles.divider} />

            {/* Recipient Details Section */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="business" size={20} color="#8A2BE2" />
                <Text style={styles.sectionTitle}>Payment Recipient</Text>
              </View>
              
              <View style={styles.recipientContainer}>
                <MaterialIcons name="store" size={24} color="#8A2BE2" style={styles.recipientIcon} />
                <View style={styles.recipientDetails}>
                  <Text style={styles.recipientName}>{receiverName || 'Not specified'}</Text>
                  <Text style={styles.recipientLabel}>Organization Name</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

           {/* Category Selection */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="category" size={20} color="#8A2BE2" />
                <Text style={styles.sectionTitle}>Payment Category *</Text>
        </View>

              <TouchableOpacity
                style={[
                  styles.dropdownSelector,
                  isModalVisible && styles.dropdownSelectorActive
                ]}
                onPress={() => setIsModalVisible(true)}
                activeOpacity={0.9}
              >
                <View style={styles.dropdownTextContainer}>
                  <MaterialIcons 
                    name="list-alt" 
                    size={20} 
                    color="#8A2BE2" 
                    style={styles.dropdownIcon}
                />
                <Text style={[
                    styles.dropdownText,
                    product_id ? styles.dropdownTextSelected : styles.dropdownTextPlaceholder
                ]}>
                    {getSelectedOptionLabel()}
                </Text>
                </View>
                <MaterialIcons 
                  name={isModalVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                  size={24} 
                  color="#8A2BE2" 
                />
              </TouchableOpacity>

              <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
              >
                <TouchableOpacity 
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setIsModalVisible(false)}
                >
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Select Payment Category</Text>
                      <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                        <MaterialIcons name="close" size={24} color="#8A2BE2" />
                      </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalScrollView}>
                      {paymentOptions.map((option) => (
                        <TouchableOpacity
                          key={option.id}
                          style={[
                            styles.modalOption,
                            product_id === option.id && styles.selectedModalOption
                          ]}
                          onPress={() => {
                            setProductId(option.id);
                            setIsModalVisible(false);
                          }}
                        >
                          <Text style={[
                            styles.modalOptionText,
                            product_id === option.id && styles.selectedModalOptionText
                          ]}>
                            {option.label}
                          </Text>
                          {product_id === option.id && (
                            <MaterialIcons name="check" size={20} color="#8A2BE2" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </TouchableOpacity>
              </Modal>
          </View>

            <View style={styles.divider} />
            
            {/* Amount Entry Section */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="payments" size={20} color="#8A2BE2" />
                <Text style={styles.sectionTitle}>Enter Amount *</Text>
        </View>

              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  placeholderTextColor="#B9B9B9"
                />
              </View>
            </View>

            <View style={styles.divider} />

            {/* Transaction Receipt Section */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="receipt-long" size={20} color="#8A2BE2" />
                <Text style={styles.sectionTitle}>Transaction Receipt</Text>
              </View>
              
              {!receipt_image ? (
                <TouchableOpacity 
                  style={styles.uploadContainer}
                  onPress={handleSelectImage}
                  activeOpacity={0.7}
                  disabled={isUploading}
                >
                  <View style={styles.uploadIconContainer}>
                    <MaterialIcons name="add-a-photo" size={32} color="#8A2BE2" />
                  </View>
                  <Text style={styles.uploadText}>Upload payment receipt image</Text>
                  <Text style={styles.uploadSubtext}>Supported formats: JPG, PNG</Text>
                  {isUploading && (
                    <Text style={styles.uploadingText}>Uploading...</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <View style={styles.receiptImageContainer}>
                  <Image 
                    source={receipt_image} 
                    style={styles.receiptImage}
                    resizeMode="cover"
                  />
                  {fileName ? (
                    <View style={styles.fileNameContainer}>
                      <MaterialIcons 
                        name="image" 
                        size={16} 
                        color="#8A2BE2" 
                      />
                      <Text style={styles.fileNameText} numberOfLines={1} ellipsizeMode="middle">
                        {fileName}
                      </Text>
                    </View>
                  ) : null}
                  
                  <View style={styles.fileActionButtons}>
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={handleRemoveImage}
                      disabled={isUploading}
                  >
                    <MaterialIcons name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.submitButtonContainer} 
              onPress={handleSubmit}
              activeOpacity={0.9}
              disabled={isUploading}
            >
              <View style={styles.submitButton}>
                {isUploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Submit Payment</Text>
                    <MaterialIcons name="check-circle" size={20} color="#fff" />
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#8A2BE2',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  header: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#8A2BE2',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    opacity: 0.9,
  },
  headerProductName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#f8f8fa',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  formSection: {
    padding: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
  },
  amountSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 8,
    marginTop: 12,
  },
  currencySymbol: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#8A2BE2',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    padding: 12,
    minWidth: 120,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  inputField: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
  },
  inputIcon: {
    marginLeft: 12,
    marginRight: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  dropdownSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
  },
  dropdownSelectorActive: {
    borderColor: '#8A2BE2',
    backgroundColor: '#f8f5ff',
  },
  dropdownTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownIcon: {
    marginRight: 10,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownTextPlaceholder: {
    color: '#999',
  },
  dropdownTextSelected: {
    color: '#333',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedModalOption: {
    backgroundColor: '#f0e6ff',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedModalOptionText: {
    color: '#8A2BE2',
    fontWeight: 'bold',
  },
  // Receipt upload styles
  uploadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    marginTop: 12,
  },
  uploadIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#777',
  },
  receiptImageContainer: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  receiptImage: {
    width: '100%', 
    height: 200,
    borderRadius: 12,
  },
  fileActionButtons: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
  },
  removeImageButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonContainer: {
    marginVertical: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#8A2BE2',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  fileNameContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileNameText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
    flex: 1,
  },
  buttonContainer: {
    marginVertical: 24,
    gap: 12,
  },
  uploadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#8A2BE2',
    fontStyle: 'italic',
  },
  recipientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  recipientIcon: {
    marginRight: 12,
  },
  recipientDetails: {
    flex: 1,
  },
  recipientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  recipientLabel: {
    fontSize: 14,
    color: '#666',
  },
  thankYouModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  thankYouModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '90%',
    maxWidth: 340,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  thankYouIcon: {
    marginBottom: 20,
  },
  thankYouTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  thankYouMessage: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 22,
  },
  thankYouSubMessage: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 25,
  },
  thankYouButton: {
    backgroundColor: '#8A2BE2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  thankYouButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentReceiveForm; 