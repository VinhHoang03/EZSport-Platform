import api from '../api/api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: string;
}

export interface AuthUser {
  _id: string;
  id?: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: string;
  status?: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', payload);
    return data.data; // backend wraps in { message, data: { user, accessToken } }
  },

  register: async (payload: RegisterPayload) => {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },

  forgotPassword: async (email: string) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  resetPassword: async (token: string, password: string) => {
    const { data } = await api.post(`/auth/reset-password/${token}`, { password });
    return data;
  },

  googleLogin: async (credential: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/google-login', { credential });
    return data.data;
  },
};
