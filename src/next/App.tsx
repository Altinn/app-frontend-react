import React from 'react';

import { useStore } from 'zustand';

import { appStore } from 'src/next/stores/settingsStore';

export const App = () => {
  const store = useStore(appStore);
  return (
    <div>
      <h1>welcome</h1>
      <pre>{JSON.stringify(store, null, 2)}</pre>
    </div>
  );
};

// import React, { useEffect } from 'react';
// import { HashRouter, Route, Routes, useNavigate } from 'react-router-dom';
//
// import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
// import type { UseQueryResult } from '@tanstack/react-query';
//
// import { initialStateUrl } from 'src/next/actions/appUrls';
// import { useInstantiateMutation } from 'src/next/mutations/intanceMutation';
// import { Instance } from 'src/next/pages/Instance';
// import { httpGet } from 'src/utils/network/sharedNetworking';
// import type { InitialState } from 'src/next/types/InitialState';
//
// export const fetchInitialStateUrl = () => httpGet<InitialState>(initialStateUrl);
//
// export const useInitialdata = (): UseQueryResult<InitialState, Error> =>
//   useQuery<InitialState, Error>({
//     queryKey: ['initialState'],
//     queryFn: fetchInitialStateUrl,
//   });
//
// const queryClient = new QueryClient();
//
// export const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <HashRouter>
//       <AppRoutes />
//     </HashRouter>
//   </QueryClientProvider>
// );
//
// const AppRoutes = () => {
//   const { data, isLoading, error } = useInitialdata();
//
//   if (isLoading) {
//     return <div>Loading metadata...</div>;
//   }
//
//   if (error) {
//     return <div>Error loading application metadata.</div>;
//   }
//
//   return (
//     <Routes>
//       <Route
//         path='/'
//         element={<InitialStateComponent metadata={data!} />}
//       />
//       <Route
//         path='/instance/:partyId/:instanceGuid/*'
//         element={<Instance />}
//       />
//     </Routes>
//   );
// };
//
// function InitialStateComponent({ metadata }: { metadata: InitialState }) {
//   const instanceMutation = useInstantiateMutation();
//   const navigate = useNavigate();
//
//   useEffect(() => {
//     if (metadata) {
//       instanceMutation.mutate(metadata.user.partyId);
//     }
//   }, [metadata]);
//
//   useEffect(() => {
//     if (instanceMutation.isSuccess) {
//       navigate(`/instance/${instanceMutation.data.id}`);
//     }
//   }, [instanceMutation]);
//
//   return (
//     <div>
//       <pre>{JSON.stringify(metadata, null, 2)}</pre>
//     </div>
//   );
// }
