import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagsApi } from '../api/tagsApi';
import { Tag } from '../types';
import { NOTES_QUERY_KEY } from './useNotes';
import { toast } from 'sonner';

export const TAGS_QUERY_KEY = ['tags'];

export function useTags() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: TAGS_QUERY_KEY,
    queryFn: () => tagsApi.getTags(),
    staleTime: 1000 * 60 * 5,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
  };

  const createTagMutation = useMutation({
    mutationFn: (name: string) => tagsApi.createTag(name),
    onSuccess: () => {
      toast.success('Tag created');
      invalidate();
    },
    onError: () => toast.error('Failed to create tag'),
  });

  const updateTagMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      tagsApi.updateTag(id, name),
    onSuccess: () => {
      toast.success('Tag updated');
      invalidate();
    },
    onError: () => toast.error('Failed to update tag'),
  });

  const deleteTagMutation = useMutation({
    mutationFn: (id: string) => tagsApi.deleteTag(id),
    onSuccess: () => {
      toast.success('Tag deleted');
      invalidate();
    },
    onError: () => toast.error('Failed to delete tag'),
  });

  return {
    tags: query.data || [],
    isLoading: query.isLoading,
    createTag: (name: string) => createTagMutation.mutateAsync(name),
    updateTag: (id: string, name: string) => updateTagMutation.mutateAsync({ id, name }),
    deleteTag: (id: string) => deleteTagMutation.mutateAsync(id),
  };
}
