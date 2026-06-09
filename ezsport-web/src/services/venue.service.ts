import api from '../api/api';

export interface Amenity {
  key: string;
  label: string;
  icon: string;
  available: boolean;
}

export interface Venue {
  _id: string;
  name: string;
  description?: string;

  // Owner
  owner?: string | {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };

  // Media
  image: string;
  images?: string[];

  // Location
  location: string;
  lat: number;
  lng: number;

  // Sport
  sportTypes: string[];   // ['badminton', 'pickleball']
  emoji: string;

  // Pricing
  price: string;          // display string
  pricePerHour?: number;  // numeric (kept for compatibility; venue pricing is display-only)

  // Hours
  openTime: string;       // '06:00'
  closeTime: string;      // '22:00'

  // Amenities
  amenities: Amenity[];

  // Contact
  phone?: string;
  email?: string;

  // Stats
  rating: number;
  reviewsCount: number;

  // Status
  isActive: boolean;
  isVerified: boolean;

  createdAt?: string;
  updatedAt?: string;
}

export interface Court {
  _id: string;
  venue: string;
  name: string;
  description?: string;
  
  // Media
  images?: string[];
  
  // Sport
  sportTypes: string[];
  emoji: string;
  courtType?: 'indoor' | 'outdoor';
  
  // Pricing
  pricePerHour: number;
  pricingRules?: Array<{
    label?: string;
    startTime: string;
    endTime: string;
    price: number;
    isActive: boolean;
  }>;
  
  // Status
  status: 'available' | 'maintenance' | 'inactive';
  isActive: boolean;
  
  createdAt?: string;
  updatedAt?: string;
}

export const venueService = {
  getVenues: async (params?: { sport?: string; search?: string; active?: string }): Promise<Venue[]> => {
    const query = new URLSearchParams();
    if (params?.sport) query.append('sport', params.sport);
    if (params?.search) query.append('search', params.search);
    if (params?.active) query.append('active', params.active);
    const { data } = await api.get(`/venues?${query.toString()}`);
    return data.data;
  },

  getMyVenues: async (params?: { sport?: string; search?: string; active?: string }): Promise<Venue[]> => {
    const query = new URLSearchParams();
    if (params?.sport) query.append('sport', params.sport);
    if (params?.search) query.append('search', params.search);
    if (params?.active) query.append('active', params.active);
    const { data } = await api.get(`/venues/owner/me?${query.toString()}`);
    return data.data;
  },

  getVenueById: async (id: string): Promise<Venue> => {
    const { data } = await api.get(`/venues/${id}`);
    return data.data;
  },

  createVenue: async (payload: FormData): Promise<Venue> => {
    const { data } = await api.post('/venues', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  updateVenue: async (id: string, payload: FormData | Partial<Venue>): Promise<Venue> => {
    const isFormData = payload instanceof FormData;
    const { data } = await api.put(`/venues/${id}`, payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return data.data;
  },

  deleteVenue: async (id: string): Promise<void> => {
    await api.delete(`/venues/${id}`);
  },
};

export const courtService = {
  getCourts: async (params?: { venue?: string; sport?: string; active?: string }) => {
    const query = new URLSearchParams();
    if (params?.venue) query.append('venue', params.venue);
    if (params?.sport) query.append('sport', params.sport);
    if (params?.active) query.append('active', params.active);
    const queryString = query.toString();
    const { data } = await api.get(`/courts${queryString ? `?${queryString}` : ''}`);
    return data.data as Court[];
  },

  getCourtById: async (id: string): Promise<Court> => {
    const { data } = await api.get(`/courts/${id}`);
    return data.data;
  },

  createCourt: async (payloads: (FormData | any)[]): Promise<Court[]> => {
    // Handle array of payloads - create all courts
    if (!Array.isArray(payloads) || payloads.length === 0) {
      throw new Error('No payloads provided');
    }

    const results: Court[] = [];

    // Create each court
    for (const payload of payloads) {
      try {
        if (payload instanceof FormData) {
          const { data } = await api.post('/courts', payload, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          results.push(data.data);
        } else {
          // Send as JSON
          const { data } = await api.post('/courts', payload, {
            headers: { 'Content-Type': 'application/json' },
          });
          results.push(data.data);
        }
      } catch (error) {
        console.error('Error creating court:', error);
        throw error;
      }
    }

    return results;
  },

  updateCourt: async (id: string, payload: FormData | Partial<Court>): Promise<Court> => {
    const isFormData = payload instanceof FormData;
    const { data } = await api.put(`/courts/${id}`, payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return data.data;
  },

  deleteCourt: async (id: string): Promise<void> => {
    await api.delete(`/courts/${id}`);
  },
};
