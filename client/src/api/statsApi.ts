import { apiClient } from './client';
import { ApiResponse, DashboardStats } from '../types';

export const statsApi = {
  async getStats(): Promise<DashboardStats> {
    const res = await apiClient.get<ApiResponse<DashboardStats>>('/stats');
    return res.data.data;
  },
};
