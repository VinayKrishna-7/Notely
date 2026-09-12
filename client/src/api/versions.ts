import { apiClient } from './client';
import { ApiResponse, Note, NoteVersion } from '../types';

export const versionsApi = {
  async getVersions(noteId: string): Promise<NoteVersion[]> {
    const res = await apiClient.get<ApiResponse<NoteVersion[]>>(`/notes/${noteId}/versions`);
    return res.data.data;
  },

  async getVersion(noteId: string, versionId: string): Promise<NoteVersion> {
    const res = await apiClient.get<ApiResponse<NoteVersion>>(`/notes/${noteId}/versions/${versionId}`);
    return res.data.data;
  },

  async restoreVersion(noteId: string, versionId: string): Promise<Note> {
    const res = await apiClient.post<ApiResponse<Note>>(`/notes/${noteId}/versions/${versionId}/restore`);
    return res.data.data;
  },
};
