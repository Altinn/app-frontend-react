import React from 'react';

type InstanceParams = {
  partyId: string;
  instanceGuid: string;
};

export const Instance = () => <div>instance</div>;

// export const Instance = () => {
//   console.log('dgre');
//   const { partyId, instanceGuid } = useParams<InstanceParams>() as Required<InstanceParams>;
//
//   const { data: loadedInstance, error, isLoading } = useInstanceQuery(partyId, instanceGuid);
//
//   const { user } = useStore(initialStateStore);
//
//   const { instance, setInstance } = useStore(instanceStore);
//
//   const { layouts, setLayoutSets, setDataObject, data } = useStore(layoutStore);
//
//   const { textResource, setTextResource } = useStore(textResourceStore);
//
//   const apiClient = useApiClient();
//
//   useEffect(() => {
//     if (loadedInstance && !instance) {
//       setInstance(loadedInstance);
//     }
//   }, [loadedInstance, instance, setInstance]);
//
//   useEffect(() => {
//     const fetchLayoutSettings = async () => {
//       const res = await apiClient.org.layoutsetsDetail(ORG, APP);
//       const data = await res.json();
//       console.log(JSON.stringify(data, null, 2));
//       setLayoutSets(data);
//     };
//
//     fetchLayoutSettings();
//   }, [apiClient.org, setLayoutSets]);
//
//   useEffect(() => {
//     const fetchData = async (instance: InstanceDTO) => {
//       if (!instance.instanceOwner.partyId) {
//         throw new Error('no party id');
//       }
//       const res = await apiClient.org.dataDetail(
//         ORG,
//         APP,
//         Number.parseInt(instance.instanceOwner.partyId),
//         instance.data[0].instanceGuid,
//         instance.data[0].id,
//       );
//       const data = await res.json();
//       setDataObject(data);
//     };
//
//     if (instance) {
//       fetchData(instance);
//     }
//   }, [apiClient.org, instance, setDataObject]);
//
//   useEffect(() => {
//     const getTexts = async () => {
//       if (user.profileSettingPreference.language) {
//         const res = await apiClient.org.v1TextsDetail(ORG, APP, user.profileSettingPreference.language);
//         const data = await res.json();
//         setTextResource(data);
//       }
//     };
//     getTexts();
//   }, [apiClient.org, setTextResource, user.profileSettingPreference.language]);
//
//   if (isLoading) {
//     return <h2>Loading instance, please wait</h2>;
//   }
//
//   // if (instance?.process.currentTask.elementId) {
//   //   return <Navigate to={`/${instance?.process.currentTask.elementId}`} />;
//   // }
//
//   // return <Outlet />;
//   console.log('ding');
//   return (
//     <div>
//       {!data && 'Loading data..'}
//
//       {/*{!layouts && 'Loading layouts...'}*/}
//
//       {data && instance && <Outlet />}
//
//       {/*<h1>Instance</h1>*/}
//       {/*<div>{partyId}</div>*/}
//       {/*<div> {instanceGuid}</div>*/}
//       <Link to={`${instance?.process.currentTask.elementId}`}>{instance?.process.currentTask.elementId}</Link>
//
//       {/*<h2>Instance</h2>*/}
//
//       {/*<pre>{JSON.stringify(instance, null, 2)}</pre>*/}
//     </div>
//   );
// };
