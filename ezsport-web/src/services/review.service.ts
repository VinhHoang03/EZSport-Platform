import api from '../api/api';

export interface Review {
  _id: string;
  venueId: string;
  userId: { _id: string; fullName: string; avatar?: string };
  bookingId?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewsResponse {
  data: Review[];
  breakdown: Record<number, number>;
  total: number;
  page: number;
  totalPages: number;
}

export const reviewService = {
  getVenueReviews: async (venueId: string, page = 1, limit = 10): Promise<ReviewsResponse> => {
    const { data } = await api.get(`/reviews/venue/${venueId}?page=${page}&limit=${limit}`);
    return data;
  },

  createReview: async (venueId: string, payload: { rating: number; comment: string; bookingId?: string }): Promise<Review> => {
    const { data } = await api.post(`/reviews/venue/${venueId}`, payload);
    return data.data;
  },

  updateReview: async (reviewId: string, payload: { rating?: number; comment?: string }): Promise<Review> => {
    const { data } = await api.put(`/reviews/${reviewId}`, payload);
    return data.data;
  },

  deleteReview: async (reviewId: string): Promise<void> => {
    await api.delete(`/reviews/${reviewId}`);
  },

  getMyReviews: async (): Promise<Review[]> => {
    const { data } = await api.get('/reviews/me');
    return data.data;
  },

  checkCanReview: async (venueId: string): Promise<{ canReview: boolean; reason?: string }> => {
    try {
      const { data } = await api.get(`/reviews/venue/${venueId}/can-review`);
      return data;
    } catch {
      return { canReview: false };
    }
  },
};
