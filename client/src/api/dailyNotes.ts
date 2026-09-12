import { apiClient } from './client';
import { ApiResponse, Note } from '../types';

export interface DailyDateRecord {
  date: string;
  title: string;
  noteId: string;
}

export const dailyNotesApi = {
  async getDailyNote(dateStr?: string): Promise<Note> {
    const url = dateStr ? `/notes/daily/${dateStr}` : '/notes/daily';
    const res = await apiClient.get<ApiResponse<Note>>(url);
    return res.data.data;
  },

  async getDailyDates(): Promise<DailyDateRecord[]> {
    const res = await apiClient.get<ApiResponse<DailyDateRecord[]>>('/notes/daily-dates');
    return res.data.data;
  },
};
