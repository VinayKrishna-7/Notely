import { apiClient } from './client';
import { ApiResponse, Note, NoteSortOption } from '../types';

export interface GetNotesParams {
  search?: string;
  tag?: string;
  color?: string;
  isFavorite?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  isDeleted?: boolean;
  sort?: NoteSortOption;
  page?: number;
  limit?: number;
}

export const notesApi = {
  async getNotes(params?: GetNotesParams): Promise<{ notes: Note[]; total: number }> {
    const res = await apiClient.get<ApiResponse<Note[]>>('/notes', { params });
    return {
      notes: res.data.data,
      total: res.data.pagination?.total ?? res.data.data.length,
    };
  },

  async getNote(id: string): Promise<Note> {
    const res = await apiClient.get<ApiResponse<Note>>(`/notes/${id}`);
    return res.data.data;
  },

  async createNote(data: Partial<Note>): Promise<Note> {
    const res = await apiClient.post<ApiResponse<Note>>('/notes', data);
    return res.data.data;
  },

  async updateNote(id: string, data: Partial<Note>): Promise<Note> {
    const res = await apiClient.put<ApiResponse<Note>>(`/notes/${id}`, data);
    return res.data.data;
  },

  async deleteNote(id: string): Promise<Note> {
    // Soft delete / Move to trash
    const res = await apiClient.delete<ApiResponse<Note>>(`/notes/${id}`);
    return res.data.data;
  },

  async toggleFavorite(id: string): Promise<Note> {
    const res = await apiClient.patch<ApiResponse<Note>>(`/notes/${id}/favorite`);
    return res.data.data;
  },

  async togglePin(id: string): Promise<Note> {
    const res = await apiClient.patch<ApiResponse<Note>>(`/notes/${id}/pin`);
    return res.data.data;
  },

  async toggleArchive(id: string): Promise<Note> {
    const res = await apiClient.patch<ApiResponse<Note>>(`/notes/${id}/archive`);
    return res.data.data;
  },

  async restoreNote(id: string): Promise<Note> {
    const res = await apiClient.patch<ApiResponse<Note>>(`/notes/${id}/restore`);
    return res.data.data;
  },

  async permanentDelete(id: string): Promise<void> {
    await apiClient.delete(`/notes/${id}/permanent`);
  },

  async duplicateNote(id: string): Promise<Note> {
    const res = await apiClient.post<ApiResponse<Note>>(`/notes/${id}/duplicate`);
    return res.data.data;
  },

  async reorderNotes(orderedIds: string[]): Promise<void> {
    await apiClient.patch('/notes/reorder', { orderedIds });
  },
};
