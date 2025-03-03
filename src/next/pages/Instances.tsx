import React from 'react';
import { Navigate } from 'react-router-dom';

import { useStore } from 'zustand/index';

import { API_CLIENT, APP, ORG } from 'src/next/app/App';
import { instanceStore } from 'src/next/stores/instanceStore';
import { initialStateStore } from 'src/next/stores/settingsStore';

// @ts-ignore
const xsrfCookie = document.cookie
  .split('; ')
  .find((row) => row.startsWith('XSRF-TOKEN='))
  .split('=')[1];
const headers = { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': xsrfCookie };

export async function initialLoader() {
  const { user, validParties } = initialStateStore.getState();

  const currentParty = validParties[0];
  if (!currentParty) {
    throw new Error('No valid parties');
  }

  console.log(JSON.stringify(user, null, 2));

  const res = await API_CLIENT.org.activeDetail(ORG, APP, currentParty.partyId); //fetch('/api/users');
  const instances = await res.json();

  if (instances.length > 0) {
    instanceStore.setState({ instance: instances[0] });
  } else {
    const res = await API_CLIENT.org.instancesCreate(
      ORG,
      APP,
      {
        instanceOwnerPartyId: currentParty.partyId,
      },
      {
        headers,
      },
    );
    const data = await res.json();
    instanceStore.setState({ instance: data });
  }

  return {};
}

export const InstancesParent = () => {
  //const { instances } = useLoaderData() as { users: Array<{ id: number; name: string }> };
  const { instance } = useStore(instanceStore);
  const { validParties } = useStore(initialStateStore);
  const currentParty = validParties[0];
  if (!currentParty) {
    throw new Error('No valid parties');
  }
  console.log('parenting');
  //return <div>InstancesParent</div>;
  return <Navigate to={`instance/${instance?.id}`} />;
  //return <Outlet />;
};

export const Instances = () => {
  const { instance } = useStore(instanceStore);
  // const navigate = useNavigate();
  //
  // const currentParty = validParties[0];

  // const { data: activeInstances, isLoading } = useActiveInstancesQuery(`${currentParty.partyId}`);

  // const apiClient = useApiClient();

  // useEffect(() => {
  //   if (activeInstances && activeInstances.length > 0) {
  //     navigate(`/instance/${activeInstances[0].id}`);
  //     return;
  //   }
  //
  //   if (activeInstances && activeInstances?.length < 1) {
  //     const createIntance = async () => {
  //       if (!user?.party?.partyId || !user?.profileSettingPreference?.language) {
  //         return;
  //       }
  //
  //       if (validParties.length < 1) {
  //         return;
  //       }
  //
  //       // @ts-ignore
  //       const xsrfCookie = document.cookie
  //         .split('; ')
  //         .find((row) => row.startsWith('XSRF-TOKEN='))
  //         .split('=')[1];
  //       const headers = { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': xsrfCookie };
  //
  //       const res = await apiClient.org.instancesCreate(
  //         ORG,
  //         APP,
  //         {
  //           instanceOwnerPartyId: currentParty.partyId,
  //         },
  //         {
  //           headers,
  //         },
  //       );
  //       const data = await res.json();
  //       navigate(`/instance/${data.id}`);
  //       // data.id
  //     };
  //     createIntance();
  //   }
  // }, [
  //   activeInstances,
  //   activeInstances?.length,
  //   apiClient.org,
  //   currentParty.partyId,
  //   navigate,
  //   user?.party?.partyId,
  //   user?.profileSettingPreference?.language,
  //   validParties.length,
  // ]);

  // if (isLoading) {
  //   return <h2>Loading instance, please wait</h2>;
  // }
  //return <Outlet />;
  // return (
  //   <div>
  //     <h1>yolo</h1>
  //     instances <Outlet />
  //   </div>
  // );

  return <Navigate to={`${instance?.id}`} />;

  // return (
  //   <div>
  //     <Outlet />
  //     <h1>Active instances</h1>
  //
  //     <button onClick={createIntance}>New instance</button>
  //
  //     <ul>
  //       {data?.map((instance) => (
  //         <li key={instance.id}>
  //           <Link to={`/instance/${instance.id}`}>{instance.id}</Link>
  //         </li>
  //       ))}
  //     </ul>
  //   </div>
  // );
};
