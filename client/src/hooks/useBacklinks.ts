import { useQuery } from '@tanstack/react-query';
import { backlinksApi } from '../api/backlinks';
import { Backlink } from '../types';

export function useBacklinks(noteId?: string) {
  const {
    data: backlinks = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Backlink[]>({
    queryKey: ['note-backlinks', noteId],
    queryFn: () => (noteId ? backlinksApi.getBacklinks(noteId) : Promise.resolve([])),
    enabled: Boolean(noteId),
    staleTime: 1000 * 30,
  });

  return { backlinks, isLoading, isError, refetch };
}
