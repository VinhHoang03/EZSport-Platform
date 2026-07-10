import api from '../api/api';

export interface Product {
  _id: string;
  venueId: string;
  owner: string;
  name: string;
  category?: string;
  description?: string;
  price: number;
  priceWithCourt?: number;
  stock: number;
  image?: string;
  isActive: boolean;
  type: 'sell' | 'rent';
  chargeType?: 'per_booking' | 'per_hour';
  createdAt?: string;
  updatedAt?: string;
}

export const productService = {
  /**
   * Get active products for a venue (for players checkout)
   */
  getProductsByVenue: async (venueId: string): Promise<Product[]> => {
    const { data } = await api.get(`/products/venue/${venueId}`);
    return data.data;
  },

  /**
   * Get all products (active and inactive) for a venue (for shop dashboard)
   */
  getProductsByVenueAll: async (venueId: string): Promise<Product[]> => {
    const { data } = await api.get(`/products/venue/${venueId}/all`);
    return data.data;
  },

  /**
   * Create a new product for a venue
   */
  createProduct: async (venueId: string, payload: Partial<Product>): Promise<Product> => {
    const { data } = await api.post(`/products/venue/${venueId}`, payload);
    return data.data;
  },

  /**
   * Update product details
   */
  updateProduct: async (productId: string, payload: Partial<Product>): Promise<Product> => {
    const { data } = await api.put(`/products/${productId}`, payload);
    return data.data;
  },

  /**
   * Delete / Deactivate a product
   */
  deleteProduct: async (productId: string): Promise<void> => {
    await api.delete(`/products/${productId}`);
  },
};
