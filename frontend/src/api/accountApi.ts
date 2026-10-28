import axiosClient from './axiosClient';
import { ApiResponse, Account, PageResponse, DashboardStats } from '../types';

export interface AccountSearchParams {
  page?: number;
  size?: number;
  keyword?: string;
  departmentId?: number;
  positionId?: number;
  role?: string;
}

export const accountApi = {
  getAccounts: (params: AccountSearchParams): Promise<ApiResponse<PageResponse<Account>>> => {
    return axiosClient.get('/accounts', { params });
  },
  getAccountById: (id: number): Promise<ApiResponse<Account>> => {
    return axiosClient.get(`/accounts/${id}`);
  },
  createAccount: (data: Partial<Account> & { password?: string }): Promise<ApiResponse<Account>> => {
    return axiosClient.post('/accounts', data);
  },
  updateAccount: (id: number, data: Partial<Account> & { password?: string }): Promise<ApiResponse<Account>> => {
    return axiosClient.put(`/accounts/${id}`, data);
  },
  deleteAccount: (id: number): Promise<ApiResponse<void>> => {
    return axiosClient.delete(`/accounts/${id}`);
  },
  getStats: (): Promise<ApiResponse<DashboardStats>> => {
    return axiosClient.get('/accounts/stats');
  },
};
