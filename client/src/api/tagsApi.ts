import { apiClient } from './client';
import { ApiResponse, Tag } from '../types';

export const tagsApi = {
  async getTags(): Promise<Tag[]> {
    const res = await apiClient.get<ApiResponse<Tag[]>>('/tags');
    return res.data.data;
  },

  async createTag(name: string): Promise<Tag> {
    const res = await apiClient.post<ApiResponse<Tag>>('/tags', { name });
    return res.data.data;
  },

  async updateTag(id: string, name: string): Promise<Tag> {
    const res = await apiClient.put<ApiResponse<Tag>>(`/tags/${id}`, { name });
    return res.data.data;
  },

  async deleteTag(id: string): Promise<void> {
    await apiClient.delete(`/tags/${id}`);
  },
};
