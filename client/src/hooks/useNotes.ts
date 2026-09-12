import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi, GetNotesParams } from '../api/notesApi';
import { Note } from '../types';
import { toast } from 'sonner';

export const NOTES_QUERY_KEY = ['notes'];

export function useNotes(params?: GetNotesParams) {
  const queryClient = useQueryClient();

  const queryKey = [NOTES_QUERY_KEY[0], params];

  const query = useQuery({
    queryKey,
    queryFn: () => notesApi.getNotes(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Helper to invalidate all notes & stats queries
  const invalidateNotes = () => {
    queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
    queryClient.invalidateQueries({ queryKey: ['tags'] });
  };

  // Optimistic Toggle Favorite
  const toggleFavoriteMutation = useMutation({
    mutationFn: (note: Note) => notesApi.toggleFavorite(note._id),
    onMutate: async (note) => {
      await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY });
      const previousData = queryClient.getQueryData<{ notes: Note[]; total: number }>(queryKey);

      if (previousData) {
        queryClient.setQueryData(queryKey, {
          ...previousData,
          notes: previousData.notes.map((n) =>
            n._id === note._id ? { ...n, isFavorite: !n.isFavorite } : n
          ),
        });
      }

      return { previousData };
    },
    onError: (err, note, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast.error('Failed to update favorite status');
    },
    onSuccess: (updated) => {
      toast.success(updated.isFavorite ? 'Added to favorites' : 'Removed from favorites');
      invalidateNotes();
    },
  });

  // Optimistic Toggle Pin
  const togglePinMutation = useMutation({
    mutationFn: (note: Note) => notesApi.togglePin(note._id),
    onMutate: async (note) => {
      await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY });
      const previousData = queryClient.getQueryData<{ notes: Note[]; total: number }>(queryKey);

      if (previousData) {
        queryClient.setQueryData(queryKey, {
          ...previousData,
          notes: previousData.notes.map((n) =>
            n._id === note._id ? { ...n, isPinned: !n.isPinned } : n
          ),
        });
      }

      return { previousData };
    },
    onError: (err, note, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast.error('Failed to update pin status');
    },
    onSuccess: (updated) => {
      toast.success(updated.isPinned ? 'Note pinned' : 'Note unpinned');
      invalidateNotes();
    },
  });

  // Optimistic Toggle Archive
  const toggleArchiveMutation = useMutation({
    mutationFn: (note: Note) => notesApi.toggleArchive(note._id),
    onMutate: async (note) => {
      await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY });
      const previousData = queryClient.getQueryData<{ notes: Note[]; total: number }>(queryKey);

      if (previousData) {
        queryClient.setQueryData(queryKey, {
          ...previousData,
          notes: previousData.notes.map((n) =>
            n._id === note._id ? { ...n, isArchived: !n.isArchived } : n
          ),
        });
      }

      return { previousData };
    },
    onError: (err, note, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast.error('Failed to update archive status');
    },
    onSuccess: (updated) => {
      toast.success(updated.isArchived ? 'Note archived' : 'Note unarchived');
      invalidateNotes();
    },
  });

  // Soft Delete Note (Move to Trash)
  const deleteNoteMutation = useMutation({
    mutationFn: (note: Note) => notesApi.deleteNote(note._id),
    onSuccess: () => {
      toast.success('Note moved to trash');
      invalidateNotes();
    },
    onError: () => {
      toast.error('Failed to delete note');
    },
  });

  // Restore Note from Trash
  const restoreNoteMutation = useMutation({
    mutationFn: (note: Note) => notesApi.restoreNote(note._id),
    onSuccess: () => {
      toast.success('Note restored');
      invalidateNotes();
    },
    onError: () => {
      toast.error('Failed to restore note');
    },
  });

  // Permanent Delete Note
  const permanentDeleteMutation = useMutation({
    mutationFn: (note: Note) => notesApi.permanentDelete(note._id),
    onSuccess: () => {
      toast.success('Note permanently deleted');
      invalidateNotes();
    },
    onError: () => {
      toast.error('Failed to delete note');
    },
  });

  // Duplicate Note
  const duplicateNoteMutation = useMutation({
    mutationFn: (note: Note) => notesApi.duplicateNote(note._id),
    onSuccess: () => {
      toast.success('Note duplicated');
      invalidateNotes();
    },
    onError: () => {
      toast.error('Failed to duplicate note');
    },
  });

  // Reorder Notes mutation (Drag & Drop)
  const reorderNotesMutation = useMutation({
    mutationFn: (orderedIds: string[]) => notesApi.reorderNotes(orderedIds),
    onMutate: async (orderedIds: string[]) => {
      await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY });
      const previousData = queryClient.getQueryData<{ notes: Note[]; total: number }>(queryKey);

      if (previousData) {
        // Optimistically sort previousData.notes to match orderedIds
        const noteMap = new Map(previousData.notes.map((n) => [n._id, n]));
        const reorderedList: Note[] = [];
        const seen = new Set<string>();

        for (const id of orderedIds) {
          const item = noteMap.get(id);
          if (item) {
            reorderedList.push(item);
            seen.add(id);
          }
        }

        // Keep any remaining notes not in orderedIds
        for (const n of previousData.notes) {
          if (!seen.has(n._id)) {
            reorderedList.push(n);
          }
        }

        queryClient.setQueryData(queryKey, {
          ...previousData,
          notes: reorderedList,
        });
      }

      return { previousData };
    },
    onError: (err, orderedIds, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast.error('Failed to save new order');
    },
    onSuccess: () => {
      invalidateNotes();
    },
  });

  return {
    notes: query.data?.notes || [],
    total: query.data?.total || 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    toggleFavorite: toggleFavoriteMutation.mutate,
    togglePin: togglePinMutation.mutate,
    toggleArchive: toggleArchiveMutation.mutate,
    deleteNote: deleteNoteMutation.mutate,
    restoreNote: restoreNoteMutation.mutate,
    permanentDelete: permanentDeleteMutation.mutate,
    duplicateNote: duplicateNoteMutation.mutate,
    reorderNotes: reorderNotesMutation.mutate,
  };
}
