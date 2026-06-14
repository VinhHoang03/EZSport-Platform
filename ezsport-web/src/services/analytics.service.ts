import api from '../api/api';

export interface OwnerStats {
  totalBookings: number;
  bookingsChange: number;
  totalRevenue: number;
  revenueChange: number;
  totalVenues: number;
  totalCourts: number;
  activeCourts: number;
  pendingBookings: number;
}

export interface RevenueChartData {
  date: string;
  label: string;
  revenue: number;
  bookings: number;
}

export interface TopCourt {
  courtId: string;
  courtName: string;
  revenue: number;
  bookings: number;
}

export const analyticsService = {
  /**
   * Lấy thống kê tổng quan cho owner
   */
  async getOwnerStats(): Promise<OwnerStats> {
    try {
      const response = await api.get('/analytics/owner/stats');
      return response.data.data;
    } catch (error: any) {
      console.error('Error getting owner stats:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy thống kê');
    }
  },

  /**
   * Lấy dữ liệu biểu đồ doanh thu
   */
  async getRevenueChart(days: number = 7): Promise<RevenueChartData[]> {
    try {
      const response = await api.get(`/analytics/owner/revenue-chart?days=${days}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error getting revenue chart:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy dữ liệu biểu đồ');
    }
  },

  /**
   * Lấy top courts theo doanh thu
   */
  async getTopCourts(limit: number = 5): Promise<TopCourt[]> {
    try {
      const response = await api.get(`/analytics/owner/top-courts?limit=${limit}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error getting top courts:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy top sân');
    }
  },
};
