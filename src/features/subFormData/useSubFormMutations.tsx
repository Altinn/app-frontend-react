import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useStrictInstance } from 'src/features/instance/InstanceContext';
import { doSubFormEntryAdd, doSubFormEntryDelete } from 'src/queries/queries';

export const useAddEntryMutation = (dataType: string) => {
  const instanceContext = useStrictInstance();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['addSubForm'],
    mutationFn: async (data: any) => await doSubFormEntryAdd(instanceContext.instanceId, dataType, data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['subFormEntries'] });
      await instanceContext.reFetch();
    },
  });
};

export const useDeleteEntryMutation = (id: string) => {
  const instanceContext = useStrictInstance();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['deleteSubForm', id],
    mutationFn: async () => await doSubFormEntryDelete(instanceContext.instanceId, id),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['subFormEntries'] });
      await instanceContext.reFetch();
    },
  });
};
