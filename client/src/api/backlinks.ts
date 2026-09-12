import { apiClient } from './client';
import { ApiResponse, Backlink } from '../types';

export const backlinksApi = {
  async getBacklinks(noteId: string): Promise<Backlink[]> {
    const res = await apiClient.get<ApiResponse<Backlink[]>>(`/notes/${noteId}/backlinks`);
    return res.data.data;
  },
};
