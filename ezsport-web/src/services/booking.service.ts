import api from '../api/api';

export interface CreateBookingPayload {
  courtId: string;
  venueId?: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  duration: number;
  sport: string;
  basePrice: number;
  serviceFee?: number;
  discount?: number;
  pointsUsed?: number;
  voucherCode?: string;
  totalPrice: number;
  paymentMethod?: 'payos' | 'cash';
  bookerName: string;
  bookerPhone: string;
  bookerEmail?: string;
  notes?: string;
  comboType?: 'week' | 'month';
}

export interface Booking extends CreateBookingPayload {
  _id: string;
  userId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';
  comboId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingResponse {
  message: string;
  data: Booking | Booking[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const bookingService = {
  /**
   * Create a new booking
   */
  createBooking: async (payload: CreateBookingPayload): Promise<any> => {
    const { data } = await api.post('/bookings', payload);
    const booking = data.data;
    if (data.payUrl) {
      booking.payUrl = data.payUrl;
    }
    return booking;
  },

  /**
   * Get all bookings for current user
   */
  getUserBookings: async (
    filters?: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    }
  ): Promise<{ bookings: Booking[]; pagination: any }> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
    if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const { data } = await api.get(`/bookings?${params.toString()}`);
    return {
      bookings: data.data,
      pagination: data.pagination,
    };
  },

  /**
   * Get booking by ID
   */
  getBookingById: async (bookingId: string, queryParams?: string): Promise<Booking> => {
    const url = `/bookings/${bookingId}${queryParams || ''}`;
    const { data } = await api.get(url);
    return data.data;
  },

  /**
   * Update booking
   */
  updateBooking: async (bookingId: string, updateData: Partial<CreateBookingPayload>): Promise<Booking> => {
    const { data } = await api.patch(`/bookings/${bookingId}`, updateData);
    return data.data;
  },

  /**
   * Cancel booking
   */
  cancelBooking: async (bookingId: string): Promise<Booking> => {
    const { data } = await api.delete(`/bookings/${bookingId}`);
    return data.data;
  },

  /**
   * Hard delete/remove a booking from user history
   */
  deleteBookingHistory: async (bookingId: string): Promise<any> => {
    const { data } = await api.delete(`/bookings/${bookingId}/remove`);
    return data;
  },

  /**
   * Hard delete/remove all deletable bookings from user history
   */
  deleteAllBookingHistory: async (): Promise<any> => {
    const { data } = await api.delete('/bookings/remove-all');
    return data;
  },

  /**
   * Get available time slots for a court
   */
  getAvailableSlots: async (
    courtId: string,
    date: string | Date,
    duration?: number
  ): Promise<Array<{ time: string; available: boolean; price?: number }>> => {
    const params = new URLSearchParams();
    const dateStr = date instanceof Date ? date.toISOString() : new Date(date).toISOString();
    params.append('date', dateStr);
    if (duration) params.append('duration', duration.toString());

    const { data } = await api.get(`/bookings/slots/${courtId}?${params.toString()}`);
    return data.data;
  },

  /**
   * Get venue bookings (admin/owner)
   */
  getVenueBookings: async (
    venueId: string,
    filters?: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    }
  ): Promise<{ bookings: Booking[]; pagination: any }> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
    if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const { data } = await api.get(`/bookings/venue/${venueId}/bookings?${params.toString()}`);
    return {
      bookings: data.data,
      pagination: data.pagination,
    };
  },

  /**
   * Confirm booking (admin/owner)
   */
  confirmBooking: async (bookingId: string): Promise<Booking> => {
    const { data } = await api.patch(`/bookings/${bookingId}/confirm`);
    return data.data;
  },

  /**
   * Cancel booking by owner (admin/owner)
   */
  cancelBookingByOwner: async (bookingId: string): Promise<Booking> => {
    const { data } = await api.patch(`/bookings/${bookingId}/cancel-owner`);
    return data.data;
  },

  checkInBooking: async (bookingId: string, userLat?: number, userLng?: number): Promise<Booking> => {
    const { data } = await api.patch(`/bookings/${bookingId}/checkin`, { userLat, userLng });
    return data.data;
  },

  /**
   * Complete booking (staff)
   */
  completeBooking: async (bookingId: string): Promise<Booking> => {
    const { data } = await api.patch(`/bookings/${bookingId}/complete`);
    return data.data;
  },
};
