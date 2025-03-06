import { useMutationState } from '@tanstack/react-query';

import { instantiationMutationKeys } from 'src/features/instantiate/InstantiationContext';
import { navigatePageMutationKeys } from 'src/features/navigation/navigationQueryKeys';
import { performActionMutationKeys } from 'src/features/payment/usePerformPaymentMutation';
import { subformMutationKeys } from 'src/features/subformData/useSubformMutations';

const longLivedMutationKeys = [
  navigatePageMutationKeys.all(),
  instantiationMutationKeys.all(),
  performActionMutationKeys.all(),
  subformMutationKeys.all(),
] as const;

export function useHasLongLivedMutations() {
  const pendingLongLivedMutations = useMutationState({
    filters: { status: 'pending' },
    select: (mutation) => longLivedMutationKeys.some((m) => m.at(0) === mutation.options.mutationKey?.at(0)),
  });

  const hasLongLivedMutations =
    pendingLongLivedMutations.length > 0 && pendingLongLivedMutations.every((m) => m === true);

  return hasLongLivedMutations;
}
