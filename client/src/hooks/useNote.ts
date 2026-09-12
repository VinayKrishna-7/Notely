import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '../api/notesApi';
import { Note } from '../types';
import { NOTES_QUERY_KEY } from './useNotes';
import { toast } from 'sonner';

export function useNote(id?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['note', id],
    queryFn: () => (id ? notesApi.getNote(id) : Promise.reject('No ID')),
    enabled: Boolean(id && id !== 'new'),
    staleTime: 1000 * 60 * 2,
    initialData: () => {
      if (!id || id === 'new') return undefined;
      const allQueries = queryClient.getQueriesData<{ notes: Note[] }>({ queryKey: NOTES_QUERY_KEY });
      for (const [, data] of allQueries) {
        const found = data?.notes?.find((n) => n._id === id);
        if (found) return found;
      }
      return undefined;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Note>) => notesApi.createNote(data),
    onSuccess: (newNote) => {
      toast.success('Note created');
      queryClient.setQueryData(['note', newNote._id], newNote);
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      return newNote;
    },
    onError: () => {
      toast.error('Failed to create note');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Note>) => {
      if (!id) throw new Error('No note ID');
      return notesApi.updateNote(id, data);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['note', id], updated);
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  return {
    note: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createNote: createMutation.mutateAsync,
    updateNote: updateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
