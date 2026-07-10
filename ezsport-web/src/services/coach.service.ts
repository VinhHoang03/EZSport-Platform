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
}

export const coachService = {
  list: async (params?: Record<string, string>) => (await api.get('/coaches', { params })).data.data as CoachProfile[],
  get: async (id: string) => (await api.get(`/coaches/${id}`)).data.data as CoachProfile,
  slots: async (id: string, date: string) => (await api.get(`/coaches/${id}/slots`, { params: { date } })).data.data,
  createBooking: async (id: string, payload: { startAt: string; durationMinutes: number; teachingMode: 'online' | 'offline'; sport: string; location?: string; notes?: string }) => (await api.post(`/coaches/${id}/bookings`, payload)).data,
  playerBookings: async () => (await api.get('/coaches/player/bookings')).data.data,
  cancel: async (id: string, reason?: string) => (await api.delete(`/coaches/player/bookings/${id}`, { data: { reason } })).data.data,
  getMyProfile: async () => (await api.get('/coaches/me/profile')).data.data,
  saveMyProfile: async (payload: Record<string, unknown>) => (await api.put('/coaches/me/profile', payload)).data.data,
  saveAvailability: async (payload: Record<string, unknown>) => (await api.put('/coaches/me/availability', payload)).data.data,
  getMyBookings: async () => (await api.get('/coaches/me/bookings')).data.data,
  transitionBooking: async (id: string, action: 'confirm' | 'reject' | 'complete', reason?: string) => (await api.patch(`/coaches/bookings/${id}/transition`, { action, reason })).data.data,
};
