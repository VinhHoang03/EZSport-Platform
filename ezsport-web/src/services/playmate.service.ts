import api from '../api/api';

export interface UserSummary {
  _id: string;
  fullName: string;
  username: string;
  email?: string;
  avatar?: string;
  phone?: string;
  role: string;
}

export interface Playmate {
  _id: string;
  creator: UserSummary;
  sport: 'Pickleball' | 'Cầu lông' | 'Bóng đá' | 'Tennis';
  creatorLevel: 'Mới chơi' | 'Trung bình' | 'Khá / Pro';
  title: string;
  description?: string;
  venueName: string;
  timeSlot: string;
  dateStr: string;
  slotsTotal: number;
  participants: UserSummary[];
  status: 'open' | 'full' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlaymatePayload {
  sport: 'Pickleball' | 'Cầu lông' | 'Bóng đá' | 'Tennis';
  creatorLevel: 'Mới chơi' | 'Trung bình' | 'Khá / Pro';
  title: string;
  description?: string;
  venueName: string;
  timeSlot: string;
  dateStr: string;
  slotsTotal: number;
}

export const playmateService = {
  /**
   * Get all playmate matchmaking requests with optional filters
   */
  getPlaymates: async (params?: {
    sport?: string;
    level?: string;
    search?: string;
  }): Promise<Playmate[]> => {
    const { data } = await api.get('/playmates', { params });
    return data.data;
  },

  /**
   * Create a new playmate matchmaking request
   */
  createPlaymate: async (payload: CreatePlaymatePayload): Promise<Playmate> => {
    const { data } = await api.post('/playmates', payload);
    return data.data;
  },

  /**
   * Join an existing playmate matchmaking session
   */
  joinPlaymate: async (id: string): Promise<Playmate> => {
    const { data } = await api.post(`/playmates/${id}/join`);
    return data.data;
  },

  /**
   * Leave a playmate matchmaking session
   */
  leavePlaymate: async (id: string): Promise<Playmate> => {
    const { data } = await api.post(`/playmates/${id}/leave`);
    return data.data;
  },

  /**
   * Delete a playmate matchmaking session
   */
  deletePlaymate: async (id: string): Promise<void> => {
    await api.delete(`/playmates/${id}`);
  },
};
