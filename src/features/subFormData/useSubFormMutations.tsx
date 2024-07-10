import { toast } from 'react-toastify';

import { useMutation } from '@tanstack/react-query';

import { useAppMutations } from 'src/core/contexts/AppQueriesProvider';
import { useStrictInstance } from 'src/features/instance/InstanceContext';
import { useLanguage } from 'src/features/language/useLanguage';
import type { IInstance } from 'src/types/shared';

export const useAddEntryMutation = (dataType: string) => {
  const instanceContext = useStrictInstance();
  const { langAsString } = useLanguage();
  const { doSubFormEntryAdd } = useAppMutations();

  return useMutation({
    mutationKey: ['addSubForm', dataType],
    mutationFn: async (data: any) => {
      const reply = await doSubFormEntryAdd(instanceContext.instanceId, dataType, data);
      return { reply };
    },
    onSuccess: ({ reply }) => {
      instanceContext?.changeData((instance: IInstance | undefined) => {
        if (!instance || !instance.data) {
          return instance;
        }
        return {
          ...instance,
          data: [...instance.data, reply],
        };
      });
    },
    onError: (error) => {
      console.error('Failed to add sub-form entry:', error);
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
    mutationFn: async (id: string) => {
      await doSubFormEntryDelete(instanceContext.instanceId, id);
      return id;
    },
    onSuccess: (deletedId) => {
      if (instanceContext?.changeData) {
        instanceContext.changeData((instance: IInstance | undefined) => {
          if (!instance || !instance.data) {
            return instance;
          }
          return {
            ...instance,
            data: instance.data.filter((item) => item.id !== deletedId),
          };
        });
      }
    },
    onError: () => {
      toast(langAsString('form_filler.error_delete_sub_form'), { type: 'error' });
    },
  });
};
