import api from '../api/api';

export interface CourtSuggestionRequest {
  prompt: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  limit?: number;
}

export interface Court {
  _id: string;
  name: string;
  description?: string;
  image: string;
  rating: number;
  location: string;
  price: string;
  lat: number;
  lng: number;
  emoji: string;
  sportType: string;
  distance?: number;
  isActive: boolean;
}

export interface MatchedCriteria {
  sportType?: string;
  priceRange?: string;
  location?: string;
  features?: string[];
}

export interface CourtSuggestionResponse {
  suggestions: Court[];
  aiExplanation: string;
  matchedCriteria: MatchedCriteria;
}

export const aiService = {
  /**
   * Gợi ý sân dựa trên prompt tự nhiên
   */
  async suggestCourts(data: CourtSuggestionRequest): Promise<CourtSuggestionResponse> {
    try {
      const response = await api.post('/courts/ai/suggest', data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error suggesting courts:', error);
      throw new Error(error.response?.data?.message || 'Không thể gợi ý sân');
    }
  },

  /**
   * Tạo mô tả cho sân bằng AI
   */
  async generateDescription(courtId: string): Promise<string> {
    try {
      const response = await api.post(`/courts/${courtId}/ai/description`);
      return response.data.data.description;
    } catch (error: any) {
      console.error('Error generating description:', error);
      throw new Error(error.response?.data?.message || 'Không thể tạo mô tả');
    }
  },

  /**
   * So sánh nhiều sân bằng AI
   */
  async compareCourts(courtIds: string[]): Promise<string> {
    try {
      const response = await api.post('/courts/ai/compare', { courtIds });
      return response.data.data.comparison;
    } catch (error: any) {
      console.error('Error comparing courts:', error);
      throw new Error(error.response?.data?.message || 'Không thể so sánh sân');
    }
  },
};
