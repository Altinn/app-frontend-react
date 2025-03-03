import React from 'react';
import { createHashRouter, Outlet, RouterProvider } from 'react-router-dom';

import { QueryClient } from '@tanstack/react-query';

import { Api } from 'src/next/app/api';
import { Instance } from 'src/next/pages/Instance';
import { initialLoader, InstancesParent } from 'src/next/pages/Instances';

const queryClient = new QueryClient();

const { org, app } = window;
const origin = window.location.origin;

export const ORG = org;
export const APP = app;

export const API_CLIENT = new Api({
  baseUrl: origin, //appPath,
  // You can pass axios overrides or custom fetch here if desired
});

const router = createHashRouter([
  {
    path: '/',
    loader: initialLoader,
    element: <Outlet />, //<InstancesParent />,
    children: [
      {
        index: true, // <- index route
        element: <InstancesParent />,
      },
      {
        path: 'instance/:partyId/:instanceGuid', //'instance',
        element: <Instance />, //<Instances />,
      },
    ],
  },
]);

////children: [{ path: ':partyId/:instanceGuid', element: <Instance /> }],
export const App = () => <RouterProvider router={router} />;

// export const App = () => (
//   <ApiClientProvider>
//     <QueryClientProvider client={queryClient}>
//       <HashRouter>
//         <Routes>
//           <Route
//             path='/'
//             element={<Instances />}
//           />
//
//           <Route path='instance'>
//             <Route
//               path=':partyId/:instanceGuid'
//               element={<Instance />}
//             >
//               <Route
//                 path=':taskId'
//                 element={<Task />}
//               >
//                 <Route
//                   path=':pageId'
//                   element={<Page />}
//                 />
//               </Route>
//             </Route>
//           </Route>
//         </Routes>
//       </HashRouter>
//     </QueryClientProvider>
//   </ApiClientProvider>
// );
