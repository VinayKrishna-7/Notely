import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { versionsApi } from '../api/versions';
import { NoteVersion, Note } from '../types';
import { toast } from 'sonner';

export function useNoteVersions(noteId?: string) {
  const queryClient = useQueryClient();

  const {
    data: versions = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<NoteVersion[]>({
    queryKey: ['note-versions', noteId],
    queryFn: () => (noteId ? versionsApi.getVersions(noteId) : Promise.resolve([])),
    enabled: Boolean(noteId),
    staleTime: 1000 * 30, // 30s
  });

  const restoreMutation = useMutation<Note, Error, string>({
    mutationFn: (versionId: string) => {
      if (!noteId) throw new Error('Note ID is required to restore version');
      return versionsApi.restoreVersion(noteId, versionId);
    },
    onSuccess: (updatedNote) => {
      toast.success('Version restored successfully');
      // Update cache
      queryClient.setQueryData(['note', noteId], updatedNote);
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note-versions', noteId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to restore version');
    },
  });

  return {
    versions,
    isLoading,
    isError,
    error,
    refetch,
    restoreVersion: restoreMutation.mutateAsync,
    isRestoring: restoreMutation.isPending,
  };
}
