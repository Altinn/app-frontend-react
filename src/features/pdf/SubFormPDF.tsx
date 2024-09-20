import React, { useEffect, useState } from 'react';

import { useQueries, useQuery } from '@tanstack/react-query';
import type { QueryKey, UseQueryOptions } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

import { ContextNotProvided } from 'src/core/contexts/context';
import { getDataModelUrl } from 'src/features/datamodel/useBindingSchema';
import { useLayoutQueryDef } from 'src/features/form/layout/LayoutsContext';
import { useLayoutSetsQueryDef } from 'src/features/form/layoutSets/LayoutSetsProvider';
import { useLaxLayoutSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { useInstanceDataQueryDef } from 'src/features/instance/InstanceContext';
import { useCurrentParty } from 'src/features/party/PartiesProvider';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';
import { fetchFormData } from 'src/queries/queries';
import { useNodeTraversal } from 'src/utils/layout/useNodeTraversal';
import type { LayoutContextValue } from 'src/features/form/layout/LayoutsContext';
import type { ILayoutSetDefault, ILayoutSetSubform } from 'src/layout/common.generated';
import type { IData } from 'src/types/shared';

export function useFormDataQueries(dataElements: IData[], partyId: string, options?: AxiosRequestConfig) {
  // Generate queries for each ID
  const queryResults = useQueries({
    queries: dataElements.map((element) => {
      // const url = `/your-api-endpoint/${id}`; // Construct the URL for each ID
      //const url = useDataModelUrl({ dataType: actualDataType, dataElementId: actualDataElementID, includeRowIds: true });
      // const url = getStatefulDataModelUrl(element.instanceGuid, element.id, true);

      const url = getDataModelUrl({
        dataType: element.dataType,
        dataElementId: element.id,
        instanceId: `${partyId}/${element.instanceGuid}`,
        language: 'en',
        isStateless: false,
        isAnonymous: false,
      });

      if (!url) {
        throw new Error('no url');
      }

      return {
        queryKey: ['fetchFormDataNEW', url],
        queryFn: () =>
          fetchFormData(url, options).then((data) => ({
            ...data, // Include the fetched data
            dataElement: element, // Attach the original dataElement
          })),
        enabled: !!element.id,
      };
    }),
  });

  return queryResults; // Return the array of query results
}

// export const useLayoutQuery = (
//   enabled: boolean,
//   defaultDataModelType: string,
//   layoutSetId?: string,
// ): UseQueryOptions<LayoutContextValue, Error, LayoutContextValue, QueryKey> => {
//   const queryDef = useLayoutQueryDef(enabled, defaultDataModelType, layoutSetId);
//
//   return {
//     queryKey: queryDef.queryKey,
//     queryFn: queryDef.queryFn,
//     enabled: queryDef.enabled,
//   };
// };

const useLayoutQueryOptions = (
  enabled: boolean,
  defaultDataModelType: string,
  layoutSetId: string,
): UseQueryOptions<LayoutContextValue, Error, LayoutContextValue, QueryKey> => {
  const queryDef = useLayoutQueryDef(enabled, defaultDataModelType, layoutSetId);

  return {
    queryKey: queryDef.queryKey,
    queryFn: queryDef.queryFn,
    enabled: queryDef.enabled,
  };
};

export function useLayoutQueries(layoutSets: { layoutSetId: string; dateModel: string }[], enabled: boolean) {
  // Generate an array of query options
  const queryOptions = layoutSets.map((layoutSet) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useLayoutQueryOptions(enabled, layoutSet.dateModel, layoutSet.layoutSetId),
  );

  // Use useQueries with the generated options
  return useQueries({ queries: queryOptions });
}
// export function useLayoutQueries(layoutSetIds: string[], enabled: boolean, defaultDataModelType: string) {
//   // Generate queries for each layoutSetId
//   const queryResults = useQueries({
//     queries: layoutSetIds.map((layoutSetId) => {
//       const queryConfig = useLayoutQuery(enabled, defaultDataModelType, layoutSetId);
//
//       return {
//         ...queryConfig,
//       };
//     }),
//   });
//
//   return queryResults; // Return the array of query results
// }

export function SubformPDF() {
  // const isHiddenSelector = Hidden.useIsHiddenSelector();
  // const nodeDataSelector = NodesInternal.useNodeDataSelector();
  const children = useNodeTraversal((t) => t.allNodes().filter((node) => node.isType('Subform')));
  // const dataType = useDataTypeFromLayoutSet(layoutSet);
  console.log('children', children);

  // 1. Finne alle subform komponenter OK
  // 2. For hver subform komponent:
  //        a For hver innsendfte subform instance:
  //    a. Hente layoutsettet som subform komponenten referer til OK
  //    b. Finne ut hvilken datamodell subformen trenger OK
  //    c. Finne alle dataElements som matcher dataTypen
  //    d. Laste dataen vi trenger
  //    e. Override datamodellType, datamodellUUid, layoutsetId
  //    f. Rendre form context
  // 3.

  // const { data: layoutSets } = useQuery(useLayoutSetsQueryDef());

  // const dataElements = instanceData.data.filter((d) => d.dataType === dataType) ?? [];

  const partyId = useNavigationParam('partyId');
  const instanceGuid = useNavigationParam('instanceGuid');

  const { data: layoutSets } = useQuery(useLayoutSetsQueryDef());

  // const subFormLayoutSets = layoutSets?.sets.filter((layoutSet) => layoutSet.type === 'subform');

  const filteredLayoutSets = layoutSets?.sets.filter(
    (set): set is ILayoutSetDefault => (set as ILayoutSetSubform).type === 'subform',
  );

  console.log('filteredLayoutSets', filteredLayoutSets);

  const { data: instanceData } = useQuery(useInstanceDataQueryDef(partyId, instanceGuid));

  console.log('instanceData', instanceData);

  const layoutSetDataModelNames = filteredLayoutSets?.map((layoutSet) => layoutSet.dataType);

  const dataElements = instanceData?.data.filter((d) => layoutSetDataModelNames?.includes(d.dataType)) ?? [];
  const currentPartyId = useCurrentParty()?.partyId;
  const maybeLayoutSettings = useLaxLayoutSettings();

  const orderWithHidden = maybeLayoutSettings === ContextNotProvided ? [] : maybeLayoutSettings.pages.order;

  console.log(JSON.stringify(maybeLayoutSettings, null, 2));

  console.log('orderWithHidden', orderWithHidden);

  // const { fetchLayoutSchema } = useAppQueries();
  // const { data: layoutSchema, isSuccess } = useQuery({
  //   enabled: true,
  //   queryKey: ['fetchLayoutSchema'],
  //   queryFn: () => fetchLayoutSchema(),
  // });
  //
  // const { fetchLayoutSets } = useAppQueries();
  // return {
  //   queryKey: ['fetchLayoutSets'],
  //   queryFn: fetchLayoutSets,
  // };

  if (!partyId) {
    throw new Error('no party ID');
  }

  const queries = useFormDataQueries(dataElements?.length > 0 ? dataElements : [], partyId);
  const layoutQueries = useLayoutQueries(
    layoutSets?.sets?.length && layoutSets?.sets?.length > 0
      ? layoutSets?.sets.map((set) => ({ layoutSetId: set.id, dateModel: set.dataType }))
      : [],
    true,
  );

  const [allData, setAllData] = useState<any[]>([]); // State to store all data

  const [allLayouts, setAllLayouts] = useState<LayoutContextValue[]>([]); // State to store all data

  const [isLoading, setIsLoading] = useState(false); // State to handle loading state

  const [isLoadingLayouts, setIsLoadingLayouts] = useState(false); // State to handle loading state
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchLayoutData() {
      try {
        setIsLoadingLayouts(true);
        const results = await Promise.all(layoutQueries.map((query) => query.refetch()));
        const successfulData = results
          .filter((result) => result.status === 'success') // Filter successful results
          .map((result) => result.data); // Extract data
        setAllLayouts(successfulData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoadingLayouts(false);
      }
    }
    if (allLayouts.length < 1 && !isLoadingLayouts) {
      fetchLayoutData();
    }
  }, [allLayouts.length, isLoadingLayouts, layoutQueries]);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const results = await Promise.all(queries.map((query) => query.refetch()));
        const successfulData = results
          .filter((result) => result.status === 'success') // Filter successful results
          .map((result) => result.data); // Extract data
        setAllData(successfulData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }
    if (allData.length < 1 && !isLoading) {
      fetchData();
    }
  }, [allData.length, queries]);

  // instanceData?.data.map((data) => {  dataModel: data.contentType, la: data. })

  const isQueryLoading = queries.every((query) => query.isLoading);
  const isLayoutQueriesLoading = layoutQueries.every((query) => query.isLoading);

  if (isQueryLoading && isLayoutQueriesLoading) {
    return <h1>Loading</h1>;
  }

  if (!maybeLayoutSettings) {
    return <h1>Loading</h1>;
  }

  if (isLoading) {
    return <h1>Loading</h1>;
  }

  if (isLoadingLayouts) {
    return <h1>isLoadingLayouts</h1>;
  }

  // For each dataElement, find the dataType and look up the correct layoutset from filteredLayoutSets
  // Now you can find the actual layout set from allLayouts
  // Now you can render the

  return (
    <div>
      {dataElements.map((dataElement) => {
        console.log(dataElement.dataType);

        // const ourData = allData.find((data) => data.dataType)

        const layouSetForData = filteredLayoutSets?.find((ls) => ls.dataType === dataElement.dataType);

        const actualLayouSet = allLayouts.find((ls) => {
          console.log('layousetFor us:');
          console.log(ls);
          return false;
        });

        return (
          <div>
            layouSetForData: <pre>{JSON.stringify(layouSetForData, null, 2)}</pre>
          </div>
        );
      })}

      <pre>{JSON.stringify(dataElements, null, 2)}</pre>

      <h2>All layouts:</h2>

      <h2>All data:</h2>

      {allData?.length > 0 &&
        allData.map((data) => {
          console.log('data', data);

          const layoutForData = layoutSets?.sets.find((set) => set.dataType === data?.dataElement?.dataType);

          console.log('layoutForData', layoutForData);
          // const ourLayout = allLayouts.find((layout) => layout.layouts)

          // const layoutSetForData = allLayouts.find(() => )

          return (
            <div key={data.dataType}>
              {data.dataType}: <pre>{JSON.stringify(layoutForData, null, 2)}</pre>
            </div>
          );
        })}

      {allLayouts?.length > 0 && <pre>{JSON.stringify(allLayouts, null, 2)}</pre>}

      {allData?.length > 0 && <pre>{JSON.stringify(allData, null, 2)}</pre>}

      {/*{ layoutQueries.filter((q) =>  q.data.layouts.}*/}

      {/*{orderWithHidden.map((page) => {*/}
      {/*  console.log(page);*/}

      {/*  // for each dataguid, find the layoutSet and render it along with the data*/}
      {/*  // (*/}
      {/*  //   // <div key={page}>{layoutQueries}</div>*/}
      {/*  // )*/}
      {/*  //*/}
      {/*  return <div></div>;*/}
      {/*})}*/}

      <pre>{JSON.stringify(layoutSets, null, 2)}</pre>

      {/*{orderWithHidden.map((page) =>*/}
      {/*  layoutQueries.map((query, index) => (*/}
      {/*    <div key={dataElements[index].id}>*/}
      {/*      {query.isLoading && <p>Loading...</p>}*/}
      {/*      {query.isError && <p>Error: {query.error.message}</p>}*/}
      {/*      {query.isSuccess && (*/}
      {/*        <div>*/}
      {/*          <h1>Here comes: {page}</h1>*/}
      {/*          <pre>{query.data[page]}</pre>*/}
      {/*          /!*{query.data &&*!/*/}
      {/*          /!*  query.data[page] &&*!/*/}
      {/*          /!*  query.data[page].map((page) => <pre key={page}>{JSON.stringify(query.data[page], null, 2)}</pre>)}*!/*/}

      {/*          /!*<pre>{JSON.stringify(query.data.layouts, null, 2)}</pre>*!/*/}
      {/*        </div>*/}
      {/*      )}*/}
      {/*    </div>*/}
      {/*  )),*/}
      {/*)}*/}

      <h1>The data:</h1>
      {queries.map((query, index) => (
        <div key={dataElements[index].id}>
          {query.isLoading && <p>Loading...</p>}
          {query.isError && <p>Error: {query.error.message}</p>}
          {query.isSuccess && (
            <div>
              {layoutSets?.sets?.find((set) => set?.dataType === query?.data?.dataElement?.dataType)?.dataType}

              {/*<pre>{JSON.stringify(query.data.dataElement.dataType, null, 2)}</pre>*/}
            </div>
          )}
        </div>
      ))}

      <h1>Layouts:</h1>
      {layoutQueries.map((query, index) => (
        <div key={dataElements[index].id}>
          {query.isLoading && <p>Loading...</p>}
          {query.isError && <p>Error: {query.error.message}</p>}
          {query.isSuccess && (
            <div>
              Data:
              <pre>{JSON.stringify(query.data.layouts, null, 2)}</pre>
            </div>
          )}
        </div>
      ))}

      {/*{instanceGuid &&*/}
      {/*  dataElements.map((el) => (*/}
      {/*    <RenderSubFormInstance*/}
      {/*      key={el.id}*/}
      {/*      dataElementID={el.id}*/}
      {/*      instanceId={instanceGuid}*/}
      {/*    />*/}
      {/*  ))}*/}

      {/*<h1>InstanceData start:</h1>*/}
      {/*<pre>{JSON.stringify(instanceData, null, 2)}</pre>*/}

      {/*<h1>InstanceData end</h1>*/}
      {/*<pre>{JSON.stringify(layoutSets, null, 2)}</pre>*/}
      {/*<h1>Subform</h1>*/}
      {/*<ul>*/}
      {/*  {children.map((child) => (*/}
      {/*    <li key={child.id}>{child.id}</li>*/}
      {/*  ))}*/}
      {/*</ul>*/}
    </div>
  );
}
