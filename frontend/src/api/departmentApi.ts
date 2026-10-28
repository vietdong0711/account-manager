import axiosClient from './axiosClient';
import { ApiResponse, Department } from '../types';

export const departmentApi = {
  getDepartments: (): Promise<ApiResponse<Department[]>> => {
    return axiosClient.get('/departments');
  },
  getDepartmentById: (id: number): Promise<ApiResponse<Department>> => {
    return axiosClient.get(`/departments/${id}`);
  },
  createDepartment: (data: { name: string }): Promise<ApiResponse<Department>> => {
    return axiosClient.post('/departments', data);
  },
  updateDepartment: (id: number, data: { name: string }): Promise<ApiResponse<Department>> => {
    return axiosClient.put(`/departments/${id}`, data);
  },
  deleteDepartment: (id: number): Promise<ApiResponse<void>> => {
    return axiosClient.delete(`/departments/${id}`);
  },
};
