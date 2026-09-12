import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dailyNotesApi, DailyDateRecord } from '../api/dailyNotes';
import { notesApi } from '../api/notesApi';
import { Note } from '../types';
import { toast } from 'sonner';

export function useDailyNote(dateStr?: string) {
  const queryClient = useQueryClient();
  const normalizedDate = dateStr || new Date().toISOString().split('T')[0];

  const {
    data: dailyNote,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Note>({
    queryKey: ['daily-note', normalizedDate],
    queryFn: () => dailyNotesApi.getDailyNote(normalizedDate),
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const { data: dailyDates = [] } = useQuery<DailyDateRecord[]>({
    queryKey: ['daily-dates'],
    queryFn: () => dailyNotesApi.getDailyDates(),
    staleTime: 1000 * 60 * 5,
  });

  const updateMutation = useMutation<Note, Error, Partial<Note>>({
    mutationFn: (data: Partial<Note>) => {
      if (!dailyNote?._id) throw new Error('Daily note not loaded');
      return notesApi.updateNote(dailyNote._id, data);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['daily-note', normalizedDate], updated);
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['daily-dates'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update daily note');
    },
  });

  return {
    dailyNote,
    dailyDates,
    isLoading,
    isError,
    error,
    refetch,
    updateDailyNote: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
