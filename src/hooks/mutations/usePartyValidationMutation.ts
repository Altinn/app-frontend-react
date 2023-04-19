import { useMutation } from '@tanstack/react-query';

import { useAppQueriesContext } from 'src/contexts/appQueriesContext';

export const usePartyValidationMutation = () => {
  const { doPartyValidation } = useAppQueriesContext();
  return useMutation((partyId: string) => doPartyValidation(partyId), {
    onError: (error: Error) => {
      console.warn(error);
      throw new Error('Server did not respond with party validation');
    },
  });
};
