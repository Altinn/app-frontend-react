// import type { LoaderFunctionArgs } from 'react-router-dom';
//
// // Assume these functions exist
// import { useStore } from 'zustand/index';
//
// import { useApiClient } from 'src/next/app/ApiClientContext';
// // import { queryClient } from 'src/next/app/QueryClient';
// import { fetchInstanceData, fetchLayoutSets, fetchTextResources } from 'src/next/pages/api';
// import { initialStateStore } from 'src/next/stores/settingsStore';
//
// export const instanceLoader = async ({ params }: LoaderFunctionArgs) => {
//   // const queryClient = useQueryClient();
//
//   const { user } = useStore(initialStateStore);
//   const { partyId, instanceGuid } = params as { partyId: string; instanceGuid: string };
//
//   const apiClient = useApiClient();
//
//   if (!partyId || !instanceGuid) {
//     throw new Response('Invalid instance parameters', { status: 400 });
//   }
//
//   // Prefetch instance data
//   const instanceData = await queryClient.fetchQuery({
//     queryKey: ['instance', partyId, instanceGuid],
//     queryFn: () => fetchInstanceData(partyId, instanceGuid),
//   });
//
//   // Prefetch layout settings
//   const layouts = await fetchLayoutSets();
//
//   // Prefetch text resources (assuming user has a language preference stored globally)
//   const userLanguage = user.profileSettingPreference.language;
//   const textResources = userLanguage ? await fetchTextResources(userLanguage) : null;
//
//   return { instanceData, layouts, textResources };
// };
