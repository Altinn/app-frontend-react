import { toast } from 'react-toastify';

import { useMutation } from '@tanstack/react-query';

import { useAppMutations } from 'src/core/contexts/AppQueriesProvider';
import { useStrictInstance } from 'src/features/instance/InstanceContext';
import { useLanguage } from 'src/features/language/useLanguage';

export const useAddEntryMutation = (dataType: string) => {
  const instanceContext = useStrictInstance();
  const { langAsString } = useLanguage();
  const { doSubFormEntryAdd } = useAppMutations();

  return useMutation({
    mutationKey: ['addSubForm', dataType],
    mutationFn: async (data: any) => await doSubFormEntryAdd(instanceContext.instanceId, dataType, data),
    onSuccess: async () => {
      // TODO: instanceContext.changeData?
      await instanceContext.reFetch();
    },
    onError: () => {
      // TODO: where are the language keys defined?
      toast(langAsString('form_filler.error_add_sub_form'), { type: 'error' });
    },
  });
};

export const useDeleteEntryMutation = (id: string) => {
  const instanceContext = useStrictInstance();
  const { langAsString } = useLanguage();
  const { doSubFormEntryDelete } = useAppMutations();

  return useMutation({
    mutationKey: ['deleteSubForm', id],
    mutationFn: async () => await doSubFormEntryDelete(instanceContext.instanceId, id),
    onSuccess: async () => {
      // TODO: instanceContext.changeData?
      await instanceContext.reFetch();
    },
    onError: () => {
      // TODO: where are the language keys defined?
      toast(langAsString('form_filler.error_delete_sub_form'), { type: 'error' });
    },
  });
};
