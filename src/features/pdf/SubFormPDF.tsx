import React from 'react';

import { useQueries, useQuery } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

import { getDataModelUrl } from 'src/features/datamodel/useBindingSchema';
import { useLayoutSetsQueryDef } from 'src/features/form/layoutSets/LayoutSetsProvider';
import { useFormDataQuery } from 'src/features/formData/useFormDataQuery';
import { useInstanceDataQueryDef } from 'src/features/instance/InstanceContext';
import { useCurrentParty } from 'src/features/party/PartiesProvider';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';
import { fetchFormData } from 'src/queries/queries';
import { useNodeTraversal } from 'src/utils/layout/useNodeTraversal';
import { getStatefulDataModelUrl } from 'src/utils/urls/appUrlHelper';
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
        queryFn: () => fetchFormData(url, options),
        enabled: !!element.id,
      };
    }),
  });

  return queryResults; // Return the array of query results
}

export function RenderSubFormInstance({ dataElementID, instanceId }: { dataElementID: string; instanceId: string }) {
  const url = getStatefulDataModelUrl(instanceId, dataElementID, true);
  const { data } = useFormDataQuery(url);

  return <div>{JSON.stringify(data, null, 2)}</div>;
}

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

  const layoutSetDataModelNames = filteredLayoutSets?.map((layoutSet) => layoutSet.dataType);

  const dataElements = instanceData?.data.filter((d) => layoutSetDataModelNames?.includes(d.dataType)) ?? [];
  const currentPartyId = useCurrentParty()?.partyId;
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

  return (
    <div>
      {queries.map((query, index) => (
        <div key={dataElements[index].id}>
          {query.isLoading && <p>Loading...</p>}
          {query.isError && <p>Error: {query.error.message}</p>}
          {query.isSuccess && <p>Data: {JSON.stringify(query.data)}</p>}
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
