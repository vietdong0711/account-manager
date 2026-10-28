import axiosClient from './axiosClient';
import { ApiResponse, AuthResponse, Account } from '../types';

export const authApi = {
  login: (data: { username: string; password: string }): Promise<ApiResponse<AuthResponse>> => {
    return axiosClient.post('/auth/login', data);
  },
  getMe: (): Promise<ApiResponse<Account>> => {
    return axiosClient.get('/auth/me');
  },
  changePassword: (data: { oldPassword: string; newPassword: string }): Promise<ApiResponse<void>> => {
    return axiosClient.put('/auth/change-password', data);
  },
  forgotPassword: (data: { email: string }): Promise<ApiResponse<void>> => {
    return axiosClient.post('/auth/forgot-password', data);
  },
  resetPassword: (data: { token: string; newPassword: string }): Promise<ApiResponse<void>> => {
    return axiosClient.post('/auth/reset-password', data);
  },
};
