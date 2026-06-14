import api from '../api/api';

export interface Voucher {
  _id: string;
  code: string;
  type: 'fixed' | 'percent';
  value: number;
  maxDiscount?: number;
  minOrderValue: number;
  pointCost: number;
  quantity: number;
  usedCount: number;
  redeemedCount: number;
  target: string;
  expiresAt?: string;
  active: boolean;
}

export interface UserVoucher {
  _id: string;
  code: string;
  status: 'available' | 'used';
  voucherId: Voucher;
}

export const voucherService = {
  listAdmin: async (): Promise<Voucher[]> => {
    const { data } = await api.get('/vouchers/admin');
    return data.data;
  },

  create: async (payload: Partial<Voucher> & { code: string; type: 'fixed' | 'percent'; value: number; quantity: number }): Promise<Voucher> => {
    const { data } = await api.post('/vouchers/admin', payload);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/vouchers/admin/${id}`);
  },

  update: async (id: string, payload: Partial<Voucher>): Promise<Voucher> => {
    const { data } = await api.put(`/vouchers/admin/${id}`, payload);
    return data.data;
  },

  listAvailable: async (): Promise<Voucher[]> => {
    const { data } = await api.get('/vouchers');
    return data.data;
  },

  listMine: async (): Promise<UserVoucher[]> => {
    const { data } = await api.get('/vouchers/me');
    return data.data;
  },

  redeem: async (voucherId: string): Promise<{ totalPoints: number }> => {
    const { data } = await api.post('/vouchers/redeem', { voucherId });
    return { totalPoints: data.totalPoints };
  },

  validate: async (code: string, orderValue: number): Promise<{ voucher: Voucher; discount: number }> => {
    const { data } = await api.post('/vouchers/validate', { code, orderValue });
    return data.data;
  },
};
