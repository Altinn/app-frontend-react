// import { useEffect, useState } from 'react';

// import { useDataListQuery } from 'src/hooks/queries/useDataListQuery';
// import { useAppSelector } from 'src/hooks/useAppSelector';
// import type { IMapping, IOptionSource } from 'src/layout/common.generated';

// interface IUseGetDataListParams {
//   id?: string;
//   // mapping?: IMapping;
//   // source?: IOptionSource;
// }

// export const useGetDataList = ({ id }: IUseGetDataListParams) => {
//   // const dataListState = useAppSelector((state) => state.dataListState.dataLists);
//   // console.log(dataListState);
//   const { instanceId } = window;
//   // const { data: formData } = useFormDataQuery();
//   // const { data: instance } = useCurrentInstanceQuery(instanceId || '', !!instanceId);
//   // const { data: applicationMetadata } = useApplicationMetadataQuery();
//   // const { data: layoutSets } = useLayoutSetsQuery();
//   // const layoutSetId = getLayoutSetIdForApplication(applicationMetadata || null, instance, layoutSets);
//   // const { data: layouts } = useLayoutsQuery(layoutSetId || '', !!layoutSetId);
//   // console.log(layouts);
//   const { data: dataListTest } = useDataListQuery(instanceId, id, !!id && !!instanceId);
//   return dataListTest.listItems;
//   // console.log('dataListState', dataListState);
//   // console.log('dataListTest', dataListTest);
// };
