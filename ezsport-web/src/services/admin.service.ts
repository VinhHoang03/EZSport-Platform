import api from '../api/api';

export interface UserAdminInfo {
  _id: string;
  fullName: string;
  username: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'owner' | 'player';
  status: 'active' | 'inactive' | 'banned';
  createdAt: string;
  lastLogin?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankQrCode?: string;
}

export interface AdminStatsData {
  totalRevenue: number;
  totalCommissions: number;
  totalBookings: number;
  cancellationRate: number;
  pendingOwners: number;
  pendingBookings: number;
  topAreas: { name: string; count: number }[];
  totalDiscount?: number;
  discountGrowth?: number;
}

export interface AdminRevenueChartData {
  month: string;
  revenue: number;
  bookings: number;
}

export interface AdminRecentActivity {
  id: string;
  user: string;
  action: string;
  time: string;
  status: string;
}

export interface AdminSportMixData {
  sport: string;
  count: number;
  percent: number;
}

export const adminService = {
  getUsers: async (params?: { role?: string; status?: string }): Promise<UserAdminInfo[]> => {
    const { data } = await api.get('/admin/users', { params });
    return data.data;
  },

  updateUserStatus: async (userId: string, status: string): Promise<UserAdminInfo> => {
    const { data } = await api.patch(`/admin/users/${userId}/status`, { status });
    return data.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/admin/users/${userId}`);
  },

  getStats: async (): Promise<AdminStatsData> => {
    const { data } = await api.get('/analytics/admin/stats');
    return data.data;
  },

  getRevenueChart: async (): Promise<AdminRevenueChartData[]> => {
    const { data } = await api.get('/analytics/admin/revenue-chart');
    return data.data;
  },

  getRecentActivities: async (): Promise<AdminRecentActivity[]> => {
    const { data } = await api.get('/analytics/admin/recent-activities');
    return data.data;
  },

  getSportMix: async (): Promise<AdminSportMixData[]> => {
    const { data } = await api.get('/analytics/admin/sport-mix');
    return data.data;
  },
  
  getTransactions: async (): Promise<any[]> => {
    const { data } = await api.get('/analytics/admin/transactions');
    return data.data.bookings;
  },
};
