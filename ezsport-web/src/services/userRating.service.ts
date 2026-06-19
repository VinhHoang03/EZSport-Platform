import api from '../api/api';

export interface UserRating {
  _id: string;
  reviewer: string | {
    _id: string;
    fullName: string;
    username: string;
    avatar?: string;
  };
  reviewee: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRatingStats {
  averageRating: number;
  totalRatings: number;
}

export const userRatingService = {
  createOrUpdateRating: async (payload: {
    revieweeId: string;
    rating: number;
    comment?: string;
  }): Promise<UserRating> => {
    const { data } = await api.post('/user-ratings', payload);
    return data.data;
  },

  getUserRatings: async (userId: string): Promise<UserRating[]> => {
    const { data } = await api.get(`/user-ratings/${userId}`);
    return data.data;
  },

  getUserRatingStats: async (userId: string): Promise<UserRatingStats> => {
    const { data } = await api.get(`/user-ratings/${userId}/stats`);
    return data.data;
  },
};
