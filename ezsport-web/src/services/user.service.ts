import api from '../api/api';

export interface UserProfile {
  _id: string;
  fullName: string;
  username?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role?: string;
  loyaltyPoints?: number;
  createdAt?: string;
}

export const userService = {
  getMe: async (): Promise<UserProfile> => {
    const { data } = await api.get('/users/me');
    return data.data;
  },

  updateProfile: async (payload: {
    fullName?: string;
    phone?: string;
    email?: string;
    avatarFile?: File;
  }): Promise<UserProfile> => {
    const fd = new FormData();
    if (payload.fullName) fd.append('fullName', payload.fullName);
    if (payload.phone !== undefined) fd.append('phone', payload.phone);
    if (payload.email !== undefined) fd.append('email', payload.email);
    if (payload.avatarFile) fd.append('avatar', payload.avatarFile);

    const { data } = await api.put('/users/me', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },
};
