import api from '../api/api';

export interface CoachProfile {
  _id: string;
  userId: { _id: string; fullName: string; avatar?: string };
  sports: string[];
  specialties: string[];
  teachingModes: ('online' | 'offline')[];
  area?: string;
  bio?: string;
  pricePerHour: number;
  sessionDurations: number[];
  weeklyAvailability?: { dayOfWeek: number; startTime: string; endTime: string }[];
  dateExceptions?: { date: string; isAvailable: boolean; startTime?: string; endTime?: string }[];
  availableStartTime?: string;
}

export interface CoachBooking {
  _id: string;
  coachId?: { _id: string; fullName: string; avatar?: string };
  coachProfileId?: CoachProfile;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  teachingMode: 'online' | 'offline';
  location?: string;
  notes?: string;
  sport: string;
  hourlyRate: number;
  totalPrice: number;
  status: 'PENDING_PAYMENT' | 'PENDING_COACH_CONFIRMATION' | 'CONFIRMED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED_BY_PLAYER' | 'CANCELLED_BY_COACH' | 'EXPIRED' | 'NO_SHOW';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED';
  rejectionReason?: string;
  refund?: {
    _id: string;
    amount: number;
    reason: string;
    status: 'PENDING' | 'PROCESSING' | 'REFUNDED' | 'FAILED';
    adminNote?: string;
    transactionReference?: string;
    processedAt?: string;
  } | null;
}

export const coachService = {
  list: async (params?: Record<string, string>) => (await api.get('/coaches', { params })).data.data as CoachProfile[],
  get: async (id: string) => (await api.get(`/coaches/${id}`)).data.data as CoachProfile,
  slots: async (id: string, date: string) => (await api.get(`/coaches/${id}/slots`, { params: { date } })).data.data,
  createBooking: async (id: string, payload: { startAt: string; durationMinutes: number; teachingMode: 'online' | 'offline'; sport: string; location?: string; notes?: string }) => (await api.post(`/coaches/${id}/bookings`, payload)).data,
  playerBookings: async () => (await api.get('/coaches/player/bookings')).data.data,
  playerBooking: async (id: string) => (await api.get(`/coaches/player/bookings/${id}`)).data.data as CoachBooking,
  syncPayment: async (id: string) => (await api.patch(`/coaches/player/bookings/${id}/sync-payment`)).data.data as CoachBooking,
  cancel: async (id: string, reason?: string) => (await api.delete(`/coaches/player/bookings/${id}`, { data: { reason } })).data.data,
  getMyProfile: async () => (await api.get('/coaches/me/profile')).data.data,
  saveMyProfile: async (payload: Record<string, unknown>) => (await api.put('/coaches/me/profile', payload)).data.data,
  saveAvailability: async (payload: Record<string, unknown>) => (await api.put('/coaches/me/availability', payload)).data.data,
  getMyBookings: async () => (await api.get('/coaches/me/bookings')).data.data,
  transitionBooking: async (id: string, action: 'confirm' | 'reject' | 'complete', reason?: string) => (await api.patch(`/coaches/bookings/${id}/transition`, { action, reason })).data.data,
};
