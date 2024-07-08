import { useMutation, useQueryClient } from '@tanstack/react-query';

import { doSubFormEntryAdd, doSubFormEntryDelete } from 'src/queries/queries';

export const useAddEntryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['addSubForm'],
    mutationFn: async (data: any) => await doSubFormEntryAdd(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subFormEntries'] });
    },
  });
};

export const useDeleteEntryMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['deleteSubForm', id],
    mutationFn: async () => await doSubFormEntryDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subFormEntries'] });
    },
  });
};
