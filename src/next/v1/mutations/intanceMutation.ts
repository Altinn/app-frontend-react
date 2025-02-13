// import {useAppMutations} from "src/core/contexts/AppQueriesProvider";
// import {useNavigate} from "src/features/routing/AppRoutingContext";
// import {useMutation, useQueryClient} from "@tanstack/react-query";
// import {useCurrentLanguage} from "src/features/language/LanguageProvider";
// import type {HttpClientError} from "src/utils/network/sharedNetworking";

import { useMutation } from '@tanstack/react-query';

import { httpPost } from 'src/utils/network/networking';
import { getCreateInstancesUrl } from 'src/utils/urls/appUrlHelper';
import type { IInstance } from 'src/types/shared';
import type { HttpClientError } from 'src/utils/network/sharedNetworking';
// import {doInstantiate} from "src/queries/queries";

export const createInstance = async (partyId: number, language?: string): Promise<IInstance> =>
  (await httpPost(getCreateInstancesUrl(partyId, language))).data;

export function useInstantiateMutation() {
  // const { doInstantiate } = useAppMutations();
  // const navigate = useNavigate();
  //const queryClient = useQueryClient();
  //const currentLanguage = useCurrentLanguage();

  return useMutation({
    mutationFn: (instanceOwnerPartyId: number) => createInstance(instanceOwnerPartyId),
    onError: (error: HttpClientError) => {
      window.logError('Instantiation failed:\n', error);
    },
    //onSuccess: (data) => {
    //onSuccess(data);
    //navigate(`/instance/${data.id}`);
    //queryClient.invalidateQueries({ queryKey: ['fetchApplicationMetadata'] });
    //},
  });
}
