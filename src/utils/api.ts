import { getAuthToken } from './tokenStorage';

// API base URL
export const API_BASE_URL = 'http://fund.swarojgar.org/api';

export interface Banner {
  id: number;
  image: string;
  url?: string;  // URL field for banner links
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  title: string;
  image: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  address?: string;
  image: string;
  description?: string;
  price?: string;
  Mobile?: string | null;
  upi?: string | null;
  Whatsapp?: string | null;
  QR?: string;
  category?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Madarsa {
  id: number;
  name: string;
  address?: string;
  image: string;
  description?: string;
  Mobile?: string | null;
  upi?: string | null;
  Whatsapp?: string | null;
  QR?: string | null;
  category?: {
    id: number;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface OlliAulia {
  id: number;
  name: string;
  address?: string;
  image: string;
  description?: string;
  Mobile?: string | null;
  upi?: string | null;
  Whatsapp?: string | null;
  QR?: string | null;
  category?: {
    id: number;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface SamajikWork {
  id: number;
  name: string;
  address?: string;
  image: string;
  description?: string;
  price?: string;
  Mobile?: string | null;
  upi?: string | null;
  Whatsapp?: string | null;
  QR?: string | null;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeCity {
  id: number;
  name: string;
  address?: string;
  image: string;
  description?: string;
  price?: string;
  Mobile?: string | null;
  upi?: string | null;
  Whatsapp?: string | null;
  QR?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RepairGadget {
  id: number;
  name: string;
  address?: string;
  image: string;
  description: string;
  Mobile: string | null;
  upi: string | null;
  Whatsapp: string | null;
  QR: string | null;
  category: {
    id: number;
    name: string;
  } | null;
}

export interface PaymentHistory {
  id: number;
  donateTo: string;
  amount: number;
  date: string;
  status: string;
  transaction_id?: string;
  payment_method?: string;
  product?: {
    id: number;
    name: string;
    image?: string;
  };
}

export interface InfoItem {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  date: string;
  hasReadMore: boolean;
}

export interface Sangathan {
  id: number;
  name: string;
  address?: string;
  image: string;
  description?: string;
  link?: string;  // URL link field from the API
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  image?: string;
  name?: string;
  created_at: string;
  updated_at: string;
  time?: string;
}

// Fetch banners from API
export const fetchBanners = async (): Promise<Banner[]> => {
  try {
    const token = await getAuthToken();
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    // Add authorization token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/banner-get`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if the banner data is in the expected format
    if (data.status === 'success' && data.data && Array.isArray(data.data.banner)) {
      console.log('Banner data from API:', JSON.stringify(data.data.banner, null, 2));
      // Map the banners, capturing url field if it exists
      return data.data.banner.map((banner: any) => ({
        id: banner.id,
        image: banner.image,
        url: banner.url || banner.link || '',  // Capture url or link field
        created_at: banner.created_at,
        updated_at: banner.updated_at
      }));
    } else {
      console.log('Unexpected banner API response format:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching banners:', error);
    return [];
  }
};

// Fetch categories from API
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const token = await getAuthToken();
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    // Add authorization token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/category-get`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Category API response:', data);
    
    // Check if the category data is in the expected format
    if (data.status === 'success' && data.data) {
      // Try different possible field names for categories
      let categoryData = null;
      
      if (Array.isArray(data.data.categories)) {
        categoryData = data.data.categories;
      } else if (Array.isArray(data.data.category)) {
        categoryData = data.data.category;
      } else if (Array.isArray(data.data)) {
        categoryData = data.data;
      }
      
      if (categoryData && categoryData.length > 0) {
        // Log the first category object to see its structure
        console.log('First category object structure:', JSON.stringify(categoryData[0], null, 2));
        
        // Map the data to match our Category interface
        return categoryData.map((item: any) => ({
          id: item.id || 0,
          title: item.title || item.name || item.category_name || '',
          image: item.image || item.icon || item.category_image || '',
          created_at: item.created_at || '',
          updated_at: item.updated_at || ''
        }));
      }
    }
    
    console.log('Unexpected category API response format:', data);
    return [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Fetch favorite items from API
export const fetchFavorites = async () => {
  try {
    const token = await getAuthToken();
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    // Add authorization token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/favorite/list`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Favorites API raw response:', data);
    
    // Try to extract favorites data from various possible response structures
    let favorites = [];
    
    if (data.status === 'success') {
      if (data.data && Array.isArray(data.data)) {
        favorites = data.data;
      } else if (data.data && data.data.favorites && Array.isArray(data.data.favorites)) {
        favorites = data.data.favorites;
      } else if (data.data && data.data.products && Array.isArray(data.data.products)) {
        favorites = data.data.products;
      } else if (data.data && typeof data.data === 'object') {
        // In case the data structure is different, try to iterate through the object
        console.log('Data structure is not as expected, attempting to extract favorites');
        Object.keys(data.data).forEach(key => {
          if (Array.isArray(data.data[key])) {
            favorites = data.data[key];
          }
        });
      }
      
      console.log('Extracted favorites array:', favorites);
      return favorites;
    } else {
      console.log('Unexpected favorites API response format:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
};

// Fetch products/masjids from API
export const fetchProducts = async (name?: string, categoryId?: number): Promise<Product[]> => {
  try {
    const token = await getAuthToken();
    let url = `${API_BASE_URL}/product-get`;
    
    // Add query parameters if provided
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (categoryId) params.append('category_id', categoryId.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    console.log('Fetching products from:', url);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Raw API Response:', JSON.stringify(data, null, 2));
    
    // Check if the data is in the expected format
    if (data.status === 'success' && data.data) {
      let products = [];
      
      if (Array.isArray(data.data.products)) {
        products = data.data.products;
      } else if (Array.isArray(data.data.product)) {
        products = data.data.product;
      } else if (Array.isArray(data.data)) {
        products = data.data;
      }
      
      console.log('Processed Products:', JSON.stringify(products, null, 2));
      
      return products.map((item: any) => ({
        id: item.id || 0,
        name: item.name || item.title || '',
        address: item.address || item.location || '',
        image: item.image || '',
        description: item.description || '',
        price: item.price || '',
        Mobile: item.Mobile || null,
        upi: item.upi || null,
        Whatsapp: item.Whatsapp || null,
        QR: item.QR || '',
        category: item.category || null,
        created_at: item.created_at || '',
        updated_at: item.updated_at || ''
      }));
    }
    
    console.log('Unexpected products API response format:', data);
    return [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error(error instanceof Error ? error.message : 'Network request failed. Please check your internet connection.');
  }
};

// Fetch a single product by ID
export const fetchProductById = async (id: string | number): Promise<Product | null> => {
  try {
    const token = await getAuthToken();
    let url = `${API_BASE_URL}/product-get`;
    
    // Add query parameter for ID
    const params = new URLSearchParams();
    params.append('id', id.toString());
    
    url += `?${params.toString()}`;

    console.log('Fetching product by ID from:', url);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Raw Product API Response:', JSON.stringify(data, null, 2));
    
    // Check if the data is in the expected format and find the specific product
    if (data.status === 'success' && data.data) {
      let products = [];
      
      if (data.data.products) {
        products = data.data.products;
      } else if (data.data.product) {
        products = [data.data.product];
      } else if (Array.isArray(data.data)) {
        products = data.data;
      }
      
      // Find the specific product with matching ID
      const product = products.find((p: any) => p.id.toString() === id.toString());
      
      if (product) {
        return {
          id: product.id || 0,
          name: product.name || product.title || '',
          address: product.address || product.location || '',
          image: product.image || '',
          description: product.description || '',
          price: product.price || '',
          Mobile: product.Mobile || null,
          upi: product.upi || null,
          Whatsapp: product.Whatsapp || null,
          QR: product.QR || '',
          category: product.category || null,
          created_at: product.created_at || '',
          updated_at: product.updated_at || ''
        };
      }
    }
    
    console.log('Product not found with ID:', id);
    return null;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }
};

// Fetch madarsa data for Madarsa Pay screen
export const fetchMadarsaList = async (searchText?: string): Promise<Madarsa[]> => {
  try {
    const token = await getAuthToken();
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    // Add authorization token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Build the URL with query parameters
    let url = `${API_BASE_URL}/product-get`;
    const params = new URLSearchParams();
    if (searchText) params.append('name', searchText);
    params.append('category_id', '4'); // Category ID 4 for Madarsa as per API
    
    url += `?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Madarsa API response:', data);
    
    // Check if the madarsa data is in the expected format
    if (data.status === 'success' && data.data) {
      let madarsaList = [];
      
      if (Array.isArray(data.data.products)) {
        madarsaList = data.data.products;
      } else if (Array.isArray(data.data.product)) {
        madarsaList = data.data.product;
      } else if (Array.isArray(data.data)) {
        madarsaList = data.data;
      }
      
      return madarsaList.map((item: any) => ({
        id: item.id || 0,
        name: item.name || item.title || '',
        address: item.address || item.location || '',
        image: item.image || '',
        description: item.description || '',
        Mobile: item.Mobile || null,
        upi: item.upi || null,
        Whatsapp: item.Whatsapp || null,
        QR: item.QR || null,
        category: item.category || null,
        created_at: item.created_at || '',
        updated_at: item.updated_at || ''
      }));
    }
    
    console.log('Unexpected madarsa API response format:', data);
    return [];
  } catch (error) {
    console.error('Error fetching madarsa list:', error);
    return [];
  }
};

// Fetch Olli Aulia data for Olli Aulia Pay screen
export const fetchOlliAuliaList = async (searchText?: string): Promise<OlliAulia[]> => {
  try {
    const token = await getAuthToken();
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    // Add authorization token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Build the URL with query parameters
    let url = `${API_BASE_URL}/product-get`;
    const params = new URLSearchParams();
    if (searchText) params.append('name', searchText);
    params.append('category_id', '5'); // Category ID 5 for Olli Aulia as per API
    
    url += `?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Olli Aulia API response:', data);
    
    // Check if the data is in the expected format
    if (data.status === 'success' && data.data) {
      let olliAuliaList = [];
      
      if (Array.isArray(data.data.products)) {
        olliAuliaList = data.data.products;
      } else if (Array.isArray(data.data.product)) {
        olliAuliaList = data.data.product;
      } else if (Array.isArray(data.data)) {
        olliAuliaList = data.data;
      }
      
      return olliAuliaList.map((item: any) => ({
        id: item.id || 0,
        name: item.name || item.title || '',
        address: item.address || item.location || '',
        image: item.image || '',
        description: item.description || '',
        Mobile: item.Mobile || null,
        upi: item.upi || null,
        Whatsapp: item.Whatsapp || null,
        QR: item.QR || null,
        category: item.category || null,
        created_at: item.created_at || '',
        updated_at: item.updated_at || ''
      }));
    }
    
    console.log('Unexpected Olli Aulia API response format:', data);
    return [];
  } catch (error) {
    console.error('Error fetching Olli Aulia list:', error);
    return [];
  }
};

// Fetch Samajik Work data for Samajik Work Pay screen
export const fetchSamajikWorkList = async (searchText?: string): Promise<SamajikWork[]> => {
  try {
    const token = await getAuthToken();
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    // Add authorization token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Build the URL with query parameters
    let url = `${API_BASE_URL}/product-get`;
    const params = new URLSearchParams();
    if (searchText) params.append('name', searchText);
    params.append('category_id', '6'); // Category ID 6 for Samajik Work as per API
    
    url += `?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Samajik Work API response:', data);
    
    // Check if the data is in the expected format
    if (data.status === 'success' && data.data) {
      let samajikWorkList = [];
      
      if (Array.isArray(data.data.products)) {
        samajikWorkList = data.data.products;
      } else if (Array.isArray(data.data.product)) {
        samajikWorkList = data.data.product;
      } else if (Array.isArray(data.data)) {
        samajikWorkList = data.data;
      }
      
      return samajikWorkList.map((item: any) => ({
        id: item.id || 0,
        name: item.name || item.title || '',
        address: item.address || item.location || '',
        image: item.image || '',
        description: item.description || '',
        price: item.price || '',
        Mobile: item.Mobile || null,
        upi: item.upi || null,
        Whatsapp: item.Whatsapp || null,
        QR: item.QR || null,
        created_at: item.created_at || '',
        updated_at: item.updated_at || ''
      }));
    }
    
    console.log('Unexpected Samajik Work API response format:', data);
    return [];
  } catch (error) {
    console.error('Error fetching Samajik Work list:', error);
    return [];
  }
};

// Fetch Knowledge City data for Knowledge City Pay screen
export const fetchKnowledgeCityList = async (searchText?: string): Promise<KnowledgeCity[]> => {
  try {
    const token = await getAuthToken();
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',

      'Content-Type': 'application/json',
    };
    
    // Add authorization token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Build the URL with query parameters
    let url = `${API_BASE_URL}/product-get`;
    const params = new URLSearchParams();
    if (searchText) params.append('name', searchText);
    params.append('category_id', '7'); // Category ID 7 for Knowledge City as per API
    
    url += `?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Knowledge City API response:', data);
    
    // Check if the data is in the expected format
    if (data.status === 'success' && data.data) {
      let knowledgeCityList = [];
      
      if (Array.isArray(data.data.products)) {
        knowledgeCityList = data.data.products;
      } else if (Array.isArray(data.data.product)) {
        knowledgeCityList = data.data.product;
      } else if (Array.isArray(data.data)) {
        knowledgeCityList = data.data;
      }
      
      return knowledgeCityList.map((item: any) => ({
        id: item.id || 0,
        name: item.name || item.title || '',
        address: item.address || item.location || '',
        image: item.image || '',
        description: item.description || '',
        price: item.price || '',
        Mobile: item.Mobile || null,
        upi: item.upi || null,
        Whatsapp: item.Whatsapp || null,
        QR: item.QR || null,
        created_at: item.created_at || '',
        updated_at: item.updated_at || ''
      }));
    }
    
    console.log('Unexpected Knowledge City API response format:', data);
    return [];
  } catch (error) {
    console.error('Error fetching Knowledge City list:', error);
    return [];
  }
};

// Fetch Repair and Gadget data for Repair and Gadget Pay screen
export const fetchRepairGadgetList = async (searchText?: string): Promise<RepairGadget[]> => {
  try {
    const token = await getAuthToken();
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    // Add authorization token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Build the URL with query parameters
    let url = `${API_BASE_URL}/product-get`;
    const params = new URLSearchParams();
    if (searchText) params.append('name', searchText);
    params.append('category_id', '8'); // Category ID 8 for Repair and Gadget as per API
    
    url += `?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Repair and Gadget API response:', data);
    
    // Check if the data is in the expected format
    if (data.status === 'success' && data.data) {
      let repairGadgetList = [];
      
      if (Array.isArray(data.data.products)) {
        repairGadgetList = data.data.products;
      } else if (Array.isArray(data.data.product)) {
        repairGadgetList = data.data.product;
      } else if (Array.isArray(data.data)) {
        repairGadgetList = data.data;
      }
      
      return repairGadgetList.map((item: any) => ({
        id: item.id || 0,
        name: item.name || item.title || '',
        address: item.address || item.location || '',
        image: item.image || '',
        description: item.description || '',
        Mobile: item.Mobile || null,
        upi: item.upi || null,
        Whatsapp: item.Whatsapp || null,
        QR: item.QR || null,
        category: item.category || null,
        created_at: item.created_at || '',
        updated_at: item.updated_at || ''
      }));
    }
    
    console.log('Unexpected Repair and Gadget API response format:', data);
    return [];
  } catch (error) {
    console.error('Error fetching Repair and Gadget list:', error);
    return [];
  }
};

// Toggle favorite status for an item
export const toggleFavorite = async (itemId: string | number): Promise<{success: boolean, message: string}> => {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      console.error('Authorization token is required for toggling favorites');
      return {
        success: false, 
        message: 'Authentication required'
      };
    }
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    // Log the request payload for debugging
    // Try different parameter naming conventions since we're getting a 422 error
    const payload = {
      product_id: itemId  // API might expect product_id instead of item_id
    };
    console.log('Toggle favorite request payload:', payload);
    
    const response = await fetch(`${API_BASE_URL}/favorite/toggle`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    console.log('Toggle favorite response:', data);
    
    if (!response.ok) {
      let errorMessage = `API Error: ${response.status}`;
      
      // Extract more detailed error message if available
      if (data && data.message) {
        errorMessage = data.message;
      } else if (data && data.error) {
        errorMessage = data.error;
      }
      
      if (response.status === 422) {
        console.error('Validation error in toggle favorite:', data);
        
        // Try alternate payload if it fails with a 422 error
        // This is a fallback mechanism that tries a different parameter name
        return await retryWithAlternatePayload(itemId, token);
      }
      
      throw new Error(errorMessage);
    }
    
    return {
      success: data.status === 'success',
      message: data.message || 'Favorite status updated'
    };
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Helper function to retry with alternate parameter name
const retryWithAlternatePayload = async (itemId: string | number, token: string): Promise<{success: boolean, message: string}> => {
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    // Try with alternate parameter name
    const alternatePayload = {
      id: itemId  // Try with just 'id'
    };
    console.log('Retrying with alternate payload:', alternatePayload);
    
    const response = await fetch(`${API_BASE_URL}/favorite/toggle`, {
      method: 'POST',
      headers,
      body: JSON.stringify(alternatePayload)
    });
    
    const data = await response.json();
    console.log('Alternate toggle favorite response:', data);
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || `API Error: ${response.status}`
      };
    }
    
    return {
      success: data.status === 'success',
      message: data.message || 'Favorite status updated with alternate parameter'
    };
  } catch (error) {
    console.error('Error in alternate toggle attempt:', error);
    return {
      success: false,
      message: 'Failed with alternate parameter too'
    };
  }
};

// Get current favorites list
export const getFavorites = async (): Promise<{[key: string]: boolean}> => {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      console.error('Authorization token is required for fetching favorites');
      return {};
    }
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    const response = await fetch(`${API_BASE_URL}/favorite/list`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Favorites list response:', data);
    
    // Process the data to create a map of item_id -> true
    const favoritesMap: {[key: string]: boolean} = {};
    
    if (data.status === 'success') {
      // Check different possible data structures based on API response
      let favorites = [];
      
      if (data.data && Array.isArray(data.data)) {
        favorites = data.data;
      } else if (data.data && data.data.favorites && Array.isArray(data.data.favorites)) {
        favorites = data.data.favorites;
      } else if (data.data && data.data.products && Array.isArray(data.data.products)) {
        favorites = data.data.products;
      }
      
      // Log the structure of the first item to help with debugging
      if (favorites.length > 0) {
        console.log('First favorite item structure:', JSON.stringify(favorites[0], null, 2));
      }
      
      // Map the items with various possible ID field names
      favorites.forEach((item: any) => {
        // Try all possible ID field names
        const id = item.id || item.product_id || item.item_id;
        if (id) {
          favoritesMap[id.toString()] = true;
        }
      });
      
      console.log('Processed favorites map:', favoritesMap);
    }
    
    return favoritesMap;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return {};
  }
};

// Fetch payment history from API
export const fetchPaymentHistory = async (): Promise<PaymentHistory[]> => {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      console.warn('No token found for payment history fetch');
      return [];
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    const response = await fetch(`${API_BASE_URL}/paymenthistory`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Payment history API response:', data);
    
    // Check if the data is in the expected format
    if (data.status === 'success' && data.data) {
      let paymentHistory = [];
      
      if (Array.isArray(data.data.payments)) {
        paymentHistory = data.data.payments;
      } else if (Array.isArray(data.data.payment)) {
        paymentHistory = data.data.payment;
      } else if (Array.isArray(data.data)) {
        paymentHistory = data.data;
      }
      
      return paymentHistory.map((item: any) => ({
        id: item.id || 0,
        donateTo: item.product?.name || item.donateTo || item.donate_to || item.recipient || '',
        amount: Number(item.amount) || 0,
        date: item.date || item.created_at || '',
        status: item.status || 'completed',
        transaction_id: item.transaction_id || item.transactionId || '',
        payment_method: item.payment_method || item.paymentMethod || '',
        product: item.product ? {
          id: item.product.id || 0,
          name: item.product.name || '',
          image: item.product.image || ''
        } : undefined
      }));
    }
    
    console.log('Unexpected payment history API response format:', data);
    return [];
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return [];
  }
};

// Fetch information data from API
export const fetchInformation = async (): Promise<InfoItem[]> => {
  try {
    const token = await getAuthToken();
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    // Add authorization token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/Information`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Information API response:', data);
    
    // Check if the data is in the expected format
    if (data.status === 'success' && data.data) {
      let informationList = [];
      
      if (Array.isArray(data.data.information)) {
        informationList = data.data.information;
      } else if (Array.isArray(data.data)) {
        informationList = data.data;
      }
      
      return informationList.map((item: any) => ({
        id: item.id?.toString() || Math.random().toString(),
        title: item.title || item.name || '',
        description: item.description || item.short_description || '',
        fullDescription: item.full_description || item.description || '',
        date: item.date || item.created_at || new Date().toISOString().split('T')[0],
        hasReadMore: true
      }));
    }
    
    console.log('Unexpected information API response format:', data);
    return [];
  } catch (error) {
    console.error('Error fetching information:', error);
    return [];
  }
};

// Fetch Sangathan data for AllSangathan screen
export const fetchSangathanList = async (searchText?: string): Promise<Sangathan[]> => {
  try {
    const token = await getAuthToken();
    
    // The API requires authentication
    if (!token) {
      console.error('No authentication token available for Sangathan API');
      return [];
    }
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    // Use the specific API endpoint
    let url = `${API_BASE_URL}/Sangathanget`;
    
    // Build the query parameters
    const params = new URLSearchParams();
    if (searchText) params.append('name', searchText);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    
    // Handle 401 Unauthorized specifically
    if (response.status === 401) {
      console.error('Authentication failed for Sangathan API (401 Unauthorized)');
      throw new Error('Authentication required. Please login again.');
    }
    
    // Check for other response errors
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process the API response
    if (data.status === 'success' && data.data && data.data.Sangathan) {
      const sangathanList = data.data.Sangathan;
      
      const mappedResults = sangathanList.map((item: any) => ({
        id: item.id || 0,
        name: item.name || '',
        address: item.address || 'N/A', // Show N/A if address is missing
        image: item.image || '',
        link: item.link || '',
        description: item.description || '',
        created_at: item.created_at || '',
        updated_at: item.updated_at || ''
      }));
      
      return mappedResults;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching Sangathan list:', error);
    return [];
  }
};

// Fetch notifications from API
export const fetchNotifications = async (): Promise<Notification[]> => {
  try {
    const token = await getAuthToken();
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    // Add authorization token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/Notificationget`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Notifications API response:', data);
    
    // Check if the data is in the expected format
    if (data.status === 'success' && data.data) {
      let notificationsList = [];
      
      if (Array.isArray(data.data.notifications)) {
        notificationsList = data.data.notifications;
      } else if (Array.isArray(data.data.notification)) {
        notificationsList = data.data.notification;
      } else if (Array.isArray(data.data)) {
        notificationsList = data.data;
      }
      
      return notificationsList.map((item: any) => ({
        id: item.id || 0,
        title: item.title || '',
        message: item.message || item.description || '',
        image: item.image || '',
        name: item.name || '',
        created_at: item.created_at || '',
        updated_at: item.updated_at || '',
        time: item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
      }));
    }
    
    console.log('Unexpected notifications API response format:', data);
    return [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}; 