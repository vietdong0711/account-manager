import axiosClient from './axiosClient';
import { ApiResponse, Position } from '../types';

export const positionApi = {
  getPositions: (): Promise<ApiResponse<Position[]>> => {
    return axiosClient.get('/positions');
  },
  getPositionById: (id: number): Promise<ApiResponse<Position>> => {
    return axiosClient.get(`/positions/${id}`);
  },
  createPosition: (data: { name: string }): Promise<ApiResponse<Position>> => {
    return axiosClient.post('/positions', data);
  },
  updatePosition: (id: number, data: { name: string }): Promise<ApiResponse<Position>> => {
    return axiosClient.put(`/positions/${id}`, data);
  },
  deletePosition: (id: number): Promise<ApiResponse<void>> => {
    return axiosClient.delete(`/positions/${id}`);
  },
};
